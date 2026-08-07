import { motion, useReducedMotion } from "framer-motion";

interface HeroNotebookStackProps {
  /** Kept for API compatibility with the hero — intentionally unused. */
  notebookCount?: number;
  noteCount?: number;
}

const RULES =
  "repeating-linear-gradient(to bottom, transparent 0 21px, hsl(var(--foreground)/0.09) 21px 22px)";

/** One half of the spread: cover edge, a few page edges for thickness, then
 *  the ruled leaf on top. `side` decides which way everything tucks. */
function Leaf({ side }: { side: "left" | "right" }) {
  const isLeft = side === "left";
  return (
    <div className={`relative h-full flex-1 ${isLeft ? "origin-right" : "origin-left"}`}>
      {/* cover board, just a sliver showing past the paper */}
      <div
        className={`absolute inset-y-[-6px] bg-accent/70 ${
          isLeft ? "left-[-7px] right-0 rounded-l-[7px]" : "left-0 right-[-7px] rounded-r-[7px]"
        }`}
      />
      {/* page edges stacked under the top leaf */}
      {[4, 2.5, 1].map((o, i) => (
        <div
          key={o}
          className={`absolute inset-y-[-${i}px] bg-card ${
            isLeft ? "left-[-4px] right-0 rounded-l-[4px]" : "left-0 right-[-4px] rounded-r-[4px]"
          }`}
          style={{ transform: `translate(${isLeft ? o : -o}px, ${o / 2}px)`, opacity: 0.55 + i * 0.15 }}
        />
      ))}
      {/* the leaf itself */}
      <div
        className={`absolute inset-0 overflow-hidden bg-card ${
          isLeft ? "rounded-l-[4px]" : "rounded-r-[4px]"
        }`}
      >
        <div className="absolute inset-0 opacity-80" style={{ backgroundImage: RULES }} />
        {/* curvature toward the gutter */}
        <div
          className={`absolute inset-y-0 w-14 ${
            isLeft ? "right-0 bg-gradient-to-l" : "left-0 bg-gradient-to-r"
          } from-foreground/14 via-foreground/4 to-transparent`}
        />
      </div>
    </div>
  );
}

/**
 * Decorative hero accent: an open book lying flat on the desk — two ruled
 * leaves, visible page thickness, a soft spine shadow and a ribbon marker.
 * Deliberately carries no data; it echoes the Notespace mark and gives the
 * hero copy something to sit against.
 */
export function HeroNotebookStack(_props: HeroNotebookStackProps) {
  const reduce = useReducedMotion();

  return (
    <div aria-hidden className="relative hidden lg:block w-[320px] shrink-0 select-none mr-5">
      <motion.div
        className="relative h-[188px] drop-shadow-[0_24px_34px_hsl(var(--foreground)/0.16)]"
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex h-full">
          <Leaf side="left" />
          <Leaf side="right" />
        </div>

        {/* spine: paper dipping into the gutter */}
        <div className="pointer-events-none absolute inset-y-[-4px] left-1/2 w-16 -translate-x-1/2 bg-[linear-gradient(to_right,transparent,hsl(var(--foreground)/0.16)_46%,hsl(var(--foreground)/0.22)_50%,hsl(var(--foreground)/0.16)_54%,transparent)]" />

        {/* ribbon marker slipping out of the gutter */}
        <motion.div
          className="absolute left-[calc(50%+14px)] top-[-6px] w-[9px] overflow-hidden"
          initial={reduce ? false : { height: 0 }}
          animate={{ height: 150 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="h-[138px] w-full bg-ochre" />
          <div
            className="h-3 w-full bg-ochre"
            style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 55%, 0 100%)" }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default HeroNotebookStack;
