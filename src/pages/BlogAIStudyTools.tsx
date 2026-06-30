import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, X } from "lucide-react";
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
import {
  BlogKeyTakeaways,
  BlogPullQuote,
  BlogDivider,
} from "@/components/blog/BlogVisuals";
import { Callout } from "@/components/blog/Callout";
import { BlogByline } from "@/components/blog/BlogByline";
import { Pill } from "@/components/blog/Pill";

const REF = "blog-ai-study-tools";
const CTA = `/auth?ref=${REF}&utm_source=blog&utm_medium=organic&utm_campaign=ai-study-tools`;

type Tool = {
  name: string;
  oneLine: string;
  bestFor: string;
  pricing: string;
  strength: string;
  weakness: string;
  verdict: string;
};

const tools: Tool[] = [
  {
    name: "Notebook Archive",
    oneLine: "A real markdown notebook with an AI explain panel - the closest thing to NotebookLM that you actually own.",
    bestFor: "Students who need to write notes and ask AI about them in the same place.",
    pricing: "Free tier sized for a semester; Pro $19/mo.",
    strength: "It's a notebook first. The AI lives next to your writing, not on top of someone else's PDF.",
    weakness: "Younger than the household names. No audio overview podcast (we think that's a feature, not a bug).",
    verdict: "Pick this if NotebookLM frustrated you because the work didn't live anywhere afterwards.",
  },
  {
    name: "NotebookLM",
    oneLine: "Google's grounded reading assistant. Brilliant at answering questions about PDFs you upload.",
    bestFor: "Making sense of dense source material - papers, textbooks, transcripts.",
    pricing: "Free up to ~100 notebooks; Plus bundled with Google One AI Premium.",
    strength: "Citation-grounded answers. The audio overview podcast is genuinely good.",
    weakness: "Not a notebook. No tags, no folders, no markdown editor, and exporting your work is painful.",
    verdict: "Use it as a reading assistant, then move the output into a real notes app.",
  },
  {
    name: "StudyFetch",
    oneLine: "A flashcard-and-tutor app built around an AI character named Spark.",
    bestFor: "Students who learn best with active recall and quizzes generated from their notes.",
    pricing: "Free with limits; Pro around $7-15/mo depending on plan.",
    strength: "Turns a PDF into flashcards, a quiz, and a study guide in one click.",
    weakness: "The tutor persona wears thin. Locked into their UI - you don't own the cards in a portable format.",
    verdict: "Solid if flashcards are the format you actually study from.",
  },
  {
    name: "Turbo.ai (Turbolearn)",
    oneLine: "A lecture-recording app that auto-generates structured notes, quizzes, and a study guide.",
    bestFor: "In-person students who want notes from live lectures without typing.",
    pricing: "Free trial; paid tiers from ~$10/mo.",
    strength: "Live audio capture is fast and the auto-formatted notes are surprisingly clean.",
    weakness: "Built around recording - less useful if your inputs are PDFs and articles, not classrooms.",
    verdict: "The right pick if your study material is your professor's voice.",
  },
  {
    name: "Mindgrasp",
    oneLine: "Upload a PDF, video, or audio file; get a summary, notes, flashcards, and a quiz.",
    bestFor: "Quick summarization of long source material when you're behind on the reading.",
    pricing: "Free trial; paid plans from ~$10/mo.",
    strength: "Handles video and audio inputs as cleanly as PDFs - a real edge over text-only competitors.",
    weakness: "The output is generic; you'll edit the notes before they're useful for your own revision style.",
    verdict: "Best as a triage tool for things you don't have time to read end-to-end.",
  },
  {
    name: "Studley.ai",
    oneLine: "An exam-prep app that turns uploaded notes into mock tests and flashcard decks.",
    bestFor: "Exam season, when you need volume of practice questions over depth of understanding.",
    pricing: "Free tier; Pro around $10/mo.",
    strength: "Question generation is varied - multiple choice, short answer, fill-in-the-blank.",
    weakness: "Quality of questions tracks the quality of the input. Garbage notes in, garbage quiz out.",
    verdict: "Use it the week before exams, not the week before the deadline to start studying.",
  },
  {
    name: "Quizlet (with Q-Chat)",
    oneLine: "The flashcard incumbent, now with an AI tutor layered on top.",
    bestFor: "Vocab, languages, MCAT-style fact recall - anything that's pure memorization.",
    pricing: "Free; Plus around $36/year for AI features and offline mode.",
    strength: "Massive library of community decks already exists for almost any subject.",
    weakness: "AI features feel bolted on. Free tier has gotten thinner over the years.",
    verdict: "Still the right answer for pure flashcard study; not the right answer for everything else.",
  },
  {
    name: "Khanmigo (Khan Academy)",
    oneLine: "A Socratic AI tutor built on Khan Academy's curriculum.",
    bestFor: "K-12 and early-college students working through Khan's existing courses.",
    pricing: "$4/mo, free for teachers and verified educators.",
    strength: "Won't just give you the answer - it walks you toward it. The tutoring style is genuinely educational.",
    weakness: "Locked to Khan Academy's curriculum scope. Less useful for university-level or specialized topics.",
    verdict: "The honest pick for a younger student who needs guardrails, not just answers.",
  },
  {
    name: "ChatGPT / Claude",
    oneLine: "General-purpose chatbots that are surprisingly capable study partners with the right prompts.",
    bestFor: "Explaining anything to anyone, brainstorming, second opinions on tricky problems.",
    pricing: "Free tiers usable; Plus/Pro tiers around $20/mo.",
    strength: "The reasoning is best-in-class. Custom GPTs and Projects let you build your own study tool.",
    weakness: "Will confidently hallucinate citations. Not grounded to your sources unless you paste them in every turn.",
    verdict: "Keep one open as a tutor. Don't use it as your single source of truth.",
  },
  {
    name: "Adobe Acrobat AI Assistant",
    oneLine: "AI summarization and Q&A built directly into Acrobat for PDFs.",
    bestFor: "Researchers who already live in PDF and just want a chat panel inside Acrobat.",
    pricing: "Add-on subscription, around $5/mo on top of Acrobat.",
    strength: "It's where your PDFs already are. No upload step.",
    weakness: "Single-document focus; weaker for cross-source synthesis. Locked to Adobe's ecosystem.",
    verdict: "Worth it if you're already paying for Acrobat. Not worth switching to.",
  },
  {
    name: "Kuse",
    oneLine: "A whiteboard-style canvas where you arrange sources, notes, and AI answers spatially.",
    bestFor: "Visual thinkers who map ideas across multiple documents at once.",
    pricing: "Free tier; paid plans from ~$15/mo.",
    strength: "The canvas metaphor is genuinely different - useful for messy, exploratory work.",
    weakness: "Steeper learning curve than a linear notebook. Overkill for single-source studying.",
    verdict: "A real fit if you already think in mind maps and miss them in linear note apps.",
  },
];

