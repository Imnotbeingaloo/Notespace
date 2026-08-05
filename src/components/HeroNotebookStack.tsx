import { motion, useReducedMotion } from "framer-motion";

/**
 * Decorative 3D stack of notebooks for the dashboard hero.
 * Pure CSS/SVG - no images. Hidden below lg.
 */
export function HeroNotebookStack() {
  const reduce = useReducedMotion();

  const shell =
    "absolute h-[100px] w-[146px] rounded-[9px] bg-card border border-border/70 overflow-hidden";

  return (
    <div
      aria-hidden
      className="relative h-[166px] w-[248px] select-none"
      style={{ perspective: "1200px" }}
    >
      <div className="absolute bottom-2 left-1/2 h-5 w-[56%] -translate-x-1/2 rounded-[50%] bg-foreground/15 blur-2xl" />

      <motion.div
        className="absolute inset-0"
        style={{ transformStyle: "preserve-3d" }}
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* back - ochre */}
        <div
          className={`${shell} left-[16px] top-[50px] shadow-[0_14px_26px_-18px_hsl(var(--foreground)/0.6)]`}
          style={{ transform: "rotate(-9deg)" }}
        >
          <div className="absolute inset-y-0 left-0 w-[8px] bg-ochre" />
          <div className="absolute inset-y-0 left-[8px] w-px bg-border" />
        </div>

        {/* middle - sage */}
        <div
          className={`${shell} left-[40px] top-[33px] shadow-[0_16px_28px_-18px_hsl(var(--foreground)/0.6)]`}
          style={{ transform: "rotate(-4.5deg)" }}
        >
          <div className="absolute inset-y-0 left-0 w-[8px] bg-sage" />
          <div className="absolute inset-y-0 left-[8px] w-px bg-border" />
        </div>

        {/* front - open ruled page */}
        <motion.div
          className={`${shell} left-[64px] top-[16px] shadow-[0_22px_36px_-18px_hsl(var(--foreground)/0.65)]`}
          style={{ transform: "rotate(1.5deg)" }}
          animate={reduce ? undefined : { y: [0, -6, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute inset-y-0 left-0 w-[8px] bg-primary" />
          <div className="absolute inset-y-0 left-[18px] w-px bg-accent-2/60" />
          <div className="absolute inset-y-4 left-[26px] right-4 flex flex-col justify-between">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="block h-[2px] rounded-full bg-foreground/15"
                style={{ width: `${100 - i * 12}%` }}
              />
            ))}
          </div>
          {/* ink accent line, drawn in */}
          <motion.span
            className="absolute left-[26px] top-[17px] h-[2px] rounded-full bg-accent"
            initial={{ width: 0 }}
            animate={{ width: 52 }}
            transition={{ duration: 1.1, delay: 0.5, ease: "easeOut" }}
          />
        </motion.div>

        {/* tape over the front cover corner */}
        <div className="absolute left-[52px] top-[9px] h-[14px] w-[46px] rotate-[-24deg] bg-ochre/50 border-x border-ochre/30" />

        {/* floating accents */}
        <motion.span
          className="absolute right-[6px] top-[6px] h-1.5 w-1.5 rounded-full bg-accent"
          animate={reduce ? undefined : { y: [0, -8, 0], opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.span
          className="absolute left-[2px] top-[34px] h-1 w-1 rounded-full bg-sage"
          animate={reduce ? undefined : { y: [0, -6, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        />
      </motion.div>
    </div>
  );
}

export default HeroNotebookStack;
