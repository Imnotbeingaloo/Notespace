import { useNavigate, Navigate, useLocation } from "react-router-dom";
import { ArrowLeft, Play, Pause, RotateCcw, Brain, Coffee, Timer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { NoindexHead } from "@/components/NoindexHead";
import {
  pomodoroStore,
  usePomodoro,
  POMODORO_PHASE_CONFIG,
  formatPomodoro,
  type PomodoroPhase,
} from "@/lib/pomodoro-store";
import { toast } from "@/components/ui/sonner";

const PHASE_META: Record<PomodoroPhase, { icon: React.ReactNode; ring: string; text: string; chipBg: string; hint: string }> = {
  work: {
    icon: <Brain className="h-4 w-4" />,
    ring: "stroke-primary",
    text: "text-primary",
    chipBg: "bg-primary/10 text-primary",
    hint: "Deep work. One thing at a time.",
  },
  break: {
    icon: <Coffee className="h-4 w-4" />,
    ring: "stroke-emerald-500",
    text: "text-emerald-500",
    chipBg: "bg-emerald-500/10 text-emerald-600",
    hint: "Stretch, breathe, sip water.",
  },
  longBreak: {
    icon: <Coffee className="h-4 w-4" />,
    ring: "stroke-amber-500",
    text: "text-amber-500",
    chipBg: "bg-amber-500/10 text-amber-600",
    hint: "Step away. Reset properly.",
  },
};

function PomodoroFullPage() {
  const navigate = useNavigate();
  const { phase, timeLeft, running, sessions } = usePomodoro();
  const config = POMODORO_PHASE_CONFIG[phase];
  const meta = PHASE_META[phase];
  const progress = 1 - timeLeft / config.duration;
  const C = 2 * Math.PI * 44;

  useEffect(() => {
    pomodoroStore.setOnPhaseComplete((finished, s) => {
      if (finished === "work") toast.success(`🎉 Focus session #${s} complete!`);
      else toast.info("☕ Break's over — time to focus!");
    });
    return () => pomodoroStore.setOnPhaseComplete(null);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <NoindexHead title="Pomodoro · Notespace" />

      {/* Top bar */}
      <header className="flex items-center gap-2 px-3 py-2 border-b border-border shrink-0">
        <button
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/home"))}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        <div className="ml-2 flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center">
            <Timer className="h-3.5 w-3.5 text-primary" />
          </div>
          <h1 className="font-serif text-sm font-bold text-foreground">Pomodoro</h1>
        </div>
        <span className="ml-auto text-[11px] font-medium text-muted-foreground bg-muted/70 px-2 py-1 rounded-full">
          {sessions} session{sessions !== 1 ? "s" : ""}
        </span>
      </header>

      {/* Ambient tint that shifts with phase */}
      <div className="relative flex-1 flex flex-col overflow-hidden">
        <AnimatePresence>
          <motion.div
            key={phase}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                phase === "work"
                  ? "radial-gradient(80% 60% at 50% 0%, hsl(var(--primary) / 0.10), transparent 70%)"
                  : phase === "break"
                    ? "radial-gradient(80% 60% at 50% 0%, rgb(16 185 129 / 0.10), transparent 70%)"
                    : "radial-gradient(80% 60% at 50% 0%, rgb(245 158 11 / 0.10), transparent 70%)",
            }}
          />
        </AnimatePresence>

        {/* Phase tabs */}
        <div className="relative z-10 px-4 pt-4">
          <div className="flex gap-1 p-1 rounded-2xl bg-muted/60 max-w-md mx-auto">
            {(["work", "break", "longBreak"] as PomodoroPhase[]).map((p) => (
              <button
                key={p}
                onClick={() => pomodoroStore.switchPhase(p)}
                className={`flex-1 text-xs font-medium py-2 rounded-xl transition-all ${
                  phase === p
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {POMODORO_PHASE_CONFIG[p].label}
              </button>
            ))}
          </div>
        </div>

        {/* Big circular timer */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-6">
          <div className="relative w-[min(78vw,340px)] aspect-square">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" strokeWidth="2.5" className="text-muted/30" stroke="currentColor" />
              <motion.circle
                cx="50" cy="50" r="44" fill="none" strokeWidth="2.5"
                className={meta.ring}
                strokeLinecap="round"
                strokeDasharray={C}
                animate={{ strokeDashoffset: C * (1 - progress) }}
                transition={{ duration: 0.5, ease: "linear" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${meta.chipBg}`}>
                {meta.icon} {config.label}
              </span>
              <motion.span
                key={formatPomodoro(timeLeft)}
                initial={{ opacity: 0.5, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`mt-3 font-mono font-bold tabular-nums ${meta.text}`}
                style={{ fontSize: "clamp(3.5rem, 14vw, 5.5rem)" }}
              >
                {formatPomodoro(timeLeft)}
              </motion.span>
              <span className="mt-2 text-xs text-muted-foreground text-center px-6">
                {meta.hint}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-10 flex items-center gap-6">
            <button
              onClick={() => pomodoroStore.reset()}
              className="h-12 w-12 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center"
              aria-label="Reset"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => pomodoroStore.toggle()}
              className={`h-20 w-20 rounded-full shadow-xl shadow-primary/25 flex items-center justify-center text-primary-foreground bg-primary hover:brightness-110 transition-all`}
              aria-label={running ? "Pause" : "Start"}
            >
              {running ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
            </motion.button>
            <div className="h-12 w-12" aria-hidden />
          </div>
        </div>

        {/* Session dots */}
        <div className="relative z-10 pb-8 pt-2 flex flex-col items-center gap-2">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 4 }).map((_, i) => {
              const done = i < sessions % 4 || (sessions > 0 && sessions % 4 === 0);
              return (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    done ? "w-6 bg-primary" : "w-3 bg-muted"
                  }`}
                />
              );
            })}
          </div>
          <span className="text-[11px] text-muted-foreground">
            {4 - (sessions % 4)} to your next long break
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AppPomodoroPage() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  if (!user) {
    const from = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/auth" replace state={{ from }} />;
  }

  return <PomodoroFullPage />;
}
