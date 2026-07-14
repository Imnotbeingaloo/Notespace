import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CalendarCheck, Clock, Sparkles, Target } from "lucide-react";
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

const REF = "study-planner-tool";
const CTA = `/auth?ref=${REF}&utm_source=tool&utm_medium=organic&utm_campaign=study-planner`;

const faq = [
  {
    q: "What is a study planner?",
    a: "A study planner is a structured schedule that maps every subject and revision task into recurring time slots across your week. It replaces guesswork with a plan you can actually follow, and lets you see at a glance whether you're on track for exams.",
  },
  {
    q: "Is the Notebook Archive study planner free?",
    a: "Yes - the study planner is included on the free plan. You get unlimited sessions, daily and weekly views, and the full revision-timetable template.",
  },
  {
    q: "How is this different from a calendar app?",
    a: "Calendars are for one-off events. The study planner is built around recurring revision blocks, subject rotation, past-paper slots, and a weekly review - the things students actually need but Google Calendar makes painful to set up.",
  },
  {
    q: "Can I use it for GCSEs and A-levels?",
    a: "Yes. The template adapts to both. We ship GCSE and A-level starter timetables you can copy in one click - then tweak slot length, subjects, and rest days to suit your exam dates.",
  },
  {
    q: "Does it work on mobile?",
    a: "Yes. The study planner works on phones, tablets, and laptops. Sessions you tick off on your phone sync instantly to the web app.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Notebook Archive Study Planner",
    operatingSystem: "Web, iOS, Android",
    applicationCategory: "EducationalApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", ratingCount: "120" },
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
  breadcrumbsJsonLd([{ name: "Study Planner", path: "/study-planner" }]),
];

export default function StudyPlanner() {
  useEffect(() => {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <>
      <SeoHead
        title="Study Planner - Build a Revision Timetable That Works"
        description="A free study planner and revision timetable maker for GCSE, A-level, and uni students. Recurring slots, past-paper blocks, and a weekly review - in one notebook."
        path="/study-planner"
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
              - Free Study Planner
            </p>
            <h1 className="font-serif text-4xl md:text-6xl font-bold leading-tight mb-6">
              A <span className="text-primary">Study Planner</span> That Actually Gets Used
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
              Most planners are abandoned by week three. This one isn't - because it lives inside your notebook, knows your subjects, and quietly tracks every session you tick off.
            </p>
            <Link
              to={CTA}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Open the study planner free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-xs text-muted-foreground mt-3">No credit card. Works on free plan.</p>
          </motion.header>

          <section className="grid md:grid-cols-2 gap-6 mb-16">
            {[
              { icon: CalendarCheck, title: "Recurring revision blocks", text: "Set Monday 4-5pm = Biology, Tuesday 4-5pm = Chemistry. The planner repeats it every week without you having to re-enter anything." },
              { icon: Clock, title: "Built-in 50-minute focus blocks", text: "Each session opens a Pomodoro timer. Tick off when done. Your weekly chart updates automatically." },
              { icon: Target, title: "Past-paper slots, separately", text: "Past-paper practice goes in its own slot - not mixed with content revision. It's the single biggest predictor of exam performance." },
              { icon: Sparkles, title: "AI-explain on whatever you're stuck on", text: "Highlight a topic in your notes, hit explain. No tab-switching, no losing your place." },
            ].map((f) => (
              <div key={f.title} className="border border-border rounded-xl p-6 bg-card">
                <f.icon className="h-5 w-5 text-primary mb-3" />
                <h3 className="font-serif text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.text}</p>
              </div>
            ))}
          </section>

          <section className="mb-16">
            <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">How it works</h2>
            <ol className="space-y-4 text-muted-foreground">
              <li><strong className="text-foreground">1. Add your subjects and exam dates.</strong> The planner counts the weeks you actually have.</li>
              <li><strong className="text-foreground">2. Pick a starter timetable.</strong> GCSE, A-level, or blank. Copies in one click.</li>
              <li><strong className="text-foreground">3. Tick sessions off as you finish them.</strong> The weekly chart shows real hours, not planned hours.</li>
              <li><strong className="text-foreground">4. Sunday review.</strong> 30 minutes to adjust next week. The planner suggests what slipped.</li>
            </ol>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/revision-timetable" className="text-sm text-primary hover:underline">→ Revision timetable maker</Link>
              <Link to="/templates/revision-timetable-template" className="text-sm text-primary hover:underline">→ Free revision timetable template</Link>
              <Link to="/blog/how-to-make-a-revision-timetable" className="text-sm text-primary hover:underline">→ How to make a revision timetable</Link>
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
            <p className="font-serif text-2xl font-bold mb-4">Start the term you'll actually finish</p>
            <Link to={CTA} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition">
              Open the study planner
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
