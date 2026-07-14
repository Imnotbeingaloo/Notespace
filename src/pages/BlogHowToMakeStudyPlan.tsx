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
import { BlogFinalCTA } from "@/components/blog/BlogFinalCTA";
import { BlogKeyTakeaways, BlogPullQuote, BlogCallout } from "@/components/blog/BlogVisuals";
import { Callout } from "@/components/blog/Callout";
import { RelatedReading, STUDY_PLANNER_RELATED } from "@/components/RelatedReading";

const REF = "blog-how-to-make-a-study-plan";
const CTA = `/auth?ref=${REF}&utm_source=blog&utm_medium=organic&utm_campaign=how-to-make-a-study-plan`;

const faq = [
  {
    q: "What should a good study plan include?",
    a: "Three things: the subjects you have to cover, the hours you actually have free each week, and a weekly review slot to catch up. Everything else (colour-coding, productivity systems, apps) is optional.",
  },
  {
    q: "How many hours a day should I study?",
    a: "Most students underestimate breaks and overestimate stamina. Two to four focused hours a day - in 50-minute blocks with real breaks - beats six unfocused hours. Quality of attention matters more than total time logged.",
  },
  {
    q: "Is there a free study plan template?",
    a: "Yes - copy the weekly template lower down on this page into any document, or open it as a ready-made note inside Notespace's study planner template.",
  },
  {
    q: "How do I stick to a study plan?",
    a: "Make the plan smaller than feels right, schedule it at the same times each week, and tick sessions off as you finish them. Visible progress is the single biggest reason people keep going.",
  },
  {
    q: "What's the difference between a study plan and a study schedule?",
    a: "A study plan is the strategy (what you'll cover, in what order, by when). A study schedule is the calendar (which day, which time slot, which subject). You need both - the plan tells you why, the schedule tells you when.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to make a study plan",
    description:
      "A simple, repeatable way to build a weekly study plan that you'll actually follow - including a copy-pasteable template.",
    step: [
      { "@type": "HowToStep", name: "List every subject and deadline", text: "Write down every course, exam, and assignment with its date." },
      { "@type": "HowToStep", name: "Count your real available hours", text: "Subtract sleep, classes, commute, meals, and one rest day from your week." },
      { "@type": "HowToStep", name: "Block subjects into fixed time slots", text: "Assign each subject a recurring slot, not a vague 'when I can'." },
      { "@type": "HowToStep", name: "Add a weekly review", text: "Keep one 30-minute slot every week to catch up and re-plan." },
      { "@type": "HowToStep", name: "Track completion, not perfection", text: "Tick sessions off as done. Don't redesign the plan every week." },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How to Make a Study Plan (With a Free Weekly Template)",
    description:
      "A practical, no-fluff guide to building a study plan that survives the semester - including a copy-pasteable weekly template and a study schedule example.",
    datePublished: "2026-06-27",
    dateModified: "2026-06-28",
    author: { "@type": "Organization", name: "Notespace" },
    publisher: { "@type": "Organization", name: "Notespace" },
    mainEntityOfPage: "https://notebookarchive.lovable.app/blog/how-to-make-a-study-plan",
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
    { name: "How to Make a Study Plan (With a Free Weekly Template)", path: "/blog/how-to-make-a-study-plan" },
  ])
];

