import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Target, Clock, CheckCircle2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PageHeader } from "@/components/PageHeader";
import { SeoHead } from "@/components/SeoHead";
import Footer from "@/components/Footer";
import { breadcrumbsJsonLd } from "@/lib/seo-breadcrumbs";

const REF = "template-study-planner";
const CTA = `/auth?ref=${REF}&utm_source=template&utm_medium=organic&utm_campaign=study-planner`;

const weeklyTemplate = `# Weekly Study Plan - Week of [date]

## Subjects this week
- [ ] Subject A - chapter 4 + practice problems
- [ ] Subject B - lecture notes + 1 essay outline
- [ ] Subject C - past paper, timed

## Study schedule
Mon  16:00-17:30  Subject A
Tue  16:00-17:00  Subject B
Wed  16:00-17:30  Subject A
Thu  16:00-17:00  Subject C (past paper)
Fri  16:00-17:30  Subject B (essay)
Sat  REST
Sun  10:00-10:30  Weekly review`;

const examTemplate = `# Exam Study Plan - [Subject]
Exam date: [date]   |   Weeks remaining: 6

## Week 6 - Diagnostic
- [ ] Full diagnostic test
- [ ] List 5 weakest topics

## Weeks 4-5 - Content review (rotate)
## Weeks 2-3 - Mixed review + timed papers
## Week 1 - Timed practice only
## Final 48h - Light review, early night`;

const faq = [
  {
    q: "Is there a free study planner app?",
    a: "Yes - Notebook Archive includes a free study planner. Open the template above, edit the slots to match your week, and tick sessions off as you finish them. No paywall on the planner itself.",
  },
  {
    q: "What's the best study planner for exams?",
    a: "The best exam study planner is the one that works backwards from the exam date and includes both content review and timed practice. The exam-week template on this page is built that way - copy it into any notebook and adapt the dates.",
  },
  {
    q: "How is this different from Google Calendar or Notion?",
    a: "Google Calendar is a calendar - it doesn't know about your notes. Notion needs you to build the structure first. Notebook Archive ships with the study planner template pre-built, plus your notes, tags, and AI explanations in the same app.",
  },
  {
    q: "Does the study planner work on mobile?",
    a: "Yes. Notebook Archive is web-based and responsive - open it on phone or tablet to check today's schedule and tick sessions off on the go.",
  },
  {
    q: "Can I use the planner for non-exam goals?",
    a: "Yes - the weekly template above works for any recurring practice (language learning, instrument practice, coding, writing). The structure is the same: fixed slots, weekly review, visible progress.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Notebook Archive - Study Planner",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    url: "https://notebookarchive.lovable.app/templates/study-planner",
    description:
      "A free study planner app and exam study planner template. Build a weekly study schedule, plan exam revision over six weeks, and tick sessions off as you go.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
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
    { name: "Templates", path: "/templates" },
    { name: "Study planner", path: "/templates/study-planner" },
  ]),
];

export default function TemplateStudyPlanner() {
  useEffect(() => {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <>
      <SeoHead
        title="Free Study Planner App & Exam Study Planner Template - Notebook Archive"
        description="A free study planner app with ready-made weekly and exam study planner templates. Build a study schedule, plan exam revision, and tick sessions off as you go."
        path="/templates/study-planner"
        jsonLd={jsonLd}
      />

      <main className="min-h-screen bg-background text-foreground">
        <PageHeader />

        {/* Hero */}
        <section className="relative overflow-hidden pt-28 pb-16 border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-primary/[0.04] pointer-events-none" />
          <div className="container mx-auto px-6 max-w-4xl text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="h-px w-10 bg-accent" />
                <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-accent">
                  Free template
                </span>
                <span className="h-px w-10 bg-accent" />
              </div>
              <h1 className="font-serif text-[2rem] md:text-[2.6rem] lg:text-[3.1rem] font-bold leading-[1.15] mb-5">
                A free <span className="text-primary">study planner app</span> -
                with an <span className="text-primary">exam study planner</span> template baked in.
              </h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Build a weekly study schedule, plan exam revision over six weeks,
                and tick sessions off as you go - all inside the same notebook
                that holds your notes.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to={CTA}
                  className="magnetic-btn inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-3 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25"
                >
                  Open template in Notebook Archive <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/templates"
                  className="magnetic-btn inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-7 py-3 text-base font-semibold hover:bg-muted transition-colors"
                >
                  Browse all templates
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* What's inside */}
        <section className="py-16 border-b border-border">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { Icon: Calendar, title: "Weekly schedule", desc: "Fixed time slots per subject, recurring every week." },
                { Icon: Target, title: "Exam countdown", desc: "Reverse-engineered from the exam date, six weeks out." },
                { Icon: CheckCircle2, title: "Tick to track", desc: "Visible progress per session - the habit that sticks." },
                { Icon: Clock, title: "Weekly review", desc: "One 30-minute slot to catch up, no overhaul." },
              ].map(({ Icon, title, desc }) => (
                <div key={title} className="rounded-xl border border-border bg-card p-5">
                  <Icon className="h-6 w-6 text-primary mb-3" />
                  <h3 className="font-serif text-lg font-bold mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Weekly template preview */}
        <section className="py-16 border-b border-border">
          <div className="container mx-auto px-6 max-w-3xl">
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-accent">
                Preview · Weekly
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <h2 className="font-serif text-3xl font-bold mb-4">Weekly study planner template</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The everyday template - a recurring study schedule with a weekly
              review slot. Works for a semester, a coding bootcamp, or any
              long-running goal.
            </p>
            <pre className="bg-muted rounded-lg p-5 text-sm leading-relaxed overflow-x-auto whitespace-pre">{weeklyTemplate}</pre>
          </div>
        </section>

        {/* Exam template preview */}
        <section className="py-16 border-b border-border">
          <div className="container mx-auto px-6 max-w-3xl">
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-accent">
                Preview · Exam
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <h2 className="font-serif text-3xl font-bold mb-4">Exam study planner template</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              A six-week countdown that shifts from content review to timed
              practice as exam day approaches. Adapts to finals, GCSEs, A-levels,
              MCAT, GRE, or LSAT.
            </p>
            <pre className="bg-muted rounded-lg p-5 text-sm leading-relaxed overflow-x-auto whitespace-pre">{examTemplate}</pre>
            <p className="text-sm text-muted-foreground mt-4">
              Walking through the six-week shape in detail?{" "}
              <Link to="/blog/how-to-make-a-study-plan-for-exams" className="text-primary underline underline-offset-2">
                Read the full guide
              </Link>.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20">
          <div className="container mx-auto px-6 max-w-3xl">
            <h2 className="font-serif text-3xl font-bold mb-6">Frequently asked</h2>
            <Accordion type="single" collapsible className="w-full">
              {faq.map((f, i) => (
                <AccordionItem key={f.q} value={`item-${i}`}>
                  <AccordionTrigger className="font-serif text-lg text-left">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-muted/20 border-t border-border">
          <div className="container mx-auto px-6 max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-bold mb-3">
              Open the study planner in Notebook Archive
            </h2>
            <p className="text-muted-foreground mb-6">
              Sign up free, click "New note", pick the study planner template.
              That's it.
            </p>
            <Link
              to={CTA}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
            >
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
