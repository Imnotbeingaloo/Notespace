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
import {
  BlogKeyTakeaways,
  BlogPullQuote,
  BlogDivider,
} from "@/components/blog/BlogVisuals";
import { Callout } from "@/components/blog/Callout";

const REF = "blog-what-is-notebooklm";
const CTA = `/auth?ref=${REF}&utm_source=blog&utm_medium=organic&utm_campaign=what-is-notebooklm`;

const useCases = [
  {
    title: "Studying from a dense PDF or textbook",
    body:
      "Drop a chapter in, ask 'explain section 3 like I'm new to this', and get an answer that quotes the actual passage. This is the use case NotebookLM was built for and it does it well - until you need the explanation to live somewhere outside Google.",
  },
  {
    title: "Summarizing meeting transcripts or interview notes",
    body:
      "Upload a transcript, ask for the three decisions made and the open questions. The grounding means the summary cites timestamps and speakers instead of hallucinating. Limited by the fact you can't edit the source - it's read-only inside NotebookLM.",
  },
  {
    title: "Comparing several research papers at once",
    body:
      "Up to 50 sources per notebook (Plus tier). Ask 'what do these papers agree and disagree about', and the answer pulls citations from each. Closest thing to a personal research assistant - if you don't mind the citations being formatted Google's way, not yours.",
  },
  {
    title: "Generating an audio overview of a topic",
    body:
      "The signature feature: a two-host podcast generated from your sources, usually 8-15 minutes. Surprisingly listenable. Useful for passive review on a commute - less useful when you wanted a written summary you can scan in 30 seconds.",
  },
  {
    title: "Turning lecture notes into a study guide",
    body:
      "Upload slides + your own notes, ask for a study guide with key terms, then for practice questions. Works. You will, however, copy the output into a real notes app afterwards because NotebookLM has no organization beyond the source list.",
  },
  {
    title: "Drafting from a brief plus reference docs",
    body:
      "Feed it a creative brief and a few brand documents, ask for a first draft. Output is competent and grounded. You'll edit it elsewhere - NotebookLM's editor is rudimentary on purpose.",
  },
];

const faq = [
  {
    q: "What is NotebookLM in one sentence?",
    a: "NotebookLM is Google's AI research assistant that answers questions about documents you upload, with citations back to the source - powered by Gemini under the hood.",
  },
  {
    q: "What is NotebookLM best used for?",
    a: "Three things, in order: making sense of long PDFs (textbooks, research papers, contracts), turning transcripts and meeting notes into summaries, and generating the now-famous audio overviews. It's a reading assistant, not a writing tool.",
  },
  {
    q: "Is NotebookLM free?",
    a: "Yes, with limits. The free tier covers around 100 notebooks and 50 sources per notebook. NotebookLM Plus (bundled into Google One AI Premium) raises the limits and adds usage analytics.",
  },
  {
    q: "What can't NotebookLM do?",
    a: "It can't be a real note-taking app. There's no markdown editor, no per-course organization beyond notebooks, no tags, no offline mode, no export of anything except chat answers, and no way to write a long-form draft and have the AI live alongside it. It's a reading assistant, not a notebook.",
  },
  {
    q: "Is NotebookLM safe for confidential documents?",
    a: "Google states NotebookLM doesn't use your uploads to train its models. For most non-regulated work that's fine. For HIPAA, attorney-client privileged material, or anything covered by a strict DPA, talk to your security team first - NotebookLM is not enterprise-certified for every regulated context.",
  },
  {
    q: "Is NotebookLM better than ChatGPT for research?",
    a: "For grounded answers about a specific set of documents - yes, by a wide margin. ChatGPT will happily hallucinate citations; NotebookLM links back to the exact passage. For open-ended brainstorming with no source material, ChatGPT or Claude is still better.",
  },
  {
    q: "What's the best alternative if I need a real notebook too?",
    a: "Notespace is the closest fit if you wanted NotebookLM's AI plus a notebook you actually write in - markdown, per-course organization, free tier sized for a semester. We compared six alternatives in detail in our NotebookLM alternatives guide.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "What Is NotebookLM Used For? Six Real Use Cases (2026)",
    description:
      "What NotebookLM is, what it's actually good at, and what it can't do. Six honest use cases, FAQ, and the alternative if you needed a real notebook too.",
    datePublished: "2026-06-30",
    dateModified: "2026-06-30",
    author: { "@type": "Organization", name: "Notespace" },
    publisher: { "@type": "Organization", name: "Notespace" },
    mainEntityOfPage: "https://notebookarchive.lovable.app/blog/what-is-notebook-lm-used-for",
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
    { name: "What Is NotebookLM Used For?", path: "/blog/what-is-notebook-lm-used-for" },
  ]),
];