export default function BlogHowToMakeStudyPlan() {
  useEffect(() => {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <>
      <SeoHead
        type="article"
        title="How to Make a Study Plan (With a Free Weekly Template) - 2026"
        description="A practical guide to building a weekly study plan and study schedule you'll actually follow. Includes a free copy-pasteable template."
        path="/blog/how-to-make-a-study-plan" image="/og/og-how-to-make-a-study-plan.jpg"
        jsonLd={jsonLd}
      />
      <div className="min-h-screen bg-background text-foreground">
        <PageHeader />

        <article className="blog-article max-w-3xl mx-auto px-6 pt-32 pb-24">
          <header
            
            
            
            className="mb-12"
          >
            <p className="text-sm uppercase tracking-widest text-accent font-semibold mb-4">
              Guides · Updated June 2026
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              How to make a <span className="text-primary">study plan</span> (with a free weekly template)
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Most study plans fail because they're built for a fantasy version of you.
              This guide builds one for the real one - including a copy-pasteable
              weekly study schedule you can use today.
            </p>
          </header>

          <BlogKeyTakeaways
            points={[
              "A study plan is a contract with future-you. Make it one you'd actually sign.",
              "Reverse-engineer from the goal, not from the textbook chapters.",
              "Weekly review beats daily perfection. Reset on Sundays, not Mondays.",
              "If your plan has no slack week, it's not a plan - it's a wish.",
            ]}
          />

          <BlogPullQuote cite="What experienced tutors quietly know">
            Every working study plan eventually has to survive a bad week. Build for that week, not the first one.
          </BlogPullQuote>

          <section className="mb-12 space-y-12">
            <div>
              <h2 className="font-serif text-2xl font-bold mb-3">
                The five steps, in order
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                A study plan is only useful if you can still see it on a Tuesday
                in week six. The order below is what survives that test - visibility
                first, real budget second, recurring slots third. Skip a step
                and the plan tends to quietly fall apart somewhere between
                weeks two and four.
              </p>

              <Callout tone="key" title="The whole plan in one sentence">
                Recurring slots at the same time each week, sized for your real
                budget, with one short review to keep them honest. Everything
                else is decoration.
              </Callout>

              <h3 className="font-serif text-lg font-bold mt-6 mb-2">1. List every subject and deadline</h3>
              <p className="text-muted-foreground leading-relaxed">
                Open a single page. Write every course you're taking, every exam date,
                and every assignment due in the next four weeks. Don't sort yet -
                just get the full picture in one place.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Once it's all visible, mark each item with how much work it
                actually still needs - new content, light revision, or just
                final polish. The first list almost always reveals one subject
                you've been quietly avoiding and one you've been over-investing
                in. That alone is worth doing the exercise.
              </p>

              <h3 className="font-serif text-lg font-bold mt-6 mb-2">2. Count your real available hours</h3>
              <p className="text-muted-foreground leading-relaxed">
                A week has 168 hours. Subtract sleep (56), classes, commute, meals,
                and one full rest day. What's left is usually 15-25 hours - the
                actual budget for your study plan. Most plans fail because they
                pretend the budget is double that.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Then take ten to twenty per cent off the top as slack for life -
                a missed train, a flat-mate's birthday, a bad night's sleep.
                A plan with built-in slack survives a bad week; a plan that's
                already 100% allocated turns one missed session into a domino
                effect that ends in starting over.
              </p>

              <h3 className="font-serif text-lg font-bold mt-6 mb-2">3. Block subjects into fixed time slots</h3>
              <p className="text-muted-foreground leading-relaxed">
                Don't write "study chemistry when I have time". Write
                "Chemistry, Mon/Wed/Fri, 4-5:30pm". A study schedule is just a
                study plan with times on it. Recurring slots build the habit;
                vague intentions don't.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Rotate subjects across the week rather than stacking single-subject
                days. Three forty-five minute Chemistry sessions on different
                days beat one two-hour marathon - the spacing is what moves
                information into long-term memory, and the variety keeps the
                week from feeling like the same Tuesday on repeat.
              </p>

              <Callout tone="tip" title="The 50/10 rule">
                Fifty minutes of phone-down work, then a real ten-minute break -
                stand up, drink water, look at something more than two metres
                away. Repeat. Most students try ninety-minute blocks and lose
                the last forty minutes to drift.
              </Callout>

              <h3 className="font-serif text-lg font-bold mt-6 mb-2">4. Add a weekly review</h3>
              <p className="text-muted-foreground leading-relaxed">
                Keep one 30-minute slot every Sunday (or whichever day works) to
                check what got done, what slipped, and what changes next week.
                This single habit is what separates a study plan that lasts a
                semester from one that lasts two weeks.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Keep the review to three short answers in a note - resist the
                urge to redesign the plan from scratch. Small course corrections
                compound; weekly redesigns are usually the first sign that the
                plan is about to be abandoned. The review is for tuning, not
                for rebuilding.
              </p>

              <h3 className="font-serif text-lg font-bold mt-6 mb-2">5. Track completion, not perfection</h3>
              <p className="text-muted-foreground leading-relaxed">
                Tick sessions off as you finish them. Don't redesign the plan
                every week - small tweaks at the review slot only. Visible streaks
                are the single biggest reason students keep showing up.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                A session counts as done if you showed up and worked for the
                full block - even if you didn't finish the topic. Tying the tick
                to attendance rather than output is what keeps the streak alive
                on the inevitable days when the material is harder than
                expected and progress is slower than you'd like.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold mb-3">
                Free weekly study plan template
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The template below is the simplest version that still works -
                subjects, recurring slots, a weekly review. Copy it into any
                document, or open it as a ready-made note in
                Notespace's <Link to="/templates/study-planner" className="text-primary underline underline-offset-2">study planner template</Link> and
                edit the slots until they match your real week.
              </p>
              <pre className="bg-muted rounded-lg p-5 text-sm leading-relaxed overflow-x-auto whitespace-pre">{`# Weekly Study Plan - Week of [date]

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
Sun  10:00-10:30  Weekly review

## Weekly review (Sun)
- What got done?
- What slipped?
- What changes next week?`}</pre>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold mb-3">
                The honest limits
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                A study plan is a scaffolding tool. It removes friction and
                forgetfulness; it doesn't create focus, motivation, or
                understanding on its own. Holding the limits below in mind keeps
                the plan useful even on the weeks when it doesn't go perfectly.
              </p>
              <ul className="space-y-2 text-muted-foreground leading-relaxed">
                <li>• A plan won't fix motivation. It just removes the daily decision of "what should I work on?"</li>
                <li>• The first week always feels too easy. Resist the urge to double it - hold the plan for three weeks before scaling up.</li>
                <li>• If you miss a session, do not "catch up" - just move to the next scheduled slot. Catch-up debt is what kills study plans.</li>
                <li>• Active recall and practice problems move marks. Re-reading notes mostly moves the time.</li>
              </ul>
              <Callout tone="warn" title="The trap to avoid">
                A beautiful colour-coded plan that took three hours to make is
                not studying. The hours spent designing it almost always come
                out of the first week's actual work.
              </Callout>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold mt-12 mb-6">Frequently asked</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The five questions students send in most often when they're
                building their first proper study plan. If yours isn't here,
                the five steps above are the long answer to most of them.
              </p>
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

          <BlogFinalCTA
            title="Build your study schedule inside Notespace"
            body="Open the study planner template, edit the slots to match your week, and tick sessions off as you finish them. Free to start."
            to={CTA}
            cta="Start using Notespace"
            secondaryTo="/templates/study-planner"
            secondaryCta="Open the study planner template"
          />
        </article>

        <RelatedReading currentPath="/blog/how-to-make-a-study-plan" items={STUDY_PLANNER_RELATED} />
        <Footer />
      </div>
    </>
  );
}
