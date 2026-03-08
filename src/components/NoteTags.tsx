import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AI_TOOLS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tools`;

interface NoteTagsProps {
  tags: string[];
  noteId: string;
  notebookId: string;
  onTagsUpdated: (tags: string[]) => void;
}

export function NoteTags({ tags, noteId, notebookId, onTagsUpdated }: NoteTagsProps) {
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <AnimatePresence>
        {tags.map((tag) => (
          <motion.span
            key={tag}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary"
          >
            <Tag className="h-2.5 w-2.5" />
            {tag}
          </motion.span>
        ))}
      </AnimatePresence>
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
        {!isPro && <Lock className="h-2 w-2 ml-0.5 opacity-50" />}
      </button>
    </div>
  );
}