const useCases = [
  {
    job: "I have 200 pages of reading and the exam is Monday",
    answer:
      "NotebookLM or Mindgrasp for the summary, then Studley or StudyFetch to generate practice questions. Use the questions, not the summary, to study from.",
  },
  {
    job: "I record every lecture and want clean notes I can search",
    answer:
      "Turbo.ai for capture; Notebook Archive or Notion AI for the long-term home where you'll actually revise from.",
  },
  {
    job: "I'm studying vocab, a language, or pure recall facts",
    answer:
      "Quizlet, full stop. Decades of decks already exist. AI generation is the wrong tool for memorization that benefits from repetition.",
  },
  {
    job: "I want to write notes and have AI explain things as I go",
    answer:
      "Notebook Archive. The whole point is the AI panel sits next to your writing instead of replacing it.",
  },
  {
    job: "I'm in middle or high school and need a tutor, not just answers",
    answer:
      "Khanmigo. It's the only one on this list designed to teach rather than complete homework.",
  },
  {
    job: "I'm a researcher juggling 30 papers on a literature review",
    answer:
      "NotebookLM for the synthesis questions; a real reference manager (Zotero) for the bibliography; Notebook Archive or Obsidian for the writeup. No single AI tool does this job alone.",
  },
];

const faq = [
  {
    q: "What is the best AI study tool overall?",
    a: "There isn't one. The honest answer: NotebookLM for reading, Notebook Archive or Notion AI for writing, Quizlet for flashcards, Khanmigo for tutoring. A student who picks one tool for everything is usually under-served on three of those jobs.",
  },
  {
    q: "What is the best free AI study tool?",
    a: "NotebookLM has the most generous free tier for grounded Q&A on documents. Quizlet's free tier is still usable for flashcards. ChatGPT's free tier is fine for explanations. Most paid tools (StudyFetch, Mindgrasp, Studley) have free trials but expect you to upgrade after a week.",
  },
  {
    q: "Is using AI to study cheating?",
    a: "Asking AI to explain a concept is no more cheating than asking a tutor. Asking AI to write your essay or take your exam is. The line most schools draw: AI for understanding, not for producing the work being graded. Check your institution's policy - they vary.",
  },
  {
    q: "Can AI study tools replace a human tutor?",
    a: "No, but they can fill the gap between tutor sessions. AI is available at 2am, doesn't get tired of dumb questions, and is patient with re-explanations. A human tutor catches the subtle misunderstandings AI misses and holds you accountable for showing up.",
  },
  {
    q: "How do I keep AI study tools from making me dumber?",
    a: "Always solve the problem before asking AI to check it. Use AI to generate practice questions, then answer them yourself before reading the answer. Never paste an essay prompt and submit what comes back. The tool is a sparring partner, not a stand-in.",
  },
  {
    q: "Which AI study tool has the best flashcard generation?",
    a: "StudyFetch and Studley both generate cards from a PDF in one click. Quizlet's AI generation is solid if you're already in the Quizlet ecosystem. Notebook Archive generates cards directly from your written notes, which we think is the right input - cards from notes you understand stick better than cards from documents you haven't read yet.",
  },
  {
    q: "Are AI study tools safe to upload my notes to?",
    a: "Read the privacy policy of each one. NotebookLM and the major paid tools state they don't train on your uploads. Smaller startups often have weaker guarantees. If your notes contain anything sensitive (medical, legal, proprietary research), default to tools with explicit no-training clauses.",
  },
  {
    q: "What's the difference between an AI study tool and a generic chatbot like ChatGPT?",
    a: "Study tools are pre-prompted for study workflows - flashcard generation, quiz creation, citation-grounded answers, spaced repetition. ChatGPT can do all of these if you prompt it correctly, but you'll re-prompt every session. Study tools save you the prompting work in exchange for less flexibility.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Best AI Study Tools in 2026: 11 Honest Picks (Free & Paid)",
    description:
      "An honest comparison of the 11 AI study tools that actually earn the label in 2026 - what each one is good at, what it isn't, and which to pick by use case.",
    datePublished: "2026-06-30",
    dateModified: "2026-06-30",
    author: { "@type": "Organization", name: "Notebook Archive" },
    publisher: { "@type": "Organization", name: "Notebook Archive" },
    mainEntityOfPage: "https://notebookarchive.lovable.app/blog/ai-study-tools",
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
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Best AI Study Tools 2026",
    itemListElement: tools.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      description: t.oneLine,
    })),
  },
  breadcrumbsJsonLd([
    { name: "Blog", path: "/blog" },
    { name: "Best AI Study Tools 2026", path: "/blog/ai-study-tools" },
  ]),
];

