import { motion, useReducedMotion } from "framer-motion";

interface HeroNotebookStackProps {
  notebookCount?: number;
  noteCount?: number;
}

/**
 * Hero peel — the entire hero band is a sheet of ruled paper whose page is
 * folded back along one long diagonal, revealing a tinted underleaf with a
 * small ledger readout. The fold spans the full width and height of the
 * section, so it reads as the page itself rather than a placed object.
 */
export function HeroNotebookStack({ notebookCount = 0, noteCount = 0 }: HeroNotebookStackProps) {
  const reduce = useReducedMotion();

  const rules = Array.from({ length: 10 }, (_, i) => i);

  // fold runs from 54% along the top edge down to the bottom-right corner
  const TOP_SHEET = "polygon(0% 0%, 68% 0%, 100% 78%, 100% 100%, 0% 100%)";
  const FLAP_CLOSED = "polygon(68% 0%, 100% 78%, 68% 0%)";
  const FLAP_OPEN = "polygon(68% 0%, 100% 78%, 62% 62%)";

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 select-none overflow-hidden">
      {/* ---- underleaf: what the folded page reveals ---- */}
      <div className="absolute inset-0 bg-[hsl(var(--accent)/0.07)]">
        <div className="absolute inset-0">
          {rules.map((i) => (
            <span
              key={i}
              className="absolute left-0 right-0 h-px bg-accent/15"
              style={{ top: `${(i + 1) * 28}px` }}
            />
          ))}
        </div>

        {/* ledger readout sitting on the underleaf */}
        <motion.div
          className="absolute right-8 bottom-5 hidden text-right lg:block"
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent/70">
            In the ledger
          </p>
          <p className="font-serif text-2xl font-bold leading-tight text-accent/85">
            {notebookCount}
            <span className="text-sm font-normal text-accent/60"> nb</span>
            <span className="mx-1.5 text-accent/30">/</span>
            {noteCount}
            <span className="text-sm font-normal text-accent/60"> notes</span>
          </p>
          <span className="mt-1 ml-auto block h-[3px] w-16 rounded-full bg-ochre/60" />
        </motion.div>

        {/* page-marker tabs bleeding off the right edge of the underleaf */}
        <div className="absolute right-0 top-6 flex flex-col items-end gap-2">
          {[
            { c: "bg-accent", w: "w-10" },
            { c: "bg-sage", w: "w-6" },
            { c: "bg-ochre", w: "w-14" },
          ].map((t, i) => (
            <motion.span
              key={i}
              className={`block h-[6px] rounded-l-full ${t.c} ${t.w} opacity-70`}
              initial={reduce ? false : { x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 0.7 }}
              transition={{ duration: 0.6, delay: 0.7 + i * 0.09, ease: [0.16, 1, 0.3, 1] }}
            />
          ))}
        </div>
      </div>

      {/* ---- top sheet: ruled paper, clipped along the fold ---- */}
      <div className="absolute inset-0 bg-background" style={{ clipPath: TOP_SHEET }}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-primary/[0.04]" />
        <div className="absolute inset-0">
          {rules.map((i) => (
            <motion.span
              key={i}
              className="absolute left-0 right-0 h-px origin-left bg-foreground/[0.09]"
              style={{ top: `${(i + 1) * 28}px` }}
              initial={reduce ? false : { scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.05 + i * 0.045, ease: [0.16, 1, 0.3, 1] }}
            />
          ))}
        </div>

        {/* margin rule */}
        <motion.span
          className="absolute top-0 bottom-0 left-16 sm:left-24 w-px origin-top bg-accent/25"
          initial={reduce ? false : { scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* punch holes */}
        <div className="absolute inset-y-0 left-5 sm:left-8 hidden flex-col justify-evenly py-4 sm:flex">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="block h-3 w-3 rounded-full border border-foreground/10 bg-foreground/[0.05]"
              initial={reduce ? false : { scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            />
          ))}
        </div>

        {/* marginalia */}
        <motion.span
          className="absolute right-[40%] top-[84px] hidden h-[16px] -translate-y-[13px] -rotate-[0.8deg] rounded-[2px] bg-ochre/25 lg:block"
          initial={reduce ? false : { width: 0 }}
          animate={{ width: 130 }}
          transition={{ duration: 0.9, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
        />
        <svg
          aria-hidden
          className="absolute left-[8%] top-[112px] hidden h-5 w-6 lg:block"
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
            transition={{ duration: 0.7, delay: 0.95, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>

        {/* soften the paper under the headline copy */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/45 to-transparent" />
      </div>

      {/* ---- the folded-back flap: reverse of the page ---- */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-foreground/[0.10] via-foreground/[0.05] to-foreground/[0.02]"
        initial={reduce ? false : { clipPath: FLAP_CLOSED }}
        animate={{ clipPath: FLAP_OPEN }}
        transition={{ duration: 1.1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={reduce ? { clipPath: FLAP_OPEN } : undefined}
      />
      {/* crease shadow along the fold */}
      <motion.span
        className="absolute left-[68%] top-0 h-[240%] w-8 origin-top-left bg-gradient-to-r from-foreground/[0.10] to-transparent"
        style={{ transform: "rotate(21deg)" }}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.5 }}
      />
    </div>
  );
}

export default HeroNotebookStack;
