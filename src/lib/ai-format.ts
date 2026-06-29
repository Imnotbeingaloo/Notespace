import { supabase } from "@/integrations/supabase/client";

const AI_TOOLS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tools`;

/**
 * Call the ai-tools "format" action and stream the formatted markdown back.
 * `onChunk` fires as each delta arrives so callers can render a live progress
 * indicator (chars formatted, etc). Falls back to the original text on error.
 */
export async function formatTextWithAI(
  rawText: string,
  onChunk?: (chunkSoFar: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error("Not signed in");

  const resp = await fetch(AI_TOOLS_URL, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify({
      action: "format",
      noteTitle: "Pasted text",
      noteContent: rawText.slice(0, 50000),
    }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    throw new Error(data.error || `AI error ${resp.status}`);
  }

  const reader = resp.body?.getReader();
  if (!reader) throw new Error("No response stream");
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") continue;
      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) {
          text += content;
          onChunk?.(text);
        }
      } catch {
        /* skip non-JSON keepalives */
      }
    }
  }

  return text.trim() || rawText;
}
