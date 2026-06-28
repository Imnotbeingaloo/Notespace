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

const REF = "blog-a-level-revision-guide";
const CTA = `/auth?ref=${REF}&utm_source=blog&utm_medium=organic&utm_campaign=a-level-revision-guide`;

const faq = [
  { q: "How many hours of revision a day for A-levels?", a: "Three to five focused hours a day in the final 8 weeks, split into 50-minute blocks. Quality beats hours - five deliberate hours beats eight unfocused ones." },
  { q: "How to revise for A-level maths?", a: "Past papers by topic, then by year. Keep a mistakes notebook. ExamSolutions for any topic that won't click. In the final month, one full paper a week minimum." },
  { q: "How to revise for A-level biology?", a: "Spec-point flashcards (every dot point) plus past-paper 6 and 9-markers. The 9-markers are where the grade boundaries get decided." },
  { q: "How to revise for A-level chemistry?", a: "Mechanisms first, then synoptic application. Past-paper multi-step calculations daily in the final month. Mark schemes ruthlessly." },
  { q: "How to revise for A-level history?", a: "Essay plans, not essays. One essay plan a day on a different question. Two full timed essays a week in the final month." },
  { q: "How to revise for A-level psychology?", a: "AO1/AO2/AO3 breakdown on every topic. Practice 16-markers weekly - mark them against the scheme. Studies and key terms on flashcards." },
  { q: "How to revise for A-level economics?", a: "Diagrams from memory. Evaluation paragraphs in your sleep. Data response and essay past papers, weekly, in the final month." },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "A-Level Revision Guide 2026 - How to Revise for Every Subject",
    description:
      "A practical A-level revision guide for 2026 - subject-by-subject techniques, hours to do, and a free A-level revision timetable.",
    datePublished: "2026-06-28",
    dateModified: "2026-06-28",
    author: { "@type": "Organization", name: "Notebook Archive" },
    publisher: { "@type": "Organization", name: "Notebook Archive" },
    mainEntityOfPage: "https://notebookarchive.lovable.app/blog/a-level-revision-guide-2026",
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
    { name: "A-Level Revision Guide 2026", path: "/blog/a-level-revision-guide-2026" },
  ]),
];

const subjects = [
  { name: "Maths", text: "Past papers, mistakes notebook, ExamSolutions for stuck topics. One full paper a week minimum in the final month." },
  { name: "Further Maths", text: "Specification has more depth than breadth - know every type of question, not every textbook example. Past papers daily in the final 3 weeks." },
  { name: "Biology", text: "Spec-point flashcards, 6-markers and 9-markers separately. Required practicals revisited in the final week." },
  { name: "Chemistry", text: "Mechanisms first, then synoptic. Multi-step calculations daily. The synoptic paper is where most students lose marks." },
  { name: "Physics", text: "Equation triangles, derivations, and unit checks. One past paper a week from week 1, three a week in the final month." },
  { name: "History", text: "Essay plans daily, full essays weekly. Source-evaluation as its own skill. Two timed papers in the final 3 weeks." },
  { name: "Geography", text: "Two case studies per topic in proper depth. NEA hours don't count towards exam prep - schedule those separately." },
  { name: "Psychology", text: "AO1/AO2/AO3 explicitly for every topic. 16-markers weekly, marked against the scheme. Don't skip research methods - it's 25% of the paper." },
  { name: "Economics", text: "Diagrams from memory. Evaluation as its own skill. Data response and essay papers weekly in the final month." },
  { name: "English Literature", text: "Theme + character + context grids per text. Comparative essays weekly. Critical theory citations in your back pocket for A* answers." },
];

export default function BlogALevelRevisionGuide() {
  useEffect(() => {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <>
      <SeoHead
        type="article"
        title="A-Level Revision Guide 2026 - How to Revise for Every Subject"
        description="A 2026 A-level revision guide - subject-by-subject revision techniques, how many hours to do, and a free A-level revision timetable template."
        path="/blog/a-level-revision-guide-2026"
        jsonLd={jsonLd}
        alternateLocales={["en-GB"]}
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
              - A-Level Revision · Updated June 2026
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              The 2026 <span className="text-primary">A-Level Revision Guide</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Every subject, what actually works at A-level, and how to build a revision timetable you'll stick to.
            </p>
          </motion.header>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold mb-4">A-level is different from GCSE</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Three subjects, not eleven. Longer questions. Synoptic content that crosses topics. The students who treat A-level like big-GCSE are the ones who underperform.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The three habits that move grades: <strong className="text-foreground">past papers, marked against the scheme, weekly</strong>. Everything else is decoration.
            </p>
            <p className="text-muted-foreground mt-4">
              Start with a plan -{" "}
              <Link to="/revision-timetable" className="text-primary hover:underline">build your A-level revision timetable here</Link>{" "}
              or grab the{" "}
              <Link to="/templates/revision-timetable-template" className="text-primary hover:underline">free template</Link>.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold mb-6">Subject-by-subject</h2>
            <div className="space-y-6">
              {subjects.map((s) => (
                <div key={s.name} className="border-l-2 border-primary pl-4">
                  <h3 className="font-serif text-xl font-bold mb-1">{s.name}</h3>
                  <p className="text-muted-foreground leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold mt-8 mb-4">Hours and pacing</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Three to five focused hours a day in the 8 weeks before the first paper. 50-minute blocks. Two short breaks and one long break (lunch) each day. Sundays for review, not new content.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              In the final 2 weeks, drop new content entirely. Past papers, mark schemes, and your mistakes notebook.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold mt-8 mb-6">Frequently asked</h2>
            <Accordion type="single" collapsible className="w-full">
              {faq.map((f, i) => (
                <AccordionItem key={f.q} value={`item-${i}`}>
                  <AccordionTrigger className="font-serif text-lg text-left">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          <div className="border-t border-border pt-10 mt-10 text-center">
            <p className="font-serif text-2xl font-bold mb-4">Build the timetable first</p>
            <p className="text-muted-foreground mb-6">Notebook Archive ships A-level starter timetables free. Five minutes to set up.</p>
            <Link to={CTA} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition">
              Open my A-level timetable
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </article>

        <Footer />
      </div>
    </>
  );
}
