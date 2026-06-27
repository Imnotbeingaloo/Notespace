// Admin-only: returns aggregated signup-referral stats.
// Caller must have role 'admin' in public.user_roles.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userRes?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE);
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: userRes.user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Page through auth.users via admin API
    const buckets = {
      total: 0,
      bySource: {} as Record<string, number>,
      byCampaign: {} as Record<string, number>,
      byLandingPath: {} as Record<string, number>,
      byRef: {} as Record<string, number>,
      noAttribution: 0,
      last30d: 0,
    };
    const thirty = Date.now() - 30 * 24 * 60 * 60 * 1000;

    let page = 1;
    const perPage = 1000;
    // Hard cap to keep response time bounded
    while (page <= 20) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
      if (error) throw error;
      if (!data?.users?.length) break;
      for (const u of data.users) {
        buckets.total++;
        if (new Date(u.created_at).getTime() >= thirty) buckets.last30d++;
        const r = (u.user_metadata as Record<string, unknown> | null)?.referral as
          | Record<string, string>
          | undefined;
        if (!r) { buckets.noAttribution++; continue; }
        const src = r.utm_source || "direct";
        const camp = r.utm_campaign || "(none)";
        const land = r.landing_path || "/";
        const ref = r.ref || "(none)";
        buckets.bySource[src] = (buckets.bySource[src] || 0) + 1;
        buckets.byCampaign[camp] = (buckets.byCampaign[camp] || 0) + 1;
        buckets.byLandingPath[land] = (buckets.byLandingPath[land] || 0) + 1;
        buckets.byRef[ref] = (buckets.byRef[ref] || 0) + 1;
      }
      if (data.users.length < perPage) break;
      page++;
    }

    return new Response(JSON.stringify(buckets), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