export default function BlogAIStudyTools() {
  useEffect(() => {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <>
      <SeoHead
        type="article"
        title="Best AI Study Tools in 2026: 11 Honest Picks (Free & Paid)"
        description="An honest comparison of the 11 AI study tools that actually earn the label in 2026 - what each one is good at, what it isn't, and which to pick by use case."
        path="/blog/ai-study-tools"
        image="/og/og-ai-study-tools.jpg"
        jsonLd={jsonLd}
      />
      <div className="min-h-screen bg-background text-foreground">
        <PageHeader />

        <article className="blog-article max-w-3xl mx-auto px-6 pt-32 pb-24">
          <header className="mb-12">
            <p className="text-sm uppercase tracking-widest text-accent font-semibold mb-4">
              Comparison · Updated June 2026
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              Best <span className="text-primary">AI Study Tools</span> in 2026
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Eleven AI study tools, picked because we've actually used them - not because someone
              paid for the slot. What each one is best at, where it falls down, and how to choose
              the right one for the way you actually study.
            </p>
          </header>

          <BlogKeyTakeaways
            points={[
              "There is no single best AI study tool. Pick by job: reading, writing, flashcards, tutoring, or planning.",
              "NotebookLM wins on grounded reading. Notebook Archive wins on writing notes alongside AI.",
              "Flashcard generation is a commodity now - StudyFetch, Studley, and Quizlet are all fine.",
              "Avoid tools that lock your study material into their UI. Owning your notes matters when finals end.",
              "Free tiers are real - you don't need to pay for any of this in your first semester of trying things out.",
            ]}
          />

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold mt-8 mb-4">Why we ranked them this way</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Every "best AI study tools" list on Google is a paid affiliate roundup. We wrote this
              one differently. Three criteria:
            </p>
            <ol className="space-y-3 text-muted-foreground mb-6 list-decimal pl-6">
              <li>
                <strong>Does the tool do one job better than a general chatbot?</strong> If the answer
                is "no, ChatGPT can do this with the right prompt", it didn't make the list.
              </li>
              <li>
                <strong>Do you own the output?</strong> If your notes, flashcards, and summaries are
                trapped in a proprietary UI you can't export, the tool loses points - even if it's
                good in the moment.
              </li>
              <li>
                <strong>Is the free tier usable for a real semester?</strong> "Free trial that
                paywalls you on day 8" is not a free tier. We say so when that's the deal.
              </li>
            </ol>

            <Callout tone="key" title="The honest meta-point">
              Most students end up using two or three of these together, not one. A reading assistant
              for the hard PDFs, a notebook for the writing, and flashcards for the recall. Picking
              one tool to do all three is usually how students end up under-served.
            </Callout>

            <BlogDivider />

            <h2 className="font-serif text-2xl font-bold mt-8 mb-4">The 11 best AI study tools in 2026</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Roughly ordered by how often the tool earns its keep in a real study workflow - not
              by marketing budget. Each entry has the same five fields so you can scan them
              side-by-side.
            </p>

            <div className="space-y-8 mb-6">
              {tools.map((t, i) => (
                <div key={t.name} className="border-l-2 border-primary/30 pl-5">
                  <h3 className="font-serif text-xl font-bold mb-2">
                    {i + 1}. {t.name}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4 italic">{t.oneLine}</p>
                  <dl className="space-y-2 text-muted-foreground text-[15px]">
                    <div><dt className="inline font-semibold text-foreground">Best for: </dt><dd className="inline">{t.bestFor}</dd></div>
                    <div><dt className="inline font-semibold text-foreground">Pricing: </dt><dd className="inline">{t.pricing}</dd></div>
                    <div className="flex gap-2"><Check className="h-4 w-4 text-primary mt-1 shrink-0" /><span><strong className="text-foreground">Strength:</strong> {t.strength}</span></div>
                    <div className="flex gap-2"><X className="h-4 w-4 text-destructive mt-1 shrink-0" /><span><strong className="text-foreground">Weakness:</strong> {t.weakness}</span></div>
                    <div><dt className="inline font-semibold text-foreground">Verdict: </dt><dd className="inline">{t.verdict}</dd></div>
                  </dl>
                </div>
              ))}
            </div>

            <Callout tone="info" title="What's missing from this list">
              We left off tools we couldn't recommend with a straight face - the ones that are
              essentially a ChatGPT wrapper with a $20/mo subscription. If you don't see a popular
              brand here, that's why.
            </Callout>

            <BlogDivider />

            <h2 className="font-serif text-2xl font-bold mt-8 mb-4">Pick by job, not by brand</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The fastest way to pick is to start from what you're actually trying to do this week.
              Six common jobs and the tool stack we'd actually use:
            </p>

            <div className="space-y-6 mb-6">
              {useCases.map((u) => (
                <div key={u.job} className="bg-primary/5 rounded-lg p-5">
                  <h3 className="font-serif text-lg font-bold mb-2">{u.job}</h3>
                  <p className="text-muted-foreground leading-relaxed">{u.answer}</p>
                </div>
              ))}
            </div>

            <BlogPullQuote cite="Almost every student we talked to">
              The students who get the most out of AI aren't the ones with the most subscriptions.
              They're the ones who picked two tools, learned them properly, and stopped tool-hopping.
            </BlogPullQuote>

            <BlogDivider />

            <h2 className="font-serif text-2xl font-bold mt-8 mb-4">How to actually use AI to study (without getting dumber)</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The risk with AI study tools isn't that they'll give you a wrong answer once - it's
              that they'll quietly replace the thinking you need to do to actually learn the
              material. Five rules we'd give a younger version of ourselves:
            </p>
            <ol className="space-y-4 text-muted-foreground mb-6 list-decimal pl-6">
              <li>
                <strong className="text-foreground">Solve before you ask.</strong> Try the problem
                first. Then ask the AI to check your work. The reverse - asking, then "verifying" -
                is how you end up confident in answers you can't reproduce on the exam.
              </li>
              <li>
                <strong className="text-foreground">Generate quizzes, not summaries.</strong>
                Reading an AI-generated summary feels productive and isn't. Generate practice
                questions instead and force yourself to answer them cold.
              </li>
              <li>
                <strong className="text-foreground">Use citations as the proof, not the chat
                answer.</strong> NotebookLM-style tools link to the source passage. Click it. Read
                it. The AI is sometimes wrong about what its own citation says.
              </li>
              <li>
                <strong className="text-foreground">Keep one tool for understanding, one for
                output.</strong> Use the chatbot to learn the concept; type the actual notes yourself
                in your notebook. The act of typing is part of how it sticks.
              </li>
              <li>
                <strong className="text-foreground">Set a tool budget and stop tool-hopping.</strong>
                Two tools, learned well, beat seven tools you use shallowly. Pick a reading tool and
                a writing tool, and don't add a third until the first two are routine.
              </li>
            </ol>

            <Callout tone="warn" title="The 'I studied for hours' trap">
              Time spent in an AI study tool is not the same as time spent learning. If you finished
              the session and can't reproduce the material on a blank page, the session didn't work
              - regardless of what the streak counter says.
            </Callout>

            <BlogDivider />

            <h2 className="font-serif text-2xl font-bold mt-8 mb-4">What we'd actually pick</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If we were back in school in 2026, knowing what's out there:
            </p>
            <ul className="space-y-3 text-muted-foreground mb-6">
              <li>• <strong>Daily driver for notes and AI questions:</strong> Notebook Archive.</li>
              <li>• <strong>For the dense PDFs we don't have time for:</strong> NotebookLM.</li>
              <li>• <strong>For flashcards in language or pure recall classes:</strong> Quizlet.</li>
              <li>• <strong>For the 2am "I don't understand this at all" moments:</strong> ChatGPT or Claude, free tier.</li>
              <li>• <strong>Total monthly spend in semester one:</strong> $0. Upgrade only if a tool earns it.</li>
            </ul>

            <Callout tone="tip" title="A test for any AI study tool">
              After two weeks: open the tool and ask yourself "what would I lose if this disappeared
              tomorrow?" If the answer is "the notes I wrote in it", that's a tool worth keeping. If
              the answer is "a chat history I never read again", it's not.
            </Callout>

            <BlogDivider />

            <h2 className="font-serif text-2xl font-bold mt-8 mb-4">Frequently asked</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The questions students ask us most about AI study tools - answered directly.
            </p>
            <Accordion type="single" collapsible className="w-full">
              {faq.map((f, i) => (
                <AccordionItem key={f.q} value={`item-${i}`}>
                  <AccordionTrigger className="font-serif text-lg text-left">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <BlogDivider />

            <h2 className="font-serif text-2xl font-bold mt-8 mb-4">Related reading</h2>
            <ul className="space-y-2 text-muted-foreground mb-6">
              <li>•{" "}
                <Link to="/blog/notebooklm-alternative" className="text-primary underline underline-offset-4">
                  NotebookLM alternatives 2026 - 6 honest picks
                </Link>
              </li>
              <li>•{" "}
                <Link to="/blog/what-is-notebook-lm-used-for" className="text-primary underline underline-offset-4">
                  What is NotebookLM used for? Six real use cases
                </Link>
              </li>
              <li>•{" "}
                <Link to="/blog/otter-ai-alternative-for-students" className="text-primary underline underline-offset-4">
                  The honest Otter.ai alternative guide for students
                </Link>
              </li>
              <li>•{" "}
                <Link to="/blog/ai-note-taking-app-for-students" className="text-primary underline underline-offset-4">
                  The AI note-taking app for students, picked honestly
                </Link>
              </li>
            </ul>
          </section>

          <div className="border-t border-border pt-10 mt-10 text-center">
            <p className="font-serif text-2xl font-bold mb-4">
              A study notebook with the AI built in.
            </p>
            <p className="text-muted-foreground mb-6">
              Notebook Archive pairs markdown notes, AI explanations, and auto-generated flashcards
              in one place - free to start, no lecture-recording gimmicks, your notes stay yours.
            </p>
            <Link
              to={CTA}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Try Notebook Archive free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </article>

        <Footer />
      </div>
    </>
  );
}
