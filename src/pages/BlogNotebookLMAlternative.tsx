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
import {
  BlogKeyTakeaways,
  BlogCallout,
  BlogCompareTable,
  BlogSteps,
  BlogDivider,
} from "@/components/blog/BlogVisuals";
import { AppDetailCard } from "@/components/blog/AppDetailCard";
import { Callout } from "@/components/blog/Callout";

import naShot from "@/assets/blog/notebook-archive.png.asset.json";
import notionShot from "@/assets/blog/notion.png.asset.json";
import obsidianShot from "@/assets/blog/obsidian.png.asset.json";
import memShot from "@/assets/blog/mem.png.asset.json";
import reflectShot from "@/assets/blog/reflect.png.asset.json";
import onenoteShot from "@/assets/blog/onenote.png.asset.json";

const REF = "blog-notebooklm-alt";
const CTA = `/auth?ref=${REF}&utm_source=blog&utm_medium=organic&utm_campaign=notebooklm-alternative`;

const picks = [
  {
    name: "Notebook Archive",
    pricing: "Free; Pro $19/mo",
    pricingTone: "amber" as const,
    imageUrl: naShot.url,
    imageAlt: "Notebook Archive - markdown notebook with an AI explain side panel",
    siteUrl: "https://notebookarchive.lovable.app",
    tagline: "A study notebook with the AI panel one click away.",
    description:
      "NotebookLM is brilliant at one trick: drop sources in, get a grounded answer back. The trick stops there. There are no real notes, no per-course organization, no markdown export, and your work lives inside a Google product that has been deprecated before. Notebook Archive is the inverse: a notebook you actually write in, with an AI panel that explains, summarizes, and questions what you've written - and a free tier built for a semester, not a demo.",
    pros: [
      "Markdown notes you own and can export",
      "Per-course notebooks beat NotebookLM's flat source list",
      "AI panel explains concepts in plain English without writing your essay",
      "Free tier sized for a full semester of work",
    ],
    cons: [
      "No native podcast/audio overview - NotebookLM still wins that column",
      "AI credits on the free tier are capped monthly",
    ],
    bestFor: "Students and researchers who want to study from sources, not just chat with them.",
    disclosure: "Disclosure: this is the product we make. Selection criteria are listed up top.",
  },
  {
    name: "Notion AI",
    pricing: "Free workspace; AI $10/user/mo",
    pricingTone: "amber" as const,
    imageUrl: notionShot.url,
    imageAlt: "Notion AI workspace",
    siteUrl: "https://notion.so",
    tagline: "If your whole life already lives in databases.",
    description:
      "Notion AI can summarize a page, draft a section, and answer questions across your workspace. It's the right pick if you've already committed to Notion for everything else - classes, projects, life admin. The tradeoff is the friction of databases: every notebook becomes a schema decision, and the AI is good but not source-grounded the way NotebookLM is. Plan for the $10/month add-on; the free tier's AI quota disappears in days.",
    pros: [
      "Workspace-wide AI search across pages",
      "Best-in-class collaboration and templates",
    ],
    cons: [
      "Database setup tax before you can write a single note",
      "AI is generative, not source-grounded - hallucinations happen",
      "Markdown export is lossy (databases mangle on the way out)",
      "AI is a $10/user/mo add-on on top of any paid plan",
    ],
    bestFor: "People already running their life in Notion.",
  },
  {
    name: "Obsidian (with Smart Connections / Copilot)",
    pricing: "Free; sync $4/mo",
    pricingTone: "sky" as const,
    imageUrl: obsidianShot.url,
    imageAlt: "Obsidian vault with plugins",
    siteUrl: "https://obsidian.md",
    tagline: "The DIY route - infinitely flexible, infinitely your problem.",
    description:
      "Obsidian plus a plugin like Smart Connections or Copilot gets you most of the NotebookLM experience locally. You point it at a folder of markdown files - your sources, your notes - and chat with them via the API key of your choice. The catch is the setup: API keys to manage, plugins to update, vault structure to maintain. Worth it if you already live in Obsidian; overkill if you don't.",
    pros: [
      "Files are plain markdown on your disk - nothing is hostage",
      "Bring your own model (OpenAI, Claude, local Llama)",
      "Backlinks and graph view are unmatched",
    ],
    cons: [
      "You're the sysadmin: plugins, keys, updates, vault hygiene",
      "Mobile experience is functional, not delightful",
      "Each new device needs setup",
    ],
    bestFor: "Tinkerers who want NotebookLM's behavior on local files.",
    aside: "The Smart Connections plugin broke twice for us during the term it shipped v2. Recovery was fine because everything is markdown - but the debugging time was real.",
  },
  {
    name: "Mem",
    pricing: "Free limited; Mem X $14.99/mo",
    pricingTone: "amber" as const,
    imageUrl: memShot.url,
    imageAlt: "Mem AI auto-organized notes",
    siteUrl: "https://mem.ai",
    tagline: "Capture-first, organization-later.",
    description:
      "Mem's bet is that you shouldn't have to organize anything - dump it in, let the AI surface what you need. It works surprisingly well for fast capture and cross-note retrieval, and the chat interface is closer to NotebookLM's feel than most. The weakness shows up when you actually want structure: there are no real notebooks, just tags and AI-suggested links, and exports are lossy enough that migration is painful.",
    pros: [
      "Lowest-friction capture in the category",
      "Cross-note AI chat is genuinely useful",
    ],
    cons: [
      "No notebook model - everything is a flat stream",
      "Export is lossy",
      "Free tier is too small for serious study",
    ],
    bestFor: "People who capture far more than they organize.",
  },
  {
    name: "Reflect",
    pricing: "$10/mo, no free tier",
    pricingTone: "rose" as const,
    imageUrl: reflectShot.url,
    imageAlt: "Reflect daily notes with backlinks",
    siteUrl: "https://reflect.app",
    tagline: "Daily notes + GPT-4, polished and opinionated.",
    opener:
      "Start with the price: $10 a month from day one, no free tier, no month-to-month escape hatch shorter than that. If you're not sure yet, this isn't the app to try. If you are: Reflect is the most aesthetically considered NotebookLM alternative on the list.",
    description:
      "Daily notes, backlinks, end-to-end encryption, and an AI assistant that can summarize, expand, and answer across your notes. The opinionated structure (daily notes are the spine) is either exactly what you want or a hard no.",
    pros: [
      "Excellent design and writing experience",
      "End-to-end encryption is real",
      "AI is well-integrated, not gimmicky",
    ],
    cons: [
      "$10/mo from day one, no free tier",
      "Daily-notes model is opinionated",
      "Smaller community than Obsidian or Notion",
    ],
    bestFor: "Writers and thinkers who already keep a daily journal.",
    aside: "We tried Reflect for a full term of lecture notes. The daily-notes spine is beautiful and completely wrong for coursework - notes belonged to a course, not to a Tuesday.",
  },
  {
    name: "OneNote + Copilot",
    pricing: "Free; Copilot via Microsoft 365 from ~$20/mo",
    pricingTone: "amber" as const,
    imageUrl: onenoteShot.url,
    imageAlt: "OneNote with Copilot",
    siteUrl: "https://www.onenote.com",
    tagline: "If you're already in the Microsoft 365 stack.",
    description:
      "OneNote with Copilot can summarize pages, draft sections, and answer questions across your notebook - and OneNote's free tier is genuinely generous. The catch is that the good AI is gated behind a Microsoft 365 subscription, the freeform canvas gets messy fast for academic use, and the export story is rough. Solid if your school or job already pays for 365; questionable otherwise.",
    pros: [
      "Free notebook is generous on storage",
      "Stylus and handwriting support are first-class",
      "Deep Microsoft 365 integration",
      "Cross-device sync works out of the box",
    ],
    cons: [
      "Copilot requires a paid 365 subscription",
      "Freeform canvas is a footgun for structured study",
    ],
    bestFor: "Stylus users in a Microsoft 365 household.",
  },
];

