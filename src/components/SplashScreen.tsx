import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
  fast?: boolean;
}

export function SplashScreen({ onComplete, fast = false }: SplashScreenProps) {
  const [isDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("app-theme") === "dark" || document.documentElement.classList.contains("dark");
  });
  const [phase, setPhase] = useState<"logo" | "text" | "done">("logo");

  useEffect(() => {
    if (fast) {
      // Quick crossfade — under 600ms total
      const t1 = setTimeout(() => setPhase("text"), 80);
      const t2 = setTimeout(() => setPhase("done"), 350);
      const t3 = setTimeout(onComplete, 550);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
    const t1 = setTimeout(() => setPhase("text"), 350);
    const t2 = setTimeout(() => setPhase("done"), 1800);
    const t3 = setTimeout(onComplete, 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete, fast]);

  return (
    <AnimatePresence>
      {phase !== "done" ? (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: fast ? 1.0 : 1.05, filter: fast ? undefined : "blur(8px)" }}
          transition={{ duration: fast ? 0.25 : 0.6, ease: [0.65, 0, 0.35, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.15 }}
            transition={{ duration: fast ? 0.4 : 1.5, ease: "easeOut" }}
            className="absolute w-80 h-80 rounded-full bg-primary blur-3xl"
          />

          <motion.img
            src="/logo.png"
            alt="Notebook Archive"
            className="relative z-10 h-20 w-20 object-contain"
            initial={{ scale: 0.3, opacity: 0, rotate: fast ? 0 : -15 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: fast ? 0.3 : 0.7, ease: [0.16, 1, 0.3, 1] }}
          />

          {!fast && (
            <>
              <motion.span
                className="font-serif text-2xl font-bold mt-5 relative z-10"
                style={{ color: isDark ? "#ffffff" : "#000000" }}
                initial={{ opacity: 0, y: 12 }}
                animate={phase !== "logo" ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                Notebook Archive
              </motion.span>

              <div className="flex gap-1.5 mt-6 relative z-10">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-primary"
                    initial={{ opacity: 0.3, scale: 0.8 }}
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
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
