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
  name: "update_note",
  title: "Update note",
  description:
    "Update fields on an existing note by id. Only the provided fields are changed. Use `append_content` to add to the end of an existing note without overwriting it.",
  inputSchema: {
    id: z.string().uuid(),
    title: z.string().trim().min(1).max(200).optional(),
    content: z.string().optional().describe("Replaces the full note content."),
    append_content: z
      .string()
      .optional()
      .describe("Appends to the end of the existing content (adds a blank line before it)."),
    emoji: z.string().max(8).optional(),
    tags: z.array(z.string()).optional(),
    notebook_id: z.string().uuid().nullable().optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  handler: async ({ id, title, content, append_content, emoji, tags, notebook_id }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supa = supabaseForUser(ctx);

    let nextContent: string | undefined = content;
    if (append_content !== undefined) {
      const { data: existing, error: readErr } = await supa
        .from("notes")
        .select("content")
        .eq("id", id)
        .maybeSingle();
      if (readErr) return { content: [{ type: "text", text: readErr.message }], isError: true };
      if (!existing)
        return { content: [{ type: "text", text: "Note not found" }], isError: true };
      const base = content ?? existing.content ?? "";
      nextContent = base ? `${base}\n\n${append_content}` : append_content;
    }

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (title !== undefined) patch.title = title;
    if (nextContent !== undefined) patch.content = nextContent;
    if (emoji !== undefined) patch.emoji = emoji;
    if (tags !== undefined) patch.tags = tags;
    if (notebook_id !== undefined) patch.notebook_id = notebook_id;

    const { data, error } = await supa
      .from("notes")
      .update(patch)
      .eq("id", id)
      .select("id, title, updated_at")
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Updated note ${data.id}` }],
      structuredContent: { note: data },
    };
  },
});
