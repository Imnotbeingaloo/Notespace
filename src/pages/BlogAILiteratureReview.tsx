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
import { BlogKeyTakeaways, BlogPullQuote, BlogCallout } from "@/components/blog/BlogVisuals";
import { Callout } from "@/components/blog/Callout";

const REF = "blog-ai-literature-review";
const CTA = `/auth?ref=${REF}&utm_source=blog&utm_medium=organic&utm_campaign=ai-literature-review`;

const faq = [
  {
    q: "Can AI actually do a literature review for me?",
    a: "No - and you shouldn't want it to. AI is excellent at summarizing a single paper, extracting definitions, and clustering themes across many papers. It's bad at judging methodological quality, spotting subtle contradictions, and citing accurately. Use it to move faster through the boring parts, not to replace the reading.",
  },
  {
    q: "Is it okay to use AI for academic writing?",
    a: "Most universities allow AI for ideation, summarization, and editing - but require disclosure for generated text. Check your institution's policy. A safe default: use AI to understand and organize sources, write the prose yourself, and disclose the tools you used.",
  },
  {
    q: "How do I avoid hallucinated citations?",
    a: "Never accept an AI-generated citation without opening the source. Tools that extract from PDFs you uploaded are far safer than tools that 'find' papers for you. In Notespace, the Explain panel only summarizes what's in the note - it doesn't invent references.",
  },
  {
    q: "What's the best note-taking system for a literature review?",
    a: "One note per paper, plus a synthesis note per theme. Each paper note holds the citation, your one-sentence takeaway, the method, and verbatim quotes with page numbers. Synthesis notes link out to the paper notes. This maps cleanly onto Zettelkasten if you prefer that vocabulary.",
  },
  {
    q: "Can Notespace handle long PDFs?",
    a: "Yes. Upload a PDF and the text is extracted into a note you can search, tag, and explain. For very long PDFs (100+ pages), split by chapter so the AI explain panel has tight context to work with.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Using AI for Literature Reviews: A Workflow for Researchers",
    description:
      "A practical, honest workflow for using AI to speed up academic literature reviews without losing rigor - covering PDF extraction, per-paper notes, thematic synthesis, and citation safety.",
    datePublished: "2026-06-27",
    dateModified: "2026-06-28",
    author: { "@type": "Organization", name: "Notespace" },
    publisher: { "@type": "Organization", name: "Notespace" },
    mainEntityOfPage:
      "https://notespace.lovable.app/blog/ai-literature-review-guide",
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
    { name: "Using AI for Literature Reviews: A Workflow for Researchers", path: "/blog/ai-literature-review-guide" },
  ])
];

