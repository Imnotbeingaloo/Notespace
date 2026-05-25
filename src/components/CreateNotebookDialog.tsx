import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EMOJIS = ["📓", "📕", "📗", "📘", "📙", "📔", "📒", "🗂️", "💡", "🔬", "🎯", "✏️"];

interface CreateNotebookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string, emoji: string) => Promise<void> | void;
  parentName?: string | null;
  title?: string;
}

export function CreateNotebookDialog({
  open,
  onOpenChange,
  onCreate,
  parentName,
  title,
}: CreateNotebookDialogProps) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName("");
      setEmoji(EMOJIS[Math.floor(Math.random() * EMOJIS.length)]);
      setSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      await onCreate(trimmed, emoji);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-background/60 backdrop-blur-md"
            onClick={() => !submitting && onOpenChange(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title || "Create Notebook"}
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl shadow-primary/10 overflow-hidden"
          >
            <div className="px-6 pt-6 pb-2 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BookPlus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-lg text-foreground">
                    {title || "Create Notebook"}
                  </h2>
                  {parentName && (
                    <p className="text-xs text-muted-foreground">
                      Inside <span className="font-medium text-foreground">{parentName}</span>
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => !submitting && onOpenChange(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder="e.g. Quantum Physics"
                  className="mt-1.5 h-10"
                  autoFocus
                  maxLength={80}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Cover emoji
                </label>
                <div className="mt-1.5 grid grid-cols-6 gap-1.5">
                  {EMOJIS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setEmoji(em)}
                      className={`h-10 rounded-lg text-xl transition-all duration-150 ${
                        emoji === em
                          ? "bg-primary/15 ring-2 ring-primary scale-105"
                          : "hover:bg-muted"
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!name.trim() || submitting}>
                {submitting ? "Creating…" : "Create Notebook"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
