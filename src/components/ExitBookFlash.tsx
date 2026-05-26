import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * "Leaving the app" splash — intentionally mirrors the app entry splash.
 * Keep the completion timer independent from parent re-renders; the landing
 * page has active typewriter animations, so depending on the inline onDone
 * callback would continually reset the timeout and leave this overlay stuck.
 */
export function ExitBookFlash({ onDone }: { onDone: () => void }) {
  const onDoneRef = useRef(onDone);
  const [isDarkExit] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("app-theme") === "dark" || document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const t = window.setTimeout(() => onDoneRef.current(), 650);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, filter: "blur(6px)" }}
      transition={{ duration: 0.3, ease: [0.65, 0, 0.35, 1] }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center pointer-events-none overflow-hidden"
      style={{ backgroundColor: `hsl(var(${isDarkExit ? "--exit-splash-dark" : "--exit-splash-light"}))` }}
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.15 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="absolute h-80 w-80 rounded-full bg-primary blur-3xl"
      />

      <motion.img
        src="/logo.png"
        alt="Notebook Archive"
        className="relative z-10 h-20 w-20 object-contain"
        initial={{ scale: 0.3, opacity: 0, rotate: -15 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      />

      <motion.span
        className="relative z-10 mt-5 font-serif text-2xl font-bold text-foreground"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.12, ease: "easeOut" }}
      >
        Notebook Archive
      </motion.span>

      <div className="relative z-10 mt-6 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-primary"
            initial={{ opacity: 0.3, scale: 0.8 }}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
          />
        ))}
      </div>
    </motion.div>
  );
}
