import { motion } from "framer-motion";
import {
  ArrowRight,
  GraduationCap,
  PenLine,
  Microscope,
  Briefcase,
  BookOpen,
  Sparkles,
  Search,
  Target,
  Quote,
} from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import Footer from "@/components/Footer";
import { SeoHead } from "@/components/SeoHead";
import { breadcrumbsJsonLd } from "@/lib/seo-breadcrumbs";


const cases = [
  {
    to: "/use-cases/students",
    Icon: GraduationCap,
    label: "Students",
    headline: "Turn a semester of lectures into a clean revision system.",
    blurb:
      "Organize every course in its own notebook, pull readable text out of dense PDFs, and rebuild your study notes before exams - without losing a weekend to setup.",
    highlights: ["Course-based notebooks", "PDF text extraction", "Daily writing streak", "Global ⌘K search"],
    cta: "See the student workflow",
  },
  {
    to: "/use-cases/writers",
    Icon: PenLine,
    label: "Writers",
    headline: "A quiet editor that respects the work.",
    blurb:
      "Draft long-form pieces in serif type with focus mode on, structure manuscripts through nested notebooks, and hit your daily word goal without leaving the page.",
    highlights: ["Distraction-free focus mode", "Nested manuscript structure", "Daily word-count goal", "Markdown export, always"],
    cta: "See the writer workflow",
  },
  {
    to: "/use-cases/researchers",
    Icon: Microscope,
    label: "Researchers",
    headline: "Hold a literature review together across years.",
    blurb:
      "Annotate papers, lift quotes from PDFs with one click, search across every notebook at once, and keep your sources private - no training, no leaks.",
    highlights: ["Cross-notebook search", "PDF quote extraction", "Smart tag aggregation", "Private by default"],
    cta: "See the researcher workflow",
  },
  {
    to: "/use-cases/project-managers",
    Icon: Briefcase,
    label: "Project Managers",
    headline: "The notebook that survives every status meeting.",
    blurb:
      "Capture meetings live, extract action items, and keep stakeholder context in one searchable place - from kickoff to retrospective.",
    highlights: ["Live meeting capture", "AI summarization", "Owner-tagged action items", "Public stakeholder share links"],
    cta: "See the PM workflow",
  },
];

const marqueeItems = [
  "Course-based notebooks",
  "PDF text extraction",
  "Global ⌘K search",
  "Distraction-free focus mode",
  "Daily word-count goal",
  "Smart tag aggregation",
  "Nested manuscript structure",
  "Markdown export, always",
  "Private by default",
  "Cross-notebook search",
  "AI that explains, never replaces",
  "Encrypted storage",
];

