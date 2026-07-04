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
  name: "create_notebook",
  title: "Create notebook",
  description: "Create a new notebook for the signed-in user.",
  inputSchema: {
    name: z.string().trim().min(1).max(120),
    emoji: z.string().max(8).optional(),
    parent_id: z.string().uuid().optional().describe("Parent notebook ID for nesting."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ name, emoji, parent_id }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const { data, error } = await supabaseForUser(ctx)
      .from("notebooks")
      .insert({
        user_id: ctx.getUserId(),
        name,
        emoji: emoji ?? "📓",
        parent_id: parent_id ?? null,
      })
      .select("id, name, emoji, parent_id, created_at")
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Created notebook ${data.id}` }],
      structuredContent: { notebook: data },
    };
  },
});
