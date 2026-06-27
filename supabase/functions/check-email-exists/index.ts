import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { email, logFailure } = await req.json();
    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ exists: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const target = email.trim().toLowerCase();

    // Fast path: GoTrue admin endpoint supports filtering by email directly,
    // avoiding a multi-page scan of every user in the project.
    let exists = false;
    try {
      const url = `${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(target)}`;
      const res = await fetch(url, {
        headers: {
          apikey: SERVICE_ROLE,
          Authorization: `Bearer ${SERVICE_ROLE}`,
        },
      });
      if (res.ok) {
        const body = await res.json();
        const users = Array.isArray(body) ? body : body.users ?? [];
        exists = users.some((u: { email?: string }) => u.email?.toLowerCase() === target);
      }
    } catch {
      // fall through with exists=false
    }

    if (logFailure) {
      const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
      const userAgent = req.headers.get("user-agent") ?? null;
      // Fire and forget - don't block the response on logging.
      admin.from("auth_failure_logs").insert({
        email: target,
        reason: exists ? "wrong_password" : "email_not_found",
        user_agent: userAgent,
      }).then(() => {}).catch(() => {});
    }

    return new Response(JSON.stringify({ exists }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ exists: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
