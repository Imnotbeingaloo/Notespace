import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, Loader2, Sparkles, X, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

const AI_TOOLS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tools`;

interface NoteTagsProps {
  tags: string[];
  noteId: string;
  notebookId?: string | null;
  onTagsUpdated: (tags: string[]) => void;
}

export function NoteTags({ tags, noteId, notebookId, onTagsUpdated }: NoteTagsProps) {
  const [loading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [newTag, setNewTag] = useState("");

  const autoTag = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const { data: note } = await supabase.from("notes").select("title, content").eq("id", noteId).single();
      if (!note) return;

      const resp = await fetch(AI_TOOLS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          action: "auto-tag",
          noteTitle: note.title,
          noteContent: note.content,
        }),
      });

      if (!resp.ok) throw new Error("Failed");
      const data = await resp.json();

      let parsedTags: string[] = [];
      try {
        parsedTags = JSON.parse(data.tags);
      } catch {
        const match = data.tags.match(/\[.*\]/s);
        if (match) parsedTags = JSON.parse(match[0]);
      }

      if (parsedTags.length > 0) {
        await supabase.from("notes").update({ tags: parsedTags } as any).eq("id", noteId);
        onTagsUpdated(parsedTags);
      }
    } catch (e) {
      console.error("Auto-tag error:", e);
    } finally {
      setLoading(false);
    }
  };

  const removeTag = async (tagToRemove: string) => {
    const newTags = tags.filter((t) => t !== tagToRemove);
    await supabase.from("notes").update({ tags: newTags } as any).eq("id", noteId);
    onTagsUpdated(newTags);
  };

  const addTag = async () => {
    const tag = newTag.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!tag) return;
    if (tags.includes(tag)) { setNewTag(""); return; }
    const updated = [...tags, tag];
    await supabase.from("notes").update({ tags: updated } as any).eq("id", noteId);
    onTagsUpdated(updated);
    setNewTag("");
    setShowInput(false);
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <AnimatePresence>
        {tags.map((tag) => (
          <motion.span
            key={tag}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary"
          >
            <Tag className="h-2.5 w-2.5" />
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="ml-0.5 p-0.5 rounded-full hover:bg-destructive/20 hover:text-destructive transition-colors"
              title={`Remove #${tag}`}
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </motion.span>
        ))}
      </AnimatePresence>

      {/* Inline add tag */}
      {showInput ? (
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          exit={{ opacity: 0, width: 0 }}
          className="inline-flex items-center gap-1"
        >
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addTag();
              if (e.key === "Escape") { setShowInput(false); setNewTag(""); }
            }}
            placeholder="tag..."
            className="h-5 w-20 text-[10px] px-1.5 py-0 rounded-full border-primary/30"
            autoFocus
          />
        </motion.div>
      ) : (
        <button
          onClick={() => setShowInput(true)}
          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium rounded-full border border-dashed border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
          title="Add tag"
        >
          <Plus className="h-2.5 w-2.5" />
        </button>
      )}

      <button
        onClick={autoTag}
        disabled={loading}
        className="magnetic-btn inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full border border-dashed border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
        title="Auto-tag with AI (Pro)"
      >
        {loading ? (
          <Loader2 className="h-2.5 w-2.5 animate-spin" />
        ) : (
          <Sparkles className="h-2.5 w-2.5" />
        )}
        Auto-tag
      </button>
    </div>
  );
}
