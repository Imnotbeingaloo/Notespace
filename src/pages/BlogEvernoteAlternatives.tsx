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
import onenoteShot from "@/assets/blog/onenote.png.asset.json";
import reflectShot from "@/assets/blog/reflect.png.asset.json";
import memShot from "@/assets/blog/mem.png.asset.json";

const REF = "blog-evernote-alt";
const CTA = `/auth?ref=${REF}&utm_source=blog&utm_medium=organic&utm_campaign=evernote-alternatives`;

const picks = [
  {
    name: "Notebook Archive",
    pricing: "Free; Pro $19/mo",
    imageUrl: naShot.url,
    imageAlt: "Notebook Archive - a quiet markdown notebook with an AI explain panel",
    siteUrl: "https://notebookarchive.lovable.app",
    tagline: "Evernote's organization - without the bloat or the price hikes.",
    description:
      "A serif markdown editor with notebooks, nesting, global tags, AI explain, and plain-text export. The shoebox metaphor Evernote pioneered - without the dated editor, the gutted free tier, or the steady price creep.",
    pros: [
      "Free tier is genuinely usable - no 2-notebook cap",
      "Markdown export means your notes outlive the app",
      "AI explain panel summarizes sources without rewriting your notes",
      "Sync, search, and tags work across devices on free",
    ],
    cons: [
      "No web clipper extension yet",
      "No native OCR for scanned receipts",
    ],
    bestFor: "Evernote users who want the organization and search but a calmer, modern editor.",
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
      "Notion is the obvious mainstream alternative for ex-Evernote users who want more structure. The trade-off is that it stores notes in proprietary blocks, the editor is slower than Evernote, and AI is a paid add-on on top of the base plan.",
    pros: [
      "Excellent collaboration and sharing",
      "Templates and databases for power users",
      "Generous free tier for one person",
    ],
    cons: [
      "Block model means markdown export is lossy",
      "Editor is slower to type in than Evernote was",
      "AI is $10/mo on top of any paid plan",
    ],
    bestFor: "People who want their notes to live alongside docs, projects, and wikis.",
  },
  {
    name: "Obsidian",
    pricing: "Free; Sync $4/mo",
    imageUrl: obsidianShot.url,
    imageAlt: "Obsidian landing page",
    siteUrl: "https://obsidian.md",
    tagline: "Local-first markdown with a backlinked graph.",
    description:
      "If you left Evernote because you didn't trust the cloud, Obsidian is the answer. Notes are plain markdown files on your disk, plugins extend everything, and there's no subscription unless you want sync. The cost is setup - Obsidian is a tool you have to build.",
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
    bestFor: "Tinkerers who want full control and don't mind configuring before they can write.",
  },
  {
    name: "Microsoft OneNote",
    pricing: "Free with a Microsoft account",
    imageUrl: onenoteShot.url,
    imageAlt: "Microsoft OneNote landing page",
    siteUrl: "https://www.onenote.com",
    tagline: "Free, infinite-canvas notebooks from Microsoft.",
    description:
      "If you mostly want a free, generous container for notes and you're already in Microsoft 365, OneNote is hard to beat on price. Excellent stylus support and no real limits on the free plan - but the free-canvas layout can get messy fast.",
    pros: [
      "Genuinely free with no real limits",
      "Best-in-class handwriting and stylus support",
      "Tight integration with Outlook, Teams, and Word",
    ],
    cons: [
      "Free-canvas layout encourages clutter",
      "Markdown export is essentially impossible",
      "AI features are tied to Microsoft 365 Copilot",
    ],
    bestFor: "Windows users and students already inside Microsoft 365.",
  },
  {
    name: "Reflect",
    pricing: "$10/mo",
    imageUrl: reflectShot.url,
    imageAlt: "Reflect landing page - a thinking tool",
    siteUrl: "https://reflect.app",
    tagline: "Daily notes plus backlinks, with AI built in.",
    description:
      "Reflect is for ex-Evernote users who want to think in their notes, not just store them. Daily notes, [[backlinks]], and first-class AI that summarizes and answers questions across your library. End-to-end encrypted, subscription only.",
    pros: [
      "AI features feel native, not bolted on",
      "End-to-end encrypted",
      "Fast, calm editor",
    ],
    cons: [
      "Subscription only - no free tier",
      "Daily-notes structure isn't for everyone",
    ],
    bestFor: "People who want Evernote's permanence with a thinking layer on top.",
  },
  {
    name: "Mem",
    pricing: "Free; Mem+ $10/mo",
    imageUrl: memShot.url,
    imageAlt: "Mem landing page - self-organizing workspace for AI",
    siteUrl: "https://mem.ai",
    tagline: "AI-first capture that organizes itself.",
    description:
      "Mem is the closest spiritual successor to Evernote's capture-first model. Fast capture from anywhere, AI search across your full library, and almost zero setup. The trade-off is less manual control over structure - you mostly trust the AI to file things.",
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
    bestFor: "Ex-Evernote users who captured more than they wrote and want AI to do the filing.",
  },
];

