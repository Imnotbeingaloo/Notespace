import { motion, useReducedMotion } from "framer-motion";

interface HeroNotebookStackProps {
  /** Kept for API compatibility with the hero — intentionally unused. */
  notebookCount?: number;
  noteCount?: number;
}

const RULES = "repeating-linear-gradient(to bottom, transparent 0 21px, hsl(var(--foreground)/0.10) 21px 22px)";

/**
 * Decorative hero accent: an open book lying flat on the desk.
 * Two facing ruled pages, a gutter shadow, a satin ribbon marker and a
 * lifting corner on the recto. It carries no information on purpose — it
 * echoes the Notespace mark and gives the hero something to sit against.
 */
export function HeroNotebookStack(_props: HeroNotebookStackProps) {
  const reduce = useReducedMotion();

  return (
    <div aria-hidden className="relative hidden lg:block w-[320px] shrink-0 select-none mr-4">
      <motion.div
        className="relative"
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* board / cover peeking beyond the pages */}
        <div className="absolute -inset-x-3 -inset-y-2 rounded-[10px] bg-accent/85 shadow-[0_22px_46px_-30px_hsl(var(--foreground)/0.65)]" />
        <div className="absolute -inset-x-2 -inset-y-1 rounded-[8px] bg-card/40" />

        <div className="relative flex h-[186px] rounded-[6px] bg-card">
          {/* verso */}
          <div className="relative flex-1 overflow-hidden rounded-l-[6px]">
            <div className="absolute inset-0 opacity-70" style={{ backgroundImage: RULES }} />
            <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-foreground/12 to-transparent" />
          </div>

          {/* gutter */}
          <div className="w-px bg-foreground/20" />

          {/* recto */}
          <div className="relative flex-1 overflow-hidden rounded-r-[6px]">
            <div className="absolute inset-0 opacity-70" style={{ backgroundImage: RULES }} />
            <div className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-foreground/12 to-transparent" />

            {/* lifting corner */}
            <motion.div
              className="absolute bottom-0 right-0 h-12 w-12"
              initial={reduce ? false : { opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: "linear-gradient(315deg, hsl(var(--muted)) 48%, transparent 48.5%)",
                filter: "drop-shadow(-3px -3px 5px hsl(var(--foreground)/0.22))",
              }}
            />
          </div>
        </div>

        {/* satin ribbon marker */}
        <motion.div
          className="absolute left-[54%] top-2 w-3"
          initial={reduce ? false : { height: 0 }}
          animate={{ height: 132 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="h-full w-full bg-ochre" />
          <div
            className="h-3 w-3 bg-ochre"
            style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 60%, 0 100%)" }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default HeroNotebookStack;
