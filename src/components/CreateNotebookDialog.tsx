import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Two curated sets — subject-themed for notebooks, note-action themed for notes.
// Both render in a 6-column grid → ~4 visible rows each.
const NOTEBOOK_EMOJIS = [
  "📓", "📕", "📗", "📘", "📙", "📔",
  "📒", "🗂️", "📚", "📖", "📰", "📑",
  "💡", "🔬", "🧪", "🧮", "📐", "📊",
  "🎯", "✏️", "🎨", "🎼", "💻", "⚗️",
  "🌍", "📜", "🩺", "⚖️", "🏛️", "🧠",
];
const NOTE_EMOJIS = [
  "📝", "📌", "✅", "⭐", "🔖", "💡",
  "📅", "✏️", "🗒️", "💬", "📋", "🎯",
  "🚀", "🔔", "❤️", "🔥", "⚡", "📞",
  "🛒", "✈️", "🍽️", "🎁", "🏃", "🧘",
  "💼", "🎬", "🎵", "🌱", "☕", "🧾",
];
const EMOJIS_FOR = (k: Kind) => (k === "note" ? NOTE_EMOJIS : NOTEBOOK_EMOJIS);

type Kind = "notebook" | "note";

interface CreateNotebookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate?: (name: string, emoji: string) => Promise<void> | void;
  onCreateNotebook?: (name: string, emoji: string) => Promise<void> | void;
  onCreateNote?: (name: string, emoji: string) => Promise<void> | void;
  /** If provided in choose mode, picking "Note" calls this instead of advancing to the name/emoji form. */
  onPickNote?: () => void;
  parentName?: string | null;
  title?: string;
  kind?: Kind;
  submitLabel?: string;
  placeholder?: string;
  mode?: "single" | "choose";
}

export function CreateNotebookDialog({
  open,
  onOpenChange,
  onCreate,
  onCreateNotebook,
  onCreateNote,
  onPickNote,
  parentName,
  title,
  kind: kindProp = "notebook",
  submitLabel,
  placeholder,
  mode = "single",
}: CreateNotebookDialogProps) {
  const [step, setStep] = useState<"choose" | "form">(mode === "choose" ? "choose" : "form");
  const [activeKind, setActiveKind] = useState<Kind>(kindProp);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(EMOJIS_FOR(kindProp)[0]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(mode === "choose" ? "choose" : "form");
      setActiveKind(kindProp);
      setName("");
      setEmoji(EMOJIS_FOR(kindProp)[0]);
      setSubmitting(false);
    }
  }, [open, mode, kindProp]);

  const pickKind = (k: Kind) => {
    setActiveKind(k);
    setEmoji(EMOJIS_FOR(k)[0]);
    setStep("form");
  };

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      if (mode === "choose") {
        if (activeKind === "note" && onCreateNote) await onCreateNote(trimmed, emoji);
        else if (activeKind === "notebook" && onCreateNotebook) await onCreateNotebook(trimmed, emoji);
        else if (onCreate) await onCreate(trimmed, emoji);
      } else if (onCreate) {
        await onCreate(trimmed, emoji);
      }
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  const Icon = activeKind === "note" ? FileText : BookOpen;
  const heading =
    step === "choose"
      ? "What do you want to create?"
      : title || (activeKind === "note" ? "Create Note" : "Create Notebook");
  const cta = submitLabel || (activeKind === "note" ? "Create Note" : "Create Notebook");

  // Smooth slide+fade transition between steps.
  const stepTransition = { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const };

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
            aria-label={title || "Create"}
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            layout
            className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl shadow-primary/10 overflow-hidden"
          >
            <div className="px-6 pt-6 pb-2 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-lg text-foreground">{heading}</h2>
                  {parentName && step === "form" && (
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

            <AnimatePresence mode="wait" initial={false}>
              {step === "choose" ? (
                <motion.div
                  key="choose"
                  initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                  transition={stepTransition}
                  className="px-6 py-5"
                >
                  <p className="text-sm text-muted-foreground mb-4">
                    Pick a single standalone note, or a notebook that groups multiple notes.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => pickKind("note")}
                      className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-background hover:border-primary/50 hover:bg-primary/[0.04] transition-all"
                    >
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-[1.04] transition-transform">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <span className="font-medium text-sm text-foreground">Note</span>
                      <span className="text-[11px] text-muted-foreground text-center leading-tight">A single page</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => pickKind("notebook")}
                      className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-background hover:border-primary/50 hover:bg-primary/[0.04] transition-all"
                    >
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-[1.04] transition-transform">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <span className="font-medium text-sm text-foreground">Notebook</span>
                      <span className="text-[11px] text-muted-foreground text-center leading-tight">A group of notes</span>
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                  transition={stepTransition}
                >
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
                        placeholder={placeholder || (activeKind === "note" ? "e.g. Meeting follow-ups" : "e.g. Quantum Physics")}
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
                        {EMOJIS_FOR(activeKind).map((em) => (
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
                    {mode === "choose" && (
                      <Button type="button" variant="ghost" onClick={() => setStep("choose")} disabled={submitting}>
                        Back
                      </Button>
                    )}
                    <Button onClick={handleSubmit} disabled={!name.trim() || submitting}>
                      {submitting ? "Creating…" : cta}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
