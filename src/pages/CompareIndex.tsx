import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SeoHead } from "@/components/SeoHead";
import Footer from "@/components/Footer";
import { COMPARISONS } from "@/data/comparisons";

export default function CompareIndex() {
  useEffect(() => {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <>
      <SeoHead
        title="Compare Notebook Archive vs other note apps (2026)"
        description="Honest side-by-side comparisons of Notebook Archive against Notion, Obsidian, Evernote, OneNote, Roam, Bear, Mem, Reflect, Apple Notes, and Google Keep."
        path="/compare"
      />
      <main className="min-h-screen bg-background">
        <PageHeader />

        <section className="pt-28 pb-12 border-b border-border">
          <div className="container mx-auto px-6 max-w-3xl text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="h-px w-8 bg-accent" />
              <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-accent">
                Compare
              </span>
              <span className="h-px w-8 bg-accent" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground leading-tight mb-5">
              Notebook Archive <span className="text-primary">vs the rest</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Honest, side-by-side comparisons. We'll tell you when the other tool is the right
              pick - and when it isn't.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {COMPARISONS.map((c, i) => (
                <motion.div
                  key={c.slug}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                >
                  <Link
                    to={`/compare/${c.slug}`}
                    className="group block rounded-xl border border-border bg-card p-6 hover:border-primary/40 transition h-full"
                  >
                    <div className="text-xs uppercase tracking-widest text-accent font-semibold mb-3">
                      Comparison
                    </div>
                    <h2 className="font-serif text-xl font-bold text-foreground mb-2 group-hover:text-primary transition">
                      vs {c.competitor}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{c.tagline}</p>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                      Read comparison <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
