import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * "Leaving the app" splash - mirrors the entry SplashScreen sequence
 * (logo pop → title fade-in → animated dots) so the hand-off feels symmetrical.
 * Timer is stabilised via a ref so the landing page's typewriter re-renders
 * cannot reset the completion countdown.
 */
export function ExitBookFlash({ onDone }: { onDone: () => void }) {
  const onDoneRef = useRef(onDone);
  const [phase, setPhase] = useState<"logo" | "text" | "done">("logo");
  const [isDarkExit] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("app-theme");
    if (stored === "dark") return true;
    if (stored === "light") return false;
    if (document.documentElement.classList.contains("dark")) return true;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase("text"), 220);
    const t2 = window.setTimeout(() => setPhase("done"), 1100);
    const t3 = window.setTimeout(() => onDoneRef.current(), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          key="exit-splash"
          aria-hidden
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.45, ease: [0.65, 0, 0.35, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center pointer-events-none overflow-hidden"
          style={{ backgroundColor: `hsl(var(${isDarkExit ? "--exit-splash-dark" : "--exit-splash-light"}))` }}
        >
          <div className="absolute h-80 w-80 rounded-full bg-primary blur-3xl splash-glow" />

          <img
            src="/logo.png"
            alt="Notespace"
            className="relative z-10 h-[3rem] w-[3rem] object-contain splash-logo"
          />

          <span
            className="relative z-10 mt-5 font-serif text-2xl font-bold splash-word"
            style={{ color: isDarkExit ? "#ffffff" : "#000000" }}
          >
            Notespace
          </span>

          <div className="relative z-10 mt-6 flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-primary splash-dot"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
