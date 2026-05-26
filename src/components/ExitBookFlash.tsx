import { useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

/**
 * Richer "leaving the app" splash — a book opens, glows, and fades out.
 * Driven by framer-motion so it stays smooth while Landing hydrates.
 */
export function ExitBookFlash({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    // Hard fallback in case the exit animation never fires.
    const t = window.setTimeout(onDone, 1600);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none overflow-hidden"
      style={{ background: "radial-gradient(ellipse at center, #14141f 0%, #08080d 100%)" }}
    >
      {/* Soft radial wash */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: [0, 0.7, 0], scale: [0.6, 1.6, 2.2] }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute h-96 w-96 rounded-full bg-primary/15 blur-3xl"
      />

      {/* Book mark */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7, y: 12, rotate: -4 }}
        animate={{
          opacity: [0, 1, 1, 0],
          scale: [0.7, 1, 1.05, 1.15],
          y: [12, 0, -2, -8],
          rotate: [-4, 0, 0, 2],
        }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], times: [0, 0.3, 0.75, 1] }}
        className="relative flex flex-col items-center gap-3"
      >
        <BookOpen className="h-14 w-14 text-primary" strokeWidth={1.6} />
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: [0, 1, 1, 0], y: [4, 0, 0, -2] }}
          transition={{ duration: 1.2, times: [0, 0.35, 0.75, 1] }}
          className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground"
        >
          Closing the notebook
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
