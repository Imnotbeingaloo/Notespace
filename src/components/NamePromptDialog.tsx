import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, BookOpen } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import { toast } from "@/components/ui/sonner";

interface NamePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "ask" | "transition" | "welcome";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 5) return "Hello, night owl";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Hello, night owl";
};

export function NamePromptDialog({ open, onOpenChange }: NamePromptDialogProps) {
  const { updateDisplayName } = useProfile();
  const reduceMotion = useReducedMotion();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<Step>("ask");
  const [savedName, setSavedName] = useState("");
  const closeTimer = useRef<number | null>(null);
  const greeting = useRef(getGreeting()).current;

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
    window.setTimeout(() => setStep("welcome"), reduceMotion ? 50 : 700);
    closeTimer.current = window.setTimeout(
      () => onOpenChange(false),
      reduceMotion ? 1200 : 2800
    );
  };

  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (saving) return;
        if (step !== "ask" && o === false) {
          onOpenChange(false);
          return;
        }
        if (step === "ask") onOpenChange(o);
      }}
    >
      <DialogContent
        className="sm:max-w-[460px] p-0 overflow-hidden border-border/40 bg-card shadow-2xl"
        hideClose={step !== "ask"}
      >
        {/* Editorial paper texture */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 opacity-[0.035] [background-image:radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] [background-size:14px_14px] text-foreground" />
          <div className="absolute -top-32 -right-24 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
        </div>

        <div className="relative min-h-[320px]">
          <AnimatePresence mode="wait">
            {step === "ask" && (
              <motion.div
                key="ask"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35, ease }}
                className="px-8 pt-9 pb-8"
              >
                {/* Eyebrow */}
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
                  <span className="h-px w-6 bg-primary/60" />
                  <span>{greeting}</span>
                </div>

                <h2 className="mt-3 font-serif text-[28px] leading-[1.15] text-foreground tracking-tight">
                  What should <span className="italic text-primary">we</span><br />
                  call you?
                </h2>

                <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                  Just a first name or a nickname - whatever feels like you.
                  We'll use it to keep things personal.
                </p>

                <div className="mt-7 space-y-5">
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
                      placeholder="Type your name…"
                      aria-label="Display name"
                      className="peer w-full bg-transparent border-0 border-b border-border/70 px-0 pt-2 pb-3 font-serif text-2xl text-foreground placeholder:text-muted-foreground/40 placeholder:font-sans placeholder:text-base focus:outline-none focus:border-primary transition-colors"
                    />
                    <motion.div
                      className="absolute left-0 right-0 -bottom-px h-[2px] bg-primary origin-left"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: name ? 1 : 0 }}
                      transition={{ duration: 0.4, ease }}
                    />
                    <span className="absolute right-0 bottom-3 text-[10px] text-muted-foreground/50 tabular-nums">
                      {name.length}/60
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-1">
                    <p className="text-[11px] text-muted-foreground/70">
                      You can change this anytime in Settings.
                    </p>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving || !name.trim()}
                      className="group relative px-5 py-2.5 text-[13px] font-medium rounded-full bg-foreground text-background hover:bg-foreground/90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      <span>Continue</span>
                      <span className="transition-transform group-hover:translate-x-0.5">→</span>
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
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0, rotate: -8 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ duration: 0.6, ease }}
                  className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/30"
                >
                  <BookOpen className="h-7 w-7 text-primary-foreground" />
                </motion.div>
              </motion.div>
            )}

            {step === "welcome" && (
              <motion.div
                key="welcome"
                className="px-8 py-12 text-center"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease }}
              >
                <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
                  <span className="h-px w-6 bg-primary/60" />
                  <span>Welcome aboard</span>
                  <span className="h-px w-6 bg-primary/60" />
                </div>

                <h2 className="mt-4 font-serif text-3xl leading-tight text-foreground tracking-tight">
                  Nice to meet you,
                </h2>
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.5, ease }}
                  className="font-serif italic text-4xl text-primary mt-1"
                >
                  {savedName}.
                </motion.p>

                <p className="text-sm text-muted-foreground mt-5 max-w-[280px] mx-auto leading-relaxed">
                  Your notebook is ready. Let's write something worth remembering.
                </p>
                <motion.div
                  className="mt-6 h-px mx-auto w-32 bg-gradient-to-r from-transparent via-primary/50 to-transparent"
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
