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
  name: "create_note",
  title: "Create note",
  description:
    "Create a new note for the signed-in user. Provide notebook_id to nest it inside a notebook, or omit for a standalone top-level note.",
  inputSchema: {
    title: z.string().trim().min(1).max(200),
    content: z.string().default(""),
    notebook_id: z.string().uuid().optional(),
    emoji: z.string().max(8).optional(),
    tags: z.array(z.string()).optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ title, content, notebook_id, emoji, tags }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const { data, error } = await supabaseForUser(ctx)
      .from("notes")
      .insert({
        user_id: ctx.getUserId(),
        title,
        content,
        notebook_id: notebook_id ?? null,
        emoji: emoji ?? null,
        tags: tags ?? null,
      })
      .select("id, title, notebook_id, created_at")
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Created note ${data.id}` }],
      structuredContent: { note: data },
    };
  },
});
