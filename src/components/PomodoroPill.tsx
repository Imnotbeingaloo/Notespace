import { Link } from "react-router-dom";
import { Timer } from "lucide-react";
import { usePomodoro, formatPomodoro } from "@/lib/pomodoro-store";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Compact running-timer pill.
 * - Desktop/tablet: sits in the app top bar (inline variant).
 * - Mobile: sits as a thin sticky strip under the top bar (strip variant).
 * Hidden entirely when no session is running.
 */
export function PomodoroPill({ variant }: { variant: "inline" | "strip" }) {
  const { running, timeLeft, phase } = usePomodoro();
  if (!running) return null;

  const phaseLabel = phase === "work" ? "Focus" : phase === "break" ? "Break" : "Long break";
  const tone =
    phase === "work"
      ? "text-primary"
      : phase === "break"
        ? "text-emerald-500"
        : "text-amber-500";

  if (variant === "strip") {
    return (
      <Link
        to="/app/pomodoro"
        className="flex items-center justify-center gap-2 w-full px-3 py-1.5 border-b border-border bg-primary/[0.04] text-[11px] font-medium hover:bg-primary/[0.08] transition-colors"
        aria-label={`Pomodoro ${phaseLabel} - ${formatPomodoro(timeLeft)} remaining. Tap to open.`}
      >
        <Timer className={`h-3.5 w-3.5 ${tone}`} />
        <span className={`font-mono tabular-nums ${tone}`}>{formatPomodoro(timeLeft)}</span>
        <span className="text-muted-foreground">· {phaseLabel}</span>
      </Link>
    );
  }

  return (
    <Link
      to="/app/pomodoro"
      className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-primary/[0.05] hover:bg-primary/[0.09] transition-colors text-[11px] font-medium"
      aria-label={`Pomodoro ${phaseLabel} - ${formatPomodoro(timeLeft)} remaining. Click to open.`}
      title={`${phaseLabel} · click to open Pomodoro`}
    >
      <Timer className={`h-3 w-3 ${tone}`} />
      <span className={`font-mono tabular-nums ${tone}`}>{formatPomodoro(timeLeft)}</span>
    </Link>
  );
}

/** Convenience: automatically renders the correct variant per viewport. */
export function PomodoroPillAuto() {
  const isMobile = useIsMobile();
  return <PomodoroPill variant={isMobile ? "strip" : "inline"} />;
}
