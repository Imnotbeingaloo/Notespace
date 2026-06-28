import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

/* ------------------------------ Hero figure ----------------------------- */

export function BlogHero({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption?: string;
}) {
  return (
    <motion.figure
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mb-14 -mx-2 md:-mx-8"
    >
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-[0_18px_48px_-22px_hsl(var(--foreground)/0.18)]">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="w-full h-auto block"
        />
      </div>
      {caption ? (
        <figcaption className="mt-3 text-xs text-muted-foreground italic text-center px-4">
          {caption}
        </figcaption>
      ) : null}
    </motion.figure>
  );
}

/* -------------------------------- Callout ------------------------------- */

type CalloutTone = "primary" | "accent" | "muted";

export function BlogCallout({
  title,
  children,
  tone = "primary",
}: {
  title?: string;
  children: ReactNode;
  tone?: CalloutTone;
}) {
  const ring =
    tone === "accent"
      ? "border-accent/40 bg-accent/[0.06]"
      : tone === "muted"
        ? "border-border bg-muted/40"
        : "border-primary/30 bg-primary/[0.05]";
  const accentBar =
    tone === "accent"
      ? "bg-accent"
      : tone === "muted"
        ? "bg-muted-foreground/40"
        : "bg-primary";
  return (
    <aside
      className={`relative my-8 rounded-xl border px-6 py-5 ${ring} overflow-hidden`}
    >
      <span
        aria-hidden
        className={`absolute left-0 top-0 h-full w-1 ${accentBar}`}
      />
      {title ? (
        <p className="font-serif font-bold text-foreground mb-2 text-lg">
          {title}
        </p>
      ) : null}
      <div className="text-muted-foreground leading-relaxed text-[0.97rem] space-y-2">
        {children}
      </div>
    </aside>
  );
}

/* ------------------------------ Pull quote ------------------------------ */

export function BlogPullQuote({
  children,
  cite,
}: {
  children: ReactNode;
  cite?: string;
}) {
  return (
    <figure className="my-10 border-l-4 border-accent pl-6 md:pl-8 max-w-prose">
      <Quote className="h-6 w-6 text-accent/70 mb-3" aria-hidden />
      <blockquote className="font-serif text-2xl md:text-[1.6rem] leading-snug text-foreground italic">
        {children}
      </blockquote>
      {cite ? (
        <figcaption className="mt-3 text-sm text-muted-foreground not-italic">
          - {cite}
        </figcaption>
      ) : null}
    </figure>
  );
}

/* ------------------------------- Stat grid ------------------------------ */

export function BlogStatGrid({
  stats,
}: {
  stats: { value: string; label: string; sub?: string }[];
}) {
  return (
    <div className="my-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
          className="rounded-xl border border-border bg-card px-5 py-5 text-center"
        >
          <p className="font-serif text-3xl md:text-4xl font-bold text-primary tabular-nums">
            {s.value}
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">{s.label}</p>
          {s.sub ? (
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          ) : null}
        </motion.div>
      ))}
    </div>
  );
}

/* ------------------------------ Key takeaways --------------------------- */

export function BlogKeyTakeaways({ points }: { points: string[] }) {
  return (
    <aside className="my-10 rounded-2xl bg-muted/50 border border-border px-6 py-6">
      <p className="text-xs uppercase tracking-[0.18em] font-semibold text-accent mb-3">
        Key takeaways
      </p>
      <ul className="space-y-2.5">
        {points.map((p, i) => (
          <li
            key={i}
            className="flex gap-3 text-foreground/90 text-[0.97rem] leading-relaxed"
          >
            <span
              aria-hidden
              className="mt-2 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"
            />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

/* --------------------------- Comparison table --------------------------- */

export function BlogCompareTable({
  headers,
  rows,
  caption,
}: {
  headers: string[];
  rows: (string | ReactNode)[][];
  caption?: string;
}) {
  return (
    <figure className="my-10 -mx-2 md:mx-0">
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/60">
              {headers.map((h) => (
                <th
                  key={h}
                  className="text-left font-serif font-bold text-foreground px-4 py-3 border-b border-border"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr
                key={ri}
                className="border-b border-border/60 last:border-0 hover:bg-muted/30"
              >
                {r.map((cell, ci) => (
                  <td
                    key={ci}
                    className="px-4 py-3 text-muted-foreground align-top leading-relaxed"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption ? (
        <figcaption className="mt-3 text-xs text-muted-foreground italic text-center">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

/* ----------------------------- Numbered steps --------------------------- */

export function BlogSteps({
  steps,
}: {
  steps: { title: string; body: ReactNode }[];
}) {
  return (
    <ol className="my-8 space-y-6">
      {steps.map((s, i) => (
        <li key={i} className="flex gap-5">
          <span
            aria-hidden
            className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 border border-primary/30 text-primary font-serif font-bold flex items-center justify-center"
          >
            {i + 1}
          </span>
          <div>
            <h4 className="font-serif text-xl font-bold mb-1">{s.title}</h4>
            <div className="text-muted-foreground leading-relaxed">
              {s.body}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------- Divider -------------------------------- */

export function BlogDivider() {
  return (
    <div className="my-12 flex items-center justify-center gap-3" aria-hidden>
      <span className="h-px w-12 bg-border" />
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      <span className="h-px w-12 bg-border" />
    </div>
  );
}