const principles = [
  {
    Icon: Sparkles,
    title: "AI that explains, never replaces",
    body: "Highlight a term to get a plain-language explanation, or upload a paper for an honest summary. We never rewrite your draft for you.",
  },
  {
    Icon: Search,
    title: "Find anything in one keystroke",
    body: "Global ⌘K search ranges across every notebook, every tag, every uploaded PDF. No more hunting through folders.",
  },
  {
    Icon: Target,
    title: "Tools that build habits",
    body: "Daily word goals, study streaks, and a focus mode that hides everything but the page. Small mechanics that compound over months.",
  },
  {
    Icon: BookOpen,
    title: "Your notes stay yours",
    body: "Encrypted storage, private buckets, and a hard rule: your notes are never used to train AI models. Export to Markdown any time.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export default function UseCasesIndex() {
  return (
    <>
      <SeoHead
        title="Use Cases - Notebook Archive"
        description="Notebook Archive for students, writers, and researchers. See how a calm, AI-assisted note-taking app fits each workflow."
        path="/use-cases"
        jsonLd={breadcrumbsJsonLd([{ name: "Use cases", path: "/use-cases" }])}
      />

      <main className="min-h-screen bg-background">
        <PageHeader />

        {/* HERO */}
        <section className="relative overflow-hidden pt-28 pb-20 border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-primary/[0.04] pointer-events-none" />
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-primary/10 blur-3xl pointer-events-none"
          />
          <div className="container mx-auto px-6 pt-8 pb-4 md:pt-16 text-center relative">
            <motion.div initial="hidden" animate="show" variants={fadeUp}>
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="h-px w-10 bg-accent" />
                <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-accent">Use cases</span>
                <span className="h-px w-10 bg-accent" />
              </div>
              <h1 className="font-serif text-[2rem] md:text-[2.5rem] lg:text-[3.1rem] font-bold text-foreground leading-[1.15] max-w-4xl mx-auto">
                Pick the workflow closest to <span className="text-primary">how you actually work</span>.
              </h1>
              <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Notebook Archive isn't a generic note-taker bent to fit your life. Each
                of the three workflows below is a separate page with real scenarios,
                pain-point answers, and an honest comparison vs the apps you're probably
                already trying.
              </p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="mt-4 text-sm text-muted-foreground"
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  Click any workflow below to open its full guide
                </span>
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* MARQUEE STRIP - what's inside, scrolling */}
        <section className="py-8 border-b border-border bg-muted/20 overflow-hidden marquee-pause">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
            <div className="marquee-track flex gap-10 whitespace-nowrap w-max">
              {[...marqueeItems, ...marqueeItems].map((item, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-3 font-serif text-base md:text-lg text-foreground/80"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/70" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>


        {/* WORKFLOW ROWS - distinctly NOT cards */}
        <section className="py-24">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="text-center mb-14">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="h-px w-10 bg-accent" />
                <span className="text-xs uppercase tracking-[0.2em] font-semibold text-accent">Three workflows</span>
                <span className="h-px w-10 bg-accent" />
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold">Open the one that fits you.</h2>
              <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
                Each row is a full guide - tap through to read it.
              </p>
            </div>

            <div className="divide-y divide-border border-t border-b border-border">
              {cases.map(({ to, Icon, label, headline, blurb, highlights, cta }, i) => (
                <motion.div
                  key={to}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                  className="group relative"
                >
                  <Link
                    to={to}
                    className="block py-10 md:py-12 transition-colors hover:bg-muted/30"
                  >
                    {/* left accent bar that grows on hover */}
                    <span
                      aria-hidden
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-0 w-1 bg-primary rounded-r-full transition-all duration-500 group-hover:h-3/4"
                    />
                    <div className="grid md:grid-cols-12 gap-6 md:gap-8 items-center px-2 md:px-6">
                      <div className="md:col-span-1 flex md:justify-center">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center transition-transform duration-500 group-hover:rotate-[-6deg] group-hover:scale-110">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div className="md:col-span-7">
                        <div className="text-xs uppercase tracking-[0.18em] font-semibold text-accent mb-2">
                          {label}
                        </div>
                        <h3 className="font-serif text-2xl md:text-[1.75rem] font-bold text-foreground leading-snug">
                          {headline}
                        </h3>
                        <p className="mt-3 text-muted-foreground leading-relaxed">{blurb}</p>
                        <ul className="mt-4 flex flex-wrap gap-2">
                          {highlights.map((h) => (
                            <li
                              key={h}
                              className="text-xs font-medium text-foreground/80 bg-muted px-2.5 py-1 rounded-full"
                            >
                              {h}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="md:col-span-4 flex md:justify-end">
                        <span className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all duration-300 group-hover:gap-3 group-hover:shadow-lg group-hover:shadow-primary/30">
                          {cta}
                          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SHARED PRINCIPLES */}
        <section className="py-24 border-t border-border bg-muted/20">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="text-center mb-14">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="h-px w-10 bg-accent" />
                <span className="text-xs uppercase tracking-[0.2em] font-semibold text-accent">What they all share</span>
                <span className="h-px w-10 bg-accent" />
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold">
                Four principles, every workflow.
              </h2>
              <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
                Whichever guide you open, the underlying app behaves the same way.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {principles.map((p, i) => (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.45, delay: i * 0.07 }}
                  className="rounded-2xl border border-border bg-card p-6 hover:shadow-md transition-shadow"
                >
                  <p.Icon className="h-6 w-6 text-primary mb-4" />
                  <h3 className="font-serif text-lg font-bold mb-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* PULL QUOTE */}
        <section className="py-24 border-t border-border">
          <div className="container mx-auto px-6 max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6 }}
            >
              <Quote className="h-8 w-8 text-primary/40 mx-auto mb-5" />
              <blockquote className="font-serif text-2xl md:text-3xl leading-snug text-foreground">
                "The fastest way to know if a tool fits is to read the workflow of
                someone exactly like you. That's what these three pages are."
              </blockquote>
              <p className="mt-5 text-sm text-muted-foreground">- The Notebook Archive team</p>
            </motion.div>
          </div>
        </section>

        {/* FURTHER READING */}
        <section className="py-20 border-t border-border">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="h-px w-8 bg-accent" />
                <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-accent">Further reading</span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                Comparing your options
              </h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <Link
                to="/blog/evernote-alternatives-2026"
                className="group block rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition"
              >
                <p className="text-[11px] uppercase tracking-widest text-accent font-semibold mb-2">Comparison</p>
                <h3 className="font-serif text-lg font-bold mb-2 group-hover:text-primary transition">
                  Six Honest Evernote Alternatives for 2026
                </h3>
                <p className="text-sm text-muted-foreground">For people sick of Evernote's shrinking free tier, dated editor, and yearly price hikes.</p>
              </Link>
              <Link
                to="/blog/obsidian-alternatives-2026"
                className="group block rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition"
              >
                <p className="text-[11px] uppercase tracking-widest text-accent font-semibold mb-2">Comparison</p>
                <h3 className="font-serif text-lg font-bold mb-2 group-hover:text-primary transition">
                  Six Honest Obsidian Alternatives for 2026
                </h3>
                <p className="text-sm text-muted-foreground">For people tired of maintaining a vault, paying for sync, and configuring plugins before they can write.</p>
              </Link>
              <Link
                to="/blog/notion-alternatives-2026"
                className="group block rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition"
              >
                <p className="text-[11px] uppercase tracking-widest text-accent font-semibold mb-2">Comparison</p>
                <h3 className="font-serif text-lg font-bold mb-2 group-hover:text-primary transition">
                  Six Honest Notion Alternatives for 2026
                </h3>
                <p className="text-sm text-muted-foreground">For people who only ever used Notion to write - and want the docs to feel like a notebook again.</p>
              </Link>
            </div>
          </div>
        </section>



        {/* FINAL CTA */}
        <section className="py-24 border-t border-border bg-muted/30">
          <div className="container mx-auto px-6 max-w-3xl text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Not sure which one to open?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Start with students - it covers the broadest workflow and most of what the
              writer and researcher pages also explain.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/use-cases/students"
                className="magnetic-btn inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-3 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25"
              >
                Open the student guide <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/auth"
                className="magnetic-btn inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-7 py-3 text-base font-semibold hover:bg-muted transition-colors"
              >
                Or just start writing
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