export default function BlogWhatIsNotebookLM() {
  useEffect(() => {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <>
      <SeoHead
        type="article"
        title="What Is NotebookLM Used For? Six Real Use Cases (2026)"
        description="A plain-English explainer of what NotebookLM is, what it's actually good at, and what it can't do. Six honest use cases, an FAQ, and the alternative if you needed a real notebook too."
        path="/blog/what-is-notebook-lm-used-for"
        image="/og/og-what-is-notebook-lm-used-for.jpg"
        jsonLd={jsonLd}
      />
      <div className="min-h-screen bg-background text-foreground">
        <PageHeader />

        <article className="blog-article max-w-3xl mx-auto px-6 pt-32 pb-24">
          <header className="mb-12">
            <p className="text-sm uppercase tracking-widest text-accent font-semibold mb-4">
              Explainer · Updated June 2026
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              What Is <span className="text-primary">NotebookLM</span> Used For?
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              NotebookLM is Google's AI research assistant - the kind of tool that's easy to demo and
              harder to explain. Here's what it actually is, six things people use it for in real life,
              and the honest list of what it can't do.
            </p>
          </header>

          <BlogKeyTakeaways
            points={[
              "NotebookLM is a grounded reading assistant - you upload sources, it answers questions with citations.",
              "It's best for dense PDFs, transcripts, and multi-document comparisons - not for writing or organizing notes.",
              "The free tier is generous: ~100 notebooks, 50 sources each. Audio overviews are the signature feature.",
              "It can't be a real notes app - no markdown, no tags, no export beyond chat answers, no offline mode.",
              "If you wanted NotebookLM's AI plus an actual notebook, the alternatives section covers that.",
            ]}
          />

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold mt-8 mb-4">What NotebookLM actually is</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              NotebookLM is a free web app at <code>notebooklm.google.com</code>. You create a notebook,
              upload up to 50 sources per notebook (PDFs, Google Docs, web pages, YouTube transcripts,
              pasted text), and then ask questions about them in a chat panel. The model - Gemini -
              answers using only those sources and footnotes its claims back to the passage.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              That's the whole product. The interesting part isn't the chat. It's the grounding: the
              promise that the answer came from your sources and not from the model's training data.
              For research and study work, that's a much bigger deal than another general chatbot.
            </p>

            <Callout tone="key" title="The one-line definition">
              NotebookLM is a grounded reading assistant. You bring the sources; it answers questions
              about them, with citations. Everything else - audio overviews, study guides, briefing
              docs - is built on top of that one capability.
            </Callout>

            <BlogPullQuote cite="Every honest review of NotebookLM in 2026">
              It's the best reading assistant we've ever shipped to consumers. It's also a deeply
              mediocre note-taking app, which is the part Google's marketing keeps glossing over.
            </BlogPullQuote>

            <BlogDivider />

            <h2 className="font-serif text-2xl font-bold mt-8 mb-4">Six things people actually use it for</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Pulled from real user threads, not Google's launch deck. Ordered roughly by how often
              the use case comes up.
            </p>

            <div className="space-y-6 mb-6">
              {useCases.map((u, i) => (
                <div key={u.title} className="border-l-2 border-primary/30 pl-5">
                  <h3 className="font-serif text-xl font-bold mb-2">
                    {i + 1}. {u.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{u.body}</p>
                </div>
              ))}
            </div>

            <Callout tone="info" title="The pattern across all six">
              Every use case ends with "...and then I copy the output somewhere else". That's the giveaway:
              NotebookLM is an answer engine, not a workspace. The work doesn't live there.
            </Callout>

            <BlogDivider />

            <h2 className="font-serif text-2xl font-bold mt-8 mb-4">What NotebookLM is not for</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Equally important. The list of things NotebookLM will quietly disappoint you on:
            </p>
            <ul className="space-y-3 text-muted-foreground mb-6">
              <li>• <strong>Long-form writing.</strong> The editor is rudimentary. You'll draft elsewhere.</li>
              <li>• <strong>Per-course or per-project organization.</strong> Notebooks are a flat list; no folders, no tags.</li>
              <li>• <strong>Owning your work.</strong> Export options are limited; the chat doesn't leave NotebookLM cleanly.</li>
              <li>• <strong>Offline access.</strong> It's a web app. No internet, no notebook.</li>
              <li>• <strong>Surviving Google product cycles.</strong> Google has deprecated note products before. Plan accordingly.</li>
            </ul>

            <Callout tone="warn" title="The Google deprecation tax">
              If your notes need to outlive any single product, building a long-term knowledge base
              inside a Google consumer app is a known risk. Keep an export plan from day one.
            </Callout>

            <BlogDivider />

            <h2 className="font-serif text-2xl font-bold mt-8 mb-4">When to use NotebookLM vs. something else</h2>
            <ul className="space-y-3 text-muted-foreground mb-6">
              <li>• <strong>You have a stack of PDFs and need to understand them fast:</strong> NotebookLM.</li>
              <li>• <strong>You want to listen to a summary on a commute:</strong> NotebookLM's audio overview, full stop.</li>
              <li>• <strong>You want a real notebook you also write in:</strong> Notespace, Notion, or Obsidian.</li>
              <li>• <strong>You want NotebookLM-style behavior in your own app:</strong>{" "}
                <Link to="/blog/notebook-lm-api" className="text-primary underline underline-offset-4">
                  there is no API
                </Link>
                {" "}- you'll build it on the Gemini API yourself.</li>
              <li>• <strong>You want a calmer, owned alternative:</strong>{" "}
                <Link to="/blog/notebooklm-alternative" className="text-primary underline underline-offset-4">
                  the six honest alternatives are here
                </Link>.</li>
            </ul>

            <BlogDivider />

            <h2 className="font-serif text-2xl font-bold mt-8 mb-4">Frequently asked</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The questions readers ask most often about NotebookLM - answered directly.
            </p>
            <Callout tone="tip" title="Before you scroll">
              Almost every FAQ below boils down to the same trade-off: NotebookLM is a brilliant
              reading assistant and a thin notebook. Decide which job you're hiring it for.
            </Callout>
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
          </section>

          <BlogFinalCTA
            title="NotebookLM's AI. A notebook you actually own."
            body="Notespace pairs a real markdown notebook with an AI explain panel - free to start, no audio podcast, no Google-account lock-in."
            to={CTA}
          />
        </article>

        <Footer />
      </div>
    </>
  );
}
