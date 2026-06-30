import { ReactNode } from "react";

type PillTone = "amber" | "violet" | "sky" | "rose";

const TONE: Record<PillTone, string> = {
  amber:  "bg-amber-100 text-amber-900 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-500/30",
  violet: "bg-violet-100 text-violet-900 ring-violet-200 dark:bg-violet-500/15 dark:text-violet-200 dark:ring-violet-500/30",
  sky:    "bg-sky-100 text-sky-900 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-200 dark:ring-sky-500/30",
  rose:   "bg-rose-100 text-rose-900 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-200 dark:ring-rose-500/30",
};

// Inline highlight pill for prices, plan names, key numbers in body copy.
// Looks like a button, isn't one — no hover/cursor change.
export function Pill({
  children,
  tone = "amber",
}: {
  children: ReactNode;
  tone?: PillTone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.85em] font-medium ring-1 ring-inset whitespace-nowrap ${TONE[tone]}`}
    >
      {children}
    </span>
  );
}

export default Pill;
