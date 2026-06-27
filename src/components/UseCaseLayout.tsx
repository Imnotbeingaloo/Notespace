import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, X, Quote, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

export interface UseCaseSection {
  title: string;
  body: string;
  bullets?: string[];
}

export interface Scenario {
  situation: string;
  problem: string;
  solution: string;
}

export interface PainPoint {
  problem: string;
  answer: string;
}

export interface ComparisonRow {
  capability: string;
  notebookArchive: string;
  others: string;
}

export interface UseCaseLayoutProps {
  eyebrow: string;
  title: React.ReactNode;
  intro: string;
  primaryCta?: { label: string; to: string };
  /** Long-form opening paragraph rendered above section 01. */
  overview?: string[];
  sections: UseCaseSection[];
  /** Real-world situations the audience hits in practice. */
  scenarios?: Scenario[];
  /** Honest pain-point answers. */
  painPoints?: PainPoint[];
  /** Quick comparison table vs. alternatives in this category. */
  comparison?: { headingOther: string; rows: ComparisonRow[] };
  /** Pull quote — composite voice of the audience, not a fake testimonial. */
  quote?: { text: string; attribution: string };
  workflow: { step: string; title: string; body: string }[];
  /** Tips/best practices for getting the most out of it. */
  tips?: { title: string; body: string }[];
  faqs: { q: string; a: string }[];
}

export function UseCaseLayout({
  eyebrow,
  title,
  intro,
  primaryCta,
  overview,
  sections,
  scenarios,
  painPoints,
  comparison,
  quote,
  workflow,
  tips,
  faqs,
}: UseCaseLayoutProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  return (
    <main className="min-h-screen bg-background">
      <PageHeader />

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-16 border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-primary/[0.04] pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="container mx-auto px-6 pt-8 pb-12 md:pt-16 md:pb-20 text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="h-px w-8 bg-accent" />
              <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-accent">{eyebrow}</span>
            </div>
            <h1 className="font-serif text-[2rem] md:text-[2.5rem] lg:text-[3.1rem] font-bold text-foreground leading-[1.18] tracking-normal pb-2 max-w-4xl mx-auto">
              {title}
            </h1>
            <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {intro}
            </p>
            {primaryCta && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <Button asChild size="lg" className="rounded-full">
                  <Link to={primaryCta.to}>
                    {primaryCta.label} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Overview */}
      {overview && overview.length > 0 && (
        <section className="py-20 border-b border-border">
          <div className="container mx-auto px-6 max-w-3xl space-y-5">
            {overview.map((p, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className={`leading-relaxed ${i === 0 ? "text-lg md:text-xl text-foreground font-serif" : "text-base text-muted-foreground"}`}
              >
                {p}
              </motion.p>
            ))}
          </div>
        </section>
      )}

      {/* Sections */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-4xl space-y-16">
          {sections.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-accent mb-3">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">
                {s.title}
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">{s.body}</p>
              {s.bullets && (
                <ul className="mt-5 space-y-2">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex gap-3 text-sm text-foreground/90">
                      <Check className="h-4 w-4 mt-1 shrink-0 text-primary" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Scenarios */}
      {scenarios && scenarios.length > 0 && (
        <section className="py-24 border-t border-border bg-muted/20">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="h-px w-8 bg-accent" />
                <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-accent">Real scenarios</span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                Situations you'll actually run into
              </h2>
            </div>
            <div className="space-y-6">
              {scenarios.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="grid gap-6 md:grid-cols-3 rounded-2xl border border-border bg-card p-6"
                >
                  <div>
                    <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-accent mb-2">The situation</div>
                    <p className="text-sm text-foreground leading-relaxed">{s.situation}</p>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-destructive/80 mb-2">The problem</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.problem}</p>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-primary mb-2">What you do</div>
                    <p className="text-sm text-foreground leading-relaxed">{s.solution}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pull quote */}
      {quote && (
        <section className="py-20 border-t border-border">
          <div className="container mx-auto px-6 max-w-3xl text-center">
            <Quote className="h-8 w-8 text-primary mx-auto mb-6 opacity-60" />
            <p className="font-serif text-xl md:text-2xl text-foreground leading-relaxed italic mb-4">
              "{quote.text}"
            </p>
            <p className="text-sm text-muted-foreground">— {quote.attribution}</p>
          </div>
        </section>
      )}

      {/* Pain points */}
      {painPoints && painPoints.length > 0 && (
        <section className="py-24 border-t border-border">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="h-px w-8 bg-accent" />
                <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-accent">The honest answers</span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                What's actually hard, and what we do about it
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {painPoints.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <X className="h-4 w-4 mt-1 shrink-0 text-destructive/70" />
                    <h3 className="font-medium text-foreground">{p.problem}</h3>
                  </div>
                  <div className="flex items-start gap-3 pl-7">
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.answer}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Comparison */}
      {comparison && (
        <section className="py-24 border-t border-border bg-muted/20">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="h-px w-8 bg-accent" />
                <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-accent">Side by side</span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                Notebook Archive vs. {comparison.headingOther}
              </h2>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="grid grid-cols-3 bg-muted/50 border-b border-border">
                <div className="p-4 text-xs font-mono uppercase tracking-wider text-muted-foreground">Capability</div>
                <div className="p-4 text-xs font-mono uppercase tracking-wider text-primary">Notebook Archive</div>
                <div className="p-4 text-xs font-mono uppercase tracking-wider text-muted-foreground">{comparison.headingOther}</div>
              </div>
              {comparison.rows.map((r, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-3 ${i !== comparison.rows.length - 1 ? "border-b border-border" : ""}`}
                >
                  <div className="p-4 text-sm font-medium text-foreground">{r.capability}</div>
                  <div className="p-4 text-sm text-foreground/90 leading-relaxed">{r.notebookArchive}</div>
                  <div className="p-4 text-sm text-muted-foreground leading-relaxed">{r.others}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Workflow */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="h-px w-8 bg-accent" />
              <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-accent">A typical week</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              How it fits into your routine
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {workflow.map((w) => (
              <div key={w.title} className="rounded-2xl border border-border bg-card p-6">
                <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-accent mb-2">{w.step}</div>
                <h3 className="font-serif text-lg font-bold text-foreground mb-2">{w.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips */}
      {tips && tips.length > 0 && (
        <section className="py-24 border-t border-border bg-muted/20">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="h-px w-8 bg-accent" />
                <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-accent">Get more out of it</span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                Tips from people who use it daily
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {tips.map((t, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-serif text-lg font-bold text-foreground mb-2">{t.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="h-px w-8 bg-accent" />
              <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-accent">FAQ</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">Common questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((f) => (
              <details key={f.q} className="group rounded-xl border border-border bg-card p-5">
                <summary className="cursor-pointer font-medium text-foreground list-none flex justify-between items-center">
                  {f.q}
                  <span className="ml-4 text-muted-foreground group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-6 max-w-2xl text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Start with one notebook.
          </h2>
          <p className="text-muted-foreground mb-8">Free to try. No credit card. Your notes stay private.</p>
          <Button asChild size="lg" className="rounded-full">
            <Link to="/auth">Create your account <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <Footer />
    </main>
  );
}
