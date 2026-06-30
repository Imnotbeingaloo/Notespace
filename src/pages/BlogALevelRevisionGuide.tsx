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
import heroAsset from "@/assets/blog/hero-alevel.jpg.asset.json";
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
import { Callout } from "@/components/blog/Callout";

const REF = "blog-a-level-revision-guide";
const CTA = `/auth?ref=${REF}&utm_source=blog&utm_medium=organic&utm_campaign=a-level-revision-guide`;

const faq = [
  { q: "How many hours of revision a day for A-levels?", a: "Three to five focused hours a day in the final 8 weeks, split into 50-minute blocks. Quality beats hours - five deliberate hours beats eight unfocused ones." },
  { q: "How to revise for A-level maths?", a: "Past papers by topic, then by year. Keep a mistakes notebook. ExamSolutions and Physics & Maths Tutor for any topic that won't click. In the final month, one full paper a week minimum." },
  { q: "How to revise for A-level biology?", a: "Spec-point flashcards (every dot point) plus past-paper 6 and 9-markers. The 9-markers are where the grade boundaries get decided. Required practicals get under-revised; don't skip them." },
  { q: "How to revise for A-level chemistry?", a: "Mechanisms first, then synoptic application. Past-paper multi-step calculations daily in the final month. Mark schemes ruthlessly - chemistry mark schemes reward very specific wording." },
  { q: "How to revise for A-level history?", a: "Essay plans, not essays. One essay plan a day on a different question. Two full timed essays a week in the final month. Memorise specific dates, statistics, and historians' names - vagueness loses marks." },
  { q: "How to revise for A-level psychology?", a: "AO1/AO2/AO3 breakdown on every topic. Practice 16-markers weekly - mark them against the scheme. Studies and key terms on flashcards. Research methods is 25% of the paper and the easiest to revise." },
  { q: "How to revise for A-level economics?", a: "Diagrams from memory. Evaluation paragraphs in your sleep. Data response and essay past papers, weekly, in the final month. Real-world examples - keep a running document of news stories tied to syllabus topics." },
  { q: "Is the jump from GCSE to A-level really that big?", a: "Yes. Questions are longer, synoptic (cross-topic), and reward depth over coverage. The students who underperform tend to revise like it's GCSE - notes summary, light flashcards. The students who do well live in past papers from week one." },
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
    { name: "A-Level Revision Guide 2026", path: "/blog/a-level-revision-guide-2026" },
  ]),
];

