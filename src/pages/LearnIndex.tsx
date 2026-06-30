import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SeoHead } from "@/components/SeoHead";
import Footer from "@/components/Footer";
import { GLOSSARY } from "@/data/glossary";
import { breadcrumbsJsonLd } from "@/lib/seo-breadcrumbs";

const CATEGORIES = ["Method", "System", "Concept", "Tool"] as const;

export default function LearnIndex() {
  useEffect(() => {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }, []);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "The Notespace Learn hub",
      description:
        "Plain-English definitions of the note-taking, PKM, and study terms people actually search for.",
      url: "https://notespace.lovable.app/learn",
      hasPart: GLOSSARY.map((g) => ({
        "@type": "DefinedTerm",
        name: g.term,
        description: g.short,
        url: `https://notespace.lovable.app/learn/${g.slug}`,
      })),
    },
    breadcrumbsJsonLd([{ name: "Learn", path: "/learn" }]),
  ];

  return (
    <>
      <SeoHead
        title="Learn - note-taking, PKM & study terms explained"
        description="Plain-English glossary of note-taking methods (Zettelkasten, Cornell, PARA), systems (Second Brain, Bullet Journal), and study techniques (spaced repetition, active recall)."
        path="/learn"
        jsonLd={jsonLd}
      />
      <main className="min-h-screen bg-background">
        <PageHeader />

        <section className="pt-28 pb-12 border-b border-border">
          <div className="container mx-auto px-6 max-w-3xl text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="h-px w-8 bg-accent" />
              <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-accent">
                Learn
              </span>
              <span className="h-px w-8 bg-accent" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground leading-tight mb-5">
              Note-taking <span className="text-primary">terms, explained</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              The methods, systems, and study techniques behind serious note-taking - in plain
              English, with our honest take on when each one is worth your time.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-6 max-w-5xl space-y-16">
            {CATEGORIES.map((cat) => {
              const items = GLOSSARY.filter((g) => g.category === cat);
              if (items.length === 0) return null;
              return (
                <div key={cat}>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-xs uppercase tracking-[0.18em] font-semibold text-accent">
                      {cat}s
                    </span>
                    <span className="h-px flex-1 bg-border" />
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((g, i) => (
                      <motion.div
                        key={g.slug}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.4, delay: i * 0.04 }}
                      >
                        <Link
                          to={`/learn/${g.slug}`}
                          className="group block h-full rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <BookOpen className="h-4 w-4 text-primary" />
                            <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono">
                              {g.category}
                            </span>
                          </div>
                          <h2 className="font-serif text-lg font-bold text-foreground mb-2 group-hover:text-primary transition">
                            {g.term}
                          </h2>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                            {g.short}
                          </p>
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                            Read definition <ArrowRight className="h-3 w-3" />
                          </span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
