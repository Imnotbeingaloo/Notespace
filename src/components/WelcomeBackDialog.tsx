import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { BookOpen } from "lucide-react";

interface WelcomeBackDialogProps {
  name: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GREETINGS = [
  "Welcome back",
  "Nice to see you again",
  "Good to see you",
  "Glad you're back",
  "Hey, you're back",
  "Welcome in",
];

/** Pick the next greeting in a stable rotation across visits. */
function useRotatingGreeting() {
  return useMemo(() => {
    if (typeof window === "undefined") return GREETINGS[0];
    try {
      const raw = localStorage.getItem("welcomeGreetingIdx");
      const idx = raw ? (parseInt(raw, 10) || 0) : 0;
      const next = (idx + 1) % GREETINGS.length;
      localStorage.setItem("welcomeGreetingIdx", String(next));
      return GREETINGS[idx % GREETINGS.length];
    } catch {
      return GREETINGS[0];
    }
  }, []);
}

/**
 * Minimal premium "welcome back" overlay shown once per session for returning
 * users. Rotates greeting copy on each visit so it never feels stale.
 */
export function WelcomeBackDialog({ name, open, onOpenChange }: WelcomeBackDialogProps) {
  const reduceMotion = useReducedMotion();
  const timer = useRef<number | null>(null);
  const [visible, setVisible] = useState(open);
  const greeting = useRotatingGreeting();

  useEffect(() => {
    setVisible(open);
    if (open) {
      timer.current = window.setTimeout(
        () => onOpenChange(false),
        reduceMotion ? 900 : 2000
      );
    }
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [open, onOpenChange, reduceMotion]);

  return (
    <Dialog open={visible} onOpenChange={onOpenChange}>
      <DialogContent
        hideClose
        className="sm:max-w-[400px] p-0 overflow-hidden border border-border/40 bg-card/95 backdrop-blur-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.4)]"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-28 left-1/2 -translate-x-1/2 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        </div>

        <div className="relative px-8 py-9 text-center flex flex-col items-center">
          <AnimatePresence>
            <motion.div
              key="icon"
              initial={{ scale: 0.7, opacity: 0, y: 6 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0.1 : 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-border/50 bg-background/60 shadow-inner"
            >
              <BookOpen className="h-5 w-5 text-primary" strokeWidth={1.75} />
            </motion.div>
          </AnimatePresence>

          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.3 }}
            className="text-[10.5px] uppercase tracking-[0.24em] text-muted-foreground mb-2.5"
          >
            {name ? "Returning" : "Hello"}
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.16, duration: 0.36 }}
            className="font-serif text-[1.55rem] leading-tight text-foreground tracking-tight"
          >
            {greeting},
            {name ? (
              <>
                <br />
                <span className="bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent">
                  {name}
                </span>
              </>
            ) : null}
          </motion.h2>

          <motion.div
            className="mt-6 h-px w-full max-w-[200px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"
            initial={{ scaleX: 0, opacity: 0.4 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: reduceMotion ? 0.1 : 1.6, ease: "linear" }}
            style={{ transformOrigin: "left" }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
