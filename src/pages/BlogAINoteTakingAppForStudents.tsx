import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, BookMarked, Brain, FileText } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SeoHead } from "@/components/SeoHead";
import Footer from "@/components/Footer";

const CTA = "/auth?ref=blog-students&utm_source=blog&utm_medium=organic&utm_campaign=ai-note-taking-app-for-students";

const picks = [
  {
    name: "Notebook Archive",
    tagline: "Built for students who actually take notes by hand-typing them.",
    why: "Notebooks per course, smart tags that pull themes out of your notes, AI that explains concepts and summarizes long PDFs without writing your essay for you, a daily word-count goal, focus mode for exam crunch, and free to start with no credit card. Everything exports to markdown so your notes outlive any one semester.",
    pricing: "Free; Pro $19/mo (student-friendly free tier)",
    bestFor: "University and high-school students juggling multiple subjects.",
    disclosure: "Disclosure: this is the product we make. Criteria below.",
    icon: GraduationCap,
  },
  {
    name: "Notion",
    tagline: "The wiki-style workspace lots of students already use.",
    why: "Databases, templates, and a generous free tier. Heavy to set up — most students spend more time decorating the workspace than studying in it. AI is a $10/mo add-on.",
    pricing: "Free; AI add-on $10/mo",
    bestFor: "Students who like building elaborate systems.",
    icon: BookMarked,
  },
  {
    name: "Obsidian",
    tagline: "Local markdown files with backlinks — your notes, forever.",
    why: "Free for personal use, completely offline, and your notes live as plain files on your device. Steep learning curve and AI requires plugins, but unmatched for long-term knowledge.",
    pricing: "Free",
    bestFor: "CS / philosophy / research-track students who like to tinker.",
    icon: Brain,
  },
  {
    name: "OneNote",
    tagline: "Microsoft's notebook app, free with most school accounts.",
    why: "Free with a school email, syncs across devices, handwriting on tablets. AI features (Copilot) require a paid Microsoft 365 plan most students don't have.",
    pricing: "Free with school account",
    bestFor: "Students whose school issues Microsoft accounts and tablets.",
    icon: FileText,
  },
];

const faq = [
  {
    q: "What is the best AI note taking app for students in 2026?",
    a: "For most students, Notebook Archive is the strongest fit — it's free to start, organizes notes by notebook (one per course is natural), and the AI explains and summarizes without writing essays for you, which keeps it within academic-integrity policies at most schools. Obsidian is the close runner-up if you want plain files on your own device.",
  },
  {
    q: "Is using an AI note taking app considered cheating?",
    a: "Using AI to explain a concept, summarize a source you read, or organize notes you took yourself is generally fine — most universities treat it like using a tutor or a study guide. Using AI to write your essay or answer exam questions is cheating under almost every academic-integrity policy. The apps above are built around the first use, not the second.",
  },
  {
    q: "Is there a free AI note taking app for students?",
    a: "Yes. Notebook Archive, Notion, Obsidian, and OneNote all have free tiers that cover real student use. Free tiers usually cap AI usage per month — that cap is the thing to compare, not the headline price.",
  },
  {
    q: "Can I use these apps to take notes from PDFs and lecture slides?",
    a: "Notebook Archive lets you upload PDFs (including lecture slides) and pull text out for summarizing and tagging. Notion handles PDFs as attachments. Obsidian needs a plugin. OneNote can OCR images of slides. For text-heavy slides, Notebook Archive is the most direct path from PDF to studyable notes.",
  },
  {
    q: "Which note taking app is best for studying for exams?",
    a: "Look for three things: a focus mode (kills distractions during a study block), search across all your notes (so you can find that one definition fast), and AI explain (so you can ask 'what is X?' without leaving the app). Notebook Archive has all three; Obsidian has search and focus but needs plugins for AI.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Best AI Note Taking App for Students in 2026",
    description:
      "An honest comparison of AI note taking apps built for how students actually study — Notebook Archive, Notion, Obsidian, and OneNote.",
    datePublished: "2026-06-27",
    author: { "@type": "Organization", name: "Notebook Archive" },
    publisher: { "@type": "Organization", name: "Notebook Archive" },
    mainEntityOfPage: "https://notebookarchive.lovable.app/blog/ai-note-taking-app-for-students",
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

export default function BlogAINoteTakingAppForStudents() {
  useEffect(() => {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <>
      <SeoHead
        title="Best AI Note Taking App for Students (2026) — Free & Honest Picks"
        description="The four AI note taking apps that actually fit how students study — Notebook Archive, Notion, Obsidian, and OneNote. Free tiers, AI features, and what each one is best for."
        path="/blog/ai-note-taking-app-for-students"
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
              — For Students · Updated June 2026
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              The Best <span className="text-primary">AI Note Taking App for Students</span> in 2026
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Students don't need a productivity system — they need a place to dump lecture notes,
              find them again at 2 a.m. before an exam, and get a concept explained without
              opening four more tabs. Here are the four apps that actually do that, ranked by who
              they fit.
            </p>
          </motion.header>

          <section className="prose prose-neutral max-w-none mb-12">
            <h2 className="font-serif text-2xl font-bold mt-12 mb-4">What students actually need</h2>
            <p className="text-muted-foreground leading-relaxed">
              We talked to undergrads, grad students, and a few high-schoolers about what they want
              from a notes app, and four things came up every time. <strong>Per-course organization</strong>{" "}
              that doesn't take an afternoon to set up. <strong>Search that works</strong> across every
              note from every class. <strong>AI that explains things</strong> — "what is the difference
              between mitosis and meiosis?" — without writing the assignment for you. And a{" "}
              <strong>free tier that's actually usable</strong>, because students don't have $19/month
              for everything.
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

            <h2 className="font-serif text-2xl font-bold mt-16 mb-4">How to pick one in 5 minutes</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li>• <strong>You want to start typing notes today, no setup:</strong> Notebook Archive.</li>
              <li>• <strong>Your friends all use it and you want to share pages:</strong> Notion.</li>
              <li>• <strong>You want your notes to live as files you own forever:</strong> Obsidian.</li>
              <li>• <strong>Your school already gave you a Microsoft account:</strong> OneNote.</li>
            </ul>

            <h2 className="font-serif text-2xl font-bold mt-12 mb-4">A note on academic integrity</h2>
            <p className="text-muted-foreground leading-relaxed">
              Every university has rules about AI use — read yours before you turn anything in. The
              safe pattern almost everywhere: use AI to <em>understand</em> material (explain, summarize,
              quiz me), not to <em>produce</em> material you submit. The apps above are built around the
              first pattern. If you want AI to write your essay, that's a different (riskier) tool category.
            </p>

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
              Start the semester with a notebook that keeps up
            </p>
            <p className="text-muted-foreground mb-6">
              Notebook Archive is free for students. No credit card.
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
