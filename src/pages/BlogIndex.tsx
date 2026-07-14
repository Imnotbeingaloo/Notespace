import { useEffect } from "react";
import { Link } from "react-router-dom";
import { prefetchOnHover } from "@/lib/prefetch-route";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Sparkles,
  Mic,
  Scale,
  PenLine,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SeoHead } from "@/components/SeoHead";
import { breadcrumbsJsonLd } from "@/lib/seo-breadcrumbs";

import Footer from "@/components/Footer";

const tagVisuals: Record<
  string,
  { gradient: string; Icon: typeof BookOpen; accent: string }
> = {
  Guides: {
    gradient: "from-amber-100 via-orange-50 to-rose-100",
    Icon: BookOpen,
    accent: "text-amber-700",
  },
  "For Students": {
    gradient: "from-sky-100 via-indigo-50 to-violet-100",
    Icon: GraduationCap,
    accent: "text-indigo-700",
  },
  "For Researchers": {
    gradient: "from-emerald-100 via-teal-50 to-cyan-100",
    Icon: Sparkles,
    accent: "text-emerald-700",
  },
  "For Writers": {
    gradient: "from-rose-100 via-pink-50 to-fuchsia-100",
    Icon: PenLine,
    accent: "text-rose-700",
  },
  "AI Writing": {
    gradient: "from-violet-100 via-fuchsia-50 to-pink-100",
    Icon: Sparkles,
    accent: "text-violet-700",
  },
  "AI Voice": {
    gradient: "from-cyan-100 via-sky-50 to-blue-100",
    Icon: Mic,
    accent: "text-cyan-700",
  },
  Comparison: {
    gradient: "from-stone-100 via-neutral-50 to-zinc-100",
    Icon: Scale,
    accent: "text-stone-700",
  },
};

