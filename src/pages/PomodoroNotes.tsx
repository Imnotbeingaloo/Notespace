import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Timer, BookOpen, Sparkles, GraduationCap, CheckCircle2, Zap } from "lucide-react";
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

const REF = "pomodoro-notes-tool";
const CTA = `/auth?ref=${REF}&utm_source=tool&utm_medium=organic&utm_campaign=pomodoro-notes`;

const faq = [
  {
    q: "What is a Pomodoro app with notes?",
    a: "A Pomodoro app combines a 25-minute focus timer with short breaks. The 'with notes' part means the timer lives next to your notes - so the work you're doing in each Pomodoro is captured in the same place you're focusing.",
  },
  {
    q: "Is the Pomodoro timer free?",
    a: "Yes - the built-in Pomodoro timer is included on the free plan, with unlimited sessions, customizable interval lengths, and a weekly focus chart.",
  },
  {
    q: "Why use Pomodoro inside a note-taking app instead of a separate timer?",
    a: "Tab-switching kills focus. When your timer, notes, and tasks live in one app, you start a session and stay in it - no Pomofocus tab, no calendar tab, no Notion tab. One window, one job.",
  },
  {
    q: "Is this a good note-taking app for students?",
    a: "Yes. Notebook Archive is built for students: subject notebooks, AI explanations of tricky topics, a study planner, revision timetable, past-paper tracker, and the Pomodoro timer - all on the free plan.",
  },
  {
    q: "Can I customize the Pomodoro intervals?",
    a: "Yes. Default is 25/5, but you can switch to 50/10 deep-work blocks or any custom pair. Long breaks every 4 sessions are on by default.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Notebook Archive - Pomodoro Timer + Notes",
    operatingSystem: "Web, iOS, Android",
    applicationCategory: "EducationalApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", ratingCount: "120" },
  },
  {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use a Pomodoro timer with notes",
    step: [
      { "@type": "HowToStep", name: "Open your subject notebook", text: "Pick the topic you're working on." },
      { "@type": "HowToStep", name: "Start a 25-minute Pomodoro", text: "Hit the timer button in the toolbar - it docks to the corner." },
      { "@type": "HowToStep", name: "Take notes as you focus", text: "When the bell rings, take a 5-minute break. After 4 cycles, take a long one." },
      { "@type": "HowToStep", name: "Review your focus chart", text: "Sunday review shows total focused hours per subject." },
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
  breadcrumbsJsonLd([{ name: "Pomodoro Timer + Notes", path: "/pomodoro-notes" }]),
];

export default function PomodoroNotes() {
  useEffect(() => {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <>
      <SeoHead
        title="Pomodoro App + Notes in One Place - Free for Students"
        description="A free Pomodoro app built into a note-taking app for students. 25-minute timer, focus chart, and your notes in one window. No tab-switching."
        path="/pomodoro-notes"
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
              - Pomodoro App + Notes
            </p>
            <h1 className="font-serif text-4xl md:text-6xl font-bold leading-tight mb-6">
              A <span className="text-primary">Pomodoro Timer</span> Built Into Your Notes
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
              Every other Pomodoro app lives in a separate tab. This one lives where your notes already are - so you start a session, stay in it, and have something to show at the end.
            </p>
            <Link
              to={CTA}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Start your first Pomodoro free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-xs text-muted-foreground mt-3">No credit card. Works on free plan.</p>
          </motion.header>

          <section className="mb-16 border border-border rounded-2xl p-8 bg-card">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="h-5 w-5 text-primary" />
              <h2 className="font-serif text-2xl md:text-3xl font-bold">Built-in Pomodoro timer + notes in one place</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You don't need pomofocus.io <em>and</em> Notion <em>and</em> a separate timer tab. Open your notebook, hit the timer, write. When the bell rings you've already got a page of notes - not just a logged session.
            </p>
            <ul className="grid sm:grid-cols-2 gap-3 text-sm">
              {[
                "25/5 default, 50/10 deep-work, or custom",
                "Long break every 4 cycles",
                "Per-subject focus chart",
                "Works on phone, tablet, laptop",
                "Sound + browser notification on bell",
                "Stays running if you switch notes",
              ].map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="grid md:grid-cols-2 gap-6 mb-16">
            {[
              { icon: Timer, title: "One-click Pomodoro", text: "The timer docks to the corner of any note. No new tab, no extension, no losing your place." },
              { icon: BookOpen, title: "Notes that survive the session", text: "Pomodoro tracks the time. Your notebook keeps the output. At the end of the week you can see both." },
              { icon: GraduationCap, title: "Built for students", text: "Subject notebooks, past-paper slots, AI-explain, revision timetable - the full study stack, free." },
              { icon: Sparkles, title: "AI-explain mid-session", text: "Highlight a tricky line, hit explain. Inline answer in 2 seconds. No tab-switching, no breaking focus." },
            ].map((f) => (
              <div key={f.title} className="border border-border rounded-xl p-6 bg-card">
                <f.icon className="h-5 w-5 text-primary mb-3" />
                <h3 className="font-serif text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.text}</p>
              </div>
            ))}
          </section>

          <section className="mb-16">
            <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">The best note taking app for students who use Pomodoro</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Pomodoro on its own is a timer. What students actually need is a timer <strong className="text-foreground">plus</strong> the notebook, the planner, the past-paper tracker, and somewhere to ask "what does this mean?" without leaving the page. That's the whole point of Notebook Archive.
            </p>
            <ol className="space-y-3 text-muted-foreground">
              <li><strong className="text-foreground">1. Open the subject you're revising.</strong> Biology, Maths, History - one notebook each.</li>
              <li><strong className="text-foreground">2. Start a 25-minute Pomodoro.</strong> The timer pins to the corner. Write as you go.</li>
              <li><strong className="text-foreground">3. Stuck? Highlight + AI-explain.</strong> Answer appears beside your notes. Timer keeps running.</li>
              <li><strong className="text-foreground">4. Bell rings. Take 5.</strong> The notebook saves itself.</li>
              <li><strong className="text-foreground">5. Sunday review.</strong> Focus chart shows hours per subject. Adjust next week's timetable.</li>
            </ol>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/study-planner" className="text-sm text-primary hover:underline">- Study planner</Link>
              <Link to="/revision-timetable" className="text-sm text-primary hover:underline">- Revision timetable maker</Link>
              <Link to="/blog/ai-note-taking-app-for-students" className="text-sm text-primary hover:underline">- AI note-taking app for students</Link>
              <Link to="/blog/best-note-taking-app-2026" className="text-sm text-primary hover:underline">- Best note-taking app 2026</Link>
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
            <p className="font-serif text-2xl font-bold mb-4">One timer, one notebook, one window</p>
            <Link to={CTA} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition">
              Start your first Pomodoro
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
