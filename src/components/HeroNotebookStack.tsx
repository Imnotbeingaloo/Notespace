import { motion, useReducedMotion } from "framer-motion";

/**
 * Hero margin mark — a flat, in-page ink flourish for the dashboard hero.
 * No floating card, no 3D object: it reads as ink laid directly on the
 * hero paper. Pure SVG/CSS.
 */
export function HeroNotebookStack() {
  const reduce = useReducedMotion();
  const draw = (delay: number) => ({
    initial: reduce ? false : { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { duration: 1.4, delay, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <div aria-hidden className="relative h-[104px] w-[300px] select-none">
      {/* highlighter sweep, sits under the ink */}
      <motion.span
        className="absolute left-[6px] top-[30px] h-[15px] rounded-[2px] bg-ochre/25"
        initial={reduce ? false : { width: 0 }}
        animate={{ width: 118 }}
        transition={{ duration: 0.9, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
      />

      <svg
        viewBox="0 0 300 104"
        className="absolute inset-0 h-full w-full overflow-visible"
        fill="none"
      >
        {/* handwriting strokes */}
        <motion.path
          d="M6 40c14-13 22 4 34-2s10-14 22-9 14 12 26 6 12-12 24-8"
          stroke="hsl(var(--accent))"
          strokeWidth="2.4"
          strokeLinecap="round"
          {...draw(0.15)}
        />
        <motion.path
          d="M6 62c26-6 44 5 68 0s38-9 60-3"
          stroke="hsl(var(--foreground) / 0.35)"
          strokeWidth="1.6"
          strokeLinecap="round"
          {...draw(0.45)}
        />
        <motion.path
          d="M6 80c18-4 30 3 46 1s26-6 40-3"
          stroke="hsl(var(--foreground) / 0.18)"
          strokeWidth="1.6"
          strokeLinecap="round"
          {...draw(0.7)}
        />
        {/* sage checkmark */}
        <motion.path
          d="M160 74l7 8 14-18"
          stroke="hsl(var(--sage))"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          {...draw(1.15)}
        />
        {/* indigo underline flourish */}
        <motion.path
          d="M150 26c22-9 46-9 72 1"
          stroke="hsl(var(--accent))"
          strokeWidth="2"
          strokeLinecap="round"
          {...draw(1.35)}
        />
      </svg>

      {/* page-marker tabs on the right edge */}
      <div className="absolute right-0 top-[10px] flex flex-col gap-2">
        {[
          { c: "bg-accent", w: "w-9" },
          { c: "bg-sage", w: "w-7" },
          { c: "bg-ochre", w: "w-11" },
        ].map((t, i) => (
          <motion.span
            key={i}
            className={`block h-[7px] rounded-l-full ${t.c} ${t.w} opacity-80`}
            initial={reduce ? false : { x: 26, opacity: 0 }}
            animate={{ x: 0, opacity: 0.8 }}
            transition={{ duration: 0.6, delay: 0.3 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </div>

      {/* ink dot that breathes, like a resting nib */}
      <motion.span
        className="absolute right-[62px] bottom-[10px] h-2 w-2 rounded-full bg-accent-2"
        animate={reduce ? undefined : { scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export default HeroNotebookStack;
