import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * "Leaving the app" splash — mirrors the entry SplashScreen sequence
 * (logo pop → title fade-in → animated dots) so the hand-off feels symmetrical.
 * Timer is stabilised via a ref so the landing page's typewriter re-renders
 * cannot reset the completion countdown.
 */
export function ExitBookFlash({ onDone }: { onDone: () => void }) {
  const onDoneRef = useRef(onDone);
  const [phase, setPhase] = useState<"logo" | "text" | "done">("logo");
  const [isDarkExit] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("app-theme") === "dark" || document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase("text"), 350);
    const t2 = window.setTimeout(() => setPhase("done"), 1800);
    const t3 = window.setTimeout(() => onDoneRef.current(), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          key="exit-splash"
          aria-hidden
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(8px)" }}
          transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center pointer-events-none overflow-hidden"
          style={{ backgroundColor: `hsl(var(${isDarkExit ? "--exit-splash-dark" : "--exit-splash-light"}))` }}
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.15 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute h-80 w-80 rounded-full bg-primary blur-3xl"
          />

          <motion.img
            src="/logo.png"
            alt="Notebook Archive"
            className="relative z-10 h-[3rem] w-[3rem] object-contain"
            initial={{ scale: 0.3, opacity: 0, rotate: -15 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />

          <motion.span
            className="relative z-10 mt-5 font-serif text-2xl font-bold"
            style={{ color: isDarkExit ? "#ffffff" : "#000000" }}
            initial={{ opacity: 0, y: 12 }}
            animate={phase !== "logo" ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
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
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
