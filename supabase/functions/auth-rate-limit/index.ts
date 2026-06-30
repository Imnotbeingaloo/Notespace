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

    // For signup/reset, log this attempt so the same throttle applies.
    if (action !== "login") {
      const userAgent = req.headers.get("user-agent") ?? null;
      await admin.from("auth_failure_logs").insert({
        email,
        reason: action === "signup" ? "signup_attempt" : "reset_attempt",
        user_agent: userAgent,
      });
    }

    const since = new Date(Date.now() - WINDOW_MS).toISOString();
    // For login: count only credential failures. For signup/reset: count attempts of the same kind.
    const reasonFilter =
      action === "login"
        ? ["wrong_password", "email_not_found"]
        : action === "signup"
        ? ["signup_attempt"]
        : ["reset_attempt"];

    const { data, error } = await admin
      .from("auth_failure_logs")
      .select("created_at")
      .eq("email", email)
      .in("reason", reasonFilter)
      .gte("created_at", since)
      .order("created_at", { ascending: true });

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
