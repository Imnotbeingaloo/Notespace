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
import Footer from "@/components/Footer";
import { AppDetailCard } from "@/components/blog/AppDetailCard";

import naShot from "@/assets/blog/notebook-archive.png.asset.json";
import notionShot from "@/assets/blog/notion.png.asset.json";
import obsidianShot from "@/assets/blog/obsidian.png.asset.json";
import evernoteShot from "@/assets/blog/evernote.png.asset.json";
import onenoteShot from "@/assets/blog/onenote.png.asset.json";
import reflectShot from "@/assets/blog/reflect.png.asset.json";
import memShot from "@/assets/blog/mem.png.asset.json";

const REF = "blog-best-note-taking-app";
const CTA = `/auth?ref=${REF}&utm_source=blog&utm_medium=organic&utm_campaign=best-note-taking-app-2026`;

const picks = [
  {
    name: "Notebook Archive",
    pricing: "Free; Pro $19/mo",
    imageUrl: naShot.url,
    imageAlt: "Notebook Archive - a quiet markdown notebook with an AI explain panel",
    siteUrl: "https://notebookarchive.lovable.app",
    tagline: "A calm, serif markdown notebook with AI that explains instead of writing for you.",
    description:
      "Notebook Archive is the note app for people who actually write. Notebooks, nesting, global tags, and an AI explain panel that summarizes your sources without rewriting your notes. Real markdown export so your work outlives the app.",
    pros: [
      "Serif editor that's pleasant for long-form writing",
      "AI explain panel - no autowriting your essay for you",
      "Markdown export means your notes are portable",
      "Free tier covers daily writing, sync, and AI",
    ],
    cons: [
      "No web clipper extension yet",
      "No stylus or handwriting input",
    ],
    bestFor: "Writers, researchers, and students who want quiet structure and AI that respects their voice.",
    disclosure: "Disclosure: this is the product we make. Selection criteria are listed up top.",
  },
  {
    name: "Notion",
    pricing: "Free; Plus $10/mo",
    imageUrl: notionShot.url,
    imageAlt: "Notion landing page",
    siteUrl: "https://www.notion.so",
    tagline: "The everything-app - wikis, databases, docs, and notes in one place.",
    description:
      "Notion is the default mainstream pick. Excellent for teams who need wikis and docs alongside notes. The downsides are a slower block-based editor, lossy markdown export, and AI as a paid add-on on top of any paid plan.",
    pros: [
      "Best-in-class collaboration and sharing",
      "Templates and databases for power users",
      "Generous free tier for one person",
    ],
    cons: [
      "Block model makes markdown export lossy",
      "Editor is slower than dedicated note apps",
      "AI is $10/mo extra",
    ],
    bestFor: "Teams who want notes, wikis, and project docs in one workspace.",
  },
  {
    name: "Obsidian",
    pricing: "Free; Sync $4/mo",
    imageUrl: obsidianShot.url,
    imageAlt: "Obsidian landing page",
    siteUrl: "https://obsidian.md",
    tagline: "Local-first markdown with a backlinked graph and infinite plugins.",
    description:
      "If you want full control over where your notes live, Obsidian is unmatched. Plain markdown files on your disk, no subscription required, and a plugin for nearly everything. The trade-off is that it's a tool you have to build before you can write.",
    pros: [
      "Notes are plain markdown files you own",
      "Massive plugin ecosystem",
      "Local-first; works fully offline",
    ],
    cons: [
      "Sync, mobile, and AI all require setup or paid add-ons",
      "No real-time collaboration",
      "Steep learning curve",
    ],
    bestFor: "Tinkerers who want full ownership and don't mind configuring before writing.",
  },
  {
    name: "Evernote",
    pricing: "Free (limited); Personal $14.99/mo",
    imageUrl: evernoteShot.url,
    imageAlt: "Evernote landing page",
    siteUrl: "https://evernote.com",
    tagline: "The original digital shoebox - still strong on capture, weak on price.",
    description:
      "Evernote pioneered the notebook-tags-search model. The web clipper and mobile capture are still excellent. The catch: a gutted free tier (2 notebooks, 50 notes) and steady price climbs that have pushed most longtime users to look elsewhere.",
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
    bestFor: "Heavy clippers who want the cleanest web-to-notes workflow.",
  },
  {
    name: "Microsoft OneNote",
    pricing: "Free with a Microsoft account",
    imageUrl: onenoteShot.url,
    imageAlt: "Microsoft OneNote landing page",
    siteUrl: "https://www.onenote.com",
    tagline: "Free, infinite-canvas notebooks - the king of stylus input.",
    description:
      "If you're already inside Microsoft 365 and you use a stylus, OneNote is hard to beat on price. Genuinely free with no real caps. The free-canvas layout encourages clutter, and markdown export is essentially impossible.",
    pros: [
      "Free with no meaningful limits",
      "Best-in-class handwriting and stylus support",
      "Tight integration with Outlook, Teams, and Word",
    ],
    cons: [
      "Free-canvas layout gets messy fast",
      "Markdown export is essentially impossible",
      "Good AI is gated behind Microsoft 365 Copilot",
    ],
    bestFor: "Windows and iPad users who handwrite notes more than they type them.",
  },
  {
    name: "Reflect",
    pricing: "$10/mo",
    imageUrl: reflectShot.url,
    imageAlt: "Reflect landing page - a thinking tool",
    siteUrl: "https://reflect.app",
    tagline: "Daily notes plus backlinks, with AI built in.",
    description:
      "Reflect is for people who want to think in their notes, not just store them. Daily notes, [[backlinks]], and AI that summarizes and answers questions across your whole library. End-to-end encrypted. Subscription only.",
    pros: [
      "AI features feel native, not bolted on",
      "End-to-end encrypted",
      "Fast, calm editor",
    ],
    cons: [
      "Subscription only - no free tier",
      "Daily-notes structure isn't for everyone",
    ],
    bestFor: "Writers and thinkers who keep a daily journal and want a thinking layer on top.",
  },
  {
    name: "Mem",
    pricing: "Free; Mem+ $10/mo",
    imageUrl: memShot.url,
    imageAlt: "Mem landing page - self-organizing workspace for AI",
    siteUrl: "https://mem.ai",
    tagline: "AI-first capture that organizes itself.",
    description:
      "Mem is built around the idea that AI should do the filing. Capture from anywhere, search across your whole library with AI, and skip the manual organization step. Trade-off: less control over structure, lossy export.",
    pros: [
      "Fast capture from anywhere",
      "AI search across your full library",
      "Almost zero setup",
    ],
    cons: [
      "Limited manual organization",
      "Markdown export loses structure",
      "Smaller free tier than competitors",
    ],
    bestFor: "Capture-heavy people who want AI to do the filing.",
  },
];

