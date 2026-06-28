import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SeoHead } from "@/components/SeoHead";
import { breadcrumbsJsonLd } from "@/lib/seo-breadcrumbs";
import Footer from "@/components/Footer";
import { AppDetailCard } from "@/components/blog/AppDetailCard";

import naShot from "@/assets/blog/notebook-archive.png.asset.json";
import scrivenerShot from "@/assets/blog/scrivener.png.asset.json";
import obsidianShot from "@/assets/blog/obsidian.png.asset.json";
import ulyssesShot from "@/assets/blog/ulysses.png.asset.json";

const CTA = "/auth?ref=blog-writers&utm_source=blog&utm_medium=organic&utm_campaign=best-note-taking-app-for-writers";

const picks = [
  {
    name: "Notebook Archive",
    pricing: "Free; Pro $19/mo",
    imageUrl: naShot.url,
    imageAlt: "Notebook Archive landing page - a quiet markdown editor with AI explain panel",
    siteUrl: "https://notebookarchive.lovable.app",
    tagline: "For writers who want their notes to feel like a notebook, not a database.",
    description:
      "A serif markdown editor, focus mode, daily word-count goal, and AI that explains or summarizes on demand without rewriting your sentences. Notebooks nest, tags are global, and everything exports to plain markdown so the work is yours forever.",
    pros: [
      "Calm, serif typography designed for long writing sessions",
      "Focus mode and daily word-count goal built in",
      "AI side panel helps you think - never auto-drafts",
      "Free tier covers real daily writing; full markdown export",
    ],
    cons: [
      "Newer than Scrivener or Ulysses - smaller community",
      "Web-first; no native mobile app yet",
    ],
    bestFor: "Long-form writers, essayists, and researchers who draft daily.",
    disclosure: "Disclosure: this is the product we make. Criteria are listed up top.",
  },
  {
    name: "Scrivener",
    pricing: "$59.99 one-time",
    imageUrl: scrivenerShot.url,
    imageAlt: "Scrivener overview page - typewriter, ring-binder, scrapbook",
    siteUrl: "https://www.literatureandlatte.com/scrivener/overview",
    tagline: "The professional draft-and-restructure tool for book-length projects.",
    description:
      "Scrivener is what novelists and screenwriters reach for when the project is too big for one document. Corkboard, outline view, scene-by-scene reordering, manuscript compile - it's a craft tool, and twenty years of polish shows.",
    pros: [
      "Best-in-class restructuring tools (corkboard, outline, scrivenings)",
      "One-time price - no subscription",
      "Unmatched for book-length manuscripts",
    ],
    cons: [
      "No AI features at all",
      "No real cloud sync - files live on one machine unless you DIY with Dropbox",
      "Steep learning curve; outdated UI in places",
    ],
    bestFor: "Novelists and screenwriters mid-manuscript.",
    ourTake:
      "Scrivener is unbeatable for restructuring a 90,000-word novel. It's the wrong tool for daily research notes, blog drafts, or anything where you'd want AI to explain a source. Many writers run Scrivener for the manuscript and Notebook Archive for everything around it.",
  },
  {
    name: "Obsidian",
    pricing: "Free; Sync $5/mo",
    imageUrl: obsidianShot.url,
    imageAlt: "Obsidian landing page - 'Sharpen your thinking'",
    siteUrl: "https://obsidian.md",
    tagline: "Local markdown files with backlinks and a graph view.",
    description:
      "Obsidian stores your notes as plain markdown files on your disk. Infinite plugins, total control, complete portability - but you're assembling your own workflow.",
    pros: [
      "Plain files on your device - notes outlive any app",
      "Plugin ecosystem covers almost anything",
      "Free for personal use, works fully offline",
    ],
    cons: [
      "Steep learning curve; setup is a project",
      "AI requires plugins and your own API keys",
      "Cross-device sync is a paid add-on",
    ],
    bestFor: "Writers who want notes that outlive any single app and don't mind tinkering.",
    ourTake:
      "Obsidian is the right answer if you enjoy assembling tools. Notebook Archive gives you the markdown-and-export portability Obsidian is loved for, with AI working out of the box.",
  },
  {
    name: "Ulysses",
    pricing: "$5.99/mo",
    imageUrl: ulyssesShot.url,
    imageAlt: "Ulysses landing page - the ultimate writing app for Mac, iPad, and iPhone",
    siteUrl: "https://ulysses.app",
    tagline: "The polished markdown writing app for Apple devices.",
    description:
      "Distraction-free, gorgeous typography, a clean library, and excellent export. Apple-only and subscription-only, but if you live in macOS/iOS it's hard to beat for pure writing pleasure.",
    pros: [
      "Beautiful typography and writing experience",
      "Tight iCloud sync across Mac, iPad, iPhone",
      "Excellent publishing exports (ePub, PDF, Medium, WordPress)",
    ],
    cons: [
      "Apple-only - no Windows, no Linux, no web",
      "No AI features",
      "Subscription locks features behind ongoing payment",
    ],
    bestFor: "Mac/iPad writers who want one polished tool for everything.",
    ourTake:
      "Ulysses is a near-perfect writing surface - for Apple-only writers, in 2018. In 2026, the absence of any AI assistance feels like a gap, and lock-in to the Apple ecosystem is a hard line for cross-platform users. Notebook Archive runs in any browser and adds the AI Ulysses doesn't.",
  },
];

