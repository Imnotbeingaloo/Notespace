import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, BookOpen, Sparkles } from "lucide-react";
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
  const greetingRef = useRef(getGreeting());

  useEffect(() => {
    if (open) {
      greetingRef.current = getGreeting();
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
    window.setTimeout(() => setStep("welcome"), reduceMotion ? 50 : 750);
    closeTimer.current = window.setTimeout(
      () => onOpenChange(false),
      reduceMotion ? 1200 : 3000
    );
  };

  const ease = [0.22, 1, 0.36, 1] as const;
  const spring = { type: "spring" as const, stiffness: 260, damping: 26 };

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
        className="sm:max-w-[480px] p-0 overflow-hidden border-0 bg-transparent shadow-none"
        hideClose={step !== "ask"}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0.2 } : spring}
          className="relative rounded-2xl bg-card border border-border/50 shadow-[0_30px_80px_-20px_hsl(var(--primary)/0.35)] overflow-hidden"
        >
          {/* Ruled-paper background */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.4]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, transparent 0, transparent 31px, hsl(var(--border)/0.35) 31px, hsl(var(--border)/0.35) 32px)",
              }}
            />
            <div className="absolute top-0 bottom-0 left-12 w-px bg-[hsl(var(--primary)/0.25)]" />
          </div>

          {/* Soft accent glows */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.9, ease }}
            className="pointer-events-none absolute -top-32 -right-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
          />
          <motion.div
            aria-hidden
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 1.1, ease }}
            className="pointer-events-none absolute -bottom-28 -left-16 h-64 w-64 rounded-full bg-orange-400/15 blur-3xl"
          />

          <div className="relative min-h-[360px]">
            <AnimatePresence mode="wait">
              {step === "ask" && (
                <motion.div
                  key="ask"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3, ease }}
                  className="px-9 pt-10 pb-9"
                >
                  {/* Brand mark */}
                  <motion.div
                    initial={{ opacity: 0, y: -8, rotate: -10, scale: 0.7 }}
                    animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
                    transition={{ ...spring, delay: 0.05 }}
                    className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  >
                    <BookOpen className="h-5 w-5" />
                  </motion.div>

                  {/* Eyebrow */}
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.18, duration: 0.4, ease }}
                    className="mt-5 flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-orange-500/90 font-semibold"
                  >
                    <span className="h-px w-8 bg-orange-500/60" />
                    <span>{greetingRef.current}</span>
                  </motion.div>

                  {/* Headline */}
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22, duration: 0.5, ease }}
                    className="mt-2 font-serif text-[30px] leading-[1.12] text-foreground tracking-tight"
                  >
                    What should{" "}
                    <span className="italic text-primary">we</span>
                    <br />
                    call you?
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5, ease }}
                    className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground max-w-[360px]"
                  >
                    Just a first name or a nickname - whatever feels like you.
                    We'll use it to keep things personal.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.38, duration: 0.5, ease }}
                    className="mt-8 space-y-5"
                  >
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
                        transition={{ duration: 0.35, ease }}
                      />
                      <span className="absolute right-0 bottom-3 text-[10px] text-muted-foreground/50 tabular-nums">
                        {name.length}/60
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-1">
                      <p className="text-[11px] text-muted-foreground/70">
                        You can change this anytime in Settings.
                      </p>
                      <motion.button
                        type="button"
                        onClick={handleSave}
                        disabled={saving || !name.trim()}
                        whileHover={!saving && name.trim() ? { scale: 1.03 } : undefined}
                        whileTap={!saving && name.trim() ? { scale: 0.97 } : undefined}
                        className="group relative px-5 py-2.5 text-[13px] font-medium rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-md shadow-primary/30"
                      >
                        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        <span>Continue</span>
                        <span className="transition-transform group-hover:translate-x-0.5">→</span>
                      </motion.button>
                    </div>
                  </motion.div>
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
                    initial={{ scale: 0.4, opacity: 0, rotate: -12 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={spring}
                    className="relative h-20 w-20 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40"
                  >
                    <BookOpen className="h-9 w-9 text-primary-foreground" />
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.25, ...spring }}
                      className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-orange-500 flex items-center justify-center shadow-lg"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-white" />
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}

              {step === "welcome" && (
                <motion.div
                  key="welcome"
                  className="px-9 py-14 text-center"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease }}
                >
                  <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.24em] text-orange-500/90 font-semibold">
                    <span className="h-px w-6 bg-orange-500/60" />
                    <span>Welcome aboard</span>
                    <span className="h-px w-6 bg-orange-500/60" />
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

                  <p className="text-sm text-muted-foreground mt-5 max-w-[300px] mx-auto leading-relaxed">
                    Your notebook is ready. Let's write something worth remembering.
                  </p>
                  <motion.div
                    className="mt-7 h-px mx-auto w-32 bg-gradient-to-r from-transparent via-primary/50 to-transparent"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: reduceMotion ? 0.1 : 2.4, ease: "linear" }}
                    style={{ transformOrigin: "left" }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
