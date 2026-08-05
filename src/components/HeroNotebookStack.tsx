import { motion, useReducedMotion } from "framer-motion";

interface HeroNotebookStackProps {
  notebookCount?: number;
  noteCount?: number;
}

/**
 * Tilted index-card stack for the dashboard hero.
 * Cards recede into depth; the front card carries real stats.
 * Pure CSS/SVG - no images. Hidden on small screens.
 */
export function HeroNotebookStack({ notebookCount = 0, noteCount = 0 }: HeroNotebookStackProps) {
  const reduce = useReducedMotion();
  const now = new Date();
  const day = now.toLocaleDateString(undefined, { day: "numeric" });
  const month = now.toLocaleDateString(undefined, { month: "short" });
  const weekday = now.toLocaleDateString(undefined, { weekday: "long" });

  return (
    <div
      aria-hidden
      className="relative hidden lg:block h-[250px] w-[400px] shrink-0 select-none"
      style={{ perspective: "1200px" }}
    >
      <div className="absolute bottom-6 left-1/2 h-8 w-[60%] -translate-x-1/2 rounded-[50%] bg-foreground/20 blur-xl" />

      <motion.div
        className="absolute inset-0 -translate-x-6"
        style={{ transformStyle: "preserve-3d" }}
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* back cards receding */}
        {[
          { x: 4, y: 10, rot: -13, z: -70, tone: "bg-ochre/30 border-ochre/45" },
          { x: 22, y: 22, rot: -10, z: -46, tone: "bg-sage/30 border-sage/45" },
          { x: 40, y: 34, rot: -7.5, z: -24, tone: "bg-card border-border" },
        ].map((c, i) => (
          <div
            key={i}
            className={`absolute h-[150px] w-[248px] rounded-lg border shadow-[0_16px_34px_-20px_hsl(var(--foreground)/0.55)] ${c.tone}`}
            style={{
              left: c.x,
              top: c.y,
              transform: `rotateY(11deg) rotateZ(${c.rot}deg) translateZ(${c.z}px)`,
            }}
          />
        ))}

        {/* front card - real stats */}
        <motion.div
          className="absolute left-[58px] top-[46px] h-[156px] w-[256px] overflow-hidden rounded-lg border border-border bg-card shadow-[0_26px_48px_-22px_hsl(var(--foreground)/0.6)]"
          style={{ transform: "rotateY(11deg) rotateZ(-5deg)" }}
          animate={reduce ? undefined : { y: [0, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* ruled paper */}
          <div
            className="absolute inset-0 opacity-[0.5]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, transparent 0 27px, hsl(var(--foreground)/0.10) 27px 28px)",
            }}
          />
          {/* red margin */}
          <div className="absolute inset-y-0 left-[34px] w-px bg-accent-2/60" />
          {/* punch holes */}
          <div className="absolute left-[12px] top-6 flex flex-col gap-8">
            {[0, 1, 2].map((i) => (
              <span key={i} className="block h-2.5 w-2.5 rounded-full bg-foreground/12 ring-1 ring-foreground/10" />
            ))}
          </div>

          <div className="relative pl-[48px] pr-4 pt-4">
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-3xl leading-none text-foreground">{day}</span>
              <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{month}</span>
            </div>
            <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-accent">{weekday}</p>

            <div className="mt-4 space-y-1.5">
              <p className="text-[13px] text-foreground">
                <span className="font-medium">{notebookCount}</span>{" "}
                <span className="text-muted-foreground">
                  {notebookCount === 1 ? "notebook" : "notebooks"}
                </span>
              </p>
              <p className="text-[13px] text-foreground">
                <span className="font-medium">{noteCount}</span>{" "}
                <span className="text-muted-foreground">{noteCount === 1 ? "note" : "notes"}</span>
              </p>
            </div>
          </div>

          {/* page tabs on the right edge */}
          <div className="absolute right-0 top-7 flex flex-col gap-2">
            <span className="block h-5 w-3 rounded-l-sm bg-accent/70" />
            <span className="block h-5 w-4 rounded-l-sm bg-ochre/70" />
            <span className="block h-5 w-2.5 rounded-l-sm bg-sage/70" />
          </div>
        </motion.div>

        {/* tape holding the stack */}
        <div className="absolute left-[38px] top-[34px] h-[22px] w-[74px] rotate-[-26deg] bg-ochre/50 shadow-sm" />
        <div className="absolute right-[42px] bottom-[26px] h-[20px] w-[62px] rotate-[8deg] bg-ochre/40 shadow-sm" />
      </motion.div>
    </div>
  );
}

export default HeroNotebookStack;