const subjects = [
  { name: "Maths", text: "Past papers, mistakes notebook, ExamSolutions for stuck topics. One full paper a week minimum in the final month. The C-grade students who jump to A* almost always do it through volume of past-paper questions, not new content." },
  { name: "Further Maths", text: "The specification rewards depth, not breadth. Know every type of question rather than every textbook example. Past papers daily in the final 3 weeks. The mechanics and statistics options are usually where students leak marks." },
  { name: "Biology", text: "Spec-point flashcards, 6-markers and 9-markers as separate practice. Required practicals revisited in the final week. The synoptic paper rewards making links across modules - actively practice that, don't just hope it happens." },
  { name: "Chemistry", text: "Mechanisms first, then synoptic. Multi-step calculations daily. The synoptic paper is where most students lose marks - usually because they revised modules in isolation. In the final month, mix questions across topics deliberately." },
  { name: "Physics", text: "Equation triangles, derivations, and unit checks. One past paper a week from week one, three a week in the final month. The 'explain' questions are predictably structured - learn the markscheme phrases verbatim." },
  { name: "History", text: "Essay plans daily, full essays weekly. Source-evaluation as its own skill - it doesn't improve by accident. Two timed papers in the final 3 weeks. Specific historian names and statistics separate A from B answers." },
  { name: "Geography", text: "Two case studies per topic in proper depth. NEA hours don't count towards exam prep - schedule those separately. The synoptic paper rewards connecting human and physical geography; practise that explicitly." },
  { name: "Psychology", text: "AO1/AO2/AO3 explicitly tagged on every topic. 16-markers weekly, marked against the scheme. Don't skip research methods - it's 25% of the paper and the most learnable section." },
  { name: "Economics", text: "Diagrams from memory. Evaluation as its own skill - 'this is good but it depends on X' is the entry point to top marks. Data response and essay papers weekly in the final month." },
  { name: "English Literature", text: "Theme + character + context grids per text. Comparative essays weekly. Critical theory citations in your back pocket for A* answers. Examiners notice the difference between 'in my opinion' and 'as Eagleton argues'." },
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
        image={heroAsset.url}
        jsonLd={jsonLd}
        alternateLocales={["en-GB"]}
      />
      <div className="min-h-screen bg-background text-foreground">
        <PageHeader />

        <article className="blog-article max-w-3xl mx-auto px-6 pt-32 pb-24">
          <header
            
            
            
            className="mb-10"
          >
            <p className="text-sm uppercase tracking-widest text-accent font-semibold mb-4">
              A-Level Revision · Updated June 2026 · 10 min read
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              The 2026 <span className="text-primary">A-Level Revision Guide</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Every subject, what actually works at A-level, and how to build a
              revision timetable you'll stick to. A-level is not big-GCSE - the
              students who treat it that way are the ones who underperform.
            </p>
          </header>

          <BlogHero
            src={heroAsset.url}
            alt="A-level study spread with chemistry mechanisms, maths past-paper working, history essay plans, and flashcards."
            caption="Three subjects, three styles of revision. Don't borrow the GCSE template."
          />

          <BlogKeyTakeaways
            points={[
              "A-level rewards depth over coverage. One past paper, fully reviewed, beats five skimmed.",
              "Start 8 weeks out for a full revision arc; 12 weeks for content-heavy subjects.",
              "Synoptic questions are the grade-decider - revise across topics, not module by module.",
              "Three to five focused hours a day. Past papers, marked against the scheme, weekly.",
              "Drop new content in the final fortnight. Past papers, mistakes notebook, sleep.",
            ]}
          />

          <section className="mb-12">
            <h2 className="font-serif text-3xl font-bold mt-4 mb-4">A-level is different from GCSE</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Three subjects, not eleven. Longer questions. Synoptic content that
              crosses topics. The students who treat A-level like big-GCSE are the
              ones who underperform - it's the most common avoidable mistake in
              sixth form.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The three habits that move grades:{" "}
              <strong className="text-foreground">
                past papers, marked against the scheme, weekly
              </strong>
              . Everything else is decoration. The volume of past-paper work an A*
              candidate does in the final month often surprises B-grade candidates -
              and that gap is where the grade lives.
            </p>
            <BlogCallout title="Start with the plan">
              <Link to="/revision-timetable" className="text-primary underline underline-offset-2 hover:text-primary/80">
                Build your A-level revision timetable here
              </Link>{" "}
              or grab the{" "}
              <Link to="/templates/revision-timetable-template" className="text-primary underline underline-offset-2 hover:text-primary/80">
                free template
              </Link>{" "}
              it accounts for three subjects, synoptic blocks, and a built-in
              rest day so you don't burn out in week four.
            </BlogCallout>
          </section>

          <BlogDivider />

          <section className="mb-12">
            <h2 className="font-serif text-3xl font-bold mb-2">Subject-by-subject</h2>
            <p className="text-muted-foreground mb-6">
              Notes below assume your exams are roughly 8 weeks away. Adjust the
              volume - not the structure - if you have more or less time.
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

          <BlogPullQuote cite="What separates A* from A: the depth of the second paragraph">
            At A-level, the easy marks go to anyone who turns up. The grade
            boundaries are decided by what you write after the obvious point -
            the evaluation, the synoptic link, the counter-argument.
          </BlogPullQuote>

          <section className="mb-12">
            <h2 className="font-serif text-3xl font-bold mt-8 mb-4">Hours and pacing</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Three to five focused hours a day in the 8 weeks before the first
              paper. 50-minute blocks. Two short breaks and one long break (lunch)
              each day. Sundays for review, not new content. In the final 2 weeks,
              drop new content entirely. Past papers, mark schemes, and your
              mistakes notebook.
            </p>
            <BlogStatGrid
              stats={[
                { value: "3-5 hrs", label: "Daily focused work", sub: "8 weeks out" },
                { value: "50 min", label: "Focus block", sub: "Then 10-min walk" },
                { value: "1+ paper", label: "Per subject / week", sub: "Final month" },
              ]}
            />
          </section>

          <BlogDivider />

          <section className="mb-12">
            <h2 className="font-serif text-3xl font-bold mb-4">An 8-week A-level shape</h2>
            <BlogCompareTable
              headers={["Week", "Focus", "Daily move"]}
              rows={[
                ["Week 8", "Diagnostic", "1 past paper per subject. Untimed. Honest marking."],
                ["Week 7", "Weak topics", "Targeted questions on lowest-scoring topics. Mistakes notebook starts."],
                ["Weeks 5-6", "Content rotation", "All three subjects in rotation. Past papers by topic."],
                ["Weeks 3-4", "Synoptic + timed", "1 timed paper per subject per week. Mark scheme review the next day."],
                ["Week 2", "Volume", "2 timed papers across the week. Mistakes notebook every night."],
                ["Week 1", "Sleep + review", "Light review only. 8 hours sleep. Trust the work you've already done."],
              ]}
            />
          </section>

          <section className="mb-12">
            <Callout tone="tip" title="Before you scroll the FAQ">
              If a question below doesn't quite match yours, the answer is usually a combination of two of the points already covered above. Skim the headings first, then come back.
            </Callout>

            <h2 className="font-serif text-3xl font-bold mt-8 mb-6">Frequently asked</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The questions readers ask most often about this topic - answered directly, without the marketing spin.
            </p>
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
            <p className="text-muted-foreground mb-6">
              Notebook Archive ships A-level starter timetables free. Five minutes
              to set up, and the schedule does the remembering for you.
            </p>
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
