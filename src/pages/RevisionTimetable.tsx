import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SeoHead } from "@/components/SeoHead";
import { breadcrumbsJsonLd } from "@/lib/seo-breadcrumbs";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const REF = "revision-timetable-tool";
const CTA = `/auth?ref=${REF}&utm_source=tool&utm_medium=organic&utm_campaign=revision-timetable`;

const faq = [
  {
    q: "How do I make a revision timetable?",
    a: "List every subject and exam date, count the weeks you have, and block each subject into recurring 45-60 minute slots across the week. Keep one full rest day, give past-paper practice its own slot, and review every Sunday. The full step-by-step is in our revision timetable guide.",
  },
  {
    q: "Is your revision timetable maker free?",
    a: "Yes. The revision timetable maker is part of the free Notebook Archive plan. No credit card needed.",
  },
  {
    q: "Does it work for GCSE and A-level?",
    a: "Yes. We ship GCSE and A-level starter timetables you can copy in one click - then adjust slot length, subjects, and rest days to your exam dates.",
  },
  {
    q: "Can I download my revision timetable?",
    a: "Yes. Every timetable exports to PDF or markdown so you can print it or back it up outside the app.",
  },
  {
    q: "How is it different from a Google Sheets revision timetable?",
    a: "Google Sheets is fine for the grid - but it can't time your sessions, track real vs planned hours, or hold the notes you take during them. Our timetable lives next to your actual revision notes, so the plan and the work are the same thing.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Notebook Archive Revision Timetable Maker",
    operatingSystem: "Web, iOS, Android",
    applicationCategory: "EducationalApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
  },
  {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to make a revision timetable",
    step: [
      { "@type": "HowToStep", name: "List subjects and exam dates" },
      { "@type": "HowToStep", name: "Count the weeks you have" },
      { "@type": "HowToStep", name: "Block subjects into recurring slots" },
      { "@type": "HowToStep", name: "Add a past-papers slot" },
      { "@type": "HowToStep", name: "Hold a Sunday review" },
    ],
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
  breadcrumbsJsonLd([{ name: "Revision Timetable", path: "/revision-timetable" }]),
];

export default function RevisionTimetable() {
  useEffect(() => {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <>
      <SeoHead
        title="Revision Timetable Maker - Free GCSE & A-Level Planner"
        description="Build a GCSE or A-level revision timetable in minutes. Free maker with starter templates, past-paper slots, Pomodoro timer, and a weekly review."
        path="/revision-timetable"
        jsonLd={jsonLd}
        alternateLocales={["en-GB", "en-AU", "en-US"]}
      />
      <div className="min-h-screen bg-background text-foreground">
        <PageHeader />

        <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-14 text-center"
          >
            <p className="text-sm uppercase tracking-widest text-accent font-semibold mb-4">
              - Free · GCSE & A-Level
            </p>
            <h1 className="font-serif text-4xl md:text-6xl font-bold leading-tight mb-6">
              Revision <span className="text-primary">Timetable Maker</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
              Build a revision timetable in under five minutes. Pick a starter template, drop in your subjects and exam dates, and you're done. Free. No spreadsheet rage.
            </p>
            <Link
              to={CTA}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Build my revision timetable
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-xs text-muted-foreground mt-3">Free forever. No credit card.</p>
          </motion.header>

          <section className="mb-16">
            <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">Pick your starter</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-border rounded-xl p-6 bg-card">
                <h3 className="font-serif text-xl font-bold mb-2">GCSE revision timetable</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Built around 9-11 subjects across 8-12 weeks. 45-minute slots, rotating subjects, past-paper Saturdays.
                </p>
                <Link to={CTA} className="text-sm text-primary font-semibold hover:underline inline-flex items-center gap-1">
                  Use GCSE starter <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="border border-border rounded-xl p-6 bg-card">
                <h3 className="font-serif text-xl font-bold mb-2">A-level revision timetable</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  3-4 subjects, longer 60-minute blocks, heavier on past papers in the final three weeks. Suited to Year 13.
                </p>
                <Link to={CTA} className="text-sm text-primary font-semibold hover:underline inline-flex items-center gap-1">
                  Use A-level starter <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">Why this beats a spreadsheet</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li>• <strong className="text-foreground">Sessions live next to notes.</strong> Open a slot, your revision notes are right there.</li>
              <li>• <strong className="text-foreground">Real hours, not planned hours.</strong> Tick off slots; the weekly chart shows what you actually did.</li>
              <li>• <strong className="text-foreground">Past-paper tracking.</strong> Separate slot, separate streak, separate reminder.</li>
              <li>• <strong className="text-foreground">Phone + laptop.</strong> Tick a Tuesday slot from your phone on the bus.</li>
              <li>• <strong className="text-foreground">Export to PDF or markdown</strong> if you want to print it for the wall.</li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/study-planner" className="text-sm text-primary hover:underline">→ See the full study planner</Link>
              <Link to="/templates/revision-timetable-template" className="text-sm text-primary hover:underline">→ Download a free template</Link>
              <Link to="/blog/gcse-revision-guide-2026" className="text-sm text-primary hover:underline">→ GCSE revision guide</Link>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">Frequently asked</h2>
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
            <p className="font-serif text-2xl font-bold mb-4">Stop replanning. Start revising.</p>
            <Link to={CTA} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition">
              Build my revision timetable
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
