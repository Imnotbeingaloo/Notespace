import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onComplete: () => void;
  fast?: boolean;
}

/**
 * Entry splash (website → app).
 *
 * This is the ORIGINAL sequence and it must stay this way: the logo POPS in
 * place (scale up from 0.3 with a small rotational unwind), the wordmark fades
 * up under it, then three dots pulse. Nothing slides in from any edge.
 * `ExitBookFlash` runs the exact same sequence so app → website is symmetrical.
 */
export function SplashScreen({ onComplete, fast = false }: SplashScreenProps) {
  const [isDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("app-theme");
    if (stored === "dark") return true;
    if (stored === "light") return false;
    if (document.documentElement.classList.contains("dark")) return true;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });
  const [phase, setPhase] = useState<"logo" | "text" | "done">("logo");

  useEffect(() => {
    if (fast) {
      const t1 = setTimeout(() => setPhase("text"), 60);
      const t2 = setTimeout(() => setPhase("done"), 280);
      const t3 = setTimeout(onComplete, 440);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
    const t1 = setTimeout(() => setPhase("text"), 220);
    const t2 = setTimeout(() => setPhase("done"), 1100);
    const t3 = setTimeout(onComplete, 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete, fast]);

  return (
    <AnimatePresence>
      {phase !== "done" ? (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: fast ? 1.0 : 1.03 }}
          transition={{ duration: fast ? 0.22 : 0.45, ease: [0.65, 0, 0.35, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
        >
          <motion.div
            className="absolute w-80 h-80 rounded-full bg-primary blur-3xl"
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.15 }}
            transition={{ duration: fast ? 0.6 : 1.4, ease: "easeOut" }}
          />

          <motion.img
            src="/logo.png"
            alt="Notespace"
            className="relative z-10 h-[3rem] w-[3rem] object-contain"
            initial={{ scale: 0.3, opacity: 0, rotate: fast ? 0 : -15 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: fast ? 0.32 : 0.7, ease: [0.16, 1, 0.3, 1] }}
          />

          {!fast && (
            <>
              <motion.span
                className="font-serif text-2xl font-bold mt-5 relative z-10"
                style={{ color: isDark ? "#ffffff" : "#000000" }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.22, ease: "easeOut" }}
              >
                Notespace
              </motion.span>

              <div className="flex gap-1.5 mt-6 relative z-10">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-primary"
                    initial={{ opacity: 0.3, scale: 0.8 }}
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.15, 0.8] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
                  />
                ))}
              </div>
            </>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
