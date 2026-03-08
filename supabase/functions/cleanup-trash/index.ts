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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Delete expired notes first (foreign key constraint)
    const { data: expiredNotes, error: notesQueryErr } = await supabase
      .from("notes")
      .select("id, attachments, user_id")
      .not("deleted_at", "is", null)
      .lt("deleted_at", thirtyDaysAgo);

    if (notesQueryErr) throw notesQueryErr;

    // Clean up storage attachments for expired notes
    for (const note of expiredNotes || []) {
      const attachments = (note.attachments as any[]) || [];
      for (const att of attachments) {
        if (att.path) {
          await supabase.storage.from("note-attachments").remove([att.path]);
        }
      }
    }

    // Delete expired notes
    const { error: notesDelErr } = await supabase
      .from("notes")
      .delete()
      .not("deleted_at", "is", null)
      .lt("deleted_at", thirtyDaysAgo);

    if (notesDelErr) throw notesDelErr;

    // Delete notes belonging to expired notebooks
    const { data: expiredNotebooks, error: nbQueryErr } = await supabase
      .from("notebooks")
      .select("id")
      .not("deleted_at", "is", null)
      .lt("deleted_at", thirtyDaysAgo);

    if (nbQueryErr) throw nbQueryErr;

    for (const nb of expiredNotebooks || []) {
      // Get notes for this notebook to clean attachments
      const { data: nbNotes } = await supabase
        .from("notes")
        .select("id, attachments")
        .eq("notebook_id", nb.id);

      for (const note of nbNotes || []) {
        const attachments = (note.attachments as any[]) || [];
        for (const att of attachments) {
          if (att.path) {
            await supabase.storage.from("note-attachments").remove([att.path]);
          }
        }
      }

      await supabase.from("notes").delete().eq("notebook_id", nb.id);
    }

    // Delete expired notebooks
    const { error: nbDelErr } = await supabase
      .from("notebooks")
      .delete()
      .not("deleted_at", "is", null)
      .lt("deleted_at", thirtyDaysAgo);

    if (nbDelErr) throw nbDelErr;

    const deletedCount = (expiredNotes?.length || 0) + (expiredNotebooks?.length || 0);

    return new Response(
      JSON.stringify({ success: true, deleted: deletedCount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
