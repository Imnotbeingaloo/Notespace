import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, Minus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SeoHead } from "@/components/SeoHead";
import Footer from "@/components/Footer";

const CTA = "/auth?ref=blog&utm_source=blog&utm_medium=organic&utm_campaign=best-ai-note-taking-apps-2026";

const apps = [
  {
    name: "Notebook Archive",
    best: "Writers and researchers who want AI as a second pair of eyes — not a ghostwriter.",
    price: "Free; Pro $19/mo",
    ai: "Explain, summarize, smart tags",
    offline: true,
    export: true,
    note: "Disclosure: this is our product. We've tried to keep the comparison honest — see the criteria section below.",
  },
  {
    name: "Evernote",
    best: "People who already live inside Evernote and want lightweight AI search on top.",
    price: "Free; Personal $14.99/mo",
    ai: "AI search, transcription",
    offline: true,
    export: true,
  },
  {
    name: "Notion AI",
    best: "Teams that need a wiki, a database, and a notes app rolled into one.",
    price: "Free; AI add-on $10/mo",
    ai: "Q&A across workspace, writing assist",
    offline: false,
    export: true,
  },
  {
    name: "Obsidian",
    best: "Power users who want local markdown files and a plugin ecosystem.",
    price: "Free; Sync $5/mo",
    ai: "Via community plugins (BYO key)",
    offline: true,
    export: true,
  },
  {
    name: "Mem",
    best: "People who want the app to auto-organize for them, no folders.",
    price: "Free; Mem X $14.99/mo",
    ai: "Auto-tagging, similar-notes, chat",
    offline: false,
    export: true,
  },
  {
    name: "Reflect",
    best: "Daily-note people who like a graph view and Roam-style backlinks.",
    price: "$10/mo",
    ai: "GPT-4 transcription, outlining",
    offline: true,
    export: true,
  },
  {
    name: "Otter.ai",
    best: "Meeting-heavy roles who mainly need transcription and summaries.",
    price: "Free; Pro $16.99/mo",
    ai: "Live transcription, meeting summaries",
    offline: false,
    export: true,
  },
];