export default function BlogAILiteratureReview() {
  useEffect(() => {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <>
      <SeoHead
        type="article"
        title="Using AI for Literature Reviews: A Workflow for Researchers (2026)"
        description="A practical workflow for using AI to speed up academic literature reviews without losing rigor. PDF extraction, per-paper notes, thematic synthesis, and citation safety."
        path="/blog/ai-literature-review-guide" image="/og/og-ai-literature-review-guide.jpg"
        jsonLd={jsonLd}
      />
      <div className="min-h-screen bg-background text-foreground">
        <PageHeader />

        <article className="blog-article max-w-3xl mx-auto px-6 pt-32 pb-24">
          <header
            
            
            
            className="mb-12"
          >
            <p className="text-sm uppercase tracking-widest text-accent font-semibold mb-4">
              For Researchers · Updated June 2026
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              Using <span className="text-primary">AI for Literature Reviews</span>:
              A Workflow for Researchers
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              You still have to read the papers. But you don't have to re-read
              them four times to find the one quote you remember. This is the
              workflow we recommend for PhD students, postdocs, and anyone
              wrangling more than twenty papers at once.
            </p>
          </header>

          <BlogKeyTakeaways
            points={[
              "AI is a research assistant, not a research substitute. Verify every claim before it lands in your literature review.",
              "Use AI to summarise and cluster sources - never to write the synthesis paragraph.",
              "Keep a 'citation provenance' column in your notes. Hallucinated references derail more theses than missed deadlines.",
              "The best AI workflows leave a paper trail you'd be happy to show your supervisor.",
            ]}
          />

          <BlogPullQuote cite="Every research advisor reviewing AI-assisted drafts in 2026">
            An AI literature review tool should make you a better reader, not a faster fabricator.
          </BlogPullQuote>

          <section className="mb-12 space-y-12">
            <div>
              <h2 className="font-serif text-2xl font-bold mb-3">
                What AI is actually good at in a lit review
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Three things, reliably:
              </p>
              <ul className="space-y-2 text-muted-foreground leading-relaxed">
                <li>
                  • <strong>Summarizing a single paper</strong> you've already
                  uploaded - abstract-level "what did they do, what did they
                  find" in a paragraph.
                </li>
                <li>
                  • <strong>Explaining a passage</strong> in plain language -
                  jargon-heavy methods sections, unfamiliar statistical
                  techniques, dense theory.
                </li>
                <li>
                  • <strong>Clustering themes</strong> across notes you wrote
                  yourself - "show me everything I've written about sample
                  selection bias."
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                What it's <em>not</em> good at: judging methodological quality,
                spotting subtle contradictions between papers, or finding
                sources that actually exist. Use it as a fast reader, not as a
                co-author.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold mb-3">
                The workflow, step by step
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The workflow below is the one that survives a real review of 80
                to 200 papers. It is deliberately boring. Every step earns its
                place by reducing the number of times you have to re-read a paper
                to find a single fact.
              </p>

              <Callout tone="key" title="The whole workflow in one line">
                One notebook per review, one note per paper, one tag per theme,
                and one synthesis note per question your supervisor might ask.
                Everything else is decoration.
              </Callout>

              <h3 className="font-serif text-lg font-bold mt-6 mb-2">
                1. One notebook per review, one note per paper
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Create a notebook for the review. Inside, every paper gets its
                own note titled <em>Author Year - Short Title</em>. This
                structure is boring on purpose - it scales to 200 papers without
                breaking.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Resist the urge to nest sub-notebooks by theme this early. Themes
                shift as you read; filenames don't. Keep the hierarchy flat and
                let tags do the thematic work later - that way a paper that turns
                out to be about three themes doesn't end up filed under only one.
              </p>

              <h3 className="font-serif text-lg font-bold mt-6 mb-2">
                2. Drop the PDF in, let extraction do the typing
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                In Notespace, upload the PDF directly to the paper note.
                The text is extracted and becomes searchable, taggable, and
                explainable. No more re-typing quotes or hunting through
                screenshots.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                For born-digital PDFs the extraction is near-perfect. For older
                scans, run them through a clean OCR pass first - figure captions
                and footnotes are where extraction quietly fails, and those are
                exactly the places your supervisor will ask about. Spot-check
                page 1 and a random middle page before trusting the note.
              </p>

              <h3 className="font-serif text-lg font-bold mt-6 mb-2">
                3. Use Explain on the methods section, not the abstract
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                The abstract you can read yourself. The 4-page methods section
                with three unfamiliar statistical models is where the AI Explain
                panel earns its keep - select the passage, ask for a plain-language
                walkthrough, and paste the explanation into your note as your
                own annotation.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Always paste the explanation back into the note with a clear
                label like <em>"Plain-English summary (AI-assisted)"</em>. That
                single line of provenance is what lets you trust your own notes
                six months later - and what lets your supervisor see exactly
                where AI helped and where your own reading begins.
              </p>

              <h3 className="font-serif text-lg font-bold mt-6 mb-2">
                4. Write your one-sentence takeaway. Always.
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Before you close a paper note, write a single sentence at the
                top: <em>"This paper argues X by doing Y, and the limit is Z."</em>
                Future-you will thank present-you when it's time to write the
                synthesis.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                If you can't write that sentence, you haven't finished the paper -
                you've just finished reading it. The forced compression is the
                whole point: it surfaces papers you only half-understood, and it
                turns the synthesis stage from "re-read 80 PDFs" into "scan 80
                one-line summaries".
              </p>

              <Callout tone="tip" title="The one-sentence test">
                If your takeaway sentence works for two different papers without
                edits, it isn't specific enough yet. Rewrite until it could only
                describe this paper.
              </Callout>

              <h3 className="font-serif text-lg font-bold mt-6 mb-2">
                5. Tag by theme, not by paper
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Tags like <code>#method-bias</code>, <code>#sample-selection</code>,
                <code> #counter-evidence</code> turn 80 paper notes into a
                queryable database. Global search across tags is how a synthesis
                note actually gets written.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Cap yourself at roughly fifteen tags for the whole review. Every
                new tag past that is usually a sub-theme that belongs inside an
                existing one. A tight tag list keeps search useful - a sprawling
                one quietly turns into the same problem you had with folders.
              </p>

              <h3 className="font-serif text-lg font-bold mt-6 mb-2">
                6. Build synthesis notes that link back to paper notes
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                A synthesis note is a theme - "What does the field say about
                X?" - with bullet points that link to the underlying paper notes.
                This is where the review actually lives. It's also the document
                you turn into a draft chapter.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Treat synthesis notes as living documents. Start one the moment
                you spot a pattern across three papers - don't wait until the
                writing-up stage. By the time you sit down to draft the chapter,
                you'll already have the argument scaffold, the citations, and
                the counter-examples queued up next to each claim.
              </p>

              <h3 className="font-serif text-lg font-bold mt-6 mb-2">
                7. Cite from your notes, not from AI
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Every citation in the final draft should trace back to a paper
                note you wrote. Never paste an AI-generated citation without
                opening the source. This is the single biggest reason
                AI-assisted reviews fail review.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                A useful rule: if the citation didn't pass through your
                reference manager, it doesn't go in the manuscript. AI models
                still invent plausible-looking DOIs, author lists, and journal
                years - and they invent them most convincingly for the topics
                you know least about, which is exactly where you're most likely
                to trust them.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold mb-3">
                The honest limits
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                AI speeds up the boring parts of a literature review; it does
                not replace the parts that matter. Before you lean on it heavily,
                walk into the work with these limits in mind - they're the same
                ones every research integrity office is currently flagging.
              </p>
              <ul className="space-y-2 text-muted-foreground leading-relaxed">
                <li>
                  • AI summaries flatten nuance. The "small caveat in section 4"
                  is exactly the thing it tends to drop.
                </li>
                <li>
                  • PDFs with bad OCR (old scans, double-column journals) extract
                  badly. Re-scan or re-type the key sections.
                </li>
                <li>
                  • The Explain panel can't tell you a paper is wrong. It can
                  only tell you what the paper says.
                </li>
                <li>
                  • Cross-paper comparisons across long contexts drift. Trust
                  synthesis you wrote; double-check synthesis a model wrote.
                </li>
              </ul>
              <Callout tone="warn" title="The one mistake that ends a viva">
                A single fabricated citation is enough to sink the credibility
                of an otherwise solid review. Verify every reference against the
                actual PDF before it leaves your notes.
              </Callout>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold mt-12 mb-6">
                Frequently asked
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Quick answers to the questions PhD students send us most often
                when they're setting up an AI-assisted review for the first
                time. If your question isn't here, the rest of the workflow
                above is the long answer to most of them.
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
            </div>
          </section>

          <div className="border-t border-border pt-10 mt-10 text-center">
            <p className="font-serif text-2xl font-bold mb-4">
              Run your next literature review in Notespace
            </p>
            <p className="text-muted-foreground mb-6">
              Upload PDFs, explain dense passages, tag by theme, and keep your
              citations honest. Free to start.
            </p>
            <Link
              to={CTA}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Open Notespace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </article>

        <Footer />
      </div>
    </>
  );
}
