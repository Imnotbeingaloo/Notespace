import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Copy, Check } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PageHeader } from "@/components/PageHeader";
import { SeoHead } from "@/components/SeoHead";
import Footer from "@/components/Footer";
import { templates } from "@/components/NoteTemplatePicker";
import { toast } from "@/components/ui/sonner";
import { useAuth, hasLikelySession } from "@/context/AuthContext";
import NotFound from "./NotFound";

export default function TemplateDetail() {
  const { id } = useParams<{ id: string }>();
  const template = templates.find((t) => t.id === id);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  const isAuthed = !!user || hasLikelySession();
  const useTemplateHref = template
    ? (isAuthed ? `/app?template=${template.id}` : `/auth?template=${template.id}`)
    : "/auth";

  useEffect(() => {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }, []);

  if (!template) return <NotFound />;

  const path = `/templates/${template.id}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: `${template.name} template`,
      description: template.description,
      genre: template.category,
      inLanguage: "en",
      isAccessibleForFree: true,
      url: `https://notebookarchive.lovable.app${path}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://notebookarchive.lovable.app/" },
        { "@type": "ListItem", position: 2, name: "Templates", item: "https://notebookarchive.lovable.app/templates" },
        { "@type": "ListItem", position: 3, name: template.name, item: `https://notebookarchive.lovable.app${path}` },
      ],
    },
  ];

  const copyMarkdown = async () => {
    await navigator.clipboard.writeText(template.content);
    setCopied(true);
    toast.success("Template copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <SeoHead
        title={`${template.name} template - free note-taking template`}
        description={`Free ${template.name.toLowerCase()} template - ${template.description}. Open in Notespace or copy the markdown to use anywhere.`}
        path={path}
        jsonLd={jsonLd}
      />
      <main className="min-h-screen bg-background">
        <PageHeader />

        <section className="pt-28 pb-12 border-b border-border">
          <div className="container mx-auto px-6 max-w-4xl">
            <Link
              to="/templates"
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-accent mb-6 hover:text-primary transition"
            >
              <ArrowLeft className="h-3 w-3" /> All templates
            </Link>
            <div className="flex items-start gap-5 mb-6">
              <div
                className={`inline-flex items-center justify-center h-14 w-14 rounded-xl shrink-0 ${template.accent ?? "bg-muted text-foreground"}`}
              >
                {template.icon}
              </div>
              <div>
                <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-accent mb-2">
                  {template.category} template
                </div>
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground leading-tight mb-2">
                  {template.name}
                </h1>
                <p className="text-base text-muted-foreground">{template.description}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to={useTemplateHref}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
              >
                Use this template <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={copyMarkdown}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted/50 transition"
              >
                {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy markdown"}
              </button>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-6 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl border border-border bg-card overflow-hidden"
            >
              <div
                className={`h-2 w-full bg-gradient-to-r ${template.swatch ?? "from-primary/30 to-primary/10"}`}
              />
              <div className="p-8 md:p-12">
                <h2 className="font-serif text-2xl font-bold mb-6">{template.title}</h2>
                <div className="prose prose-sm md:prose-base max-w-none prose-headings:font-serif prose-headings:text-foreground prose-p:text-foreground/90 prose-li:text-foreground/90 prose-strong:text-foreground prose-table:text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{template.content}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-16 bg-muted/20 border-t border-border">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="text-center mb-8">
              <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-accent mb-2">
                More templates
              </div>
              <h2 className="font-serif text-2xl font-bold text-foreground">
                Browse the rest of the library
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {templates
                .filter((t) => t.id !== template.id && t.id !== "blank")
                .slice(0, 6)
                .map((t) => (
                  <Link
                    key={t.id}
                    to={`/templates/${t.id}`}
                    className="group block rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`inline-flex items-center justify-center h-9 w-9 rounded-lg shrink-0 ${t.accent ?? "bg-muted text-foreground"}`}
                      >
                        {t.icon}
                      </div>
                      <div>
                        <div className="font-serif text-sm font-bold text-foreground group-hover:text-primary transition">
                          {t.name}
                        </div>
                        <div className="text-xs text-muted-foreground">{t.category}</div>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
