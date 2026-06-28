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
import otterShot from "@/assets/blog/otter.png.asset.json";
import notionShot from "@/assets/blog/notion.png.asset.json";
import obsidianShot from "@/assets/blog/obsidian.png.asset.json";
import memShot from "@/assets/blog/mem.png.asset.json";

const REF = "blog-ai-voice-notes";
const CTA = `/auth?ref=${REF}&utm_source=blog&utm_medium=organic&utm_campaign=ai-voice-notes`;

const picks = [
  {
    name: "Notebook Archive",
    pricing: "Free; Pro $19/mo",
    imageUrl: naShot.url,
    imageAlt: "Notebook Archive - a quiet markdown notebook with built-in AI",
    siteUrl: "https://notebookarchive.lovable.app",
    tagline: "Voice in, organized markdown out - without the meeting-bot vibe.",
    description:
      "Dictate or paste a transcript and Notebook Archive turns it into clean, structured markdown inside a real notebook. The AI explain panel summarizes long transcripts into headings and bullets without rewriting your voice. No meeting bots joining calls uninvited.",
    pros: [
      "Voice-to-text inside the editor, then real markdown structure on top",
      "AI explain panel summarizes transcripts into headings and bullets",
      "Notes live in notebooks with tags and search - not a transcript dump",
      "Markdown export so transcripts outlive the app",
    ],
    cons: [
      "No automatic meeting-bot that joins Zoom/Meet calls",
      "Speaker diarization is basic compared to Otter",
    ],
    bestFor: "Writers, researchers, and students who want voice as an input - not a separate transcript app.",
    disclosure: "Disclosure: this is the product we make. Selection criteria are listed up top.",
  },
  {
    name: "Otter.ai",
    pricing: "Free 300 min/mo; Pro $16.99/mo",
    imageUrl: otterShot.url,
    imageAlt: "Otter.ai meeting transcription dashboard",
    siteUrl: "https://otter.ai",
    tagline: "The default for live meeting transcription.",
    description:
      "Otter joins your Zoom, Google Meet, and Teams calls and ships a searchable transcript with speaker labels and a short AI summary. It's the best-in-class for live meetings - but the output stays in Otter, not in your note system.",
    pros: [
      "Live transcription with strong speaker diarization",
      "OtterPilot joins meetings automatically",
      "Decent AI summaries and action item extraction",
    ],
    cons: [
      "Notes are stuck inside Otter - exports are awkward",
      "Free tier capped at 300 minutes/month",
      "Meeting bot joining calls can feel intrusive to other attendees",
    ],
    bestFor: "Sales, customer success, and recruiters who live in back-to-back calls.",
  },
  {
    name: "Notion AI",
    pricing: "Free; AI add-on $10/mo",
    imageUrl: notionShot.url,
    imageAlt: "Notion AI page",
    siteUrl: "https://www.notion.so/product/ai",
    tagline: "Voice notes inside a wiki, with AI that rewrites them.",
    description:
      "Notion's mobile app records audio and transcribes it into a page. Notion AI then summarizes or rewrites the transcript inside the same doc. Great if your whole team already lives in Notion - less great as a focused voice-notes tool.",
    pros: [
      "Voice capture + AI summary in one place",
      "Shared workspace for team-wide voice notes",
    ],
    cons: [
      "Editor is slower than dedicated note apps",
      "AI add-on is a separate paid line item",
    ],
    bestFor: "Teams already on Notion who want voice as one more capture method.",
  },
  {
    name: "Obsidian + Whisper plugin",
    pricing: "Free; community plugin",
    imageUrl: obsidianShot.url,
    imageAlt: "Obsidian editor with a plugin sidebar",
    siteUrl: "https://obsidian.md",
    tagline: "Local-first voice notes, if you're willing to assemble the stack.",
    description:
      "Run Whisper locally or via API through a community plugin, and Obsidian becomes a private voice-notes setup. Transcripts stay on your machine. Setup time is real, and AI summarization needs another plugin on top.",
    pros: [
      "Local-first - voice data never leaves your device if you run Whisper locally",
      "Free, scriptable, plugin-extensible",
      "Markdown forever - your transcripts are portable",
    ],
    cons: [
      "Plugin assembly and config required",
      "No native mobile recording UX",
    ],
    bestFor: "Privacy-first power users who want to own their stack.",
  },
  {
    name: "Mem",
    pricing: "Free; Mem X $14.99/mo",
    imageUrl: memShot.url,
    imageAlt: "Mem note feed with AI",
    siteUrl: "https://mem.ai",
    tagline: "Capture-first voice notes that the AI organizes for you.",
    description:
      "Mem encourages a stream of quick captures - including voice - and uses AI to auto-tag and connect them. It's the right shape if your problem is 'I record a lot and never organize anything'.",
    pros: [
      "Frictionless mobile capture, including voice",
      "AI auto-organizes and links related notes",
    ],
    cons: [
      "Light on heavy editing and structured docs",
      "Less suitable for long-form transcripts",
    ],
    bestFor: "People who capture far more voice memos than they ever turn into structured notes.",
  },
];

