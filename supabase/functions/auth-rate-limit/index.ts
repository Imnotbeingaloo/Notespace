// Pre-login rate limit check.
// Returns { blocked: boolean, retryAfter: number (seconds), remaining: number }
// Policy: max 5 failed attempts per email per 15 minutes.
// Failures themselves are recorded by `check-email-exists` (logFailure:true).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const rawEmail = typeof body?.email === "string" ? body.email : "";
    const email = rawEmail.trim().toLowerCase();
    if (!email || email.length > 320) {
      return new Response(
        JSON.stringify({ blocked: false, remaining: MAX_ATTEMPTS, retryAfter: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const since = new Date(Date.now() - WINDOW_MS).toISOString();
    const { data, error } = await admin
      .from("auth_failure_logs")
      .select("created_at")
      .eq("email", email)
      .gte("created_at", since)
      .order("created_at", { ascending: true });

    if (error) {
      // Fail open: don't lock users out if our store is unreachable.
      return new Response(
        JSON.stringify({ blocked: false, remaining: MAX_ATTEMPTS, retryAfter: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const count = data?.length ?? 0;
    const blocked = count >= MAX_ATTEMPTS;
    let retryAfter = 0;
    if (blocked && data && data.length > 0) {
      const oldest = new Date(data[0].created_at).getTime();
      retryAfter = Math.max(0, Math.ceil((oldest + WINDOW_MS - Date.now()) / 1000));
    }

    return new Response(
      JSON.stringify({
        blocked,
        remaining: Math.max(0, MAX_ATTEMPTS - count),
        retryAfter,
      }),
      {
        status: blocked ? 429 : 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch {
    return new Response(
      JSON.stringify({ blocked: false, remaining: MAX_ATTEMPTS, retryAfter: 0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
