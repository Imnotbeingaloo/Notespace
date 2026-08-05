import { motion, useReducedMotion } from "framer-motion";

/**
 * Decorative 3D-ish stack of notebooks for the dashboard hero.
 * Pure CSS/SVG - no images, no network cost. Hidden on small screens.
 */
export function HeroNotebookStack() {
  const reduce = useReducedMotion();

  return (
    <div
      aria-hidden
      className="relative h-[190px] w-[300px] select-none"
      style={{ perspective: "1100px" }}
    >
      {/* soft grounding shadow */}
      <div className="absolute bottom-3 left-1/2 h-6 w-[62%] -translate-x-1/2 rounded-[50%] bg-foreground/20 blur-xl" />

      <motion.div
        className="absolute inset-0"
        style={{ transformStyle: "preserve-3d" }}
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* back book - ochre */}
        <div
          className="absolute left-[18px] top-[46px] h-[112px] w-[168px] rounded-md border border-ochre/45 bg-ochre/25 shadow-[0_10px_24px_-14px_hsl(var(--foreground)/0.5)]"
          style={{ transform: "rotateX(52deg) rotateZ(-24deg) translateZ(-26px)" }}
        />
        {/* middle book - sage */}
        <div
          className="absolute left-[46px] top-[36px] h-[112px] w-[168px] rounded-md border border-sage/50 bg-sage/30 shadow-[0_12px_26px_-14px_hsl(var(--foreground)/0.5)]"
          style={{ transform: "rotateX(52deg) rotateZ(-20deg) translateZ(-12px)" }}
        />

        {/* front book - primary cover, open with ruled page */}
        <motion.div
          className="absolute left-[70px] top-[22px] h-[118px] w-[176px] rounded-md border border-primary/45 bg-primary/20 backdrop-blur-[1px] shadow-[0_18px_34px_-16px_hsl(var(--foreground)/0.55)]"
          style={{ transform: "rotateX(50deg) rotateZ(-16deg)" }}
          animate={reduce ? undefined : { y: [0, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* spine */}
          <div className="absolute inset-y-0 left-0 w-[7px] rounded-l-md bg-accent/70" />
          {/* ruled lines */}
          <div className="absolute inset-y-3 left-[20px] right-4 flex flex-col justify-between">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="block h-px w-full bg-foreground/25"
                style={{ width: `${100 - i * 9}%` }}
              />
            ))}
          </div>
          {/* red margin */}
          <div className="absolute inset-y-2 left-[15px] w-px bg-accent-2/70" />
        </motion.div>

        {/* tape strip */}
        <div className="absolute left-[52px] top-[16px] h-[16px] w-[54px] rotate-[-28deg] bg-ochre/45 shadow-sm" />

        {/* floating ink dot accents */}
        <motion.span
          className="absolute right-[26px] top-[18px] h-2 w-2 rounded-full bg-accent"
          animate={reduce ? undefined : { y: [0, -7, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.span
          className="absolute right-[54px] top-[54px] h-1.5 w-1.5 rounded-full bg-sage"
          animate={reduce ? undefined : { y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        />
      </motion.div>
    </div>
  );
}

export default HeroNotebookStack;
