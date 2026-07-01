import { ReactNode } from "react";

/* Zapier-style: plain, semantic, no motion, minimal decoration. */

export function BlogHero({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <figure className="mb-10">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="w-full h-auto rounded-md border border-border"
      />
      {caption ? (
        <figcaption className="mt-2 text-sm text-muted-foreground text-center">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

export function BlogCallout({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
  tone?: "primary" | "accent" | "muted";
}) {
  return (
    <aside className="my-6 rounded-md border border-border bg-muted/30 px-5 py-4">
      {title ? <p className="font-semibold text-foreground mb-1.5">{title}</p> : null}
      <div className="text-foreground/80 leading-relaxed space-y-2">{children}</div>
    </aside>
  );
}

export function BlogPullQuote({ children, cite }: { children: ReactNode; cite?: string }) {
  return (
    <figure className="my-8 border-l-2 border-border pl-5">
      <blockquote className="text-lg leading-relaxed text-foreground italic">
        {children}
      </blockquote>
      {cite ? (
        <figcaption className="mt-2 text-sm text-muted-foreground not-italic">- {cite}</figcaption>
      ) : null}
    </figure>
  );
}

export function BlogStatGrid({ stats }: { stats: { value: string; label: string; sub?: string }[] }) {
  return (
    <div className="my-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="border-l-2 border-primary pl-4">
          <p className="text-2xl font-semibold text-foreground tabular-nums">{s.value}</p>
          <p className="mt-1 text-sm text-foreground">{s.label}</p>
          {s.sub ? <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p> : null}
        </div>
      ))}
    </div>
  );
}

export function BlogKeyTakeaways({ points }: { points: string[] }) {
  return (
    <aside className="my-8 rounded-md border border-border bg-muted/30 px-5 py-4">
      <p className="text-sm font-semibold text-foreground mb-2">Key takeaways</p>
      <ul className="space-y-1.5 list-disc pl-5 text-foreground/85">
        {points.map((p, i) => (
          <li key={i} className="leading-relaxed">{p}</li>
        ))}
      </ul>
    </aside>
  );
}

export function BlogCompareTable({
  headers,
  rows,
  caption,
  bleed = true,
}: {
  headers: string[];
  rows: (string | ReactNode)[][];
  caption?: string;
  /** Full-bleed band that breaks out of the reading column. Default on. */
  bleed?: boolean;
}) {
  const table = (
    <figure className={bleed ? "" : "my-8"}>
      <div className="overflow-x-auto rounded-md border border-border bg-background">
        <table className="w-full text-sm">
          <thead>
            <tr>
              {headers.map((h) => (
                <th key={h} className="text-left font-semibold text-foreground px-4 py-2.5 border-b border-border bg-muted/40">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri} className="border-b border-border last:border-0 odd:bg-muted/20">
                {r.map((cell, ci) => (
                  <td key={ci} className="px-4 py-2.5 text-foreground/80 align-top leading-relaxed">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption ? (
        <figcaption className="mt-2 text-sm text-muted-foreground text-center">{caption}</figcaption>
      ) : null}
    </figure>
  );

  if (!bleed) return table;

  return (
    <div className="not-prose relative left-1/2 right-1/2 -mx-[50vw] w-screen my-10 bg-muted/40 py-10 md:py-12">
      <div className="mx-auto max-w-5xl px-6">{table}</div>
    </div>
  );
}

export function BlogSteps({ steps }: { steps: { title: string; body: ReactNode }[] }) {
  return (
    <ol className="my-6 space-y-5 list-decimal pl-6">
      {steps.map((s, i) => (
        <li key={i} className="pl-1">
          <h4 className="font-semibold text-foreground mb-1">{s.title}</h4>
          <div className="text-foreground/80 leading-relaxed">{s.body}</div>
        </li>
      ))}
    </ol>
  );
}

export function BlogDivider() {
  return <hr className="my-10 border-border" />;
}
