import { motion, useReducedMotion } from "framer-motion";

/**
 * Hero paper field — the whole hero band reads as a sheet of notebook paper:
 * full-width ruled lines that sweep in, a margin rule, punch holes down the
 * left edge and a couple of quiet marginalia marks on the right. It covers the
 * entire section instead of sitting in one corner as a separate object.
 */
export function HeroNotebookStack() {
  const reduce = useReducedMotion();

  // ruled lines on a 28px rhythm — matches the editor grid
  const rules = Array.from({ length: 9 }, (_, i) => i);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 select-none overflow-hidden">
      {/* ruled lines across the full width */}
      <div className="absolute inset-0">
        {rules.map((i) => (
          <motion.span
            key={i}
            className="absolute left-0 right-0 h-px origin-left bg-foreground/[0.09]"
            style={{ top: `${(i + 1) * 28}px` }}
            initial={reduce ? false : { scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.05 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </div>

      {/* margin rule */}
      <motion.span
        className="absolute top-0 bottom-0 left-16 sm:left-24 w-px bg-accent-2/30 origin-top"
        initial={reduce ? false : { scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* punch holes down the left edge */}
      <div className="absolute left-5 sm:left-8 inset-y-0 hidden sm:flex flex-col justify-evenly py-4">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block h-3 w-3 rounded-full border border-foreground/10 bg-foreground/[0.05]"
            initial={reduce ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </div>

      {/* marginalia: highlighter sweep sitting exactly on a rule */}
      <motion.span
        className="absolute right-[8%] top-[84px] hidden lg:block h-[16px] -translate-y-[13px] -rotate-[0.8deg] rounded-[2px] bg-ochre/20"
        initial={reduce ? false : { width: 0 }}
        animate={{ width: 150 }}
        transition={{ duration: 0.9, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* sage tick in the right margin */}
      <svg
        aria-hidden
        className="absolute right-[5%] top-[112px] hidden lg:block h-5 w-6"
        viewBox="0 0 24 20"
        fill="none"
      >
        <motion.path
          d="M3 11l6 6L21 3"
          stroke="hsl(var(--sage))"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduce ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 1, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>

      {/* page-marker tabs bleeding off the right edge */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-2">
        {[
          { c: "bg-accent", w: "w-10" },
          { c: "bg-sage", w: "w-6" },
          { c: "bg-ochre", w: "w-14" },
        ].map((t, i) => (
          <motion.span
            key={i}
            className={`block h-[6px] rounded-l-full ${t.c} ${t.w} opacity-60`}
            initial={reduce ? false : { x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 0.6 }}
            transition={{ duration: 0.6, delay: 0.5 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </div>

      {/* soften the paper under the headline copy */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent lg:to-background/0" />
    </div>
  );
}

export default HeroNotebookStack;
