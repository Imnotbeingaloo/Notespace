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

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const target = email.trim().toLowerCase();
    let page = 1;
    let exists = false;
    while (page <= 20) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) break;
      if (data.users.some((u) => u.email?.toLowerCase() === target)) {
        exists = true;
        break;
      }
      if (data.users.length < 1000) break;
      page++;
    }

    if (logFailure) {
      const userAgent = req.headers.get("user-agent") ?? null;
      await admin.from("auth_failure_logs").insert({
        email: target,
        reason: exists ? "wrong_password" : "email_not_found",
        user_agent: userAgent,
      });
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
