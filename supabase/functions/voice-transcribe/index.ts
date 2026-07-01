import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

// Groq-powered speech-to-text with an LLM cleanup pass.
// Audio in (multipart form field `file`) -> Whisper transcript -> Llama polish
// -> { raw, cleaned }.

const GROQ_KEY = Deno.env.get('GROQ_API_KEY');
const STT_MODEL = 'whisper-large-v3-turbo';
const CLEANUP_MODEL = 'llama-3.3-70b-versatile';
const MAX_BYTES = 25 * 1024 * 1024; // Groq's per-file cap.

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!GROQ_KEY) {
    return new Response(JSON.stringify({ error: 'GROQ_API_KEY is not configured' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Validate the caller so anonymous traffic can't burn Groq credits.
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const token = authHeader.replace('Bearer ', '');
  const { data: claimsRes, error: claimsErr } = await supabase.auth.getClaims(token);
  if (claimsErr || !claimsRes?.claims) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return new Response(JSON.stringify({ error: 'Expected multipart/form-data' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const file = form.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return new Response(JSON.stringify({ error: 'Missing or empty audio file' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  if (file.size > MAX_BYTES) {
    return new Response(JSON.stringify({ error: 'Audio file exceeds 25 MB' }), {
      status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const clean = form.get('clean') !== 'false'; // default: run cleanup pass
  const language = typeof form.get('language') === 'string' ? String(form.get('language')) : undefined;

  // 1) Groq Whisper transcription
  const sttForm = new FormData();
  sttForm.append('file', file, file.name || 'audio.webm');
  sttForm.append('model', STT_MODEL);
  sttForm.append('response_format', 'json');
  sttForm.append('temperature', '0');
  if (language) sttForm.append('language', language);

  const sttRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${GROQ_KEY}` },
    body: sttForm,
  });

  if (!sttRes.ok) {
    const detail = await sttRes.text().catch(() => '');
    return new Response(JSON.stringify({ error: 'Groq transcription failed', status: sttRes.status, detail }), {
      status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const sttJson: { text?: string } = await sttRes.json();
  const raw = (sttJson.text || '').trim();

  if (!raw) {
    return new Response(JSON.stringify({ raw: '', cleaned: '' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!clean) {
    return new Response(JSON.stringify({ raw, cleaned: raw }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 2) Groq LLM cleanup: fix punctuation, capitalisation, filler words. Keep meaning.
  const cleanupRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: CLEANUP_MODEL,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content:
            'You clean up raw voice-to-text transcripts for a note-taking app. ' +
            'Fix punctuation, capitalisation, and obvious ASR mistakes. ' +
            'Remove filler words (um, uh, like, you know). ' +
            'Keep the speaker\'s wording and meaning; do not rewrite, summarise, or add content. ' +
            'Return only the cleaned transcript, no preamble, no quotes, no markdown.',
        },
        { role: 'user', content: raw },
      ],
    }),
  });

  if (!cleanupRes.ok) {
    // Cleanup failed - still return raw transcript so the user isn't blocked.
    return new Response(JSON.stringify({ raw, cleaned: raw, cleanup_error: cleanupRes.status }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const cleanupJson = await cleanupRes.json();
  const cleaned = (cleanupJson?.choices?.[0]?.message?.content || raw).trim();

  return new Response(JSON.stringify({ raw, cleaned }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
