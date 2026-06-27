import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SeoHead } from "@/components/SeoHead";
import Footer from "@/components/Footer";

const posts = [
  {
    slug: "evernote-alternatives-2026",
    title: "Six Honest Evernote Alternatives for 2026",
    excerpt:
      "Evernote pioneered the digital shoebox — then the free tier shrank, the editor stayed in 2015, and the price kept climbing. The six apps people actually move to: Notion, Obsidian, OneNote, Reflect, Mem, and Notebook Archive.",
    date: "Jun 2026",
    tag: "Comparison",
  },
  {
    slug: "onenote-alternatives-2026",
    title: "Six Honest OneNote Alternatives for 2026",
    excerpt:
      "OneNote is free and generous — and a freeform canvas that gets messy fast, locks your notes in, and gates the good AI behind Microsoft 365. The six apps people actually move to.",
    date: "Jun 2026",
    tag: "Comparison",
  },
  {
    slug: "obsidian-alternatives-2026",
    title: "Six Honest Obsidian Alternatives for 2026",
    excerpt:
      "Obsidian is brilliant — and it's a tool you have to build. If you're tired of maintaining a vault, paying for sync, and configuring plugins before you can write, here are the six apps people actually move to.",
    date: "Jun 2026",
    tag: "Comparison",
  },
  {
    slug: "notion-alternatives-2026",
    title: "Six Honest Notion Alternatives for 2026",
    excerpt:
      "Notion grew into an everything-tool. If you only ever used it for notes, here are the six apps people actually leave for — Obsidian, Evernote, OneNote, Reflect, Mem, and Notebook Archive.",
    date: "Jun 2026",
    tag: "Comparison",
  },
  {
    slug: "best-ai-note-taking-apps-2026",
    title: "Best AI Note Taking Apps for Writers and Researchers in 2026",
    excerpt:
      "An honest comparison of the seven AI note taking apps that actually earn the label — Notebook Archive, Evernote, Notion AI, Obsidian, Mem, Reflect, and Otter.ai.",
    date: "Jun 2026",
    tag: "Comparison",
  },
  {
    slug: "best-note-taking-app-for-writers",
    title: "The Best Note Taking App for Writers in 2026",
    excerpt:
      "Most lists are written for project managers. Writers need something else. The four apps that actually fit how writers work — Scrivener, Obsidian, Ulysses, and Notebook Archive.",
    date: "Jun 2026",
    tag: "For Writers",
  },
  {
    slug: "ai-note-taking-app-for-students",
    title: "The Best AI Note Taking App for Students in 2026",
    excerpt:
      "Per-course organization, AI that explains without writing your essay, free tiers that are actually usable. Notebook Archive, Notion, Obsidian, and OneNote compared.",
    date: "Jun 2026",
    tag: "For Students",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "Notebook Archive Blog",
  url: "https://notebookarchive.lovable.app/blog",
  description:
    "Honest writing on note taking, AI for writers and researchers, and the tools we build at Notebook Archive.",
  blogPost: posts.map((p) => ({
    "@type": "BlogPosting",
    headline: p.title,
    url: `https://notebookarchive.lovable.app/blog/${p.slug}`,
  })),
};

export default function BlogIndex() {
  useEffect(() => {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <>
      <SeoHead
        title="Blog — Notebook Archive"
        description="Honest writing on note taking apps, AI for writers and researchers, and the tools we build at Notebook Archive."
        path="/blog"
        jsonLd={jsonLd}
      />
      <div className="min-h-screen bg-background text-foreground">
        <PageHeader />

        <main className="max-w-3xl mx-auto px-6 pt-32 pb-20">
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-16 text-center"
          >
            <p className="text-sm uppercase tracking-widest text-accent font-semibold mb-4">
              — The Notebook Archive Blog
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              Writing about <span className="text-primary">writing, notes, and the tools between them</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Honest comparisons, opinionated picks, and the occasional behind-the-scenes from
              the team building Notebook Archive.
            </p>
          </motion.header>

          <div className="space-y-8">
            {posts.map((p, i) => (
              <motion.article
                key={p.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Link
                  to={`/blog/${p.slug}`}
                  className="block border border-border rounded-lg p-6 bg-card hover:border-primary/40 transition group"
                >
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span className="uppercase tracking-widest text-accent font-semibold">{p.tag}</span>
                    <span>·</span>
                    <span>{p.date}</span>
                  </div>
                  <h2 className="font-serif text-2xl font-bold mb-3 group-hover:text-primary transition">
                    {p.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">{p.excerpt}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    Read post <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
                  </span>
                </Link>
              </motion.article>
            ))}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
