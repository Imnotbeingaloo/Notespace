import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify this is called by the service role (cron) - require auth unconditionally
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const checkClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const token = authHeader.replace("Bearer ", "");
      const { data: claimsData } = await checkClient.auth.getClaims(token);
      if (claimsData?.claims?.role !== "service_role") {
        return new Response(
          JSON.stringify({ error: "Forbidden" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const today = new Date().toISOString().split("T")[0];

    const { data: plans, error } = await supabase
      .from("study_plans")
      .select("id, title, scheduled_time, user_id")
      .eq("scheduled_date", today)
      .eq("completed", false)
      .eq("remind_via_email", true);

    if (error) throw error;
    if (!plans || plans.length === 0) {
      return new Response(
        JSON.stringify({ message: "No reminders to send" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userPlans: Record<string, typeof plans> = {};
    for (const plan of plans) {
      if (!userPlans[plan.user_id]) userPlans[plan.user_id] = [];
      userPlans[plan.user_id].push(plan);
    }

    let sentCount = 0;
    for (const [userId, sessions] of Object.entries(userPlans)) {
      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      if (!userData?.user?.email) continue;

      const email = userData.user.email;
      const sessionList = sessions
        .map(
          (s) =>
            `• ${s.title}${s.scheduled_time ? ` at ${s.scheduled_time.slice(0, 5)}` : ""}`
        )
        .join("\n");

      console.log(
        `📧 Reminder for ${email}:\n` +
          `You have ${sessions.length} study session(s) today:\n${sessionList}`
      );
      sentCount++;
    }

    return new Response(
      JSON.stringify({ message: `Processed reminders for ${sentCount} user(s)` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("study-reminders error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
