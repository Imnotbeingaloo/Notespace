import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, Sparkles, BookOpen } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import { toast } from "@/components/ui/sonner";

interface NamePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "ask" | "transition" | "welcome";

export function NamePromptDialog({ open, onOpenChange }: NamePromptDialogProps) {
  const { updateDisplayName } = useProfile();
  const reduceMotion = useReducedMotion();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<Step>("ask");
  const [savedName, setSavedName] = useState("");
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      setStep("ask");
      setName("");
      setSavedName("");
    }
    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, [open]);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Please enter a name");
      return;
    }
    if (trimmed.length > 60) {
      toast.error("Keep it under 60 characters");
      return;
    }
    setSaving(true);
    const { error } = await updateDisplayName(trimmed);
    setSaving(false);
    if (error) {
      toast.error(error);
      return;
    }
    setSavedName(trimmed);
    setStep("transition");
    // Bridge animation, then welcome
    window.setTimeout(() => setStep("welcome"), reduceMotion ? 50 : 650);
    // Auto-dismiss into the app
    closeTimer.current = window.setTimeout(
      () => onOpenChange(false),
      reduceMotion ? 1200 : 2600
    );
  };

  const bridgeDuration = reduceMotion ? 0.1 : 0.55;
  const fadeDuration = reduceMotion ? 0.1 : 0.4;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        // Lock dialog while saving or during the transition/welcome flow
        if (saving) return;
        if (step !== "ask" && o === false) {
          onOpenChange(false);
          return;
        }
        if (step === "ask") onOpenChange(o);
      }}
    >
      <DialogContent
        className="sm:max-w-md p-0 overflow-hidden border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl"
        hideClose={step !== "ask"}
      >
        {/* Ambient gradient backdrop */}
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -top-24 -right-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
        </div>

        <div className="relative px-7 pt-8 pb-7 min-h-[260px]">
          <AnimatePresence mode="wait">
            {step === "ask" && (
              <motion.div
                key="ask"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: fadeDuration, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25">
                    <Sparkles className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl leading-tight text-foreground">
                      What should we call you?
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      A friendlier workspace starts with a name.
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="relative">
                    <input
                      autoFocus
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSave();
                      }}
                      maxLength={60}
                      placeholder="Your name or nickname"
                      aria-label="Display name"
                      className="w-full px-4 py-3 rounded-xl border border-input/80 bg-background/70 text-foreground text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60 transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/60 tabular-nums">
                      {name.length}/60
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-muted-foreground/80">
                      You can change this anytime in Settings.
                    </p>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving || !name.trim()}
                      className="px-5 py-2.5 text-sm rounded-xl bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:hover:translate-y-0 flex items-center gap-2"
                    >
                      {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Continue
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === "transition" && (
              <motion.div
                key="transition"
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: fadeDuration }}
              >
                <motion.div
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: bridgeDuration, ease: [0.22, 1, 0.36, 1] }}
                  className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-xl shadow-primary/40"
                >
                  <BookOpen className="h-6 w-6 text-primary-foreground" />
                </motion.div>
              </motion.div>
            )}

            {step === "welcome" && (
              <motion.div
                key="welcome"
                className="text-center py-4"
                initial={{ opacity: 0, scale: 0.96, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: fadeDuration, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div
                  initial={{ rotate: -8, scale: 0.9 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ duration: fadeDuration + 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-xl shadow-primary/40 mb-5"
                >
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </motion.div>
                <h2 className="font-serif text-2xl text-foreground tracking-tight">
                  Nice to meet you,{" "}
                  <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {savedName}
                  </span>
                  !
                </h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Your workspace is ready. Let's open your first notebook.
                </p>
                <motion.div
                  className="mt-5 h-0.5 rounded-full bg-gradient-to-r from-transparent via-primary/60 to-transparent"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: reduceMotion ? 0.1 : 2.2, ease: "linear" }}
                  style={{ transformOrigin: "left" }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
