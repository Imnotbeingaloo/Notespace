import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PageHeader } from "@/components/PageHeader";
import { SeoHead } from "@/components/SeoHead";
import { breadcrumbsJsonLd } from "@/lib/seo-breadcrumbs";
import Footer from "@/components/Footer";
import { AppDetailCard } from "@/components/blog/AppDetailCard";

import naShot from "@/assets/blog/notebook-archive.png.asset.json";
import notionShot from "@/assets/blog/notion.png.asset.json";
import obsidianShot from "@/assets/blog/obsidian.png.asset.json";
import evernoteShot from "@/assets/blog/evernote.png.asset.json";
import reflectShot from "@/assets/blog/reflect.png.asset.json";
import memShot from "@/assets/blog/mem.png.asset.json";

const REF = "blog-onenote-alt";
const CTA = `/auth?ref=${REF}&utm_source=blog&utm_medium=organic&utm_campaign=onenote-alternatives`;

const picks = [
  {
    name: "Notebook Archive",
    pricing: "Free; Pro $19/mo",
    imageUrl: naShot.url,
    imageAlt: "Notebook Archive - a quiet markdown notebook with an AI explain panel",
    siteUrl: "https://notebookarchive.lovable.app",
    tagline: "OneNote's notebook model - with structure instead of an infinite mess.",
    description:
      "A serif markdown editor with notebooks, nesting, global tags, AI explain, and plain-text export. Keeps the notebook-and-section metaphor OneNote pioneered - without the free-canvas chaos or the Microsoft 365 lock-in.",
    pros: [
      "Real structure: notebooks, sections, nested notes",
      "Markdown export so your notes outlive the app",
      "AI explain panel summarizes sources without rewriting your notes",
      "Works the same on any OS, not just inside Microsoft",
    ],
    cons: [
      "No stylus or handwriting support",
      "No native OCR for scanned pages",
    ],
    bestFor: "OneNote users who type more than they draw and want a calmer, more structured editor.",
    disclosure: "Disclosure: this is the product we make. Selection criteria are listed up top.",
  },
  {
    name: "Notion",
    pricing: "Free; Plus $10/mo",
    imageUrl: notionShot.url,
    imageAlt: "Notion landing page",
    siteUrl: "https://www.notion.so",
    tagline: "An everything-tool with blocks, databases, and wikis.",
    description:
      "If you mostly used OneNote for shared team notebooks, Notion is the natural next step. Better collaboration, wikis, and databases - at the cost of a slower editor and a proprietary block format that doesn't export cleanly.",
    pros: [
      "Excellent collaboration and sharing",
      "Templates and databases for power users",
      "Generous free tier for one person",
    ],
    cons: [
      "Block model means markdown export is lossy",
      "Editor is slower than OneNote",
      "AI is $10/mo on top of any paid plan",
    ],
    bestFor: "Teams who need wikis and shared docs alongside notes.",
  },
  {
    name: "Obsidian",
    pricing: "Free; Sync $4/mo",
    imageUrl: obsidianShot.url,
    imageAlt: "Obsidian landing page",
    siteUrl: "https://obsidian.md",
    tagline: "Local-first markdown with a backlinked graph.",
    description:
      "If you left OneNote because you didn't trust Microsoft with your notes, Obsidian is the answer. Notes are plain markdown files on disk, plugins extend everything, and there's no subscription unless you want sync. The cost is setup - Obsidian is a tool you have to build.",
    pros: [
      "Notes are plain markdown files you own",
      "Massive plugin ecosystem",
      "Local-first; works fully offline",
    ],
    cons: [
      "Sync, mobile, and AI all require setup or paid add-ons",
      "No collaboration",
      "Steep learning curve",
    ],
    bestFor: "Tinkerers who want full control over where their notes live.",
  },
  {
    name: "Evernote",
    pricing: "Free (limited); Personal $14.99/mo",
    imageUrl: evernoteShot.url,
    imageAlt: "Evernote landing page",
    siteUrl: "https://evernote.com",
    tagline: "The original digital shoebox - now expensive.",
    description:
      "Evernote still does the notebook-tags-search model better than most. The catch is the gutted free tier (2 notebooks, 50 notes) and steady price climbs. If OneNote felt too freeform, Evernote's structure may be the upgrade you wanted.",
    pros: [
      "Best-in-class web clipper",
      "Mature search across years of notes",
      "Strong mobile capture",
    ],
    cons: [
      "Free tier is nearly unusable",
      "Editor feels stuck in 2015",
      "Yearly price hikes",
    ],
    bestFor: "People who want OneNote's organization but with a real web clipper.",
  },
  {
    name: "Reflect",
    pricing: "$10/mo",
    imageUrl: reflectShot.url,
    imageAlt: "Reflect landing page - a thinking tool",
    siteUrl: "https://reflect.app",
    tagline: "Daily notes plus backlinks, with AI built in.",
    description:
      "Reflect is for ex-OneNote users who want to think in their notes, not just store them. Daily notes, [[backlinks]], and first-class AI that summarizes and answers questions across your library. End-to-end encrypted, subscription only.",
    pros: [
      "AI features feel native, not bolted on",
      "End-to-end encrypted",
      "Fast, calm editor",
    ],
    cons: [
      "Subscription only - no free tier",
      "Daily-notes structure isn't for everyone",
    ],
    bestFor: "People who want a thinking layer on top of their notes.",
  },
  {
    name: "Mem",
    pricing: "Free; Mem+ $10/mo",
    imageUrl: memShot.url,
    imageAlt: "Mem landing page - self-organizing workspace for AI",
    siteUrl: "https://mem.ai",
    tagline: "AI-first capture that organizes itself.",
    description:
      "Mem replaces OneNote's freeform canvas with AI filing. Capture from anywhere and let the AI find it later through full-library search. The trade-off is less manual control over structure - you trust the AI to file things.",
    pros: [
      "Fast capture from anywhere",
      "AI search across your full notes library",
      "Almost zero setup to get started",
    ],
    cons: [
      "Limited manual organization",
      "Markdown export loses structure",
      "Smaller free tier than competitors",
    ],
    bestFor: "Ex-OneNote users who captured more than they organized and want AI to do the filing.",
  },
];

