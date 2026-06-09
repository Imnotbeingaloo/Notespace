import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sparkles } from "lucide-react";

interface WelcomeBackDialogProps {
  name: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Lightweight "Nice to see you again, [Name]!" overlay shown once per
 * session right after a returning user signs in. Auto-dismisses into the
 * app after a brief, polished delay.
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
        reduceMotion ? 900 : 2200
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
        className="sm:max-w-md p-0 overflow-hidden border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl"
      >
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -top-24 -right-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
        </div>
        <div className="relative px-7 py-8 text-center min-h-[220px] flex flex-col items-center justify-center">
          <AnimatePresence>
            <motion.div
              key="icon"
              initial={{ scale: 0.6, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: reduceMotion ? 0.1 : 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-xl shadow-primary/40 mb-5"
            >
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </motion.div>
          </AnimatePresence>
          <motion.h2
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.15, duration: 0.4 }}
            className="font-serif text-2xl text-foreground tracking-tight"
          >
            Nice to see you again,{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {name}
            </span>
            !
          </motion.h2>
          <motion.div
            className="mt-5 h-0.5 w-40 rounded-full bg-gradient-to-r from-transparent via-primary/60 to-transparent"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: reduceMotion ? 0.1 : 1.8, ease: "linear" }}
            style={{ transformOrigin: "left" }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