const faq = [
  {
    q: "Why look for a NotebookLM alternative at all?",
    a: "Short version: NotebookLM is a research demo, not a notebook. Most people move on when they realize they can't export the chat, can't organize by course, and can't write a real note inside it.",
  },
  {
    q: "Can I import my NotebookLM sources somewhere else?",
    a: "NotebookLM doesn't currently offer a bulk export of your sources or your chat history. The practical workaround is to keep the original PDFs and documents (you uploaded them, so you have them), drop them into the new tool, and re-run the questions that mattered. Treat NotebookLM as ephemeral and your local files as the source of truth.",
  },
  {
    q: "Which alternative has the closest 'chat with my docs' feel?",
    a: "Mem is closest out of the box - paste sources, chat across them, no setup. Obsidian with Smart Connections or Copilot gets you closer to NotebookLM's source-grounded behavior if you're willing to manage API keys. Notebook Archive takes a different approach: the AI is a panel that explains and summarizes the notes you write, which is what most students settle into after a few weeks.",
  },
  {
    q: "Is NotebookLM free forever?",
    a: "The base product is free today. NotebookLM Plus is paid and bundled into AI Premium subscriptions. Google's track record with free research products (Inbox, Google Notebook, the original Bard, etc.) is mixed, so 'free forever' is a planning assumption you may not want to make for a four-year degree.",
  },
  {
    q: "Does Notebook Archive do source-grounded answers like NotebookLM?",
    a: "Differently. NotebookLM's bet is that the AI should only answer from your sources. Notebook Archive's bet is that you should write the notes and the AI should help you understand and revise them. You can paste source material in and ask the AI panel to summarize or explain it, but the shape of the product is a notebook you study from.",
  },
  {
    q: "What about privacy?",
    a: "NotebookLM processes your sources on Google's infrastructure under standard Google terms. Obsidian keeps files local. Reflect is end-to-end encrypted. Notebook Archive stores notes encrypted in transit and at rest on a managed backend, with private buckets and row-level access control - your notes are not used to train any model.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "NotebookLM Alternatives 2026: 6 Apps People Actually Move To",
    description:
      "Six NotebookLM alternatives compared for students, researchers, and writers - Notebook Archive, Notion AI, Obsidian, Mem, Reflect, and OneNote.",
    datePublished: "2026-06-30",
    dateModified: "2026-06-30",
    author: { "@type": "Organization", name: "Notebook Archive" },
    publisher: {
      "@type": "Organization",
      name: "Notebook Archive",
      logo: {
        "@type": "ImageObject",
        url: "https://notebookarchive.lovable.app/favicon.ico",
      },
    },
    mainEntityOfPage:
      "https://notebookarchive.lovable.app/blog/notebooklm-alternative",
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
    {
      name: "NotebookLM Alternatives",
      path: "/blog/notebooklm-alternative",
    },
  ]),
];

