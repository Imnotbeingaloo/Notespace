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

const REF = "blog-how-to-make-a-study-plan-for-exams";
const CTA = `/auth?ref=${REF}&utm_source=blog&utm_medium=organic&utm_campaign=how-to-make-a-study-plan-for-exams`;

const faq = [
  {
    q: "How many weeks before an exam should I start studying?",
    a: "For a single subject final, three to four weeks is realistic. For finals season (multiple exams in two weeks), start six weeks out. Cramming the last seven days works for memorization but fails for anything requiring practice or problem-solving.",
  },
  {
    q: "How do I make an exam study plan for finals week?",
    a: "Reverse-engineer from the exam dates. Assign the last two days before each exam to that subject only. Fill the weeks before with rotating coverage of every subject. Build in one full rest day per week - sleep debt destroys exam performance.",
  },
  {
    q: "How do I study for the MCAT, GRE, or LSAT with a plan?",
    a: "Standardized tests follow the same pattern: diagnostic test first, then content review, then daily timed practice for the last 4-6 weeks. Plan the practice sessions on your calendar - not 'when you have time'. The MCAT and GRE in particular reward consistency over intensity.",
  },
  {
    q: "What's the best study plan template for exam revision?",
    a: "Look for one that has both content blocks (what to cover) and a review schedule (when to revisit). The template lower down on this page is built that way. You can open it directly in Notebook Archive's study planner.",
  },
  {
    q: "Should I use spaced repetition in an exam study plan?",
    a: "Yes - for vocabulary, formulas, and recall-heavy subjects. Use it as one part of the plan (15-30 minutes a day), not as the whole plan. Application-heavy subjects (problem sets, essays) still need long-form practice blocks.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to make a study plan for exams",
    description:
      "A six-week exam study plan you can adapt to finals, GCSEs, A-levels, the MCAT, GRE, or LSAT.",
    step: [
      { "@type": "HowToStep", name: "Reverse-engineer from the exam date", text: "Write down each exam date and work backwards in weekly chunks." },
      { "@type": "HowToStep", name: "Take a baseline / diagnostic test", text: "Find out what you actually know now, not what you assume you know." },
      { "@type": "HowToStep", name: "Block content review", text: "Spend weeks 4-6 covering material in rotation, not one subject at a time." },
      { "@type": "HowToStep", name: "Shift to timed practice", text: "In the final 2-3 weeks, replace passive review with full timed practice." },
      { "@type": "HowToStep", name: "Lock in sleep and one rest day", text: "Protect 7-8 hours of sleep and one full rest day per week - non-negotiable." },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How to Make a Study Plan for Exams (Six-Week Template)",
    description:
      "A practical six-week exam study plan template for finals, GCSEs, A-levels, the MCAT, GRE, and LSAT - with a copy-pasteable schedule.",
    datePublished: "2026-06-27",
    dateModified: "2026-06-28",
    author: { "@type": "Organization", name: "Notebook Archive" },
    publisher: { "@type": "Organization", name: "Notebook Archive" },
    mainEntityOfPage: "https://notebookarchive.lovable.app/blog/how-to-make-a-study-plan-for-exams",
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
    { name: "How to Make a Study Plan for Exams (Six-Week Template)", path: "/blog/how-to-make-a-study-plan-for-exams" },
  ])
];

export default function BlogHowToMakeStudyPlanForExams() {
  useEffect(() => {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <>
      <SeoHead
        type="article"
        title="How to Make a Study Plan for Exams (Six-Week Template) - 2026"
        description="A six-week exam study plan template for finals, GCSEs, A-levels, MCAT, GRE, and LSAT. Includes a free study schedule you can copy."
        path="/blog/how-to-make-a-study-plan-for-exams" image="/og/og-how-to-make-a-study-plan-for-exams.jpg"
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
              How to make a <span className="text-primary">study plan for exams</span> (six-week template)
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Whether you're prepping for finals, GCSEs, A-levels, the MCAT, GRE,
              or LSAT - the structure is the same. Six weeks out, diagnostic
              first, timed practice last, sleep protected. Here's the template.
            </p>
          </motion.header>

          <section className="mb-12 space-y-12">
            <div>
              <h2 className="font-serif text-2xl font-bold mb-3">The six-week shape</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Most exam study plans fail because they treat week six the same as week one.
                They shouldn't be. The shape of a good exam study plan changes as the date
                gets closer:
              </p>
              <ul className="space-y-2 text-muted-foreground leading-relaxed">
                <li>• <strong>Week 6:</strong> Diagnostic test. Identify weak areas honestly. No revision yet.</li>
                <li>• <strong>Weeks 4-5:</strong> Content review. Rotate subjects - never one subject for a whole day.</li>
                <li>• <strong>Weeks 2-3:</strong> Mixed review + first timed practice papers.</li>
                <li>• <strong>Week 1:</strong> Timed practice only. No new content. Sleep protected.</li>
                <li>• <strong>Final 48 hours per exam:</strong> Light review, no all-nighters. Sleep wins points.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold mb-3">Free exam study plan template</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Copy this into any document - or open it directly as a note in
                Notebook Archive's <Link to="/templates/study-planner" className="text-primary underline underline-offset-2">study planner template</Link>.
              </p>
              <pre className="bg-muted rounded-lg p-5 text-sm leading-relaxed overflow-x-auto whitespace-pre">{`# Exam Study Plan - [Subject / Exam name]
Exam date: [date]   |   Weeks remaining: 6

## Week 6 - Diagnostic
- [ ] Full diagnostic test (untimed)
- [ ] List 5 weakest topics

## Weeks 4-5 - Content review (rotate daily)
Mon  Topic 1   |   Tue  Topic 2   |   Wed  Topic 3
Thu  Topic 4   |   Fri  Topic 5   |   Sat  Weakest
Sun  REST

## Weeks 2-3 - Mixed review + first timed papers
- 1 timed past paper / week (Saturday)
- Review mistakes in detail (Sunday)

## Week 1 - Timed practice only
- 1 timed paper every other day
- No new content
- 8 hours sleep, every night

## Final 48 hours
- Light review of summary notes
- Early night
- Trust the plan`}</pre>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold mb-3">Adapting the template</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                The skeleton above works for almost any exam. Two adjustments worth making:
              </p>
              <ul className="space-y-2 text-muted-foreground leading-relaxed">
                <li>• <strong>For standardized tests (MCAT, GRE, LSAT):</strong> Replace "Topic 1-5" with the test's official content categories. Add 30 minutes of spaced-repetition vocabulary or formula drilling every day.</li>
                <li>• <strong>For finals season (multiple exams in two weeks):</strong> Duplicate the Week 1 block for each exam. Assign the 48 hours before each to that subject only.</li>
                <li>• <strong>For GCSEs / A-levels:</strong> Treat each subject as its own six-week run, staggered so the diagnostic and timed-practice weeks don't all collide.</li>
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
              Run your exam study plan inside Notebook Archive
            </p>
            <p className="text-muted-foreground mb-6">
              Open the study planner template, drop in your exam dates, and let
              the schedule do the remembering. Free to start.
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

        <RelatedReading currentPath="/blog/how-to-make-a-study-plan-for-exams" items={STUDY_PLANNER_RELATED} />
        <Footer />
      </div>
    </>
  );
}
