import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { motion, type PanInfo } from "framer-motion";
import { Brain, Coffee } from "lucide-react";
import { usePomodoro, formatPomodoro } from "@/lib/pomodoro-store";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Compact running-timer pill.
 * - Desktop/tablet ("inline"): free-draggable within the top bar. Only the
 *   number + a phase icon are shown. Position is *not* persisted — it snaps
 *   back to its default anchor on reload; only the session count survives.
 * - Mobile ("strip"): stays as a thin sticky strip under the top bar.
 * Hidden entirely when no session is running.
 */
export function PomodoroPill({ variant }: { variant: "inline" | "strip" }) {
  const { running, timeLeft, phase } = usePomodoro();
  const navigate = useNavigate();
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const draggedRef = useRef(false);

  if (!running) return null;

  const phaseLabel = phase === "work" ? "Focus" : phase === "break" ? "Break" : "Long break";
  const tone =
    phase === "work"
      ? "text-primary"
      : phase === "break"
        ? "text-emerald-500"
        : "text-amber-500";
  const Icon = phase === "work" ? Brain : Coffee;

  if (variant === "strip") {
    return (
      <button
        onClick={() => navigate("/app/pomodoro")}
        className="flex items-center justify-center gap-2 w-full px-3 py-1.5 border-b border-border bg-primary/[0.04] text-[11px] font-medium hover:bg-primary/[0.08] transition-colors"
        aria-label={`Pomodoro ${phaseLabel} - ${formatPomodoro(timeLeft)} remaining. Tap to open.`}
      >
        <Icon className={`h-3.5 w-3.5 ${tone}`} />
        <span className={`font-mono tabular-nums ${tone}`}>{formatPomodoro(timeLeft)}</span>
        <span className="text-muted-foreground">· {phaseLabel}</span>
      </button>
    );
  }

  const handleDragStart = (_: unknown, info: PanInfo) => {
    startRef.current = { x: info.point.x, y: info.point.y };
    draggedRef.current = false;
  };
  const handleDrag = (_: unknown, info: PanInfo) => {
    if (!startRef.current) return;
    const dx = info.point.x - startRef.current.x;
    const dy = info.point.y - startRef.current.y;
    if (Math.hypot(dx, dy) > 4) draggedRef.current = true;
  };
  const handleClick = () => {
    if (draggedRef.current) return;
    navigate("/app/pomodoro");
  };

  return (
    <motion.button
      type="button"
      drag
      dragMomentum={false}
      dragElastic={0.12}
      dragConstraints={{ left: -600, right: 40, top: -8, bottom: 40 }}
      whileDrag={{ scale: 1.06, cursor: "grabbing" }}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onClick={handleClick}
      className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-background/95 backdrop-blur shadow-sm hover:shadow-md hover:bg-primary/[0.06] transition-shadow text-[11px] font-medium select-none cursor-grab active:cursor-grabbing touch-none"
      aria-label={`Pomodoro ${phaseLabel} - ${formatPomodoro(timeLeft)} remaining. Drag to move, click to open.`}
      title={`${phaseLabel} · drag to move · click to open`}
    >
      <Icon className={`h-3 w-3 ${tone}`} />
      <span className={`font-mono tabular-nums ${tone}`}>{formatPomodoro(timeLeft)}</span>
    </motion.button>
  );
}

/** Convenience: automatically renders the correct variant per viewport. */
export function PomodoroPillAuto() {
  const isMobile = useIsMobile();
  return <PomodoroPill variant={isMobile ? "strip" : "inline"} />;
}