export default function BlogNotebookLMAlternative() {
  useEffect(() => {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <>
      <SeoHead
        type="article"
        title="NotebookLM Alternatives 2026: 6 Apps People Actually Move To"
        description="Six NotebookLM alternatives compared for 2026 - screenshots, pros and cons, pricing, and a clear pick for each kind of person."
        path="/blog/notebooklm-alternative"
        jsonLd={jsonLd}
      />
      <div className="min-h-screen bg-background text-foreground">
        <PageHeader />

        <article className="blog-article max-w-3xl mx-auto px-6 pt-32 pb-24">
          <header className="mb-12">
            <p className="text-sm uppercase tracking-widest text-accent font-semibold mb-4">
              NotebookLM Alternatives · Updated June 2026
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              <span className="text-primary">NotebookLM Alternatives</span>: 6 Apps People Actually Move To
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              NotebookLM is a remarkable demo of source-grounded AI. It is not, in any
              meaningful sense, a notebook. There is no writing surface, no
              per-course organization, no markdown export, and the whole experience lives
              inside a Google research product with an uncertain shelf life. These are
              the six apps people actually move to - what each does well, where it falls
              short, and who it's for.
            </p>
          </header>

          <BlogKeyTakeaways
            points={[
              "NotebookLM is great at Q&A over your sources. The gap starts when you want a place to write.",
              "There's no bulk export of your sources or chats. Treat NotebookLM as ephemeral.",
              "The right replacement depends on what you do with the answers - study, write, or just look them up.",
              "Most people end up with a notebook and an AI panel side by side.",
            ]}
          />




          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold mt-8 mb-4">How we picked</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Every app on this list had to do three things NotebookLM doesn't: give you a
              real writing surface (not a chat box), organize work by course or project
              (not a flat source list), and let you export what you wrote in a format
              that outlives the app (markdown, ideally). We left out pure chat
              interfaces (ChatGPT, Claude) - they're tools, not notebooks - and
              meeting-only transcribers, which solve a different problem. Pricing is
              current as of June 2026.
            </p>

            <Callout tone="key" title="What we weighted most">
              A writing surface you own, organization that survives a semester, and an
              export path that doesn't strand your work. A perfect AI answer you can't
              save, organize, or revise is worse than a 90% one you can.
            </Callout>

            <h2 className="font-serif text-2xl font-bold mb-6 mt-10">The six picks</h2>
            <div className="space-y-8">
              {picks.map((p, i) => (
                <AppDetailCard key={p.name} index={i + 1} {...p} />
              ))}
            </div>
          </section>

          {/* Full-bleed comparison band */}
          <div className="relative -mx-6 md:-mx-24 lg:-mx-40 bg-muted/40 border-y border-border py-12 px-6 md:px-12 my-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">
                NotebookLM vs the alternatives at a glance
              </h2>
              <BlogCompareTable
                headers={[
                  "",
                  "Writing surface",
                  "Per-course organization",
                  "Markdown export",
                  "Audio overview",
                  "Free tier for a semester",
                ]}
                rows={[
                  ["Notebook Archive", "Yes", "Yes", "Yes", "No", "Yes (AI credits capped)"],
                  ["NotebookLM", "No - chat only", "No - flat sources", "No", "Yes (best-in-class)", "Yes (today)"],
                  ["Notion AI", "Yes", "Databases", "Lossy", "No", "AI add-on $10/mo"],
                  ["Obsidian + plugin", "Yes", "Folders", "Yes", "No", "Yes (BYO key)"],
                  ["Mem", "Yes", "No - flat stream", "Lossy", "No", "Limited"],
                  ["Reflect", "Yes", "Daily notes", "Partial", "No", "No free tier"],
                  ["OneNote + Copilot", "Yes", "Notebooks", "Poor", "No", "Copilot is paid"],
                ]}
              />
              <p className="mt-4 text-sm text-muted-foreground">
                One column NotebookLM genuinely owns: the two-host audio overview. Nothing else on this list matches it yet.
              </p>
            </div>
          </div>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold mt-4 mb-4">
              The workflow most people land on
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              By week 6 of a semester, the pattern users describe is consistent: notes get written first, the AI is consulted second, and everything lives in a folder structure the user controls.
            </p>

            <BlogSteps
              steps={[
                {
                  title: "Keep the source PDFs locally",
                  body:
                    "Whatever app you use, treat the original PDFs as the source of truth. NotebookLM, Mem, and Notion all process them in the cloud - if any of them goes away, you still have the files.",
                },
                {
                  title: "Create a notebook per course or project",
                  body:
                    "Not per source. The unit you'll revisit is 'this class' or 'this paper', not 'this PDF'. Per-source organization is what makes NotebookLM feel powerful in week one and useless in week six.",
                },
                {
                  title: "Write the note first, ask the AI second",
                  body:
                    "Drop your reading notes in. Highlight the part you didn't understand and ask the AI panel to explain it. The AI improves the note you already wrote.",
                },
                {
                  title: "Use the AI to revise the note you have",
                  body:
                    "Ask for a 5-bullet summary of the lecture. Ask for the three questions a strict examiner would ask. Ask it to explain the confusing paragraph as if you were 12. This is where source-grounded models earn their keep.",
                },
                {
                  title: "Export to markdown at the end of every term",
                  body:
                    "Whichever tool you choose, do a markdown export when the semester ends. This is the backup that lets you switch tools later without losing two years of notes.",
                },
              ]}
            />

            <h2 className="font-serif text-2xl font-bold mt-12 mb-4">
              How to pick the right one
            </h2>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                • <strong>You want a notebook with the AI panel built in:</strong>{" "}
                Notebook Archive.
              </li>
              <li>
                • <strong>You only ever need to chat with sources, never to write:</strong>{" "}
                Stay on NotebookLM, but keep the source PDFs.
              </li>
              <li>
                • <strong>Your degree already lives in Notion:</strong> Notion AI with the
                $10/mo add-on.
              </li>
              <li>
                • <strong>You already use Obsidian and like to tinker:</strong> Obsidian +
                Smart Connections or Copilot.
              </li>
              <li>
                • <strong>You capture far more than you organize:</strong> Mem.
              </li>
              <li>
                • <strong>You want a polished daily-notes thinking tool:</strong> Reflect.
              </li>
              <li>
                • <strong>You're already paying for Microsoft 365:</strong> OneNote +
                Copilot.
              </li>
            </ul>

            <h2 className="font-serif text-2xl font-bold mt-16 mb-6">Frequently asked</h2>

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

        </article>

        {/* Full-bleed asymmetric CTA */}
        <div className="bg-foreground text-background py-16 px-6">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center gap-8 md:gap-12">
            <div className="flex-1">
              <p className="font-serif text-3xl md:text-4xl font-bold mb-3 leading-tight">
                A notebook, not a chatbot.
              </p>
              <p className="text-background/70 text-lg leading-relaxed">
                Notebook Archive is free to start. Per-course notebooks, an AI explain panel, and a markdown export that outlives the app.
              </p>
            </div>
            <Link
              to={CTA}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition self-start md:self-auto whitespace-nowrap"
            >
              Open Notebook Archive
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