const faq = [
  {
    q: "Why are people leaving Evernote in 2026?",
    a: "Three reasons keep coming up: the free tier was gutted to 2 notebooks and 50 notes, pricing has climbed past $14.99/mo for a single person, and the editor feels stuck in 2015. The alternatives on this list either fix one of those problems or trade them for something more valuable.",
  },
  {
    q: "Which Evernote alternative has the best free tier?",
    a: "Notebook Archive and OneNote. Notebook Archive's free tier covers daily writing including sync and AI explain. OneNote is genuinely free with a Microsoft account and has no real caps. Notion's free plan is fine for one person. Reflect and Mem don't have meaningful free tiers.",
  },
  {
    q: "Can I import my Evernote notebooks into one of these?",
    a: "Yes. Notion, Obsidian, and Notebook Archive all accept Evernote's .enex exports. Notion's importer keeps the most structure intact. Obsidian flattens to markdown files. Notebook Archive converts notebooks and tags directly. OneNote has an official Evernote importer too.",
  },
  {
    q: "Which Evernote alternative is best for capture?",
    a: "Mem, hands down - its mobile capture and AI filing are the closest to what Evernote pioneered. OneNote is a close second if you use a stylus. For text-first writers, Notebook Archive's quick-capture flow plus tags covers most Evernote workflows.",
  },
  {
    q: "Is there an Evernote alternative that keeps notes in plain text?",
    a: "Notebook Archive and Obsidian. Both let you export real markdown so your notes outlive whichever app you use. Notion, Mem, OneNote, and Reflect all store notes in proprietary formats - their exports are lossy.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Evernote Alternatives in 2026 - Honest Comparison",
    description:
      "Six Evernote alternatives compared honestly: Notebook Archive, Notion, Obsidian, OneNote, Reflect, and Mem. Screenshots, pros and cons, and who each one is for.",
    datePublished: "2026-06-27",
    dateModified: "2026-06-28",
    author: { "@type": "Organization", name: "Notebook Archive" },
    publisher: { "@type": "Organization", name: "Notebook Archive" },
    mainEntityOfPage: "https://notebookarchive.lovable.app/blog/evernote-alternatives-2026",
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
    { name: "Evernote Alternatives in 2026 - Honest Comparison", path: "/blog/evernote-alternatives-2026" },
  ])
];

export default function BlogEvernoteAlternatives() {
  useEffect(() => {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <>
      <SeoHead
        type="article"
        title="Evernote Alternatives in 2026 - 6 Honest Picks Compared"
        description="Six Evernote alternatives compared with screenshots, pros and cons, and pricing - Notion, Obsidian, OneNote, Reflect, Mem, and Notebook Archive."
        path="/blog/evernote-alternatives-2026" image="/og/og-evernote-alternatives-2026.jpg"
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
              - Evernote Alternatives · Updated June 2026
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              Six Honest <span className="text-primary">Evernote Alternatives</span> for 2026
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Evernote pioneered the digital shoebox. Then the free tier shrank, the editor
              stayed in 2015, and the price kept climbing. These are the six apps people
              actually move to - what each does well, where it falls short, and who it's for.
            </p>
          </motion.header>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold mt-8 mb-4">How we picked</h2>
            <p className="text-muted-foreground leading-relaxed mb-12">
              We left out tools that don't actually replace Evernote (Trello, chat apps,
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
              <li>• <strong>You want Evernote's organization without the bloat:</strong> Notebook Archive.</li>
              <li>• <strong>You need wikis and docs alongside notes:</strong> Notion.</li>
              <li>• <strong>You want local-first markdown you own:</strong> Obsidian.</li>
              <li>• <strong>You're already in Microsoft 365:</strong> OneNote.</li>
              <li>• <strong>You want backlinks and AI built in:</strong> Reflect.</li>
              <li>• <strong>You captured more than you wrote:</strong> Mem.</li>
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
              The calm alternative
            </p>
            <p className="text-muted-foreground mb-6">
              Notebook Archive is free to start. Real markdown export. Sync that works. No price hikes.
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
