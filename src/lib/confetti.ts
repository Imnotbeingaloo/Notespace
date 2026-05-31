import confetti from "canvas-confetti";

type CelebrationSource = "study-planner" | "word-goal";

const CELEBRATION_COLORS = [
  "hsl(172, 50%, 36%)",
  "hsl(32, 80%, 55%)",
  "hsl(48, 96%, 53%)",
  "hsl(262, 83%, 58%)",
  "hsl(0, 84%, 60%)",
];

function logConfetti(source: CelebrationSource, message: string, extra?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const payload = {
    source,
    message,
    canvasCount: document.querySelectorAll("canvas").length,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    reducedMotion: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    ...extra,
  };
  console.info("[confetti-diagnostics]", payload);
}

export function fireNotebookConfetti(source: CelebrationSource) {
  if (typeof window === "undefined") return;

  logConfetti(source, "starting");

  const defaults = {
    colors: CELEBRATION_COLORS,
    disableForReducedMotion: false,
    scalar: 1.1,
    zIndex: 2147483647,
  };

  try {
    confetti({ ...defaults, particleCount: 80, spread: 70, origin: { x: 0.5, y: 0.35 } });
    confetti({ ...defaults, particleCount: 55, angle: 60, spread: 65, origin: { x: 0, y: 0.78 } });
    confetti({ ...defaults, particleCount: 55, angle: 120, spread: 65, origin: { x: 1, y: 0.78 } });

    window.setTimeout(() => {
      logConfetti(source, "after burst", {
        visibleCanvasCount: Array.from(document.querySelectorAll("canvas")).filter((canvas) => {
          const style = window.getComputedStyle(canvas);
          return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity || 1) > 0;
        }).length,
      });
    }, 120);
  } catch (error) {
    logConfetti(source, "failed", { error: error instanceof Error ? error.message : String(error) });
  }
}