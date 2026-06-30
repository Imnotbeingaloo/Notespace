// Pre-action rate limit check for auth endpoints.
// Policy: max 5 attempts per email per 15 minutes, applied to login,
// signup, and password reset.
// - For "login": failures are recorded by check-email-exists. This function
//   only reads the count.
// - For "signup" and "reset": this function records the attempt itself
//   (success or failure) because Supabase's signUp / resetPasswordForEmail
//   intentionally don't reveal whether the email exists, so we throttle
//   raw attempts to prevent enumeration / spam.
// Returns: { blocked: boolean, retryAfter: number (seconds), remaining: number }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
type Action = "login" | "signup" | "reset";
const ALLOWED: Action[] = ["login", "signup", "reset"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const okBody = (extra: Record<string, unknown> = {}) =>
    new Response(
      JSON.stringify({ blocked: false, remaining: MAX_ATTEMPTS, retryAfter: 0, ...extra }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  try {
    const body = await req.json().catch(() => ({}));
    const rawEmail = typeof body?.email === "string" ? body.email : "";
    const action: Action = ALLOWED.includes(body?.action) ? body.action : "login";
    const email = rawEmail.trim().toLowerCase();
    if (!email || email.length > 320) return okBody();

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Derive client IP and hash it (for IP-based throttling on signup/reset).
    const xff = req.headers.get("x-forwarded-for") ?? "";
    const ip = xff.split(",")[0].trim() || req.headers.get("cf-connecting-ip") || "unknown";
    const ipSalt = Deno.env.get("SUPABASE_JWKS") ?? SERVICE_ROLE;
    const ipBuf = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(`${ipSalt}:${ip}`)
    );
    const ipHash = Array.from(new Uint8Array(ipBuf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // For signup/reset, log this attempt by IP (NOT by email) so attackers
    // cannot lock out arbitrary victim emails by spamming this endpoint.
    if (action !== "login") {
      const userAgent = req.headers.get("user-agent") ?? null;
      await admin.from("auth_failure_logs").insert({
        email, // kept for audit visibility; not used as the throttle key
        reason: action === "signup" ? "signup_attempt" : "reset_attempt",
        user_agent: userAgent,
        ip_hash: ipHash,
      });
    }

    const since = new Date(Date.now() - WINDOW_MS).toISOString();
    const reasonFilter =
      action === "login"
        ? ["wrong_password", "email_not_found"]
        : action === "signup"
        ? ["signup_attempt"]
        : ["reset_attempt"];

    // Login is keyed by email (real credential failures recorded by
    // check-email-exists). Signup/reset are keyed by IP hash to prevent
    // email-targeted denial-of-service.
    let query = admin
      .from("auth_failure_logs")
      .select("created_at")
      .in("reason", reasonFilter)
      .gte("created_at", since)
      .order("created_at", { ascending: true });

    query = action === "login" ? query.eq("email", email) : query.eq("ip_hash", ipHash);

    const { data, error } = await query;

    if (error) return okBody();


    const count = data?.length ?? 0;
    const blocked = count >= MAX_ATTEMPTS;
    let retryAfter = 0;
    if (blocked && data && data.length > 0) {
      const oldest = new Date(data[0].created_at).getTime();
      retryAfter = Math.max(0, Math.ceil((oldest + WINDOW_MS - Date.now()) / 1000));
    }

    return new Response(
      JSON.stringify({ blocked, remaining: Math.max(0, MAX_ATTEMPTS - count), retryAfter }),
      {
        status: blocked ? 429 : 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch {
    return okBody();
  }
});
