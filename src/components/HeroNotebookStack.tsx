import { motion, useReducedMotion } from "framer-motion";

interface HeroNotebookStackProps {
  /** Kept for API compatibility with the hero — intentionally unused. */
  notebookCount?: number;
  noteCount?: number;
}

/**
 * Decorative hero accent: a single closed notebook standing slightly open,
 * with its page block fanning out and an ochre ribbon slipping past the foot.
 * A soft offset sage panel sits behind it for depth. No glow, no data —
 * it just gives the hero copy something quiet to sit against.
 */
export function HeroNotebookStack(_props: HeroNotebookStackProps) {
  const reduce = useReducedMotion();

  return (
    <div aria-hidden className="relative hidden lg:block w-[300px] shrink-0 select-none mr-4">
      <motion.div
        className="relative mx-auto h-[196px] w-[184px]"
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* offset panel behind — the one quiet nod to layered paper */}
        <div
          className="absolute left-[26px] top-[16px] h-[168px] w-[132px] rounded-[6px] rotate-[-5deg]"
          style={{ backgroundColor: "hsl(var(--sage, 96 16% 62%) / 0.28)" }}
        />

        {/* the notebook, tilted just off square */}
        <div className="absolute left-[14px] top-[6px] h-[176px] w-[140px] rotate-[3deg]">
          {/* page block fanning out on the right */}
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute inset-y-[5px] left-[7px] right-0 rounded-r-[3px] bg-card"
              style={{
                transform: `translateX(${5 + i * 2.5}px) rotate(${i * 0.5}deg)`,
                boxShadow: "0 0 0 1px hsl(var(--foreground) / 0.07)",
                opacity: 1 - i * 0.12,
              }}
            />
          ))}

          {/* cover */}
          <div
            className="absolute inset-0 rounded-[4px] rounded-l-[7px]"
            style={{
              backgroundColor: "hsl(var(--primary))",
              boxShadow: "0 14px 24px -14px hsl(var(--foreground) / 0.4)",
            }}
          >
            {/* spine crease */}
            <div className="absolute inset-y-0 left-[11px] w-px bg-background/20" />
            <div className="absolute inset-y-0 left-0 w-[11px] rounded-l-[7px] bg-foreground/10" />
          </div>

          {/* ribbon slipping past the foot */}
          <motion.div
            className="absolute bottom-[-26px] left-[94px] w-[8px] overflow-hidden"
            initial={reduce ? false : { height: 0 }}
            animate={{ height: 46 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="h-[34px] w-full"
              style={{ backgroundColor: "hsl(var(--ochre, 35 68% 48%))" }}
            />
            <div
              className="h-3 w-full"
              style={{
                backgroundColor: "hsl(var(--ochre, 35 68% 48%))",
                clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 55%, 0 100%)",
              }}
            />
          </motion.div>
        </div>

        {/* contact shadow on the desk */}
        <div
          className="absolute bottom-[6px] left-[22px] h-[10px] w-[142px] rounded-full blur-[7px]"
          style={{ backgroundColor: "hsl(var(--foreground) / 0.16)" }}
        />
      </motion.div>
    </div>
  );
}

export default HeroNotebookStack;
