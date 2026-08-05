import { motion, useReducedMotion } from "framer-motion";

interface HeroNotebookStackProps {
  notebookCount?: number;
  noteCount?: number;
}

/**
 * Flat "today card" accent for the dashboard hero.
 * No 3D, no floating object — a real index card taped onto the page.
 */
export function HeroNotebookStack({ notebookCount = 0, noteCount = 0 }: HeroNotebookStackProps) {
  const reduce = useReducedMotion();
  const now = new Date();
  const day = now.toLocaleDateString(undefined, { day: "numeric" });
  const month = now.toLocaleDateString(undefined, { month: "long" });
  const weekday = now.toLocaleDateString(undefined, { weekday: "long" });

  return (
    <div aria-hidden className="relative hidden lg:block w-[300px] shrink-0 select-none mr-4">
      {/* back sheet peeking out */}
      <div className="absolute -right-2.5 top-3 h-full w-full rotate-[1.6deg] rounded-md border border-border/70 bg-card/70" />

      <motion.div
        className="relative overflow-hidden rounded-md border border-border bg-card shadow-[0_18px_40px_-28px_hsl(var(--foreground)/0.5)]"
        initial={reduce ? false : { opacity: 0, y: 10, rotate: -1.4 }}
        animate={{ opacity: 1, y: 0, rotate: -0.8 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* ruled paper */}
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent 0 27px, hsl(var(--foreground)/0.09) 27px 28px)",
          }}
        />
        {/* margin rule */}
        <div className="pointer-events-none absolute inset-y-0 left-10 w-px bg-accent-2/50" />

        <div className="relative py-6 pl-14 pr-6">
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">{weekday}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-[44px] leading-none text-foreground">{day}</span>
            <span className="font-serif text-lg italic text-accent">{month}</span>
          </div>

          <div className="mt-6 h-px w-full bg-border" />

          <dl className="mt-4 space-y-2.5">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Notebooks
              </dt>
              <dd className="font-mono text-sm text-foreground">
                {String(notebookCount).padStart(2, "0")}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Notes
              </dt>
              <dd className="font-mono text-sm text-foreground">
                {String(noteCount).padStart(2, "0")}
              </dd>
            </div>
          </dl>
        </div>

        {/* page markers on the right edge */}
        <div className="absolute right-0 top-8 flex flex-col gap-1.5">
          <span className="block h-6 w-1.5 rounded-l-sm bg-accent/70" />
          <span className="block h-6 w-1.5 rounded-l-sm bg-ochre/70" />
          <span className="block h-6 w-1.5 rounded-l-sm bg-sage/70" />
        </div>
      </motion.div>

      {/* tape holding it to the page */}
      <div className="absolute -top-2.5 left-8 h-5 w-20 -rotate-[7deg] bg-ochre/50 shadow-sm" />
      <div className="absolute -bottom-2 right-10 h-4 w-16 rotate-[5deg] bg-ochre/40 shadow-sm" />
    </div>
  );
}

export default HeroNotebookStack;
