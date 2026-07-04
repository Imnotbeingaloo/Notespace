import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_notes",
  title: "List notes",
  description:
    "List notes for the signed-in user. Optionally filter by notebook_id (pass 'standalone' for top-level notes with no notebook). Returns note metadata without full content.",
  inputSchema: {
    notebook_id: z
      .string()
      .optional()
      .describe("Notebook ID, or 'standalone' for top-level notes, or omit for all notes."),
    limit: z.number().int().min(1).max(100).default(50),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ notebook_id, limit }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    let query = supabaseForUser(ctx)
      .from("notes")
      .select("id, title, emoji, tags, notebook_id, created_at, updated_at")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(limit);
    if (notebook_id === "standalone") query = query.is("notebook_id", null);
    else if (notebook_id) query = query.eq("notebook_id", notebook_id);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { notes: data ?? [] },
    };
  },
});
