import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, PenLine, BookOpen, Layers, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SeoHead } from "@/components/SeoHead";
import Footer from "@/components/Footer";

const CTA = "/auth?ref=blog-writers&utm_source=blog&utm_medium=organic&utm_campaign=best-note-taking-app-for-writers";

const picks = [
  {
    name: "Notebook Archive",
    tagline: "For writers who want their notes to feel like a notebook, not a database.",
    why: "Markdown editor with a serif typeface, focus mode, daily word-count goal, and AI that explains and summarizes without rewriting your sentences. Notebooks nest, tags are global, and everything exports to plain markdown so nothing is locked in.",
    pricing: "Free; Pro $19/mo",
    bestFor: "Long-form writers, essayists, novelists drafting research notes.",
    disclosure: "Disclosure: this is the product we make. Criteria below.",
    icon: PenLine,
  },
  {
    name: "Scrivener",
    tagline: "The professional draft-and-restructure tool, no AI.",
    why: "Corkboard, outline view, scene-by-scene reordering. Heavy, but unmatched for book-length projects. No cloud, no AI.",
    pricing: "$59.99 one-time",
    bestFor: "Novelists and screenwriters mid-manuscript.",
    icon: BookOpen,
  },
  {
    name: "Obsidian",
    tagline: "Local markdown files with backlinks and a graph view.",
    why: "Plain-text files on your disk, infinite plugins, complete control. Steeper to set up but durable for life.",
    pricing: "Free; Sync $5/mo",
    bestFor: "Writers who want notes that outlive any single app.",
    icon: Layers,
  },
  {
    name: "Ulysses",
    tagline: "Markdown writing app for Apple devices, polished.",
    why: "Distraction-free, clean library, gorgeous typography. Apple-only and subscription-only.",
    pricing: "$5.99/mo",
    bestFor: "Mac/iPad writers who want one app for everything.",
    icon: Sparkles,
  },
];

const faq = [
  {
    q: "What is the best note taking app for writers in 2026?",
    a: "For most writers, the answer depends on the project. For long-form manuscript work, Scrivener still wins. For everyday writing with research notes, AI help, and plain-text portability, Notebook Archive or Obsidian are the strongest picks. For Apple-only writers who want one polished tool, Ulysses.",
  },
  {
    q: "Do I need an AI note taking app as a writer?",
    a: "Only if you want the model to do specific, narrow jobs — summarize a long source you pasted in, explain an unfamiliar concept, or pull tags out of your prose. You do not need AI to write for you. The best apps treat AI as a second pair of eyes, not a ghostwriter.",
  },
  {
    q: "Is there a free note taking app for writers?",
    a: "Yes. Notebook Archive and Obsidian both have free tiers that cover real long-form writing. Free tiers usually cap AI usage per month — that cap is the thing to compare, not the headline price.",
  },
  {
    q: "Can I export my notes if I switch apps later?",
    a: "Only some apps make this easy. Notebook Archive, Obsidian, and Ulysses all export to plain markdown. Scrivener exports to most word-processor formats. Apps that lock you into a proprietary database (some legacy options) are worth avoiding for that reason alone.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Best Note Taking App for Writers in 2026",
    description:
      "An honest comparison of the four note taking apps that actually fit how writers work — Notebook Archive, Scrivener, Obsidian, and Ulysses.",
    datePublished: "2026-06-27",
    author: { "@type": "Organization", name: "Notebook Archive" },
    publisher: { "@type": "Organization", name: "Notebook Archive" },
    mainEntityOfPage: "https://notebookarchive.lovable.app/blog/best-note-taking-app-for-writers",
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  },
];

export default function BlogBestNoteTakingAppForWriters() {
  useEffect(() => {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <>
      <SeoHead
        title="Best Note Taking App for Writers (2026) — Honest Comparison"
        description="The four note taking apps that actually fit how writers work — Scrivener, Obsidian, Ulysses, and Notebook Archive. Pricing, AI features, and who each one is for."
        path="/blog/best-note-taking-app-for-writers"
        jsonLd={jsonLd}
      />
      <div className="min-h-screen bg-background text-foreground">
        <PageHeader />

        <article className="max-w-3xl mx-auto px-6 pt-32 pb-20">
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <p className="text-sm uppercase tracking-widest text-accent font-semibold mb-4">
              — For Writers · Updated June 2026
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              The Best <span className="text-primary">Note Taking App for Writers</span> in 2026
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Most "best note taking app" lists are written for project managers. Writers need
              something else: a place that feels like a notebook, holds research without losing it,
              and stays out of the way while you draft. These are the four apps that actually do that.
            </p>
          </motion.header>

          <section className="prose prose-neutral max-w-none mb-12">
            <h2 className="font-serif text-2xl font-bold mt-12 mb-4">What writers actually need from a notes app</h2>
            <p className="text-muted-foreground leading-relaxed">
              We watched what writers do with notes — not what productivity blogs say they should
              do — and ended up with four criteria. The app has to feel calm to type in (typography
              and focus matter more than feature counts). It has to hold research alongside drafts
              without making you switch tools. It has to let you export, so the work outlives the
              app. And if it has AI, the AI should help you think — explain a concept, summarize a
              source — not write the sentence for you.
            </p>

            <h2 className="font-serif text-2xl font-bold mt-12 mb-4">The four picks</h2>

            <div className="not-prose space-y-6 mt-6">
              {picks.map((p, i) => {
                const Icon = p.icon;
                return (
                  <motion.div
                    key={p.name}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="border border-border rounded-lg p-6 bg-card"
                  >
                    <div className="flex items-baseline justify-between gap-4 mb-2">
                      <h3 className="font-serif text-xl font-bold flex items-center gap-3">
                        <Icon className="h-5 w-5 text-primary" />
                        {i + 1}. {p.name}
                      </h3>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">{p.pricing}</span>
                    </div>
                    <p className="italic text-foreground/80 mb-3">{p.tagline}</p>
                    <p className="text-muted-foreground mb-3">{p.why}</p>
                    <p className="text-sm"><strong className="text-primary">Best for:</strong> <span className="text-muted-foreground">{p.bestFor}</span></p>
                    {p.disclosure && (
                      <p className="text-xs italic text-muted-foreground mt-4 border-t border-border pt-3">
                        {p.disclosure}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <h2 className="font-serif text-2xl font-bold mt-16 mb-4">How to pick the right one</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li>• <strong>You're drafting a book:</strong> Scrivener, with Notebook Archive for the research notes.</li>
              <li>• <strong>You write essays, articles, or research notes daily:</strong> Notebook Archive.</li>
              <li>• <strong>You want files you can read in twenty years without a subscription:</strong> Obsidian.</li>
              <li>• <strong>You're all-in on Apple and want one polished tool:</strong> Ulysses.</li>
            </ul>

            <h2 className="font-serif text-2xl font-bold mt-16 mb-6">Frequently asked</h2>
            <div className="not-prose space-y-6">
              {faq.map((f) => (
                <div key={f.q} className="border-l-2 border-primary/40 pl-4">
                  <h3 className="font-serif text-lg font-bold mb-2">{f.q}</h3>
                  <p className="text-muted-foreground">{f.a}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="border-t border-border pt-10 mt-10 text-center">
            <p className="font-serif text-2xl font-bold mb-4">
              Try the one built for writers
            </p>
            <p className="text-muted-foreground mb-6">
              Notebook Archive is free to start. No credit card.
            </p>
            <Link
              to={CTA}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Open Notebook Archive
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </article>

        <Footer />
      </div>
    </>
  );
}
