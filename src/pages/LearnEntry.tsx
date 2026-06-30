import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SeoHead } from "@/components/SeoHead";
import Footer from "@/components/Footer";
import { getEntry, GLOSSARY } from "@/data/glossary";
import { breadcrumbsJsonLd } from "@/lib/seo-breadcrumbs";
import NotFound from "./NotFound";

export default function LearnEntry() {
  const { slug } = useParams<{ slug: string }>();
  const entry = slug ? getEntry(slug) : undefined;

  useEffect(() => {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }, []);

  if (!entry) return <NotFound />;

  const path = `/learn/${entry.slug}`;
  const related =
    entry.related?.map((s) => getEntry(s)).filter((e): e is NonNullable<typeof e> => Boolean(e)) ?? [];

  const jsonLd: Array<Record<string, unknown>> = [
    {
      "@context": "https://schema.org",
      "@type": "DefinedTerm",
      name: entry.term,
      description: entry.short,
      inDefinedTermSet: "https://notespace.lovable.app/learn",
      url: `https://notespace.lovable.app${path}`,
    },
    breadcrumbsJsonLd([
      { name: "Learn", path: "/learn" },
      { name: entry.term, path },
    ]),
  ];

  if (entry.faqs && entry.faqs.length > 0) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: entry.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  return (
    <>
      <SeoHead
        title={`${entry.term} - definition & how it works | Notespace`}
        description={entry.short}
        path={path}
        jsonLd={jsonLd}
      />
      <main className="min-h-screen bg-background">
        <PageHeader />

        <article className="pt-28 pb-12 border-b border-border">
          <div className="container mx-auto px-6 max-w-3xl">
            <Link
              to="/learn"
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-accent mb-6 hover:text-primary transition"
            >
              <ArrowLeft className="h-3 w-3" /> All terms
            </Link>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono mb-3">
              {entry.category}
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground leading-tight mb-5">
              {entry.term}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed border-l-2 border-primary/40 pl-4">
              {entry.short}
            </p>
          </div>
        </article>

        <section className="py-14">
          <div className="container mx-auto px-6 max-w-3xl">
            <div className="prose prose-lg max-w-none">
              {entry.body.map((p, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="text-base md:text-lg text-foreground/90 leading-relaxed mb-5"
                >
                  {p}
                </motion.p>
              ))}
            </div>

            {entry.faqs && entry.faqs.length > 0 && (
              <div className="mt-12 pt-10 border-t border-border">
                <h2 className="font-serif text-2xl font-bold mb-6">Common questions</h2>
                <div className="space-y-5">
                  {entry.faqs.map((f, i) => (
                    <div key={i}>
                      <h3 className="font-semibold text-foreground mb-1.5">{f.q}</h3>
                      <p className="text-muted-foreground leading-relaxed">{f.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {related.length > 0 && (
              <div className="mt-12 pt-10 border-t border-border">
                <h2 className="font-serif text-2xl font-bold mb-6">Related terms</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {related.map((r) => (
                    <Link
                      key={r.slug}
                      to={`/learn/${r.slug}`}
                      className="group block rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition"
                    >
                      <h3 className="font-serif text-lg font-bold text-foreground mb-2 group-hover:text-primary transition">
                        {r.term}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{r.short}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-14 rounded-2xl bg-primary/10 border border-primary/20 p-6 md:p-8 text-center">
              <h3 className="font-serif text-xl md:text-2xl font-bold mb-2">
                Try {entry.term} in Notespace
              </h3>
              <p className="text-muted-foreground mb-5 max-w-md mx-auto">
                A calm note-taking app with global search, tags, and Markdown export. Free to start.
              </p>
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg transition"
              >
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
