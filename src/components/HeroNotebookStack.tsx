import { useMemo } from "react";

interface HeroNotebookStackProps {
  notebooks?: number;
  notes?: number;
}

/**
 * Hero side visual: a small taped-down date card sitting on the desk next to
 * the greeting. Reads instantly as notebook stationery — no abstract diagrams.
 */
export function HeroNotebookStack({ notebooks = 0, notes = 0 }: HeroNotebookStackProps) {
  const today = useMemo(() => new Date(), []);
  const weekday = today.toLocaleDateString(undefined, { weekday: "long" });
  const month = today.toLocaleDateString(undefined, { month: "short" }).toUpperCase();
  const day = today.getDate();

  return (
    <div
      aria-hidden
      className="hidden md:block relative w-[15rem] lg:w-[17rem] flex-shrink-0 select-none pointer-events-none"
    >
      {/* back card */}
      <div className="absolute inset-x-6 top-3 h-full rounded-md border border-border/70 bg-card/70 rotate-[3.5deg] shadow-[0_1px_2px_rgba(0,0,0,0.05)]" />
      <div className="absolute inset-x-3 top-1.5 h-full rounded-md border border-border/70 bg-card/85 -rotate-[1.5deg]" />

      {/* front card */}
      <div className="relative rounded-md border border-border bg-card rotate-[-0.75deg] shadow-[0_6px_16px_-10px_rgba(0,0,0,0.35)] overflow-hidden">
        {/* tape */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 rotate-[-3deg] h-5 w-20 bg-ochre/40 border-x border-ochre/25" />

        {/* ruled body */}
        <div
          className="px-4 pt-5 pb-4"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent 0px, transparent 27px, hsl(var(--border)/0.55) 27px, hsl(var(--border)/0.55) 28px)",
            backgroundPosition: "0 12px",
          }}
        >
          <div className="flex items-baseline gap-2.5">
            <span className="font-serif text-4xl font-bold leading-none text-foreground">{day}</span>
            <div className="leading-tight">
              <div className="font-mono text-[10px] tracking-[0.22em] text-accent">{month}</div>
              <div className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground">
                {weekday.toUpperCase()}
              </div>
            </div>
          </div>

          <div className="mt-3 space-y-1.5">
            <Line label={`${notebooks} ${notebooks === 1 ? "notebook" : "notebooks"}`} tone="sage" />
            <Line label={`${notes} ${notes === 1 ? "note" : "notes"}`} tone="accent" />
          </div>
        </div>
      </div>

      {/* page-marker tabs */}
      <div className="absolute -right-1 top-10 h-6 w-3 rounded-r-sm bg-sage/60" />
      <div className="absolute -right-1 top-[4.5rem] h-6 w-3 rounded-r-sm bg-ochre/60" />
    </div>
  );
}

function Line({ label, tone }: { label: string; tone: "sage" | "accent" }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-3.5 w-3.5 rounded-[3px] border flex items-center justify-center ${
          tone === "sage" ? "border-sage/70" : "border-accent/70"
        }`}
      >
        <svg viewBox="0 0 10 10" className="h-2.5 w-2.5">
          <path
            d="M1.5 5.4 L4 8 L8.5 2"
            fill="none"
            stroke={tone === "sage" ? "hsl(var(--sage))" : "hsl(var(--accent))"}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-[12.5px] text-muted-foreground">{label}</span>
    </div>
  );
}
