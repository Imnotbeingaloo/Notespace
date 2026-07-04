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
  name: "search_notes",
  title: "Search notes",
  description:
    "Full-text search across the signed-in user's note titles and content. Returns matching notes with a short snippet.",
  inputSchema: {
    query: z.string().trim().min(1).describe("Search text to match against titles and content."),
    limit: z.number().int().min(1).max(50).default(20),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, limit }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    // Escape %/_ for ilike, then wrap.
    const like = `%${query.replace(/[%_]/g, (m) => "\\" + m)}%`;
    const { data, error } = await supabaseForUser(ctx)
      .from("notes")
      .select("id, title, emoji, tags, notebook_id, content, updated_at")
      .is("deleted_at", null)
      .or(`title.ilike.${like},content.ilike.${like}`)
      .order("updated_at", { ascending: false })
      .limit(limit);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const results = (data ?? []).map((n) => {
      const c = n.content ?? "";
      const idx = c.toLowerCase().indexOf(query.toLowerCase());
      const snippet =
        idx >= 0
          ? c.slice(Math.max(0, idx - 60), Math.min(c.length, idx + 140))
          : c.slice(0, 160);
      return {
        id: n.id,
        title: n.title,
        emoji: n.emoji,
        tags: n.tags,
        notebook_id: n.notebook_id,
        updated_at: n.updated_at,
        snippet,
      };
    });
    return {
      content: [{ type: "text", text: JSON.stringify(results) }],
      structuredContent: { results },
    };
  },
});
