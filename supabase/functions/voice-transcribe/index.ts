import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

// Groq-powered speech-to-text with an LLM cleanup pass.
// Audio in (multipart form field `file`) -> Whisper verbose_json (with word
// timestamps) -> Llama cleanup -> { raw, cleaned, words, duration }.

const GROQ_KEY = Deno.env.get('GROQ_API_KEY');
const STT_MODEL = 'whisper-large-v3-turbo';
const CLEANUP_MODEL = 'llama-3.3-70b-versatile';
const MAX_BYTES = 25 * 1024 * 1024; // Groq's per-file cap.
const STT_TIMEOUT_MS = 55_000;
const CLEANUP_TIMEOUT_MS = 20_000;

type Word = { word: string; start: number; end: number };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!GROQ_KEY) return json({ error: 'Voice service is not configured (missing GROQ_API_KEY).', code: 'config' }, 500);

  // Auth
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return json({ error: 'You need to be signed in to use voice transcription.', code: 'unauthorized' }, 401);
  }
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const token = authHeader.replace('Bearer ', '');
  const { data: claimsRes, error: claimsErr } = await supabase.auth.getClaims(token);
  if (claimsErr || !claimsRes?.claims) {
    return json({ error: 'Your session has expired. Please sign in again.', code: 'unauthorized' }, 401);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ error: 'Expected multipart/form-data', code: 'bad_request' }, 400);
  }

  const file = form.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return json({ error: 'No audio was received - please try recording again.', code: 'empty_audio' }, 400);
  }
  if (file.size > MAX_BYTES) {
    return json({ error: 'Recording is over the 25 MB limit. Try a shorter clip.', code: 'too_large' }, 413);
  }

  const clean = form.get('clean') !== 'false';
  const language = typeof form.get('language') === 'string' ? String(form.get('language')) : undefined;

  // 1) Groq Whisper transcription with word-level timestamps.
  const sttForm = new FormData();
  sttForm.append('file', file, file.name || 'audio.webm');
  sttForm.append('model', STT_MODEL);
  sttForm.append('response_format', 'verbose_json');
  sttForm.append('timestamp_granularities[]', 'word');
  sttForm.append('temperature', '0');
  if (language) sttForm.append('language', language);

  let sttRes: Response;
  try {
    sttRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${GROQ_KEY}` },
      body: sttForm,
      signal: AbortSignal.timeout(STT_TIMEOUT_MS),
    });
  } catch (e) {
    const timeout = (e as Error)?.name === 'TimeoutError' || (e as Error)?.name === 'AbortError';
    return json(
      timeout
        ? { error: 'Transcription timed out. Please try a shorter recording.', code: 'stt_timeout' }
        : { error: 'Could not reach the transcription service. Check your connection and retry.', code: 'stt_network' },
      timeout ? 504 : 502,
    );
  }

  if (!sttRes.ok) {
    const detail = await sttRes.text().catch(() => '');
    if (sttRes.status === 401) return json({ error: 'Voice service authentication failed. Please contact support.', code: 'stt_auth' }, 502);
    if (sttRes.status === 429) return json({ error: 'Voice service is busy right now. Please try again in a moment.', code: 'stt_rate_limit' }, 429);
    if (sttRes.status === 413) return json({ error: 'Recording is too large for the service. Try a shorter clip.', code: 'stt_too_large' }, 413);
    return json({ error: 'Transcription failed. Please try again.', code: 'stt_error', status: sttRes.status, detail: detail.slice(0, 500) }, 502);
  }

  const sttJson: { text?: string; duration?: number; words?: Word[] } = await sttRes.json();
  const raw = (sttJson.text || '').trim();
  const words: Word[] = Array.isArray(sttJson.words)
    ? sttJson.words
        .filter((w) => w && typeof w.word === 'string')
        .map((w) => ({ word: String(w.word), start: Number(w.start) || 0, end: Number(w.end) || 0 }))
    : [];
  const duration = typeof sttJson.duration === 'number' ? sttJson.duration : undefined;

  if (!raw) return json({ raw: '', cleaned: '', words: [], duration });
  if (!clean) return json({ raw, cleaned: raw, words, duration });

  // 2) Cleanup pass (non-fatal - we always return the raw transcript if it fails).
  try {
    const cleanupRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: CLEANUP_MODEL,
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content:
              'You clean up raw voice-to-text transcripts for a note-taking app. ' +
              'Fix punctuation, capitalisation, and obvious ASR mistakes. ' +
              "Remove filler words (um, uh, like, you know). " +
              "Keep the speaker's wording and meaning; do not rewrite, summarise, or add content. " +
              'Return only the cleaned transcript, no preamble, no quotes, no markdown.',
          },
          { role: 'user', content: raw },
        ],
      }),
      signal: AbortSignal.timeout(CLEANUP_TIMEOUT_MS),
    });

    if (!cleanupRes.ok) {
      return json({ raw, cleaned: raw, words, duration, cleanup_error: `Cleanup unavailable (${cleanupRes.status}) - returned raw transcript.` });
    }
    const cleanupJson = await cleanupRes.json();
    const cleaned = (cleanupJson?.choices?.[0]?.message?.content || raw).trim();
    return json({ raw, cleaned, words, duration });
  } catch (e) {
    const timeout = (e as Error)?.name === 'TimeoutError' || (e as Error)?.name === 'AbortError';
    return json({ raw, cleaned: raw, words, duration, cleanup_error: timeout ? 'Cleanup timed out - returned raw transcript.' : 'Cleanup unavailable - returned raw transcript.' });
  }
});