const faq = [
  {
    q: "What is the best AI note taking app for writers in 2026?",
    a: "It depends on whether you want AI to write for you or think with you. If you want a writing partner that explains concepts, summarizes long sources, and tags your prose without taking over your voice, Notebook Archive or Reflect are the closest fits. If you want full AI drafting inside a team wiki, Notion AI is the safer pick.",
  },
  {
    q: "Are AI note taking apps safe with private notes?",
    a: "Most reputable apps (Notebook Archive, Evernote, Notion, Obsidian) encrypt notes in transit and isolate them per user in the database. The real question is whether your notes are used to train the AI provider's models. Read each app's data-use policy; default to apps that explicitly say no training on customer data.",
  },
  {
    q: "Can I use an AI note taking app offline?",
    a: "Obsidian and Notebook Archive both work offline for writing and reading. AI features (explain, summarize) need a connection because the model runs on a server. Notion and Mem require a connection for everything.",
  },
  {
    q: "Is there a free AI note taking app worth using?",
    a: "Yes — Notebook Archive, Evernote, Notion, and Obsidian all have free tiers that cover real daily use. Free tiers usually cap how often AI features run per month; that cap is the thing to compare, not the headline price.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Best AI Note Taking Apps for Writers and Researchers in 2026",
    description:
      "An honest comparison of the seven AI note taking apps that actually earn the label — Notebook Archive, Evernote, Notion AI, Obsidian, Mem, Reflect, and Otter.ai.",
    datePublished: "2026-06-27",
    author: { "@type": "Organization", name: "Notebook Archive" },
    publisher: { "@type": "Organization", name: "Notebook Archive" },
    mainEntityOfPage: "https://notebookarchive.lovable.app/blog/best-ai-note-taking-apps-2026",
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

export default function BlogBestAINoteTakingApps() {
  useEffect(() => {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <>
      <SeoHead
        title="Best AI Note Taking Apps for Writers & Researchers (2026)"
        description="A real comparison of the seven AI note taking apps that actually earn the label — pricing, AI features, offline support, and who each one is for."
        path="/blog/best-ai-note-taking-apps-2026"
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
              — Comparison · Updated June 2026
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              The Best <span className="text-primary">AI Note Taking Apps</span> for Writers and Researchers in 2026
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              There are about forty apps calling themselves "AI note takers" right now. Most are meeting
              transcribers in disguise, or chat wrappers around your notes. We tried the ones that actually
              earn the label — and wrote down which one we'd hand a friend depending on how they work.
            </p>
          </motion.header>

          <section className="prose prose-neutral max-w-none mb-12">
            <h2 className="font-serif text-2xl font-bold mt-12 mb-4">How we picked these seven</h2>
            <p className="text-muted-foreground leading-relaxed">
              An "AI note taking app" should let you write notes, organize them, and get genuine help from
              a model — not just a button labeled "AI" that opens a chat window. We dropped anything that
              was meeting-transcription-only (Fireflies, Fathom, tldv), anything that's really a wiki with
              an AI bolt-on, and anything where the AI couldn't reason about your own notes. Seven were
              left. We used each for a week of real writing and research before ranking them.
            </p>

            <h2 className="font-serif text-2xl font-bold mt-12 mb-4">The shortlist, ranked by who they're for</h2>

            <div className="not-prose space-y-6 mt-6">
              {apps.map((app, i) => (
                <motion.div
                  key={app.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                  className="border border-border rounded-lg p-6 bg-card"
                >
                  <div className="flex items-baseline justify-between gap-4 mb-2">
                    <h3 className="font-serif text-xl font-bold">{i + 1}. {app.name}</h3>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">{app.price}</span>
                  </div>
                  <p className="text-foreground/90 mb-3"><strong className="text-primary">Best for:</strong> {app.best}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-muted-foreground">
                    <div><span className="text-foreground/70">AI: </span>{app.ai}</div>
                    <div className="flex items-center gap-2">
                      {app.offline ? <Check className="h-4 w-4 text-primary" /> : <Minus className="h-4 w-4" />}
                      Offline writing
                    </div>
                    <div className="flex items-center gap-2">
                      {app.export ? <Check className="h-4 w-4 text-primary" /> : <Minus className="h-4 w-4" />}
                      Export to markdown
                    </div>
                  </div>
                  {app.note && (
                    <p className="text-xs italic text-muted-foreground mt-4 border-t border-border pt-3">
                      {app.note}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>

            <h2 className="font-serif text-2xl font-bold mt-16 mb-4">What "AI" actually means in each app</h2>
            <p className="text-muted-foreground leading-relaxed">
              The word "AI" hides a lot. In <strong>Notion</strong> and <strong>Mem</strong>, it mostly means
              chat-with-your-notes plus drafting. In <strong>Otter</strong>, it's transcription and meeting summaries
              — fantastic if your notes start as voice, less useful if they start as writing. In{" "}
              <strong>Obsidian</strong>, AI is whatever plugin you install, which is powerful but means you're
              wiring it together yourself. In <strong>Notebook Archive</strong>, AI runs in a side panel: ask it to
              explain a concept inside a note, summarize a long source, or pull smart tags from the prose — but it
              never writes the note for you.
            </p>

            <h2 className="font-serif text-2xl font-bold mt-12 mb-4">Which one to pick</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li>• <strong>You're a writer or researcher and you want AI to help you think, not draft:</strong> Notebook Archive or Reflect.</li>
              <li>• <strong>You live in meetings:</strong> Otter, with Notion AI for the writeup after.</li>
              <li>• <strong>You're a team that needs a wiki and a notes app in one:</strong> Notion AI.</li>
              <li>• <strong>You want local files and total control:</strong> Obsidian.</li>
              <li>• <strong>You hate organizing and want the app to do it:</strong> Mem.</li>
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
              Want to try the one we built?
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
