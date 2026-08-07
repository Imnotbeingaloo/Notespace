import { motion, useReducedMotion } from "framer-motion";

interface HeroNotebookStackProps {
  /** Kept for API compatibility with the hero — intentionally unused. */
  notebookCount?: number;
  noteCount?: number;
}

const RULES =
  "repeating-linear-gradient(to bottom, transparent 0 25px, hsl(var(--foreground)/0.08) 25px 26px)";

/** Hand-drawn margin mark: strokes draw themselves once on load. */
function Mark({
  d,
  delay,
  color,
  width = 2,
}: {
  d: string;
  delay: number;
  color: string;
  width?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={reduce ? false : { pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}

/** A single line of "text" — a grey bar sitting on the rule. */
function TextLine({ w, top, delay }: { w: number; top: number; delay: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="absolute h-[7px] rounded-[2px] bg-foreground/20"
      style={{ left: 58, top, width: w }}
      initial={reduce ? false : { opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
    />
  );
}

/**
 * Decorative hero accent: a plain ruled page with a margin, where a few
 * hand-drawn annotations — a bracket, an arrow, a check, an underline —
 * draw themselves in once. Quiet, flat, no glow.
 */
export function HeroNotebookStack(_props: HeroNotebookStackProps) {
  const reduce = useReducedMotion();
  const ink = "hsl(var(--foreground) / 0.55)";
  const ochre = "hsl(var(--ochre))";
  const sage = "hsl(var(--sage))";

  return (
    <div aria-hidden className="relative hidden lg:block w-[340px] shrink-0 select-none mr-4">
      <motion.div
        className="relative h-[212px] rounded-[6px] bg-card overflow-hidden border border-foreground/10 shadow-[0_10px_24px_-16px_hsl(var(--foreground)/0.35)]"
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* ruled lines */}
        <div className="absolute inset-0" style={{ backgroundImage: RULES, backgroundPosition: "0 12px" }} />
        {/* margin rule */}
        <div className="absolute inset-y-0 left-[46px] w-px bg-ochre/35" />

        {/* body text */}
        <TextLine w={216} top={30} delay={0.15} />
        <TextLine w={182} top={56} delay={0.21} />
        <TextLine w={204} top={82} delay={0.27} />
        <TextLine w={148} top={108} delay={0.33} />
        <TextLine w={196} top={134} delay={0.39} />
        <TextLine w={126} top={160} delay={0.45} />

        {/* annotations */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 340 212" fill="none">
          {/* margin bracket beside lines 2–3 */}
          <Mark d="M30 50 C22 54, 22 84, 30 88" delay={0.6} color={ink} />
          {/* small arrow pointing at line 4 */}
          <Mark d="M16 118 L38 112" delay={0.85} color={sage} />
          <Mark d="M32 108 L39 112 L33 117" delay={0.98} color={sage} />
          {/* underline under line 5 */}
          <Mark d="M58 146 C110 143, 190 145, 252 142" delay={1.1} color={ochre} width={2.5} />
          {/* tick in the margin next to it */}
          <Mark d="M22 168 L29 175 L40 160" delay={1.3} color={ochre} width={2.5} />
        </svg>
      </motion.div>
    </div>
  );
}

export default HeroNotebookStack;
