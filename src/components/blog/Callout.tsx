import { Lightbulb, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { ReactNode } from "react";

type CalloutTone = "tip" | "warn" | "info" | "key";

interface CalloutProps {
  tone?: CalloutTone;
  title?: string;
  children: ReactNode;
}

const TONE: Record<CalloutTone, { icon: typeof Info; bar: string; bg: string; iconColor: string; label: string }> = {
  tip:  { icon: Lightbulb,     bar: "border-l-amber-400",  bg: "bg-amber-50/70 dark:bg-amber-500/5",  iconColor: "text-amber-600 dark:text-amber-400", label: "Tip" },
  warn: { icon: AlertTriangle, bar: "border-l-rose-400",   bg: "bg-rose-50/70 dark:bg-rose-500/5",    iconColor: "text-rose-600 dark:text-rose-400",   label: "Heads up" },
  info: { icon: Info,          bar: "border-l-sky-400",    bg: "bg-sky-50/70 dark:bg-sky-500/5",      iconColor: "text-sky-600 dark:text-sky-400",     label: "Note" },
  key:  { icon: CheckCircle2,  bar: "border-l-emerald-400",bg: "bg-emerald-50/70 dark:bg-emerald-500/5", iconColor: "text-emerald-600 dark:text-emerald-400", label: "Key point" },
};

export function Callout({ tone = "key", title, children }: CalloutProps) {
  const t = TONE[tone];
  const Icon = t.icon;
  return (
    <aside
      className={`not-prose my-6 border-l-4 ${t.bar} ${t.bg} rounded-r-md px-4 py-3 flex gap-3`}
      role="note"
    >
      <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${t.iconColor}`} aria-hidden="true" />
      <div className="text-[0.97em] leading-relaxed">
        <div className="font-semibold mb-0.5">{title ?? t.label}</div>
        <div className="[&>p:last-child]:mb-0">{children}</div>
      </div>
    </aside>
  );
}

export default Callout;