const faq = [
  {
    q: "What is the best note taking app for writers in 2026?",
    a: "It depends on the project. For long-form manuscript work, Scrivener still wins. For everyday writing with research notes, AI help, and plain-text portability, Notebook Archive or Obsidian are the strongest picks. For Apple-only writers who want one polished tool, Ulysses.",
  },
  {
    q: "Do I need an AI note taking app as a writer?",
    a: "Only if you want the model to do specific, narrow jobs - summarize a long source you pasted in, explain an unfamiliar concept, or pull tags out of your prose. You do not need AI to write for you. The best apps treat AI as a second pair of eyes, not a ghostwriter.",
  },
  {
    q: "Is there a free note taking app for writers?",
    a: "Yes. Notebook Archive and Obsidian both have free tiers that cover real long-form writing. Free tiers usually cap AI usage per month - that cap is the thing to compare, not the headline price.",
  },
  {
    q: "Can I export my notes if I switch apps later?",
    a: "Only some apps make this easy. Notebook Archive, Obsidian, and Ulysses all export to plain markdown. Scrivener exports to most word-processor formats. Apps that lock you into a proprietary database are worth avoiding for that reason alone.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Best Note Taking App for Writers in 2026",
    description:
      "An honest comparison of the four note taking apps that actually fit how writers work - Notebook Archive, Scrivener, Obsidian, and Ulysses.",
    datePublished: "2026-06-27",
    dateModified: "2026-06-28",
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
  },,
  breadcrumbsJsonLd([
    { name: "Blog", path: "/blog" },
    { name: "Best Note Taking App for Writers in 2026", path: "/blog/best-note-taking-app-for-writers" },
  ])
];

export default function BlogBestNoteTakingAppForWriters() {
  useEffect(() => {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <>
      <SeoHead
        type="article"
        title="Best Note Taking App for Writers (2026) - Honest Comparison"
        description="The four note taking apps that actually fit how writers work - Scrivener, Obsidian, Ulysses, and Notebook Archive. Screenshots, pros and cons, and who each one is for."
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
              - For Writers · Updated June 2026
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              The Best <span className="text-primary">Note Taking App for Writers</span> in 2026
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Most "best note taking app" lists are written for project managers. Writers need
              something else: a place that feels like a notebook, holds research without losing
              it, and stays out of the way while you draft. These are the four apps that actually
              do that - with screenshots, pros, cons, and where each one fits.
            </p>
          </motion.header>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold mt-8 mb-4">What writers actually need from a notes app</h2>
            <p className="text-muted-foreground leading-relaxed mb-12">
              We watched what writers do with notes - not what productivity blogs say they should
              do - and ended up with four criteria. The app has to feel calm to type in. It has to
              hold research alongside drafts without making you switch tools. It has to let you
              export, so the work outlives the app. And if it has AI, the AI should help you
              think, not write the sentence for you.
            </p>

            <h2 className="font-serif text-2xl font-bold mb-6">The four picks</h2>
            <div className="space-y-8">
              {picks.map((p, i) => (
                <AppDetailCard key={p.name} index={i + 1} {...p} />
              ))}
            </div>

            <h2 className="font-serif text-2xl font-bold mt-16 mb-4">How to pick the right one</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li>• <strong>You're drafting a book:</strong> Scrivener, with Notebook Archive for the research notes.</li>
              <li>• <strong>You write essays, articles, or research notes daily:</strong> Notebook Archive.</li>
              <li>• <strong>You want files you can read in twenty years without a subscription:</strong> Obsidian.</li>
              <li>• <strong>You're all-in on Apple and want one polished tool:</strong> Ulysses.</li>
            </ul>

            <h2 className="font-serif text-2xl font-bold mt-16 mb-6">Frequently asked</h2>
            <div className="space-y-6">
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
