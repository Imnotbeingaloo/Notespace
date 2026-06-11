import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { BookOpen } from "lucide-react";

interface WelcomeBackDialogProps {
  name: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Minimalist "Nice to see you again, [Name]" overlay shown once per session
 * for returning users. Premium aesthetic matching the editor surface.
 */
export function WelcomeBackDialog({ name, open, onOpenChange }: WelcomeBackDialogProps) {
  const reduceMotion = useReducedMotion();
  const timer = useRef<number | null>(null);
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    setVisible(open);
    if (open) {
      timer.current = window.setTimeout(
        () => onOpenChange(false),
        reduceMotion ? 900 : 2400
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
        className="sm:max-w-[420px] p-0 overflow-hidden border border-border/40 bg-card/90 backdrop-blur-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)]"
      >
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        </div>

        <div className="relative px-8 py-10 text-center flex flex-col items-center">
          <AnimatePresence>
            <motion.div
              key="icon"
              initial={{ scale: 0.7, opacity: 0, y: 6 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0.1 : 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-border/50 bg-background/60 shadow-inner"
            >
              <BookOpen className="h-5 w-5 text-primary" strokeWidth={1.75} />
            </motion.div>
          </AnimatePresence>

          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3"
          >
            Welcome back
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.18, duration: 0.4 }}
            className="font-serif text-[1.6rem] leading-tight text-foreground tracking-tight"
          >
            Nice to see you again,
            <br />
            <span className="bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent">
              {name}
            </span>
          </motion.h2>

          <motion.div
            className="mt-7 h-px w-full max-w-[220px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"
            initial={{ scaleX: 0, opacity: 0.4 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: reduceMotion ? 0.1 : 2.0, ease: "linear" }}
            style={{ transformOrigin: "left" }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