const faq = [
  {
    q: "What is the best AI voice note taking app in 2026?",
    a: "It depends on whether you want a transcript or a finished note. For polished, organized markdown notes from your voice, Notebook Archive is the cleanest pick. For raw, accurate meeting transcripts with speaker labels, Otter.ai is still the default.",
  },
  {
    q: "Are AI meeting transcription apps accurate enough to rely on?",
    a: "For clear English audio with good microphones, Whisper-based and Otter transcripts are 90%+ accurate. Heavy accents, overlapping speakers, and bad audio still produce errors - always skim the transcript before sharing it as source-of-truth.",
  },
  {
    q: "Is it legal to record meetings with an AI note taker?",
    a: "It varies by jurisdiction. Most US states are one-party consent; the EU and California require all parties to consent. Always announce the bot is recording, and check your company's policy before using OtterPilot or similar in client meetings.",
  },
  {
    q: "Can I get voice transcription without a meeting bot joining my calls?",
    a: "Yes. Notebook Archive, Notion, and Obsidian let you dictate or upload audio without a bot ever joining the meeting. If you'd rather not have a stranger in your Zoom, dictate the highlights after the call instead.",
  },
  {
    q: "What's the cheapest way to get AI voice notes?",
    a: "Self-hosting OpenAI Whisper is free if you have the technical chops. Otherwise, Notebook Archive's free tier handles voice input + AI explain without a paid add-on, and Mem's free tier covers basic capture.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Best AI Voice Note Taking and Meeting Transcription Apps in 2026",
    description:
      "Five honest picks for AI voice notes and meeting transcription - Notebook Archive, Otter.ai, Notion AI, Obsidian + Whisper, and Mem.",
    datePublished: "2026-06-27",
    dateModified: "2026-06-28",
    author: { "@type": "Organization", name: "Notebook Archive" },
    publisher: { "@type": "Organization", name: "Notebook Archive" },
    mainEntityOfPage: "https://notebookarchive.lovable.app/blog/ai-voice-notes-meeting-transcription",
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
    { name: "Best AI Voice Note Taking and Meeting Transcription Apps in 2026", path: "/blog/ai-voice-notes-meeting-transcription" },
  ])
];

export default function BlogAIVoiceNotes() {
  useEffect(() => {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <>
      <SeoHead
        type="article"
        title="Best AI Voice Note Taking & Meeting Transcription Apps (2026)"
        description="Five honest picks for AI voice notes and meeting transcription - Notebook Archive, Otter.ai, Notion AI, Obsidian + Whisper, and Mem. With pricing, pros and cons."
        path="/blog/ai-voice-notes-meeting-transcription" image="/og/og-ai-voice-notes-meeting-transcription.jpg"
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
              - AI Voice Notes · Updated June 2026
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              The Best <span className="text-primary">AI Voice Note Taking</span> Apps in 2026
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Voice-to-text has finally crossed the line from "novelty" to "real input method".
              These are the five apps that turn your voice into something you'll actually re-read -
              from full meeting transcripts to quick dictated thoughts.
            </p>
          </motion.header>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold mt-8 mb-4">How we picked</h2>
            <p className="text-muted-foreground leading-relaxed mb-12">
              Two questions: does the transcript end up somewhere you'll re-read it, and does the
              AI summarize without rewriting your voice? Pricing is current as of June 2026.
            </p>

            <h2 className="font-serif text-2xl font-bold mb-6">The five picks</h2>
            <div className="space-y-8">
              {picks.map((p, i) => (
                <AppDetailCard key={p.name} index={i + 1} {...p} />
              ))}
            </div>

            <h2 className="font-serif text-2xl font-bold mt-16 mb-4">How to pick the right one</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li>• <strong>You want voice in, finished notes out:</strong> Notebook Archive.</li>
              <li>• <strong>You live in back-to-back meetings:</strong> Otter.ai.</li>
              <li>• <strong>Your team's already on Notion:</strong> Notion AI.</li>
              <li>• <strong>You want local-first privacy:</strong> Obsidian + Whisper.</li>
              <li>• <strong>You capture more than you organize:</strong> Mem.</li>
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
              Voice in. Real notes out.
            </p>
            <p className="text-muted-foreground mb-6">
              Notebook Archive turns dictation and transcripts into clean, organized markdown - free to start, no meeting bot required.
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
