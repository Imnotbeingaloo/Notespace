import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/sonner";


interface NamePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "ask" | "welcome";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 5) return "Late hours";
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  if (h < 21) return "Evening";
  return "Late hours";
};


export function NamePromptDialog({ open, onOpenChange }: NamePromptDialogProps) {
  const { updateDisplayName } = useProfile();
  const { user } = useAuth();
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

  const deriveFromEmail = () => {
    const email = user?.email ?? "";
    const prefix = email.split("@")[0] ?? "";
    const cleaned = prefix.replace(/[._\-+]+/g, " ").trim();
    if (!cleaned) return "";
    return cleaned
      .split(" ")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
      .slice(0, 60);
  };

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
    setStep("welcome");
    closeTimer.current = window.setTimeout(
      () => onOpenChange(false),
      reduceMotion ? 1600 : 3200
    );


  };

  const handleDismiss = async () => {
    if (saving) return;
    const fallback = deriveFromEmail();
    if (fallback) {
      // Fire-and-forget; don't block the close.
      updateDisplayName(fallback).catch(() => {});
    }
    onOpenChange(false);
  };

  const ease = [0.22, 1, 0.36, 1] as const;
  const spring = { type: "spring" as const, stiffness: 220, damping: 24, mass: 0.9 };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (saving) return;
        if (o === false) {
          handleDismiss();
          return;
        }
        if (step === "ask") onOpenChange(o);
      }}
    >

      <DialogContent
        className="sm:max-w-[460px] p-0 overflow-visible border-0 bg-transparent shadow-none data-[state=open]:animate-none data-[state=closed]:animate-[fade-out_0.45s_ease-out,scale-out_0.45s_ease-out]"
        hideClose={step !== "ask"}
      >
        {/* Stacked paper effect: two offset sheets behind the main card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.82, y: 32, rotate: -1.5 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
          transition={reduceMotion ? { duration: 0.2 } : spring}
          className="relative"
        >
          {/* Back sheets - peek out from behind the main card */}
          <div
            aria-hidden
            className="absolute inset-0 rounded-[14px] bg-card border border-border/40 shadow-md"
            style={{ transform: "rotate(-2.2deg) translate(-6px, 6px)" }}
          />
          <div
            aria-hidden
            className="absolute inset-0 rounded-[14px] bg-card border border-border/50 shadow-md"
            style={{ transform: "rotate(1.4deg) translate(4px, 3px)" }}
          />

          {/* Main card - index card / bookplate */}
          <div className="relative rounded-[14px] bg-card border border-border shadow-2xl overflow-hidden">
            {/* Gray ruled notebook lines, confined to the left margin (left of the red rule) */}
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 bottom-0 left-0 w-[52px] opacity-60"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, transparent 0, transparent 22px, hsl(var(--border)) 22px, hsl(var(--border)) 23px)",
              }}
            />
            {/* Left margin rule (notebook red/orange) */}
            <div
              aria-hidden
              className="absolute top-0 bottom-0 left-[52px] w-px bg-orange-500/70"
            />

            {/* Punched holes accent (left edge) */}
            <div aria-hidden className="absolute left-[18px] top-1/4 h-2.5 w-2.5 rounded-full bg-background border border-border/70" />
            <div aria-hidden className="absolute left-[18px] top-1/2 h-2.5 w-2.5 rounded-full bg-background border border-border/70" />
            <div aria-hidden className="absolute left-[18px] top-3/4 h-2.5 w-2.5 rounded-full bg-background border border-border/70" />


            <AnimatePresence mode="wait">
              {step === "ask" && (
                <motion.div
                  key="ask"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3, ease }}
                  className="relative pl-[72px] pr-9 pt-9 pb-9"
                >
                  {/* Headline */}
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12, duration: 0.5, ease }}
                    className="font-serif text-[32px] leading-[1.15] text-foreground tracking-tight pr-10"
                  >
                    What should{" "}
                    <span className="italic text-primary">we</span>{" "}
                    call you?
                  </motion.h2>


                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.26, duration: 0.5, ease }}
                    className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground max-w-[320px]"
                  >
                    A first name, a nickname, whatever feels like you. We'll use
                    it to keep things personal.
                  </motion.p>

                  {/* Field label like a form field on the card */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.34, duration: 0.5, ease }}
                    className="mt-8"
                  >
                    <label className="block text-[10px] uppercase tracking-[0.24em] text-muted-foreground/80 font-mono mb-1">
                      Name on file
                    </label>
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
                        className="w-full bg-transparent border-0 border-b-2 border-border px-0 pt-1 pb-3 font-serif text-[26px] text-foreground placeholder:text-muted-foreground/35 placeholder:font-sans placeholder:text-base focus:outline-none focus:border-primary transition-colors"
                      />
                      <motion.div
                        className="absolute left-0 right-0 -bottom-[2px] h-[2px] bg-primary origin-left"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: name ? 1 : 0 }}
                        transition={{ duration: 0.35, ease }}
                      />
                      <span className="absolute right-0 bottom-3 text-[10px] text-muted-foreground/50 tabular-nums font-mono">
                        {name.length}/60
                      </span>
                    </div>
                  </motion.div>

                  {/* Footer row */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.42, duration: 0.5, ease }}
                    className="mt-7 flex items-center justify-between gap-4"
                  >
                    <p className="text-[11px] text-muted-foreground/70 italic">
                      You can change this anytime in Settings.
                    </p>
                    <motion.button
                      type="button"
                      onClick={handleSave}
                      disabled={saving || !name.trim()}
                      whileHover={!saving && name.trim() ? { scale: 1.03 } : undefined}
                      whileTap={!saving && name.trim() ? { scale: 0.97 } : undefined}
                      className="group relative px-5 py-2.5 text-[13px] font-medium rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
                    >
                      {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      <span>Continue</span>
                      <span className="transition-transform group-hover:translate-x-0.5">→</span>
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}

              {step === "welcome" && (
                <motion.div
                  key="welcome"
                  className="relative pl-[72px] pr-9 py-12 min-h-[300px] flex flex-col justify-center"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease }}
                >
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-orange-500 font-mono">
                    <span className="h-px w-6 bg-orange-500/60" />
                    <span>Welcome aboard</span>
                  </div>

                  <h2 className="mt-3 font-serif text-[28px] leading-tight text-foreground tracking-tight flex items-center gap-3">
                    <span>Nice to meet you,</span>
                    <motion.span
                      aria-hidden
                      className="inline-block origin-[70%_70%] text-[30px]"
                      initial={{ rotate: 0, scale: 0.6, opacity: 0 }}
                      animate={
                        reduceMotion
                          ? { rotate: 0, scale: 1, opacity: 1 }
                          : {
                              opacity: 1,
                              scale: 1,
                              rotate: [0, -18, 14, -12, 10, -6, 0],
                            }
                      }
                      transition={
                        reduceMotion
                          ? { duration: 0.2 }
                          : { delay: 0.25, duration: 1.4, ease: "easeInOut", repeat: 1, repeatDelay: 0.4 }
                      }
                    >
                      👋
                    </motion.span>
                  </h2>

                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.5, ease }}
                    className="font-serif italic text-[40px] leading-tight text-primary mt-1"
                  >
                    {savedName}.
                  </motion.p>

                  <p className="text-sm text-muted-foreground mt-5 max-w-[320px] leading-relaxed">
                    Your notebook is ready. Let's write something worth
                    remembering.
                  </p>
                  <motion.div
                    className="mt-7 h-px w-32 bg-primary/40"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: reduceMotion ? 0.1 : 2.2, ease: "linear" }}
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
