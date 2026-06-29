import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
  BlogPullQuote,
  BlogCallout,
  BlogCompareTable,
  BlogSteps,
  BlogDivider,
} from "@/components/blog/BlogVisuals";
import { AppDetailCard } from "@/components/blog/AppDetailCard";

import naShot from "@/assets/blog/notebook-archive.png.asset.json";
import otterShot from "@/assets/blog/otter.png.asset.json";
import notionShot from "@/assets/blog/notion.png.asset.json";
import obsidianShot from "@/assets/blog/obsidian.png.asset.json";
import memShot from "@/assets/blog/mem.png.asset.json";
import reflectShot from "@/assets/blog/reflect.png.asset.json";

const REF = "blog-otter-alt";
const CTA = `/auth?ref=${REF}&utm_source=blog&utm_medium=organic&utm_campaign=otter-alternative-students`;

const picks = [
  {
    name: "Notebook Archive",
    pricing: "Free; Pro $19/mo",
    imageUrl: naShot.url,
    imageAlt: "Notebook Archive - markdown notebook with an AI explain side panel",
    siteUrl: "https://notebookarchive.lovable.app",
    tagline: "The study notebook Otter never tried to be.",
    description:
      "Otter is a transcript machine. Notebook Archive is a notebook. You can paste the raw transcript in, ask the AI panel to summarize a tricky section in plain English, tag the lecture, and have it next to the rest of the course - not stranded in a sidebar of meetings. Free tier covers daily study; nothing is gated behind a 600-minute monthly cap.",
    pros: [
      "Notebooks-by-course beats Otter's flat meeting list for studying",
      "AI explain panel turns a transcript into revision notes, not just text",
      "Markdown export means your lectures outlive any app",
      "No monthly minute cap on the free tier",
    ],
    cons: [
      "No native live recording yet - paste from a recorder or Otter free tier",
      "No real-time live caption overlay",
    ],
    bestFor: "Students who record lectures but actually want to study from them later.",
    disclosure: "Disclosure: this is the product we make. Selection criteria are listed up top.",
  },
  {
    name: "Otter.ai",
    pricing: "Free (300 min/mo, 30 min/recording); Pro $16.99/mo",
    imageUrl: otterShot.url,
    imageAlt: "Otter.ai landing page",
    siteUrl: "https://otter.ai",
    tagline: "The category leader for live transcription.",
    description:
      "Worth keeping on your phone for live capture - the live transcript and speaker labels are still best-in-class. Where it falls down for students is everything after the lecture ends: there are no notebooks, no per-course organization, the AI chat is locked to one meeting at a time, and the free plan's 300-minute monthly cap quietly disappears two weeks into the semester.",
    pros: [
      "Best live transcription accuracy in the consumer tier",
      "Speaker separation works with multiple voices",
      "Mobile capture is one tap",
    ],
    cons: [
      "Built for meetings, not courses - no notebook or folder model",
      "300-minute monthly cap on free; 30-minute per-recording cap",
      "AI chat is per-meeting, can't reason across a whole semester",
    ],
    bestFor: "Live capture only. Move the transcript somewhere else to study from it.",
  },
  {
    name: "Notion AI",
    pricing: "Free; Plus $10/mo + AI $10/mo",
    imageUrl: notionShot.url,
    imageAlt: "Notion landing page",
    siteUrl: "https://www.notion.so",
    tagline: "A workspace that swallows your lecture notes whole.",
    description:
      "Strong if your whole degree already lives in Notion: paste a transcript into a course database, run AI summary, link it to a reading. The trade-offs are real - block-based markdown is lossy, AI is a $10 add-on on top of any paid plan, and the editor is slower to type into than a real notes app during a lecture.",
    pros: [
      "Excellent for cross-linking notes, readings, and tasks",
      "Databases are powerful once you set them up",
      "Sharing a transcript with a study group is one click",
    ],
    cons: [
      "AI is a paid add-on on top of the paid plan",
      "Block model makes markdown export lossy",
      "Slower in-editor performance during a live lecture",
    ],
    bestFor: "Students whose entire degree already lives inside Notion.",
  },
  {
    name: "Obsidian + Whisper",
    pricing: "Obsidian free; Whisper API ~$0.006/min",
    imageUrl: obsidianShot.url,
    imageAlt: "Obsidian landing page",
    siteUrl: "https://obsidian.md",
    tagline: "Local-first markdown with a community Whisper plugin.",
    description:
      "If you already use Obsidian and don't mind setup, the community Whisper plugin will transcribe an audio file straight into a markdown note. Backlinks let you connect 'Lecture 4' to the readings without a database. The catch is the same as it always is with Obsidian: you have to build the workflow before you can use it.",
    pros: [
      "Transcripts land directly inside your vault as plain markdown",
      "[[Backlinks]] tie a lecture to its reading without setup",
      "Lower long-term cost than any subscription transcription tool",
    ],
    cons: [
      "Whisper plugin and API key are DIY",
      "No real-time live transcription",
      "Mobile experience is rougher than purpose-built apps",
    ],
    bestFor: "Tinkerers who already live in Obsidian and want everything in one vault.",
  },
  {
    name: "Mem",
    pricing: "Free; Mem+ $10/mo",
    imageUrl: memShot.url,
    imageAlt: "Mem landing page",
    siteUrl: "https://mem.ai",
    tagline: "AI-first capture that organizes itself.",
    description:
      "Mem's pitch lands closest to what most Otter users actually want next: capture fast, let AI handle the filing, ask questions across everything later. The trade-off is less manual control - if you like to keep neat course folders, Mem's auto-organization can feel unstructured.",
    pros: [
      "AI search across your entire library, not one meeting at a time",
      "Mobile capture is quick and quiet",
      "Almost zero setup",
    ],
    cons: [
      "Less manual structure than course-based students often want",
      "Markdown export is lossy",
      "Free tier is smaller than Notebook Archive's",
    ],
    bestFor: "Students who capture more than they organize and want AI to do the filing.",
  },
  {
    name: "Reflect",
    pricing: "$10/mo",
    imageUrl: reflectShot.url,
    imageAlt: "Reflect landing page",
    siteUrl: "https://reflect.app",
    tagline: "Daily notes with backlinks and built-in AI.",
    description:
      "Reflect's daily-notes model fits the academic rhythm well: every day a new page, link out to [[Linear Algebra]] when it comes up. AI feels native rather than bolted on, and end-to-end encryption is genuinely rare in this category. The price of admission is no free tier and a structure that some students find too freeform.",
    pros: [
      "AI is built in, not a paid add-on",
      "End-to-end encrypted",
      "Daily-notes flow matches how lectures actually happen",
    ],
    cons: [
      "No free tier",
      "Daily-notes structure isn't for everyone",
      "No native transcription - paste from Otter or Whisper",
    ],
    bestFor: "Students who want a thinking layer on top of lecture notes.",
  },
];

