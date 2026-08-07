import { motion, useReducedMotion } from "framer-motion";

interface HeroNotebookStackProps {
  /** Kept for API compatibility with the hero — intentionally unused. */
  notebookCount?: number;
  noteCount?: number;
}

/** Ink strokes standing in for handwriting. Lengths are hand-picked so the
 *  ragged right edge reads like a real paragraph rather than a placeholder. */
const STROKES = [
  { y: 22, w: 178 },
  { y: 50, w: 202 },
  { y: 78, w: 146 },
  { y: 106, w: 194 },
  { y: 134, w: 88 },
];

/**
 * Purely decorative hero accent: a scrap of ruled paper, taped down, with a
 * few lines of "handwriting" that ink themselves in on load and a small nib
 * flourish underneath. No data, no date — it exists to make the page feel
 * like a desk rather than a dashboard.
 */
export function HeroNotebookStack(_props: HeroNotebookStackProps) {
  const reduce = useReducedMotion();

  return (
    <div aria-hidden className="relative hidden lg:block w-[300px] shrink-0 select-none mr-4">
      {/* scraps stacked underneath */}
      <div className="absolute -right-3 top-4 h-full w-full rotate-[2.2deg] rounded-sm border border-border/60 bg-card/60" />
      <div className="absolute -left-2 top-2 h-full w-full -rotate-[1.6deg] rounded-sm border border-border/50 bg-card/40" />

      <motion.div
        className="relative overflow-hidden rounded-sm border border-border bg-card shadow-[0_18px_40px_-28px_hsl(var(--foreground)/0.5)]"
        initial={reduce ? false : { opacity: 0, y: 12, rotate: -1.8 }}
        animate={{ opacity: 1, y: 0, rotate: -0.9 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* ruled paper */}
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent 0 27px, hsl(var(--foreground)/0.09) 27px 28px)",
          }}
        />
        {/* margin rule */}
        <div className="pointer-events-none absolute inset-y-0 left-10 w-px bg-accent-2/50" />

        <div className="relative px-6 pb-7 pl-14 pt-7">
          <svg
            viewBox="0 0 210 176"
            className="w-full overflow-visible"
            fill="none"
            strokeLinecap="round"
          >
            {STROKES.map((s, i) => (
              <motion.path
                key={s.y}
                d={`M2 ${s.y} H${s.w}`}
                stroke="hsl(var(--foreground) / 0.34)"
                strokeWidth={i === 0 ? 5 : 3.5}
                initial={reduce ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.25 + i * 0.11, ease: "easeOut" }}
              />
            ))}
            {/* nib flourish signing off the page */}
            <motion.path
              d="M2 166 C 34 150, 58 178, 90 160 S 140 146, 168 164"
              stroke="hsl(var(--accent))"
              strokeWidth={3}
              initial={reduce ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.9, delay: 0.95, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
        </div>

        {/* page markers on the right edge */}
        <div className="absolute right-0 top-10 flex flex-col gap-1.5">
          <span className="block h-6 w-1.5 rounded-l-sm bg-accent/70" />
          <span className="block h-6 w-1.5 rounded-l-sm bg-ochre/70" />
          <span className="block h-6 w-1.5 rounded-l-sm bg-sage/70" />
        </div>
      </motion.div>

      {/* tape holding it to the page */}
      <div className="absolute -top-2.5 left-8 h-5 w-20 -rotate-[7deg] bg-ochre/50 shadow-sm" />
      <div className="absolute -bottom-2 right-10 h-4 w-16 rotate-[5deg] bg-ochre/40 shadow-sm" />
    </div>
  );
}

export default HeroNotebookStack;
