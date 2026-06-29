import { useEffect } from "react";
import { Link } from "react-router-dom";
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
import heroAsset from "@/assets/blog/hero-gcse.jpg.asset.json";
import {
  BlogHero,
  BlogCallout,
  BlogPullQuote,
  BlogStatGrid,
  BlogKeyTakeaways,
  BlogCompareTable,
  BlogSteps,
  BlogDivider,
} from "@/components/blog/BlogVisuals";

const REF = "blog-gcse-revision-guide";
const CTA = `/auth?ref=${REF}&utm_source=blog&utm_medium=organic&utm_campaign=gcse-revision-guide`;

const faq = [
  { q: "How many hours of revision a day for GCSE?", a: "Two to four focused hours a day in the final 8-10 weeks is plenty for most students. Split into 45-minute blocks with 10-15 minute breaks. Six unfocused hours is worth less than three deliberate ones." },
  { q: "When should I start revising for GCSEs?", a: "Eight to twelve weeks before your first exam is the sweet spot. Earlier is fine for content-heavy subjects (sciences, history); shorter is risky and forces you to skip past papers, which is the most expensive thing to cut." },
  { q: "What's the best way to revise for GCSE English?", a: "Active recall on quotes, past-paper essay plans (not full essays), and one full mock under timed conditions each week of the final month. Re-reading the texts is the lowest-yield way to spend the time." },
  { q: "How do I revise for GCSE maths?", a: "Past papers, by topic, then by year. Mark them yourself. Keep a 'mistakes notebook' and re-do the wrong questions a week later. Worked-solution videos for anything you keep getting wrong - Corbettmaths and Maths Genie are the standards." },
  { q: "How do I revise for GCSE history?", a: "Flashcards for dates and people. Past-paper exam questions for structure. One full practice paper per topic in the final three weeks - timed. The 16-mark questions are usually where grade boundaries shift." },
  { q: "Is BBC Bitesize enough for GCSE revision?", a: "It's a fine starting point for content; not enough on its own. Pair it with past papers and active recall - those are what move marks. Bitesize for the first read, past papers for the last six weeks." },
  { q: "What's the best time of day to revise?", a: "Whatever time you can do consistently. Mornings get cited because cortisol is high and the house is quiet, but a 7pm-9pm session you actually do beats a 6am session you skip three days a week." },
  { q: "Do flashcards actually work for GCSE?", a: "Yes - for definitions, dates, formulas, and vocabulary. They don't work for essay structure or multi-step problem solving. Use Anki or paper, not Quizlet's matching games, which feel productive but barely move recall." },
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
    image: `https://notebookarchive.lovable.app${heroAsset.url}`,
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
  { name: "English Language", text: "Quote flashcards, two past-paper essays a week, and a mark scheme review every Sunday. Question 5 (the long writing task) is where most marks live - drill it weekly under timed conditions and your grade rises faster than any other intervention." },
  { name: "English Literature", text: "Themes, characters, context - one A4 sheet per text. Past-paper essay plans, not full essays, until the final 4 weeks. Memorise 8-10 quotes per text rather than 30 you only half know. Examiners reward precise, well-chosen evidence." },
  { name: "Maths", text: "Past papers by topic in weeks 1-4, by year in weeks 5-8. A 'mistakes notebook' you re-do weekly is the single biggest mark-mover - 90% of dropped marks at GCSE come from the same handful of errors repeating." },
  { name: "Biology", text: "Required practicals are the surprise hit - know the method, variables, expected results, and graphs. Flashcards for definitions, past papers for application. The 6-markers are essentially small essays; plan three points before writing." },
  { name: "Chemistry", text: "Equations and units first - you'll lose easy marks for unit slips. Past-paper 6-markers separately; they're a different exam skill. Ionic equations, mole calculations, and required practicals are the perennial problem areas." },
  { name: "Physics", text: "Equation triangles for every formula on the equation sheet. Past-paper calculation questions, every day in the final 3 weeks. Practicals same as biology. Don't skip the 'explain' questions - they're usually 4 marks each and predictably structured." },
  { name: "History", text: "Dates and people on flashcards. Source-evaluation past papers. One full timed paper per topic in the final 3 weeks. Knowing two case studies in depth beats knowing five vaguely - examiners reward specificity, not coverage." },
  { name: "Geography", text: "Case studies are the make-or-break. Learn 2 per topic in proper detail, not 5 vaguely. Past-paper 9-markers, three a week. The fieldwork paper is where students under-prepare most - rehearse your investigation in advance." },
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
        image={heroAsset.url}
        jsonLd={jsonLd}
        alternateLocales={["en-GB"]}
      />
      <div className="min-h-screen bg-background text-foreground">
        <PageHeader />

        <article className="max-w-3xl mx-auto px-6 pt-32 pb-20">
          <header
            
            
            
            className="mb-10"
          >
            <p className="text-sm uppercase tracking-widest text-accent font-semibold mb-4">
              GCSE Revision · Updated June 2026 · 9 min read
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              The 2026 <span className="text-primary">GCSE Revision Guide</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Every subject, what actually works, and how many hours to do. Plus a
              free revision timetable you can copy in one click - and the handful
              of habits that separate a comfortable 7 from a stressed 5.
            </p>
          </header>

          <BlogHero
            src={heroAsset.url}
            alt="A student desk with an open notebook containing a six-week GCSE revision timetable, surrounded by textbooks and a coffee mug."
            caption="The single highest-leverage revision tool is a timetable you actually keep."
          />

          <BlogKeyTakeaways
            points={[
              "Start 8-12 weeks out. Sooner for content-heavy subjects (sciences, history).",
              "Past papers, marked against the scheme, are the only thing that consistently moves grades.",
              "Two to four focused hours a day beats six unfocused ones, every time.",
              "One rest day a week isn't slacking - it's the reason the other six work.",
              "A mistakes notebook is the cheapest grade you'll buy.",
            ]}
          />

          <section className="mb-12">
            <h2 className="font-serif text-3xl font-bold mt-4 mb-4">The three things that move marks</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You can spend a hundred hours on revision and still walk into the exam
              under-prepared. The students who jump grades in the final term aren't
              the ones doing the most - they're the ones doing the right three things,
              consistently, for eight weeks.
            </p>
            <BlogSteps
              steps={[
                {
                  title: "Past papers under timed conditions",
                  body: (
                    <p>
                      Nothing else gets close. Past papers expose what the examiner actually
                      asks, train your timing, and surface the gaps that revision
                      guides paper over. From the second week onwards, every Sunday
                      should be a paper.
                    </p>
                  ),
                },
                {
                  title: "Active recall, not re-reading",
                  body: (
                    <p>
                      Flashcards, blurting, self-testing - anything that forces your
                      brain to retrieve. Re-reading notes is comfortable but
                      <em> almost useless</em> as a memory technique. If you're
                      highlighting more than you're reciting, you're studying wrong.
                    </p>
                  ),
                },
                {
                  title: "A timetable you stick to",
                  body: (
                    <p>
                      Three boring hours a day for ten weeks beats ten heroic hours
                      the week before. A schedule removes the daily question
                      "what should I do now?" - which is where most revision time
                      quietly leaks away.
                    </p>
                  ),
                },
              ]}
            />
            <BlogCallout title="Build the timetable first">
              It's the cheapest mark-mover you'll ever do.{" "}
              <Link to="/revision-timetable" className="text-primary underline underline-offset-2 hover:text-primary/80">
                Use our free revision timetable maker
              </Link>{" "}
              or copy our{" "}
              <Link to="/templates/revision-timetable-template" className="text-primary underline underline-offset-2 hover:text-primary/80">
                free template
              </Link>{" "}
              both pre-set for typical 11-subject GCSE loads.
            </BlogCallout>
          </section>

          <BlogDivider />

          <section className="mb-12">
            <h2 className="font-serif text-3xl font-bold mb-2">Subject-by-subject</h2>
            <p className="text-muted-foreground mb-6">
              The mechanics differ. The principles - past papers, active recall,
              timed practice - stay the same. Treat the notes below as the
              high-leverage move in each subject, not the whole strategy.
            </p>
            <div className="space-y-6">
              {subjects.map((s) => (
                <div key={s.name} className="border-l-2 border-primary pl-5 py-1">
                  <h3 className="font-serif text-xl font-bold mb-1.5">{s.name}</h3>
                  <p className="text-muted-foreground leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>
          </section>

          <BlogPullQuote cite="Examiner principal's report, common refrain across boards">
            Students who consistently practise full past papers under timed conditions
            outperform those who do twice the volume of unstructured revision.
          </BlogPullQuote>

          <section className="mb-12">
            <h2 className="font-serif text-3xl font-bold mt-8 mb-4">How many hours a day?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Two to four focused hours a day in the final 8-10 weeks. Split into 45-minute
              blocks. A rest day each week isn't a luxury - it's why the other six days work.
              In the final two weeks, ramp to 4-6 hours but keep the breaks. The students
              who burn out always cut the breaks first.
            </p>
            <BlogStatGrid
              stats={[
                { value: "8-12", label: "Weeks out", sub: "When to start" },
                { value: "45 min", label: "Focus block", sub: "Then 10-15 min off" },
                { value: "1", label: "Rest day per week", sub: "Non-negotiable" },
              ]}
            />
          </section>

          <BlogDivider />

          <section className="mb-12">
            <h2 className="font-serif text-3xl font-bold mb-4">A six-week shape that works</h2>
            <BlogCompareTable
              headers={["Week", "Focus", "What to do"]}
              rows={[
                ["Week 6", "Diagnostic", "One past paper per priority subject. Untimed. Mark them honestly."],
                ["Week 5", "Weak topics", "Flashcards + targeted questions on the 5 weakest topics."],
                ["Week 4", "Content rotation", "All subjects in rotation. 45-min blocks, mixed timing."],
                ["Week 3", "Mixed practice", "1 timed paper. Continue rotation. Start mark-scheme reviews."],
                ["Week 2", "Timed practice", "3 timed papers across the week. Mistakes notebook to bed."],
                ["Week 1", "Sleep + review", "Light review only. 8 hours sleep, every night."],
              ]}
              caption="A workable shape - shift the dates, not the structure."
            />
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-3xl font-bold mt-8 mb-6">Frequently asked</h2>
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
            <p className="text-muted-foreground mb-6">
              Notebook Archive's revision planner is free. Pick a GCSE starter, drop
              in your exam dates, and you're done in five minutes.
            </p>
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