const faq = [
  {
    q: "What's the best note taking app overall in 2026?",
    a: "There isn't one - there's a best one for how you work. For writers and students who want quiet structure and honest AI, Notebook Archive. For teams who need wikis, Notion. For tinkerers who want full ownership, Obsidian. For stylus users in Microsoft 365, OneNote. The picks above each list who they're actually best for.",
  },
  {
    q: "What's the best free note taking app?",
    a: "OneNote is the most generous free plan if you're on Windows. Notebook Archive's free tier is the best for typing - it includes sync, tags, and AI explain. Notion's free plan is fine for one person. Evernote, Reflect, and Mem don't have meaningful free tiers anymore.",
  },
  {
    q: "What's the best note taking app for students?",
    a: "Notebook Archive for typed notes plus AI that explains rather than autowrites. OneNote if you take handwritten notes on an iPad or Surface. Notion if you want to keep class notes, assignments, and group docs together. Full breakdown on our students post.",
  },
  {
    q: "What's the best AI note taking app?",
    a: "It depends on what 'AI' means to you. Notebook Archive's AI explains your sources without rewriting your notes. Notion AI generates content. Reflect summarizes and questions across your library. Mem auto-organizes. We compared all of them in detail on the AI note taking apps post.",
  },
  {
    q: "Which note taking app lets me actually own my notes?",
    a: "Notebook Archive and Obsidian. Both export real markdown, so your notes outlive whichever app you use. Notion, Mem, OneNote, Reflect, and Evernote all store notes in proprietary formats - their exports are lossy.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "The Best Note Taking Apps in 2026 - Honest Comparison",
    description:
      "Seven note taking apps compared honestly: Notebook Archive, Notion, Obsidian, Evernote, OneNote, Reflect, and Mem. Screenshots, pros and cons, and who each one is for.",
    datePublished: "2026-06-27",
    author: { "@type": "Organization", name: "Notebook Archive" },
    publisher: { "@type": "Organization", name: "Notebook Archive" },
    mainEntityOfPage: "https://notebookarchive.lovable.app/blog/best-note-taking-app-2026",
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

const deepDives = [
  { to: "/blog/notion-alternatives-2026", title: "Notion alternatives, compared" },
  { to: "/blog/obsidian-alternatives-2026", title: "Obsidian alternatives, compared" },
  { to: "/blog/evernote-alternatives-2026", title: "Evernote alternatives, compared" },
  { to: "/blog/onenote-alternatives-2026", title: "OneNote alternatives, compared" },
  { to: "/blog/best-ai-note-taking-apps-2026", title: "Best AI note taking apps" },
  { to: "/blog/best-note-taking-app-for-writers", title: "Best note taking app for writers" },
  { to: "/blog/ai-note-taking-app-for-students", title: "Best AI note taking app for students" },
];

export default function BlogBestNoteTakingApp() {
  useEffect(() => {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <>
      <SeoHead
        type="article"
        title="The Best Note Taking App in 2026 - 7 Honest Picks Compared"
        description="The seven best note taking apps in 2026, compared honestly - Notebook Archive, Notion, Obsidian, Evernote, OneNote, Reflect, and Mem. Screenshots, pros and cons, pricing."
        path="/blog/best-note-taking-app-2026"
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
              - Best Note Taking App · Updated June 2026
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              The Best <span className="text-primary">Note Taking App</span> in 2026
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Every "best note app" list says the same five names and never tells you who
              they're actually for. This one does. Seven apps, screenshots, honest pros and
              cons, and a clear pick for each kind of person.
            </p>
          </motion.header>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold mt-8 mb-4">How we picked</h2>
            <p className="text-muted-foreground leading-relaxed mb-12">
              We left out tools that aren't really note apps (Trello, chat tools,
              read-it-later services). The shortlist had to do three things: hold a serious
              volume of notes, work on mobile and desktop, and let you take your data with
              you if you ever leave. Pricing is current as of June 2026.
            </p>

            <h2 className="font-serif text-2xl font-bold mb-6">The seven picks</h2>
            <div className="space-y-8">
              {picks.map((p, i) => (
                <AppDetailCard key={p.name} index={i + 1} {...p} />
              ))}
            </div>

            <h2 className="font-serif text-2xl font-bold mt-16 mb-4">How to pick the right one</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li>• <strong>You write long-form and want AI that respects your voice:</strong> Notebook Archive.</li>
              <li>• <strong>You need wikis and team docs alongside notes:</strong> Notion.</li>
              <li>• <strong>You want local-first markdown you own:</strong> Obsidian.</li>
              <li>• <strong>You clip the web constantly:</strong> Evernote.</li>
              <li>• <strong>You handwrite on an iPad or Surface:</strong> OneNote.</li>
              <li>• <strong>You want backlinks and AI built in:</strong> Reflect.</li>
              <li>• <strong>You capture more than you organize:</strong> Mem.</li>
            </ul>

            <h2 className="font-serif text-2xl font-bold mt-16 mb-4">Go deeper</h2>
            <p className="text-muted-foreground mb-6">
              If one of the picks above stood out, we have a dedicated post on each:
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {deepDives.map((d) => (
                <Link
                  key={d.to}
                  to={d.to}
                  className="block border border-border rounded-lg p-4 bg-card hover:border-primary/40 transition group"
                >
                  <span className="font-serif text-base group-hover:text-primary transition">
                    {d.title}
                  </span>
                  <ArrowRight className="inline h-4 w-4 ml-2 group-hover:translate-x-1 transition" />
                </Link>
              ))}
            </div>

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
              The calm pick
            </p>
            <p className="text-muted-foreground mb-6">
              Notebook Archive is free to start. Real markdown export. Sync that works. AI that explains, not autowrites.
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
