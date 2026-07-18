import { useEffect } from "react";
import { motion } from "framer-motion";
import { Timer, Play, Pause, RotateCcw, Coffee, Brain, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import {
  pomodoroStore,
  usePomodoro,
  POMODORO_PHASE_CONFIG,
  type PomodoroPhase,
} from "@/lib/pomodoro-store";

const PHASE_META: Record<PomodoroPhase, { icon: React.ReactNode; color: string }> = {
  work: { icon: <Brain className="h-4 w-4" />, color: "text-primary" },
  break: { icon: <Coffee className="h-4 w-4" />, color: "text-emerald-500" },
  longBreak: { icon: <Coffee className="h-4 w-4" />, color: "text-amber-500" },
};

interface PomodoroTimerProps {
  onClose?: () => void;
  /** "floating" (desktop widget, default) or "inline" (fills its container - mobile/tablet page). */
  variant?: "floating" | "inline";
}

export function PomodoroTimer({ onClose, variant = "floating" }: PomodoroTimerProps) {
  const { phase, timeLeft, running, sessions } = usePomodoro();
  const config = POMODORO_PHASE_CONFIG[phase];
  const meta = PHASE_META[phase];

  // Toast on phase completions - registered once per mount of a timer instance.
  useEffect(() => {
    pomodoroStore.setOnPhaseComplete((finished, s) => {
      if (finished === "work") {
        toast.success(`🎉 Focus session #${s} complete!`);
      } else {
        toast.info("☕ Break's over - time to focus!");
      }
    });
    return () => pomodoroStore.setOnPhaseComplete(null);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = 1 - timeLeft / config.duration;

  const isInline = variant === "inline";

  const container = isInline
    ? "w-full max-w-md mx-auto rounded-3xl border border-border/80 bg-card shadow-sm overflow-hidden"
    : "fixed bottom-5 right-5 z-50 w-[300px] rounded-3xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl shadow-primary/10 overflow-hidden ring-1 ring-foreground/[0.02]";

  const ringSize = isInline ? "w-56 h-56" : "w-36 h-36";
  const timeSize = isInline ? "text-5xl" : "text-3xl";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: 12 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={container}
    >
      {/* Header */}
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
            {onClose && (
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg" onClick={onClose}>
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Phase tabs */}
      <div className="flex gap-1 px-3 pt-3">
        {(["work", "break", "longBreak"] as PomodoroPhase[]).map((p) => (
          <button
            key={p}
            onClick={() => pomodoroStore.switchPhase(p)}
            className={`flex-1 text-[11px] font-medium py-1.5 rounded-lg transition-all ${
              phase === p ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {POMODORO_PHASE_CONFIG[p].label}
          </button>
        ))}
      </div>

      {/* Timer display */}
      <div className={`flex flex-col items-center px-4 ${isInline ? "py-8" : "py-6"}`}>
        <div className={`relative ${ringSize}`}>
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/30" />
            <motion.circle
              cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="3"
              className={meta.color}
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 44}
              animate={{ strokeDashoffset: 2 * Math.PI * 44 * (1 - progress) }}
              transition={{ duration: 0.5, ease: "linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`${timeSize} font-bold font-mono ${meta.color}`}>
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
            <span className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              {meta.icon} {config.label}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 px-4 pb-6">
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => pomodoroStore.reset()}>
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => pomodoroStore.toggle()}
          size="icon"
          className={isInline ? "h-14 w-14 rounded-full shadow-lg shadow-primary/20" : "h-12 w-12 rounded-full shadow-lg shadow-primary/20"}
        >
          {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
        </Button>
        <div className="w-9" />
      </div>
    </motion.div>
  );
}
