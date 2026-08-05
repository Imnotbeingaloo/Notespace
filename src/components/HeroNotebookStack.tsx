import { motion, useReducedMotion } from "framer-motion";

/**
 * Hero side mark — a small 2.5D stack of index cards clipped to a teal spine,
 * sitting at the right of the "Welcome back" band. Quiet, product-grounded,
 * and deliberately secondary to the copy: ruled cards, an ochre tape strip,
 * a sage tick, and a slow idle drift.
 */
export function HeroNotebookStack() {
  const reduce = useReducedMotion();

  const cards = [
    { rotate: -7, x: -14, y: 8, tone: "bg-card", z: 0 },
    { rotate: 4, x: -4, y: 4, tone: "bg-card", z: 1 },
    { rotate: -1.5, x: 6, y: 0, tone: "bg-card", z: 2 },
  ];

  return (
    <div
      aria-hidden
      className="pointer-events-none relative hidden md:block h-[132px] w-[188px] shrink-0 select-none"
      style={{ perspective: "900px" }}
    >
      <motion.div
        className="absolute inset-0"
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="absolute inset-0"
          style={{ transformStyle: "preserve-3d" }}
          animate={reduce ? undefined : { rotateX: [3, 6, 3], rotateY: [-8, -5, -8] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        >
          {cards.map((c, i) => (
            <motion.div
              key={i}
              className={`absolute left-0 top-0 h-[104px] w-[152px] rounded-[10px] border border-border ${c.tone}`}
              style={{
                transform: `translate3d(${c.x}px, ${c.y}px, ${c.z * 10}px) rotate(${c.rotate}deg)`,
                boxShadow: "0 10px 24px -14px hsl(var(--foreground) / 0.35)",
              }}
              initial={reduce ? false : { opacity: 0, y: c.y + 14, rotate: c.rotate * 1.8 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* spine */}
              <span className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-primary/70" />
              {/* margin rule */}
              <span className="absolute inset-y-3 left-[22px] w-px bg-accent-2/25" />

              {i === cards.length - 1 && (
                <>
                  {/* ruled lines */}
                  <div className="absolute left-[30px] right-4 top-[22px] space-y-[11px]">
                    {[0, 1, 2, 3].map((r) => (
                      <motion.span
                        key={r}
                        className="block h-px origin-left bg-foreground/[0.14]"
                        initial={reduce ? false : { scaleX: 0 }}
                        animate={{ scaleX: r === 3 ? 0.55 : 1 }}
                        transition={{ duration: 0.7, delay: 0.5 + r * 0.09, ease: [0.16, 1, 0.3, 1] }}
                      />
                    ))}
                  </div>
                  {/* ochre highlighter sweep on the first rule */}
                  <motion.span
                    className="absolute left-[30px] top-[17px] h-[9px] rounded-[2px] bg-ochre/35"
                    initial={reduce ? false : { width: 0 }}
                    animate={{ width: 54 }}
                    transition={{ duration: 0.6, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  />
                  {/* sage tick */}
                  <svg className="absolute bottom-3 right-3 h-4 w-[18px]" viewBox="0 0 24 20" fill="none">
                    <motion.path
                      d="M3 11l6 6L21 3"
                      stroke="hsl(var(--sage))"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={reduce ? false : { pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6, delay: 1.15, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </svg>
                </>
              )}
            </motion.div>
          ))}

          {/* tape holding the stack down */}
          <motion.span
            className="absolute left-[112px] top-[-6px] h-[30px] w-[42px] rounded-[2px] bg-ochre/45 border border-ochre/30"
            style={{ transform: "translateZ(34px) rotate(-18deg)" }}
            initial={reduce ? false : { opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default HeroNotebookStack;
