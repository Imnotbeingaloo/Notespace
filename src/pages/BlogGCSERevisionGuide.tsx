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

const REF = "blog-gcse-revision-guide";
const CTA = `/auth?ref=${REF}&utm_source=blog&utm_medium=organic&utm_campaign=gcse-revision-guide`;

const faq = [
  { q: "How many hours of revision a day for GCSE?", a: "Two to four focused hours a day in the final 8-10 weeks is plenty for most students. Split into 45-minute blocks with 10-15 minute breaks. Six unfocused hours is worth less than three deliberate ones." },
  { q: "When should I start revising for GCSEs?", a: "Eight to twelve weeks before your first exam is the sweet spot. Earlier is fine for content-heavy subjects (sciences, history) - shorter is risky." },
  { q: "What's the best way to revise for GCSE English?", a: "Active recall on quotes, past-paper essay plans, and one full mock under timed conditions each week of the final month. Re-reading the texts is the lowest-yield way to spend the time." },
  { q: "How do I revise for GCSE maths?", a: "Past papers, by topic, then by year. Mark them yourself. Keep a 'mistakes notebook' and re-do the wrong questions a week later. Worked-solution videos for anything you keep getting wrong." },
  { q: "How do I revise for GCSE history?", a: "Flashcards for dates and people. Past-paper exam questions for structure. One full practice paper per topic in the final three weeks - timed." },
  { q: "Is BBC Bitesize enough for GCSE revision?", a: "It's a fine starting point for content, not enough on its own. Pair it with past papers and active recall - those are what move marks." },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "GCSE Revision Guide 2026 - How to Revise for Every Subject",
    description:
      "A practical GCSE revision guide for 2026 - subject-by-subject techniques, how many hours to do, and a free revision timetable you can copy.",
    datePublished: "2026-06-28",
    dateModified: "2026-06-28",
    author: { "@type": "Organization", name: "Notebook Archive" },
    publisher: { "@type": "Organization", name: "Notebook Archive" },
    mainEntityOfPage: "https://notebookarchive.lovable.app/blog/gcse-revision-guide-2026",
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
    { name: "GCSE Revision Guide 2026", path: "/blog/gcse-revision-guide-2026" },
  ]),
];

const subjects = [
  { name: "English Language", text: "Quote flashcards, two past-paper essays a week, and a mark scheme review every Sunday. Question 5 is where most marks live - drill it." },
  { name: "English Literature", text: "Themes, characters, context - one A4 sheet per text. Past-paper essay plans, not full essays. Timed essays only in the final 4 weeks." },
  { name: "Maths", text: "Past papers by topic in weeks 1-4, by year in weeks 5-8. A 'mistakes notebook' you re-do weekly is the single biggest mark-mover." },
  { name: "Biology", text: "Required practicals are the surprise hit - know the method, variables, and graphs. Flashcards for definitions, past papers for application." },
  { name: "Chemistry", text: "Equations and units first - you'll lose marks for unit slips. Past-paper 6-markers separately; they're a different exam-skill." },
  { name: "Physics", text: "Equation triangles for every formula. Past-paper calculation questions, every day in the final 3 weeks. Practicals same as biology." },
  { name: "History", text: "Dates and people on flashcards. Source-evaluation past papers. One full timed paper per topic in the final 3 weeks." },
  { name: "Geography", text: "Case studies are the make-or-break - learn 2 per topic in detail, not 5 vaguely. Past-paper 9-markers, three a week." },
];

export default function BlogGCSERevisionGuide() {
  useEffect(() => {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <>
      <SeoHead
        type="article"
        title="GCSE Revision Guide 2026 - How to Revise for Every Subject"
        description="A practical 2026 GCSE revision guide - subject-by-subject techniques, how many hours to do, and a free revision timetable you can copy in one click."
        path="/blog/gcse-revision-guide-2026"
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
              - GCSE Revision · Updated June 2026
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              The 2026 <span className="text-primary">GCSE Revision Guide</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Every subject, what actually works, and how many hours to do. Plus a free revision timetable you can copy in one click.
            </p>
          </motion.header>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold mt-4 mb-4">The three things that move marks</h2>
            <ol className="space-y-3 text-muted-foreground list-decimal pl-5">
              <li><strong className="text-foreground">Past papers under timed conditions.</strong> Nothing else gets close.</li>
              <li><strong className="text-foreground">Active recall</strong> - flashcards, blurting, self-testing. Re-reading is comfortable but useless.</li>
              <li><strong className="text-foreground">A timetable you stick to.</strong> Three boring hours a day for ten weeks beats ten heroic hours the week before.</li>
            </ol>
            <p className="text-muted-foreground mt-4">
              Build the timetable first - it's the cheapest mark-mover you'll ever do.{" "}
              <Link to="/revision-timetable" className="text-primary hover:underline">Use our free revision timetable maker</Link>{" "}
              or copy our{" "}
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
            <h2 className="font-serif text-2xl font-bold mt-8 mb-4">How many hours a day?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Two to four focused hours a day in the final 8-10 weeks. Split into 45-minute blocks. A rest day each week is not a luxury - it's why the other six days work.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              In the final two weeks, ramp to 4-6 hours but keep the breaks. The students who burn out always cut the breaks first.
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
            <p className="font-serif text-2xl font-bold mb-4">Start with the timetable</p>
            <p className="text-muted-foreground mb-6">Notebook Archive's revision planner is free. Pick a GCSE starter and you're done in five minutes.</p>
            <Link to={CTA} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition">
              Open my GCSE timetable
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </article>

        <Footer />
      </div>
    </>
  );
}