function CardVisual({ tag, title }: { tag: string; title: string }) {
  const v = tagVisuals[tag] ?? tagVisuals.Guides;
  const { Icon, gradient, accent } = v;
  const initials = title
    .replace(/[^a-zA-Z ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return (
    <div
      className={`relative h-40 w-full overflow-hidden bg-gradient-to-br ${gradient}`}
      aria-hidden
    >
      {/* soft grid texture */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.18] mix-blend-multiply"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id={`g-${tag}`} width="22" height="22" patternUnits="userSpaceOnUse">
            <path d="M22 0H0V22" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#g-${tag})`} />
      </svg>
      {/* decorative blurred orb */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/40 blur-2xl" />
      <div className="absolute -left-8 -bottom-10 h-28 w-28 rounded-full bg-white/30 blur-2xl" />
      {/* big serif initials */}
      <span
        className={`absolute right-4 bottom-2 font-serif text-[5rem] leading-none font-bold ${accent} opacity-25 select-none`}
      >
        {initials}
      </span>
      {/* icon badge */}
      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-3 py-1.5 shadow-sm">
        <Icon className={`h-3.5 w-3.5 ${accent}`} />
        <span className={`text-[0.65rem] uppercase tracking-widest font-semibold ${accent}`}>
          {tag}
        </span>
      </div>
    </div>
  );
}

const posts = [
  {
    slug: "how-to-make-a-study-plan",
    title: "How to Make a Study Plan (With a Free Weekly Template)",
    excerpt:
      "A practical guide to building a weekly study plan and study schedule you'll actually follow - including a free copy-pasteable template.",
    date: "Jun 2026",
    tag: "Guides",
  },
  {
    slug: "how-to-make-a-study-plan-for-exams",
    title: "How to Make a Study Plan for Exams (Six-Week Template)",
    excerpt:
      "A six-week exam study plan template for finals, GCSEs, A-levels, MCAT, GRE, and LSAT - with a copy-pasteable schedule.",
    date: "Jun 2026",
    tag: "Guides",
  },
  {
    slug: "gcse-revision-guide-2026",
    title: "The 2026 GCSE Revision Guide - How to Revise for Every Subject",
    excerpt:
      "Subject-by-subject GCSE revision techniques, how many hours to do, and a free revision timetable you can copy in one click.",
    date: "Jun 2026",
    tag: "Guides",
  },
  {
    slug: "a-level-revision-guide-2026",
    title: "The 2026 A-Level Revision Guide - How to Revise for Every Subject",
    excerpt:
      "Subject-by-subject A-level revision techniques, pacing for the final 8 weeks, and a free A-level revision timetable template.",
    date: "Jun 2026",
    tag: "Guides",
  },
  {
    slug: "hsc-vce-study-notes-guide",
    title: "HSC & VCE Study Notes - How to Make Notes That Actually Work",
    excerpt:
      "Structure, per-subject techniques, and the principle that separates HSC and VCE notes that move ATAR from notes that just look pretty.",
    date: "Jun 2026",
    tag: "For Students",
  },
  {
    slug: "how-to-make-a-revision-timetable",
    title: "How to Make a Revision Timetable (GCSE & A-level)",
    excerpt:
      "A step-by-step guide to building a GCSE or A-level revision timetable you'll actually follow - includes a free weekly template.",
    date: "Jun 2026",
    tag: "Guides",
  },
  {
    slug: "ai-literature-review-guide",
    title: "Using AI for Literature Reviews: A Workflow for Researchers",
    excerpt:
      "A practical workflow for PhD students and researchers - PDF extraction, per-paper notes, thematic synthesis, and how to keep citations honest when AI is in the loop.",
    date: "Jun 2026",
    tag: "For Researchers",
  },
  {
    slug: "best-ai-writing-assistants-for-note-takers",
    title: "Best AI Writing Assistants for Note-Takers (2026)",
    excerpt:
      "Grammarly owns the search - but note-takers need something different. Six honest picks for AI writing assistants that live inside your notebook: Notespace, Notion AI, Obsidian, Mem, Reflect, and Ulysses.",
    date: "Jun 2026",
    tag: "AI Writing",
  },
  {
    slug: "ai-voice-notes-meeting-transcription",
    title: "Best AI Voice Note Taking & Meeting Transcription Apps (2026)",
    excerpt:
      "Voice in, organized notes out. Five honest picks for AI voice notes and meeting transcription - Notespace, Otter.ai, Notion AI, Obsidian + Whisper, and Mem.",
    date: "Jun 2026",
    tag: "AI Voice",
  },
  {
    slug: "best-note-taking-app-2026",
    title: "The Best Note Taking App in 2026 - 7 Honest Picks",
    excerpt:
      "Seven note taking apps compared honestly - Notespace, Notion, Obsidian, Evernote, OneNote, Reflect, and Mem. Screenshots, pros and cons, and a clear pick for each kind of person.",
    date: "Jun 2026",
    tag: "Comparison",
  },
  {
    slug: "evernote-alternatives-2026",
    title: "Six Honest Evernote Alternatives for 2026",
    excerpt:
      "Evernote pioneered the digital shoebox - then the free tier shrank, the editor stayed in 2015, and the price kept climbing. The six apps people actually move to: Notion, Obsidian, OneNote, Reflect, Mem, and Notespace.",
    date: "Jun 2026",
    tag: "Comparison",
  },
  {
    slug: "onenote-alternatives-2026",
    title: "Six Honest OneNote Alternatives for 2026",
    excerpt:
      "OneNote is free and generous - and a freeform canvas that gets messy fast, locks your notes in, and gates the good AI behind Microsoft 365. The six apps people actually move to.",
    date: "Jun 2026",
    tag: "Comparison",
  },
  {
    slug: "obsidian-alternatives-2026",
    title: "Six Honest Obsidian Alternatives for 2026",
    excerpt:
      "Obsidian is brilliant - and it's a tool you have to build. If you're tired of maintaining a vault, paying for sync, and configuring plugins before you can write, here are the six apps people actually move to.",
    date: "Jun 2026",
    tag: "Comparison",
  },
  {
    slug: "notion-alternatives-2026",
    title: "Six Honest Notion Alternatives for 2026",
    excerpt:
      "Notion grew into an everything-tool. If you only ever used it for notes, here are the six apps people actually leave for - Obsidian, Evernote, OneNote, Reflect, Mem, and Notespace.",
    date: "Jun 2026",
    tag: "Comparison",
  },
  {
    slug: "notebooklm-alternative",
    title: "NotebookLM Alternatives 2026 - 6 Honest Picks (Free & Paid)",
    excerpt:
      "NotebookLM is a great demo and not much of a notebook. Six honest alternatives compared - Notespace, Notion AI, Obsidian, Mem, Reflect, and OneNote + Copilot.",
    date: "Jun 2026",
    tag: "Comparison",
  },
  {
    slug: "notebook-lm-api",
    title: "Does NotebookLM Have an API? Honest 2026 Answer",
    excerpt:
      "No public NotebookLM API exists as of 2026. Here's what that means for developers, how to build NotebookLM-style RAG on the Gemini API, and when to skip the build entirely.",
    date: "Jun 2026",
    tag: "Developer Guide",
  },
  {
    slug: "what-is-notebook-lm-used-for",
    title: "What Is NotebookLM Used For? Six Real Use Cases",
    excerpt:
      "A plain-English explainer of what NotebookLM is, what it's actually good at, and what it can't do. Six honest use cases with an FAQ that doesn't dodge the limits.",
    date: "Jun 2026",
    tag: "Explainer",
  },
  {
    slug: "ai-study-tools",
    title: "Best AI Study Tools in 2026: 11 Honest Picks (Free & Paid)",
    excerpt:
      "Eleven AI study tools compared honestly - NotebookLM, StudyFetch, Turbo.ai, Mindgrasp, Quizlet, Khanmigo, and more. What each is best at, and how to pick by job.",
    date: "Jun 2026",
    tag: "Comparison",
  },
  {
    slug: "otter-ai-alternative-for-students",
    title: "The Honest Otter.ai Alternative Guide for Students",
    excerpt:
      "Otter is a transcript machine, not a study tool. Six honest alternatives compared for students - Notespace, Notion AI, Obsidian + Whisper, Mem, Reflect, and Otter itself.",
    date: "Jun 2026",
    tag: "Comparison",
  },
  {
    slug: "best-ai-note-taking-apps-2026",
    title: "Best AI Note Taking Apps for Writers and Researchers in 2026",
    excerpt:
      "An honest comparison of the seven AI note taking apps that actually earn the label - Notespace, Evernote, Notion AI, Obsidian, Mem, Reflect, and Otter.ai.",
    date: "Jun 2026",
    tag: "Comparison",
  },
  {
    slug: "best-note-taking-app-for-writers",
    title: "The Best Note Taking App for Writers in 2026",
    excerpt:
      "Most lists are written for project managers. Writers need something else. The four apps that actually fit how writers work - Scrivener, Obsidian, Ulysses, and Notespace.",
    date: "Jun 2026",
    tag: "For Writers",
  },
  {
    slug: "ai-note-taking-app-for-students",
    title: "The Best AI Note Taking App for Students in 2026",
    excerpt:
      "Per-course organization, AI that explains without writing your essay, free tiers that are actually usable. Notespace, Notion, Obsidian, and OneNote compared.",
    date: "Jun 2026",
    tag: "For Students",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "Notespace Blog",
  url: "https://notebookarchive.lovable.app/blog",
  description:
    "Honest writing on note taking, AI for writers and researchers, and the tools we build at Notespace.",
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
        title="Blog - Notespace"
        description="Honest writing on note taking apps, AI for writers and researchers, and the tools we build at Notespace."
        path="/blog"
        jsonLd={[jsonLd, breadcrumbsJsonLd([{ name: "Blog", path: "/blog" }])]}
      />

      <div className="min-h-screen bg-background text-foreground">
        <PageHeader />

        <main className="max-w-6xl mx-auto px-6 pt-32 pb-20">
          <header
            
            
            
            className="mb-16 text-center max-w-3xl mx-auto"
          >
            <p className="text-sm uppercase tracking-widest text-accent font-semibold mb-4">
              The Notespace Blog
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              Writing about <span className="text-primary">writing, notes, and the tools between them</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Honest comparisons, opinionated picks, and the occasional behind-the-scenes from
              the team building Notespace.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p, i) => (
              <article
                key={p.slug}
                
                
                
                
              >
                <Link
                  to={`/blog/${p.slug}`}
                  {...prefetchOnHover(`/blog/${p.slug}`)}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-[0_18px_48px_-22px_hsl(var(--foreground)/0.18)] transition"
                >
                  <CardVisual tag={p.tag} title={p.title} />
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <span>{p.date}</span>
                    </div>
                    <h2 className="font-serif text-xl font-bold mb-3 leading-snug group-hover:text-primary transition">
                      {p.title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed text-sm mb-5 line-clamp-4">
                      {p.excerpt}
                    </p>
                    <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-primary">
                      Read post <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </main>


        <Footer />
      </div>
    </>
  );
}
