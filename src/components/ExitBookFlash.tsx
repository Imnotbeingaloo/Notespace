import { useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

/**
 * "Leaving the app" splash — book mark visible the entire time, then a quick
 * fade. Coordinated with AnimatePresence: onDone fires right as the icon
 * finishes its arc so the exit fade is the only thing between splash and page.
 */
export function ExitBookFlash({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onDone, 850);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none overflow-hidden"
      style={{ background: "radial-gradient(ellipse at center, #1a1a26 0%, #0a0a12 100%)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 0.55, scale: 1.8 }}
        transition={{ duration: 0.85, ease: "easeOut" }}
        className="absolute h-96 w-96 rounded-full bg-primary/25 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 10 }}
        animate={{ opacity: 1, scale: 1.05, y: -2 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col items-center gap-3"
      >
        <BookOpen className="h-14 w-14 text-primary" strokeWidth={1.6} />
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground"
        >
          Closing the notebook
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
