// Shared AI provider chain with automatic failover.
// Order: Gemini (Google) -> Groq -> Lovable AI Gateway.
// Each provider is OpenAI-compatible chat completions.

type Provider = {
  name: string;
  endpoint: string;
  key: string;
  model: string;
};

export function getProviders(): Provider[] {
  const providers: Provider[] = [];
  const gemini = Deno.env.get("GEMINI_API_KEY");
  const groq = Deno.env.get("GROQ_API_KEY");
  const lovable = Deno.env.get("LOVABLE_API_KEY");

  if (gemini) {
    providers.push({
      name: "gemini",
      endpoint: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      key: gemini,
      model: "gemini-2.5-flash",
    });
  }
  if (groq) {
    providers.push({
      name: "groq",
      endpoint: "https://api.groq.com/openai/v1/chat/completions",
      key: groq,
      model: "llama-3.3-70b-versatile",
    });
  }
  if (lovable) {
    providers.push({
      name: "lovable",
      endpoint: "https://ai.gateway.lovable.dev/v1/chat/completions",
      key: lovable,
      model: "google/gemini-3-flash-preview",
    });
  }
  return providers;
}

export type ChatBody = {
  messages: Array<{ role: string; content: string }>;
  max_tokens?: number;
  stream?: boolean;
};

// Tries providers in order. Returns first successful Response.
// On stream=true, a 2xx response is returned immediately (body is consumed by caller).
export async function callWithFailover(body: ChatBody): Promise<Response> {
  const providers = getProviders();
  if (providers.length === 0) throw new Error("No AI key configured");

  let lastResp: Response | null = null;
  let lastErr: unknown = null;

  for (const p of providers) {
    try {
      const resp = await fetch(p.endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${p.key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...body, model: p.model }),
      });
      if (resp.ok) {
        console.log(`[ai] provider=${p.name} ok`);
        return resp;
      }
      // Failover on rate limit, credits, or server errors.
      if (resp.status === 429 || resp.status === 402 || resp.status >= 500) {
        const t = await resp.text().catch(() => "");
        console.warn(`[ai] provider=${p.name} status=${resp.status} failing over. ${t.slice(0, 200)}`);
        lastResp = new Response(t, { status: resp.status });
        continue;
      }
      // Other errors (400, 401, 403) are returned immediately — failover won't help.
      return resp;
    } catch (e) {
      console.warn(`[ai] provider=${p.name} threw`, e);
      lastErr = e;
      continue;
    }
  }

  if (lastResp) return lastResp;
  throw lastErr ?? new Error("All AI providers failed");
}