const faq = [
  {
    q: "Is Otter.ai still good for students in 2026?",
    a: "For live capture, yes - the live transcript is still best-in-class. For studying afterward, no. There are no notebooks, no per-course organization, and the free plan's 300-minute monthly cap is roughly half a single week of lectures. Most students pair Otter with a real notes app or move to a tool that does both.",
  },
  {
    q: "What's the best free Otter.ai alternative for students?",
    a: "Notebook Archive's free tier covers daily lecture study including AI explain and markdown export, with no monthly minute cap. Obsidian with the community Whisper plugin is also free at the app level, but you pay per minute for the Whisper API and have to wire it up yourself.",
  },
  {
    q: "Can I import my Otter transcripts into one of these apps?",
    a: "Yes. Otter exports as .txt, .docx, .srt, or .pdf. Notebook Archive, Notion, Obsidian, and Reflect all accept those formats directly. Paste the transcript in, run an AI summary, tag the lecture, and you're done.",
  },
  {
    q: "Which Otter alternative has built-in AI summaries?",
    a: "Notebook Archive, Notion AI (paid add-on), Mem, and Reflect all have AI that summarizes and answers questions across your notes. Notebook Archive's AI panel is included in the free tier; Notion AI is $10/mo extra on top of any paid plan.",
  },
  {
    q: "Do I need a paid plan to record long lectures?",
    a: "With Otter, yes - the free tier caps recordings at 30 minutes each. With Notebook Archive, paste a transcript of any length and the AI panel can summarize it in sections. You only need a paid transcription tool when the lecture is happening; the studying afterward shouldn't need a subscription.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Otter.ai Alternatives for Students - Honest Comparison",
    description:
      "Six Otter.ai alternatives compared honestly for students - Notebook Archive, Notion AI, Obsidian + Whisper, Mem, Reflect, and Otter itself. Screenshots, pros and cons, and who each one is for.",
    datePublished: "2026-06-29",
    dateModified: "2026-06-29",
    author: { "@type": "Organization", name: "Notebook Archive" },
    publisher: { "@type": "Organization", name: "Notebook Archive" },
    mainEntityOfPage:
      "https://notebookarchive.lovable.app/blog/otter-ai-alternative-for-students",
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
      name: "Otter.ai Alternatives for Students",
      path: "/blog/otter-ai-alternative-for-students",
    },
  ]),
];

