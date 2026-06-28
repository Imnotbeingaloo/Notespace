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
import { RelatedReading, STUDY_PLANNER_RELATED } from "@/components/RelatedReading";

const REF = "blog-how-to-make-a-revision-timetable";
const CTA = `/auth?ref=${REF}&utm_source=blog&utm_medium=organic&utm_campaign=how-to-make-a-revision-timetable`;

const faq = [
  {
    q: "How do I make a revision timetable for GCSEs?",
    a: "List every subject, count the weeks until your first exam, and block each subject into recurring 45-60 minute slots across the week. Leave one full rest day and a Sunday review slot. Past-paper practice goes in its own slot, not mixed with revision.",
  },
  {
    q: "How many hours of revision a day for A-levels?",
    a: "Most A-level students do well on three to five focused hours a day in the final eight weeks, split into 50-minute blocks with proper breaks. Quality of attention beats hours logged - six unfocused hours is worth less than three deliberate ones.",
  },
  {
    q: "When should I start my revision timetable?",
    a: "Eight to twelve weeks before your first exam for GCSEs and A-levels. Earlier is fine for content-heavy subjects (sciences, history). Past-paper-heavy weeks belong in the final three to four weeks.",
  },
  {
    q: "Is there a free revision timetable template?",
    a: "Yes - copy the weekly template lower down on this page into any document, or open it as a ready-made note inside Notebook Archive's study planner template.",
  },
  {
    q: "What's the best way to stick to a revision timetable?",
    a: "Make it smaller than feels right, run it at the same times each day, and tick sessions off as you finish them. Don't redesign the timetable every week - small tweaks at a Sunday review only.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to make a revision timetable",
    description:
      "A step-by-step way to build a GCSE or A-level revision timetable you'll actually follow, including a free weekly template.",
    step: [
      { "@type": "HowToStep", name: "List every subject and exam date", text: "Write down every subject, paper, and exam date in one place." },
      { "@type": "HowToStep", name: "Count the weeks you actually have", text: "Subtract holidays and rest days from the time until your first exam." },
      { "@type": "HowToStep", name: "Block subjects into fixed slots", text: "Give each subject recurring 45-60 minute slots across the week." },
      { "@type": "HowToStep", name: "Reserve a past-papers slot", text: "Past-paper practice gets its own slot, not mixed with content revision." },
      { "@type": "HowToStep", name: "Hold a Sunday review", text: "Spend 30 minutes every Sunday checking what got done and what changes next week." },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How to Make a Revision Timetable (GCSE & A-level, With Free Template)",
    description:
      "A practical guide to building a GCSE or A-level revision timetable that survives until exams - includes a free weekly template.",
    datePublished: "2026-06-28",
    dateModified: "2026-06-28",
    author: { "@type": "Organization", name: "Notebook Archive" },
    publisher: { "@type": "Organization", name: "Notebook Archive" },
    mainEntityOfPage: "https://notebookarchive.lovable.app/blog/how-to-make-a-revision-timetable",
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
    { name: "How to Make a Revision Timetable (GCSE & A-level, With Free Template)", path: "/blog/how-to-make-a-revision-timetable" },
  ])
];