const faq = [
  {
    q: "Why look for a OneNote alternative in 2026?",
    a: "Three reasons come up most: the free-canvas layout encourages clutter that's hard to clean up, exporting your notes out of OneNote is essentially impossible, and the best AI features are gated behind a Microsoft 365 Copilot subscription. The picks on this list each fix one of those problems.",
  },
  {
    q: "Which OneNote alternative has the best free tier?",
    a: "Notebook Archive and Notion. Notebook Archive's free tier covers daily writing including sync and AI explain. Notion's free plan is generous for one person. Evernote, Reflect, and Mem don't have meaningful free tiers anymore.",
  },
  {
    q: "Can I import my OneNote notebooks into one of these?",
    a: "Yes, but expect some cleanup. Notion has an official OneNote importer. Obsidian and Notebook Archive accept the exported HTML or markdown that OneNote-to-markdown tools produce. Evernote can import OneNote via the official path. Stylus drawings rarely survive the move.",
  },
  {
    q: "Which OneNote alternative is best for students?",
    a: "Notebook Archive for typed notes and AI explain. Notion if you want wikis and tables alongside notes. Obsidian if you want plain markdown that lives on your laptop. None of these match OneNote's stylus support - keep OneNote if handwriting is core to how you study.",
  },
  {
    q: "Is there a OneNote alternative that keeps notes in plain text?",
    a: "Notebook Archive and Obsidian. Both export real markdown so your notes outlive whichever app you use. Notion, Mem, Evernote, and Reflect all store notes in proprietary formats - their exports are lossy.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "OneNote Alternatives in 2026 - Honest Comparison",
    description:
      "Six OneNote alternatives compared honestly: Notebook Archive, Notion, Obsidian, Evernote, Reflect, and Mem. Screenshots, pros and cons, and who each one is for.",
    datePublished: "2026-06-27",
    dateModified: "2026-06-28",
    author: { "@type": "Organization", name: "Notebook Archive" },
    publisher: { "@type": "Organization", name: "Notebook Archive" },
    mainEntityOfPage: "https://notebookarchive.lovable.app/blog/onenote-alternatives-2026",
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
  breadcrumbsJsonLd([
    { name: "Blog", path: "/blog" },
    { name: "OneNote Alternatives in 2026 - Honest Comparison", path: "/blog/onenote-alternatives-2026" },
  ])
];

export default function BlogOneNoteAlternatives() {
  useEffect(() => {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <>
      <SeoHead
        type="article"
        title="OneNote Alternatives in 2026 - 6 Honest Picks Compared"
        description="Six OneNote alternatives compared with screenshots, pros and cons, and pricing - Notion, Obsidian, Evernote, Reflect, Mem, and Notebook Archive."
        path="/blog/onenote-alternatives-2026" image="/og/og-onenote-alternatives-2026.jpg"
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
              OneNote Alternatives · Updated June 2026
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              Six Honest <span className="text-primary">OneNote Alternatives</span> for 2026
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              OneNote is free, generous, and great for stylus users. It's also a freeform
              canvas that gets messy fast, locks your notes inside a proprietary format, and
              gates the good AI behind Microsoft 365 Copilot. These are the six apps people
              actually move to.
            </p>
          </motion.header>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold mt-8 mb-4">How we picked</h2>
            <p className="text-muted-foreground leading-relaxed mb-12">
              We left out tools that don't actually replace OneNote (Trello, chat apps,
              read-it-later services). The shortlist had to do three things: hold a serious
              volume of notes, import what you already have, and let you take your data with
              you if you ever leave. Pricing is current as of June 2026.
            </p>

            <h2 className="font-serif text-2xl font-bold mb-6">The six picks</h2>
            <div className="space-y-8">
              {picks.map((p, i) => (
                <AppDetailCard key={p.name} index={i + 1} {...p} />
              ))}
            </div>

            <h2 className="font-serif text-2xl font-bold mt-16 mb-4">How to pick the right one</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li>• <strong>You want OneNote's structure without the freeform mess:</strong> Notebook Archive.</li>
              <li>• <strong>You need wikis and team docs alongside notes:</strong> Notion.</li>
              <li>• <strong>You want local-first markdown you own:</strong> Obsidian.</li>
              <li>• <strong>You want the original notebook-tags-search model:</strong> Evernote.</li>
              <li>• <strong>You want backlinks and AI built in:</strong> Reflect.</li>
              <li>• <strong>You captured more than you organized:</strong> Mem.</li>
            </ul>

            <h2 className="font-serif text-2xl font-bold mt-16 mb-6">Frequently asked</h2>
            <Accordion type="single" collapsible className="w-full">
              {faq.map((f, i) => (
                <AccordionItem key={f.q} value={`item-${i}`}>
                  <AccordionTrigger className="font-serif text-lg text-left">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          <div className="border-t border-border pt-10 mt-10 text-center">
            <p className="font-serif text-2xl font-bold mb-4">
              Structure without the mess
            </p>
            <p className="text-muted-foreground mb-6">
              Notebook Archive is free to start. Real markdown export. Sync that works. No Microsoft account required.
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