export default function BlogOtterAlternative() {
  useEffect(() => {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <>
      <SeoHead
        type="article"
        title="Otter.ai Alternatives for Students in 2026 - 6 Honest Picks"
        description="Six Otter.ai alternatives for students compared with screenshots, pros and cons, and pricing - Notebook Archive, Notion AI, Obsidian + Whisper, Mem, Reflect, and Otter."
        path="/blog/otter-ai-alternative-for-students"
        image="/og/og-otter-ai-alternative-for-students.jpg"
        jsonLd={jsonLd}
      />
      <div className="min-h-screen bg-background text-foreground">
        <PageHeader />

        <article className="max-w-3xl mx-auto px-6 pt-32 pb-20">
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <p className="text-sm uppercase tracking-widest text-accent font-semibold mb-4">
              Otter.ai Alternatives · Updated June 2026
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              The Honest <span className="text-primary">Otter.ai Alternative</span> Guide
              for Students
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Otter is a transcription tool, not a study tool. For one-tap live capture
              it's still very good. For everything that happens after the lecture ends -
              organizing by course, summarizing for an exam, finding the moment a
              professor defined a concept - it falls apart fast. These are the six apps
              students actually move to, what each does well, where it falls short, and
              who it's for.
            </p>
          </motion.header>

          <BlogKeyTakeaways
            points={[
              "Otter's free plan caps you at 300 minutes/month - roughly two weeks of lectures.",
              "Transcripts are a starting point, not a study tool. You need a notebook around them.",
              "The best alternative depends on what you do after the lecture, not during it.",
              "Most students end up with two tools: one for live capture, one for studying.",
            ]}
          />

          <BlogPullQuote cite="Otter user on r/GradSchool, 2026">
            I have 41 hours of lectures in Otter and no idea what's in any of them. The
            transcript was never the problem - finding what mattered was.
          </BlogPullQuote>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold mt-8 mb-4">How we picked</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The shortlist had to do three student-specific things: hold a serious
              semester's worth of lectures, organize by course or topic instead of a flat
              meeting list, and let you actually study from the transcript later - not
              just store it. Pricing is current as of June 2026. We left out
              meeting-only tools (Fathom, Fireflies, Read.ai) because they optimize for
              workplace calls, not a 90-minute lecture you'll revisit three months later.
            </p>

            <BlogCallout title="The real Otter problem" tone="info">
              Otter's free tier looks generous until you do the math: a typical
              undergraduate week is 8-12 hours of lectures. The 300-minute monthly cap
              runs out in the second week of classes - every semester, on schedule.
            </BlogCallout>

            <h2 className="font-serif text-2xl font-bold mb-6 mt-10">The six picks</h2>
            <div className="space-y-8">
              {picks.map((p, i) => (
                <AppDetailCard key={p.name} index={i + 1} {...p} />
              ))}
            </div>

            <BlogDivider />

            <h2 className="font-serif text-2xl font-bold mt-12 mb-6">
              Otter.ai vs the alternatives at a glance
            </h2>
            <BlogCompareTable
              headers={["", "Free tier", "Notebook model", "AI across all notes", "Markdown export"]}
              rows={[
                ["Notebook Archive", "Generous, no minute cap", "Yes, per-course", "Yes", "Yes"],
                ["Otter.ai", "300 min/mo, 30 min/recording", "No - flat meeting list", "Per-meeting only", "No"],
                ["Notion AI", "Free workspace; AI $10/mo extra", "Databases", "Yes (paid)", "Lossy"],
                ["Obsidian + Whisper", "Free + ~$0.006/min", "Folders + backlinks", "Plugins", "Yes"],
                ["Mem", "Limited", "Auto-organized", "Yes", "Lossy"],
                ["Reflect", "No free tier", "Daily notes + backlinks", "Yes", "Partial"],
              ]}
            />

            <h2 className="font-serif text-2xl font-bold mt-12 mb-4">
              The two-tool workflow most students land on
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              After watching dozens of students migrate off Otter, the pattern is
              consistent: keep one tool for capture, move studying to a real notebook.
            </p>
            <BlogSteps
              steps={[
                {
                  title: "Capture the lecture live",
                  body:
                    "Otter free tier on your phone is still the easiest one-tap capture. Stay inside 30 minutes per recording so the free plan keeps working.",
                },
                {
                  title: "Export the transcript",
                  body:
                    "When the lecture ends, hit Export → .txt or .docx. This is the only step that needs Otter; you can move on after.",
                },
                {
                  title: "Paste it into a notebook organized by course",
                  body:
                    "In Notebook Archive (or your tool of choice), create a note inside the course notebook. Paste the transcript, tag it with the week number, save.",
                },
                {
                  title: "Use an AI panel to make it studyable",
                  body:
                    "Ask the AI panel to summarize the lecture into 5 bullet points, then to explain the part you missed in plain English. The transcript becomes revision material.",
                },
                {
                  title: "Search across the semester, not the lecture",
                  body:
                    "When the exam comes, search by concept across every lecture - not by meeting title. This is the step Otter can't do.",
                },
              ]}
            />

            <h2 className="font-serif text-2xl font-bold mt-12 mb-4">
              How to pick the right one
            </h2>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                • <strong>You want one tool that handles studying after capture:</strong>{" "}
                Notebook Archive.
              </li>
              <li>
                • <strong>You only ever need the live transcript:</strong> Stay on Otter,
                stay under the cap.
              </li>
              <li>
                • <strong>Your entire degree already lives in Notion:</strong> Notion AI.
              </li>
              <li>
                • <strong>You already use Obsidian and like to tinker:</strong> Obsidian +
                Whisper.
              </li>
              <li>
                • <strong>You capture far more than you organize:</strong> Mem.
              </li>
              <li>
                • <strong>You want a daily-notes thinking layer:</strong> Reflect.
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

          <div className="border-t border-border pt-10 mt-10 text-center">
            <p className="font-serif text-2xl font-bold mb-4">
              The notebook your transcripts deserve
            </p>
            <p className="text-muted-foreground mb-6">
              Notebook Archive is free to start. Per-course notebooks. AI explain panel.
              Real markdown export. No monthly minute cap.
            </p>
            <Link
              to={CTA}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Open Notebook Archive
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </article>

        <Footer />
      </div>
    </>
  );
}