export default function BlogHowToMakeRevisionTimetable() {
  useEffect(() => {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <>
      <SeoHead
        type="article"
        title="How to Make a Revision Timetable (GCSE & A-level) - Free Template 2026"
        description="A practical guide to building a GCSE or A-level revision timetable you'll actually follow. Includes a free weekly template."
        path="/blog/how-to-make-a-revision-timetable"
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
              - Guides · Updated June 2026
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              How to make a <span className="text-primary">revision timetable</span> (GCSE &amp; A-level)
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              A revision timetable only works if it's built for the hours you
              actually have. This guide builds one for the real you - with a
              free weekly template you can copy today.
            </p>
          </motion.header>

          <section className="mb-12 space-y-12">
            <div>
              <h2 className="font-serif text-2xl font-bold mb-3">
                The five steps, in order
              </h2>

              <h3 className="font-serif text-lg font-bold mt-6 mb-2">1. List every subject and exam date</h3>
              <p className="text-muted-foreground leading-relaxed">
                Open one page. Write every subject, every paper, and every exam
                date. Don't sort yet - just get the full picture in one place
                before you start blocking out time.
              </p>

              <h3 className="font-serif text-lg font-bold mt-6 mb-2">2. Count the weeks you actually have</h3>
              <p className="text-muted-foreground leading-relaxed">
                Look at the calendar between today and your first exam.
                Subtract half-term, family commitments, and one full rest day a
                week. What's left is your real revision budget - usually 6-10
                weeks, not the 12 you imagined.
              </p>

              <h3 className="font-serif text-lg font-bold mt-6 mb-2">3. Block subjects into fixed slots</h3>
              <p className="text-muted-foreground leading-relaxed">
                Don't write "revise maths when I can". Write
                "Maths, Mon/Wed/Fri, 4-5pm". Recurring slots build the habit;
                vague intentions don't. Aim for 45-60 minute blocks with a real
                10-minute break between each.
              </p>

              <h3 className="font-serif text-lg font-bold mt-6 mb-2">4. Reserve a past-papers slot</h3>
              <p className="text-muted-foreground leading-relaxed">
                Past papers are the single highest-ROI revision activity for
                GCSE and A-level. Give them their own slot - don't fold them
                into content revision. Mark each one as done in your timetable
                so the streak is visible.
              </p>

              <h3 className="font-serif text-lg font-bold mt-6 mb-2">5. Hold a Sunday review</h3>
              <p className="text-muted-foreground leading-relaxed">
                Thirty minutes every Sunday: what got done, what slipped, what
                changes next week. This single habit is what separates a
                timetable that lasts until exams from one that lasts two weeks.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold mb-3">
                Free weekly revision timetable template
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Copy this into any document - or open it as a ready-made note in
                Notebook Archive's <Link to="/templates/study-planner" className="text-primary underline underline-offset-2">study planner template</Link>.
              </p>
              <pre className="bg-muted rounded-lg p-5 text-sm leading-relaxed overflow-x-auto whitespace-pre">{`# Revision Timetable - Week of [date]

## This week's focus
- [ ] Maths - paper 1 topics + 1 past paper
- [ ] Biology - cells & transport, flashcards
- [ ] English Lit - Macbeth essay plan

## Daily timetable
Mon  16:00-17:00  Maths        17:15-18:00  Biology
Tue  16:00-17:00  English Lit  17:15-18:00  Maths
Wed  16:00-17:00  Biology      17:15-18:00  English Lit
Thu  16:00-17:00  Maths past paper (timed)
Fri  16:00-17:00  English Lit  17:15-18:00  Biology
Sat  REST
Sun  10:00-10:30  Weekly review

## Sunday review
- What got done?
- What slipped?
- What changes next week?`}</pre>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold mb-3">
                Honest limits
              </h2>
              <ul className="space-y-2 text-muted-foreground leading-relaxed">
                <li>• A timetable won't fix motivation. It just removes the daily decision of "what should I revise?"</li>
                <li>• The first week always feels too easy. Hold the plan for three weeks before scaling up.</li>
                <li>• If you miss a session, don't "catch up" - move to the next scheduled slot. Catch-up debt is what kills revision timetables.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold mt-12 mb-6">Frequently asked</h2>
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

          <div className="border-t border-border pt-10 mt-10 text-center">
            <p className="font-serif text-2xl font-bold mb-4">
              Build your revision timetable inside Notebook Archive
            </p>
            <p className="text-muted-foreground mb-6">
              Open the study planner template, edit the slots to match your
              week, and tick sessions off as you finish them. Free to start.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link to="/templates/study-planner" className="inline-flex items-center gap-2 border border-border bg-card px-5 py-3 rounded-lg font-semibold hover:bg-muted transition">
                Open the study planner template
              </Link>
              <Link to={CTA} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition">
                Start using Notebook Archive <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </article>

        <Footer />
      </div>
    </>
  );
}
