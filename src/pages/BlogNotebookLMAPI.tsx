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

const REF = "blog-notebooklm-api";
const CTA = `/auth?ref=${REF}&utm_source=blog&utm_medium=organic&utm_campaign=notebooklm-api`;

const faq = [
  {
    q: "Does NotebookLM have an official API?",
    a: "No. As of June 2026, Google has not shipped a public NotebookLM API. There is no documented REST endpoint, no client library, and no OAuth scope for programmatic source ingestion or chat. Everything happens inside notebooklm.google.com.",
  },
  {
    q: "Is there a NotebookLM API on the Google Cloud or Vertex AI side?",
    a: "No. NotebookLM is built on Gemini, and Gemini itself is fully programmatic via the Gemini API and Vertex AI - but NotebookLM's grounded RAG layer (the part that makes it special) is not exposed. If you want to reproduce the experience, you'll need to build the source ingestion and grounding yourself on top of the Gemini API.",
  },
  {
    q: "Can I scrape NotebookLM or automate it with a headless browser?",
    a: "Technically possible, contractually a bad idea. Google's terms forbid automated access to consumer products, your account can be suspended, and the DOM changes often enough that scrapers break weekly. For anything production-shaped, build on the official Gemini API instead.",
  },
  {
    q: "What's the closest legitimate way to get NotebookLM-style behavior in my own app?",
    a: "Three pieces glued together: (1) the Gemini API for the model itself, (2) a document chunker and vector store for your sources, (3) a prompt that forces citations back to the chunks. Most teams reach for LangChain, LlamaIndex, or a managed RAG service to avoid hand-rolling all three.",
  },
  {
    q: "If I don't want to build it myself, what are my options?",
    a: "Two paths. If you need NotebookLM specifically, you have to use the web app - there's no integration. If you need a notebook with AI you can actually trust to study from, tools like Notebook Archive give you a real notebook with an AI explain panel, markdown export, and a free tier - no API needed because the workflow lives inside the app.",
  },
  {
    q: "Will NotebookLM ever get an API?",
    a: "Probably, but on Google's timeline. Google has shipped Gemini API features at a steady clip; an external NotebookLM API would be the natural next step for enterprise customers. There's no announcement and no public roadmap commitment as of writing - so plan for today's reality, not tomorrow's press release.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Does NotebookLM Have an API? (Honest 2026 Answer)",
    description:
      "There is no public NotebookLM API as of 2026. Here's what that means for developers, what the alternatives are, and how to build NotebookLM-style behavior yourself.",
    datePublished: "2026-06-30",
    dateModified: "2026-06-30",
    author: { "@type": "Organization", name: "Notebook Archive" },
    publisher: { "@type": "Organization", name: "Notebook Archive" },
    mainEntityOfPage: "https://notebookarchive.lovable.app/blog/notebook-lm-api",
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
    { name: "Does NotebookLM Have an API?", path: "/blog/notebook-lm-api" },
  ]),
];

