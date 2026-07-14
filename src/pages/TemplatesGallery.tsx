import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, FileText } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SeoHead } from "@/components/SeoHead";
import Footer from "@/components/Footer";
import { templates } from "@/components/NoteTemplatePicker";
import { breadcrumbsJsonLd } from "@/lib/seo-breadcrumbs";

const CATEGORIES = ["Academic", "Productivity", "Work", "Personal"] as const;

export default function TemplatesGallery() {
  useEffect(() => {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }, []);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Note-taking templates",
      itemListElement: templates
        .filter((t) => t.id !== "blank")
        .map((t, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: t.name,
          url: `https://notebookarchive.lovable.app/templates/${t.id}`,
        })),
    },
    breadcrumbsJsonLd([{ name: "Templates", path: "/templates" }]),
  ];


  return (
    <>
      <SeoHead
        title="Free note-taking templates - lecture, Cornell, meeting & more"
        description="A curated library of free note-taking templates: Cornell notes, lecture notes, research notes, meeting notes, weekly reviews, book notes, study guides, and more. Open in any note app."
        path="/templates"
        jsonLd={jsonLd}
      />
      <main className="min-h-screen bg-background">
        <PageHeader />

        <section className="pt-28 pb-12 border-b border-border">
          <div className="container mx-auto px-6 max-w-3xl text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="h-px w-8 bg-accent" />
              <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-accent">
                Templates
              </span>
              <span className="h-px w-8 bg-accent" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground leading-tight mb-5">
              Free note-taking <span className="text-primary">templates</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Twelve well-built templates for studying, meetings, research, and personal reflection.
              Open with one click in Notespace, or copy the markdown to use anywhere.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/templates/study-planner"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
              >
                Featured: free study planner template <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {CATEGORIES.map((cat) => {
          const items = templates.filter((t) => t.category === cat);
          if (items.length === 0) return null;
          return (
            <section key={cat} className="py-16 border-b border-border last:border-b-0">
              <div className="container mx-auto px-6 max-w-5xl">
                <div className="mb-8 flex items-baseline gap-3">
                  <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-accent">
                    {cat}
                  </span>
                  <span className="h-px flex-1 bg-border" />
                </div>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {items.map((t, i) => (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: i * 0.04 }}
                    >
                      <Link
                        to={`/templates/${t.id}`}
                        className="group block rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 transition h-full"
                      >
                        <div
                          className={`h-2 w-full bg-gradient-to-r ${t.swatch ?? "from-primary/30 to-primary/10"}`}
                        />
                        <div className="p-5">
                          <div
                            className={`inline-flex items-center justify-center h-9 w-9 rounded-lg mb-3 ${t.accent ?? "bg-muted text-foreground"}`}
                          >
                            {t.icon}
                          </div>
                          <h3 className="font-serif text-lg font-bold text-foreground mb-1 group-hover:text-primary transition">
                            {t.name}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                            {t.description}
                          </p>
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                            Preview <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition" />
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          );
        })}

        <section className="py-20 bg-muted/20 border-t border-border">
          <div className="container mx-auto px-6 max-w-2xl text-center">
            <FileText className="h-8 w-8 text-primary mx-auto mb-4 opacity-60" />
            <h2 className="font-serif text-3xl font-bold text-foreground mb-3">
              Use any template in two clicks
            </h2>
            <p className="text-muted-foreground mb-6">
              Sign up free, click "New note", pick a template. That's it.
            </p>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
            >
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
