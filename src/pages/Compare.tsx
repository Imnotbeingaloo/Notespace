import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, ChevronDown, X } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SeoHead } from "@/components/SeoHead";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { COMPARISONS, getComparison } from "@/data/comparisons";
import NotFound from "./NotFound";

export default function Compare() {
  const { slug } = useParams<{ slug: string }>();
  const data = slug ? getComparison(slug) : undefined;
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }, []);

  if (!data) return <NotFound />;

  const path = `/compare/${data.slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: data.metaTitle,
      description: data.metaDescription,
      author: { "@type": "Organization", name: "Notespace" },
      publisher: {
        "@type": "Organization",
        name: "Notespace",
        logo: { "@type": "ImageObject", url: "https://notespace.lovable.app/logo.png" },
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": `https://notespace.lovable.app${path}` },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://notespace.lovable.app/" },
        { "@type": "ListItem", position: 2, name: "Compare", item: "https://notespace.lovable.app/compare" },
        {
          "@type": "ListItem",
          position: 3,
          name: `Notespace vs ${data.competitor}`,
          item: `https://notespace.lovable.app${path}`,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: data.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <>
      <SeoHead
        title={data.metaTitle}
        description={data.metaDescription}
        path={path}
        jsonLd={jsonLd}
        type="article"
      />
      <main className="min-h-screen bg-background">
        <PageHeader />

        {/* Hero */}
        <section className="relative overflow-hidden pt-28 pb-16 border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-primary/[0.04] pointer-events-none" />
          <div className="container mx-auto px-6 pt-8 pb-12 md:pt-16 md:pb-20 text-center relative">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="h-px w-8 bg-accent" />
                <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-accent">
                  Notespace vs {data.competitor}
                </span>
                <span className="h-px w-8 bg-accent" />
              </div>
              <h1 className="font-serif text-[2rem] md:text-[2.5rem] lg:text-[3.1rem] font-bold text-foreground leading-[1.18] max-w-4xl mx-auto">
                Notespace vs <span className="text-primary">{data.competitor}</span>
              </h1>
              <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {data.tagline}
              </p>
              <div className="mt-8 flex items-center justify-center gap-4">
                <Button asChild size="lg" className="rounded-full">
                  <Link to="/auth">
                    Try Notespace free <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Honest framing */}
        <section className="py-20 border-b border-border">
          <div className="container mx-auto px-6 max-w-3xl space-y-8">
            <div>
              <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-accent mb-3">
                What {data.competitor} does well
              </div>
              <p className="text-lg text-foreground font-serif leading-relaxed">{data.competitorStrength}</p>
            </div>
            <div>
              <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-accent mb-3">
                Where it falls short
              </div>
              <p className="text-base text-muted-foreground leading-relaxed">{data.competitorGap}</p>
            </div>
            <div className="border-l-2 border-primary pl-5">
              <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-primary mb-2">Best for</div>
              <p className="text-base text-foreground">{data.bestFor}</p>
            </div>
          </div>
        </section>

        {/* Comparison table */}
        <section className="py-24 bg-muted/20 border-b border-border">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="h-px w-8 bg-accent" />
                <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-accent">Side by side</span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                Feature by feature
              </h2>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="grid grid-cols-3 bg-muted/50 border-b border-border">
                <div className="p-4 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Capability
                </div>
                <div className="p-4 text-xs font-mono uppercase tracking-wider text-primary">
                  Notespace
                </div>
                <div className="p-4 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  {data.competitor}
                </div>
              </div>
              {data.rows.map((r, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-3 ${i !== data.rows.length - 1 ? "border-b border-border" : ""}`}
                >
                  <div className="p-4 text-sm font-medium text-foreground">{r.capability}</div>
                  <div className="p-4 text-sm text-foreground/90 leading-relaxed">{r.na}</div>
                  <div className="p-4 text-sm text-muted-foreground leading-relaxed">{r.other}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pick X / Pick us */}
        <section className="py-24 border-b border-border">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="h-px w-8 bg-accent" />
                <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-accent">
                  The honest call
                </span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                Which one is right for you?
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-serif text-xl font-bold text-foreground mb-4">
                  Pick {data.competitor} if...
                </h3>
                <ul className="space-y-3">
                  {data.pickThem.map((p) => (
                    <li key={p} className="flex gap-3 text-sm text-foreground/90">
                      <Check className="h-4 w-4 mt-1 shrink-0 text-muted-foreground" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border-2 border-primary/40 bg-primary/[0.04] p-6">
                <h3 className="font-serif text-xl font-bold text-foreground mb-4">
                  Pick Notespace if...
                </h3>
                <ul className="space-y-3">
                  {data.pickUs.map((p) => (
                    <li key={p} className="flex gap-3 text-sm text-foreground/90">
                      <Check className="h-4 w-4 mt-1 shrink-0 text-primary" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 border-b border-border">
          <div className="container mx-auto px-6 max-w-3xl">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="h-px w-8 bg-accent" />
                <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-accent">FAQ</span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                What people ask
              </h2>
            </div>
            <div className="space-y-3">
              {data.faqs.map((f, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={f.q} className="rounded-xl border border-border bg-card overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="w-full flex items-center justify-between gap-4 text-left p-5 hover:bg-muted/30 transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span className="font-medium text-foreground">{f.q}</span>
                      <motion.span
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="shrink-0 text-muted-foreground"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* More comparisons */}
        <section className="py-20 bg-muted/20 border-b border-border">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="h-px w-8 bg-accent" />
                <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-accent">
                  More comparisons
                </span>
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                See how it stacks up against the others
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {COMPARISONS.filter((c) => c.slug !== data.slug)
                .slice(0, 6)
                .map((c) => (
                  <Link
                    key={c.slug}
                    to={`/compare/${c.slug}`}
                    className="group block rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition"
                  >
                    <div className="text-xs uppercase tracking-widest text-accent font-semibold mb-2">
                      Compare
                    </div>
                    <div className="font-serif text-base font-bold text-foreground group-hover:text-primary transition">
                      vs {c.competitor}
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24">
          <div className="container mx-auto px-6 max-w-2xl text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Try the quieter notebook
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-8">
              Free to start. No credit card. Bring your notes when you're ready.
            </p>
            <Button asChild size="lg" className="rounded-full">
              <Link to="/auth">
                Get started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