export default function BlogNotebookLMAPI() {
  useEffect(() => {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <>
      <SeoHead
        type="article"
        title="Does NotebookLM Have an API? Honest 2026 Answer for Developers"
        description="There is no public NotebookLM API as of June 2026. Here's what that means, what the alternatives are, and how to build NotebookLM-style behavior on the Gemini API yourself."
        path="/blog/notebook-lm-api"
        image="/og/og-notebook-lm-api.jpg"
        jsonLd={jsonLd}
      />
      <div className="min-h-screen bg-background text-foreground">
        <PageHeader />

        <article className="blog-article max-w-3xl mx-auto px-6 pt-32 pb-24">
          <header className="mb-12">
            <p className="text-sm uppercase tracking-widest text-accent font-semibold mb-4">
              Developer Guide · Updated June 2026
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              Does <span className="text-primary">NotebookLM</span> Have an API?
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Short answer: no. Long answer: there's a clean path to build NotebookLM-style behavior yourself
              on the Gemini API - and a faster path if you just wanted a notebook that thinks with you.
              Here's both, without the speculation.
            </p>
          </header>

          <BlogKeyTakeaways
            points={[
              "There is no public NotebookLM API as of June 2026 - no REST endpoint, no SDK, no OAuth scope.",
              "Gemini (the model under NotebookLM) is fully programmatic. The grounded-RAG layer that makes NotebookLM special is not.",
              "Scraping or browser automation violates Google's terms and breaks weekly. Don't ship it.",
              "To reproduce NotebookLM in your own product, build RAG on Gemini yourself or use a managed service.",
              "If you wanted a notebook + AI, not an API, jump to the alternatives section.",
            ]}
          />

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold mt-8 mb-4">The honest answer in one paragraph</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Google ships NotebookLM as a consumer web product at <code>notebooklm.google.com</code>. The
              backend is private. There is no documented endpoint to upload a source, no method to start a
              chat from code, and no way to retrieve a generated audio overview without a human clicking
              the button. Every "NotebookLM API" tutorial you'll find online either wraps a headless
              browser (fragile, against ToS) or quietly substitutes the raw Gemini API (which is a
              different product entirely).
            </p>

            <Callout tone="warn" title="Don't ship browser automation">
              Wrapping NotebookLM in Puppeteer or Playwright violates Google's terms of service, gets
              accounts flagged, and breaks the moment Google touches the DOM. It's not a stable foundation
              for anything beyond a weekend experiment.
            </Callout>

            <BlogPullQuote cite="The reality of every closed-product API question">
              The interesting part of NotebookLM isn't the model - it's the grounding. And the grounding
              is exactly the part Google hasn't exposed.
            </BlogPullQuote>

            <BlogDivider />

            <h2 className="font-serif text-2xl font-bold mt-8 mb-4">What you can do with the Gemini API today</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The model that powers NotebookLM - Gemini - is fully accessible via the Gemini API and
              Vertex AI. You can hit it from any backend with an API key, you get the same model family,
              and the rate limits are generous on the paid tier. What you don't get for free is NotebookLM's
              source-grounded behavior - that's an application layer Google built on top.
            </p>

            <Callout tone="info" title="The three pieces of grounded RAG">
              To reproduce what NotebookLM does, you need: (1) a chunker that splits your sources into
              passages, (2) a vector store that retrieves the most relevant chunks for a question, and
              (3) a prompt that forces the model to cite chunk IDs in its answer. Skip any one of these
              and you get a chatbot, not a research tool.
            </Callout>

            <h3 className="font-serif text-xl font-bold mt-8 mb-3">A minimal sketch</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The shortest honest version of grounded RAG on Gemini looks like this:
            </p>
            <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto mb-6"><code>{`// 1. ingest
const chunks = chunkDocument(pdfText, { size: 800, overlap: 100 });
const vectors = await embed(chunks); // text-embedding-004
await vectorStore.upsert(chunks, vectors);

// 2. retrieve
const hits = await vectorStore.query(userQuestion, { k: 6 });

// 3. ground
const prompt = \`Answer using ONLY these passages.
Cite passage IDs in [brackets].

\${hits.map((h, i) => \`[\${i}] \${h.text}\`).join("\\n\\n")}

Question: \${userQuestion}\`;

const answer = await gemini.generate({ model: "gemini-2.5-pro", prompt });`}</code></pre>

            <p className="text-muted-foreground leading-relaxed mb-6">
              That's the whole shape. Most teams add reranking, hybrid keyword + vector search, and a
              streaming response handler - but the skeleton above is what NotebookLM is doing under
              the hood, give or take a few production hardening passes.
            </p>

            <Callout tone="tip" title="Skip the hand-roll if you can">
              LangChain, LlamaIndex, and managed services like Vertex AI Search, Pinecone Assistant,
              and Supabase Vector each cover most of the boilerplate. Building from scratch is a great
              way to learn; it's a slow way to ship.
            </Callout>

            <BlogDivider />

            <h2 className="font-serif text-2xl font-bold mt-8 mb-4">If you didn't actually want an API</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              A lot of people search "NotebookLM API" because NotebookLM is missing something - notes
              that survive outside Google, per-project organization, export, a free tier sized for real
              work. If that's you, you don't need an API. You need a different notebook.
            </p>

            <p className="text-muted-foreground leading-relaxed mb-6">
              <Link to="/blog/notebooklm-alternative" className="text-primary underline underline-offset-4">
                We wrote a longer comparison of six honest alternatives
              </Link>{" "}
              - the short version: Notebook Archive is built around the workflow NotebookLM hints at but
              doesn't deliver. Real markdown notes you own. A per-notebook AI explain panel. Free tier
              sized for a semester. No API required, because the workflow lives inside the app.
            </p>

            <BlogDivider />

            <h2 className="font-serif text-2xl font-bold mt-8 mb-4">Frequently asked</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The questions developers ask most often about a NotebookLM API - answered without the
              speculation.
            </p>
            <Callout tone="tip" title="Before you scroll">
              If your question isn't here, it's almost certainly answered by the Gemini API docs - that's
              the real surface area, and it's well documented. NotebookLM-specific behavior lives in the
              app, not in any endpoint.
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
            title="Want a notebook that thinks with you - today?"
            body="Notebook Archive gives you real markdown notes with an AI explain panel built in. Free to start. No API required."
            to={CTA}
          />
        </article>

        <Footer />
      </div>
    </>
  );
}
