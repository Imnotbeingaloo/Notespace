import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Play, Pause, RotateCcw, Coffee, Brain, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

type PomodoroPhase = "work" | "break" | "longBreak";

const PHASE_CONFIG: Record<PomodoroPhase, { duration: number; label: string; icon: React.ReactNode; color: string }> = {
  work: { duration: 25 * 60, label: "Focus", icon: <Brain className="h-4 w-4" />, color: "text-primary" },
  break: { duration: 5 * 60, label: "Short Break", icon: <Coffee className="h-4 w-4" />, color: "text-emerald-500" },
  longBreak: { duration: 15 * 60, label: "Long Break", icon: <Coffee className="h-4 w-4" />, color: "text-amber-500" },
};

export function PomodoroTimer({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<PomodoroPhase>("work");
  const [timeLeft, setTimeLeft] = useState(PHASE_CONFIG.work.duration);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const config = PHASE_CONFIG[phase];

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!running) {
      clearTimer();
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          setRunning(false);
          // Phase complete
          if (phase === "work") {
            const newSessions = sessions + 1;
            setSessions(newSessions);
            toast.success(`🎉 Focus session #${newSessions} complete!`);
            if (newSessions % 4 === 0) {
              setPhase("longBreak");
              return PHASE_CONFIG.longBreak.duration;
            } else {
              setPhase("break");
              return PHASE_CONFIG.break.duration;
            }
          } else {
            toast.info("☕ Break's over — time to focus!");
            setPhase("work");
            return PHASE_CONFIG.work.duration;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return clearTimer;
  }, [running, phase, sessions, clearTimer]);

  const reset = () => {
    clearTimer();
    setRunning(false);
    setTimeLeft(PHASE_CONFIG[phase].duration);
  };

  const switchPhase = (p: PomodoroPhase) => {
    clearTimer();
    setRunning(false);
    setPhase(p);
    setTimeLeft(PHASE_CONFIG[p].duration);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = 1 - timeLeft / config.duration;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: 12 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-5 right-5 z-50 w-[300px] rounded-3xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl shadow-primary/10 overflow-hidden ring-1 ring-foreground/[0.02]"
    >
      {/* Subtle gradient header band */}
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-primary/[0.06] to-transparent pointer-events-none" />
        <div className="relative flex items-center justify-between px-4 py-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
              <Timer className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-[11px] font-semibold tracking-wide text-foreground uppercase">Pomodoro</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-medium text-muted-foreground bg-muted/70 px-1.5 py-0.5 rounded-full">
              {sessions} session{sessions !== 1 ? "s" : ""}
            </span>
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg" onClick={onClose}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Phase tabs */}
      <div className="flex gap-1 px-3 pt-3">
        {(["work", "break", "longBreak"] as PomodoroPhase[]).map((p) => (
          <button
            key={p}
            onClick={() => switchPhase(p)}
            className={`flex-1 text-[10px] font-medium py-1.5 rounded-lg transition-all ${
              phase === p
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {PHASE_CONFIG[p].label}
          </button>
        ))}
      </div>

      {/* Timer display */}
      <div className="flex flex-col items-center py-6 px-4">
        <div className="relative w-36 h-36">
          {/* Progress ring */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/30" />
            <motion.circle
              cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="3"
              className={config.color}
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 44}
              animate={{ strokeDashoffset: 2 * Math.PI * 44 * (1 - progress) }}
              transition={{ duration: 0.5, ease: "linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold font-mono ${config.color}`}>
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
            <span className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
              {config.icon} {config.label}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 px-4 pb-4">
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={reset}>
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => setRunning((p) => !p)}
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg shadow-primary/20"
        >
          {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
        </Button>
        <div className="w-9" /> {/* spacer for symmetry */}
      </div>
    </motion.div>
  );
}
