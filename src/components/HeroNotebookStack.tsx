import { motion, useReducedMotion } from "framer-motion";

/**
 * Hero ink field — a full-bleed decorative layer for the right side of the
 * dashboard hero. Strokes run off the top, right and bottom edges so the mark
 * reads as part of the page rather than an object placed on it. The left side
 * is masked out so it dissolves under the headline copy.
 */
export function HeroNotebookStack() {
  const reduce = useReducedMotion();
  const draw = (delay: number, duration = 1.6) => ({
    initial: reduce ? false : { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { duration, delay, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 right-0 hidden lg:block w-[52%] max-w-[720px] select-none"
      style={{
        maskImage:
          "linear-gradient(to right, transparent 0%, black 34%, black 88%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 34%, black 88%, transparent 100%)",
      }}
    >
      {/* highlighter smear, bleeds past the right edge */}
      <motion.span
        className="absolute right-[10%] top-[38%] h-[18px] -rotate-[1.5deg] rounded-[3px] bg-ochre/20"
        initial={reduce ? false : { width: 0 }}
        animate={{ width: 190 }}
        transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
      />

      <svg
        viewBox="0 0 720 200"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        fill="none"
      >
        {/* long irregular rules running clean off both edges */}
        <motion.path
          d="M-20 54C90 40 168 66 262 56s150-34 246-20 138 34 252 22"
          stroke="hsl(var(--foreground) / 0.16)"
          strokeWidth="1.4"
          strokeLinecap="round"
          {...draw(0.1, 2)}
        />
        <motion.path
          d="M-20 128C104 142 176 112 286 122s160 30 244 14 158-26 230-6"
          stroke="hsl(var(--foreground) / 0.12)"
          strokeWidth="1.4"
          strokeLinecap="round"
          {...draw(0.3, 2.2)}
        />
        {/* indigo handwriting scrawl */}
        <motion.path
          d="M60 92c34-30 54 12 84-2s24-36 54-24 34 30 66 16 28-30 62-22 30 32 62 22"
          stroke="hsl(var(--accent))"
          strokeWidth="2.6"
          strokeLinecap="round"
          {...draw(0.2, 1.8)}
        />
        {/* stroke escaping off the top edge */}
        <motion.path
          d="M430 -30c-14 44 22 62 6 104"
          stroke="hsl(var(--accent) / 0.5)"
          strokeWidth="2"
          strokeLinecap="round"
          {...draw(0.9)}
        />
        {/* stroke escaping off the bottom edge */}
        <motion.path
          d="M214 118c10 46-18 60-6 112"
          stroke="hsl(var(--sage) / 0.55)"
          strokeWidth="2"
          strokeLinecap="round"
          {...draw(1.05)}
        />
        {/* trailing tail off the right edge */}
        <motion.path
          d="M566 96c48-22 96 6 190-10"
          stroke="hsl(var(--accent-2) / 0.45)"
          strokeWidth="1.8"
          strokeLinecap="round"
          {...draw(1.2)}
        />
        {/* sage check, off-grid */}
        <motion.path
          d="M498 140l9 10 17-22"
          stroke="hsl(var(--sage))"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          {...draw(1.35, 0.9)}
        />
      </svg>

      {/* page-marker tabs bleeding off the right edge */}
      <div className="absolute right-0 top-[16%] flex flex-col gap-2.5">
        {[
          { c: "bg-accent", w: "w-14" },
          { c: "bg-sage", w: "w-9" },
          { c: "bg-ochre", w: "w-20" },
          { c: "bg-accent-2", w: "w-6" },
        ].map((t, i) => (
          <motion.span
            key={i}
            className={`block h-[7px] rounded-l-full ${t.c} ${t.w} opacity-70`}
            initial={reduce ? false : { x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 0.7 }}
            transition={{ duration: 0.7, delay: 0.35 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </div>

      {/* resting nib dot */}
      <motion.span
        className="absolute right-[26%] bottom-[18%] h-2 w-2 rounded-full bg-accent-2"
        animate={reduce ? undefined : { scale: [1, 1.3, 1], opacity: [0.5, 0.95, 0.5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        className="absolute right-[44%] top-[22%] h-1.5 w-1.5 rounded-full bg-sage/80"
        animate={reduce ? undefined : { y: [0, -7, 0], opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      />
    </div>
  );
}

export default HeroNotebookStack;
