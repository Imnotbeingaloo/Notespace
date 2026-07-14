import { UseCaseLayout } from "@/components/UseCaseLayout";
import { SeoHead } from "@/components/SeoHead";
import { breadcrumbsJsonLd } from "@/lib/seo-breadcrumbs";

export default function UseCaseWriters() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Notespace for Writers",
      description:
        "A quiet, structured note-taking app for writers. Draft long-form work with focus mode, word count goals, and frictionless export.",
      url: "https://notebookarchive.lovable.app/use-cases/writers",
    },
    breadcrumbsJsonLd([
      { name: "Use cases", path: "/use-cases" },
      { name: "Writers", path: "/use-cases/writers" },
    ]),
  ];

  return (
    <>
      <SeoHead
        title="Note-Taking App for Writers - Notespace"
        description="A calm Markdown editor with focus mode, word-count goals, and tags that organize ideas across drafts."
        path="/use-cases/writers"
        jsonLd={jsonLd}
      />

      <UseCaseLayout
        eyebrow="For writers"
        title={<>A quiet editor for <span className="text-primary">long-form work</span>.</>}
        intro="Markdown, focus mode, and a sidebar that disappears when you don't need it. Designed for the days you actually write."
        primaryCta={{ label: "Open the editor", to: "/auth" }}
        overview={[
          "Writing tools tend to come in two flavors: bloated suites that interrupt you with comments and version histories, or minimalist editors that look beautiful but can't hold a 90,000-word manuscript without falling apart.",
          "Notespace sits between them. It treats writing as the primary act - focus mode, fast keyboard shortcuts, a Markdown editor that doesn't fight you - while still giving you the structure a long project needs: nested notebooks for chapters, tags for characters and themes, and a research notebook that stays one click away from the draft.",
          "It's not pretending to be Scrivener. It's not trying to replace your word processor on the day you ship to an editor. It's the app you live in while the work is being made.",
        ]}
        sections={[
          {
            title: "A canvas that gets out of the way",
            body:
              "Focus mode hides every element except your draft. Word count, character count, and read time live in a footer you can ignore until you want them. Headings, callouts, and tables are a keystroke away. The editor renders cleanly even at 30,000 words - nothing lags, nothing stutters.",
            bullets: [
              "Markdown editor with a quiet, customizable toolbar",
              "Focus mode for distraction-free sessions",
              "Live word count, character count, and read time",
              "Notebook-paper ruled background, optional, for the feel of writing on a page",
            ],
          },
          {
            title: "Structure that scales with the manuscript",
            body:
              "Use notebooks for projects, nested notebooks for parts or arcs, individual notes for chapters or scenes. Tags handle the cross-cutting concerns - themes, characters, settings, research strands - that don't fit a tree structure. Smart tags surface every note that mentions a name, which matters the day a side character becomes central and you need to find every scene they've appeared in.",
            bullets: [
              "Notebooks → nested notebooks → notes (as deep as the work requires)",
              "Drag to reorder when the structure of the book changes",
              "Tag chips in the sidebar - click any tag to see every note that uses it",
              "Standalone notes for stray ideas that don't belong to a project yet",
            ],
          },
          {
            title: "A daily word-count goal you can actually hit",
            body:
              "Set a target, watch the weekly graph fill in. The goal is optional and off by default - turn it on the weeks you need accountability, leave it off when you don't. The graph never shames you. Streaks reward consistency without punishing a missed day.",
          },
          {
            title: "Research and draft, side by side",
            body:
              "Keep a research notebook in the same workspace. Upload PDFs of source material, drag in articles, paste in interview transcripts. Tag passages by theme. When you need a quote in the draft, search finds it across the entire workspace in one keystroke.",
          },
          {
            title: "Own your words",
            body:
              "Export to Markdown or PDF in one click. No proprietary format. Notes are private by default. AI is opt-in, never trained on your work, and only sees what you explicitly send it. You can write a sensitive piece without worrying about who else is reading.",
          },
          {
            title: "Reliable when it has to be",
            body:
              "Every save is persisted to the cloud. Edits queue offline and sync when you reconnect. There is no scenario where you lose a day's work because the connection dropped.",
          },
        ]}
        scenarios={[
          {
            situation: "You're 40,000 words into a novel and a side character is becoming the protagonist.",
            problem: "Their early scenes are scattered across fifteen chapters. You need to find every one and revise their voice.",
            solution: "Click the character's tag in the sidebar. Every scene they appear in lists in chronological order. Open them one by one and rewrite - the tag stays as you go.",
          },
          {
            situation: "You're drafting a long essay with twelve cited sources.",
            problem: "You can't remember which source had the statistic you want to use.",
            solution: "Drop all twelve PDFs in a research notebook. Search the statistic - Notespace finds it across the extracted text. Drag the quote into the draft, keep the source link in the margin.",
          },
          {
            situation: "You wrote 3,000 words on a flight in airplane mode.",
            problem: "The plane lands and you panic that nothing saved.",
            solution: "Open the app. Edits queued locally are already syncing. Word count matches what you remember. Nothing was lost.",
          },
          {
            situation: "You finished a draft. Your editor wants it as a .docx.",
            problem: "You've been writing in Markdown.",
            solution: "Export to Markdown, run it through pandoc (one command), send the .docx. Or export to PDF if a clean print version is enough. Both options ship in the app today.",
          },
        ]}
        painPoints={[
          {
            problem: "Markdown intimidates me.",
            answer: "The toolbar inserts the syntax for you - bold, italic, headings, lists, links, tables. You can write a full draft without typing a single asterisk. Once you start noticing the patterns, the keyboard shortcuts become faster than reaching for a mouse.",
          },
          {
            problem: "I write longhand first.",
            answer: "Take a photo, drop it into a note, type up the transcript when you have time. Standalone notes are perfect for this kind of in-between capture.",
          },
          {
            problem: "I need version history.",
            answer: "Honest answer: granular version history isn't shipped yet. Frequent autosave keeps recent state safe, and Markdown export to a local git repo is the workaround serious writers use today. We're working on built-in versions.",
          },
          {
            problem: "I want AI to write for me.",
            answer: "That's not what this is. Notespace's AI explains a term, summarizes a source, or clarifies an idea you wrote. It does not generate prose for your manuscript. If generated text is what you want, this is the wrong tool.",
          },
          {
            problem: "I publish to Substack / WordPress.",
            answer: "Both accept Markdown. Export from Notespace, paste into the editor on the other end. Formatting carries cleanly because Markdown is a universal interchange format.",
          },
        ]}
        comparison={{
          headingOther: "Scrivener / Ulysses",
          rows: [
            { capability: "Where it runs", notebookArchive: "Browser, any device.", others: "Native apps - usually Mac and iOS only." },
            { capability: "Markdown-first", notebookArchive: "Yes. The editor is Markdown.", others: "Scrivener uses rich text; Ulysses is Markdown but Apple-only." },
            { capability: "Manuscript binder", notebookArchive: "Notebooks + nested notebooks + tags.", others: "Scrivener's binder is more elaborate; Ulysses uses groups." },
            { capability: "AI for clarification", notebookArchive: "Inline explanations and summaries.", others: "Limited or none." },
            { capability: "Export to .docx", notebookArchive: "Via Markdown + pandoc (one command).", others: "Native; Scrivener's Compile is best-in-class." },
            { capability: "Subscription cost", notebookArchive: "Free tier; Pro starts at $19.", others: "Scrivener $60 one-time; Ulysses $5.99/month." },
            { capability: "Best for", notebookArchive: "Drafting, essays, long-form nonfiction, journals.", others: "Novelists who want a deep binder and rich compile pipeline." },
          ],
        }}
        quote={{
          text: "It's the first writing app I've used that doesn't make me feel like I need to learn the app before I can write.",
          attribution: "the kind of feedback we hear most often from writers",
        }}
        workflow={[
          { step: "Morning", title: "Draft", body: "Focus mode on, sidebar hidden, write to your daily target. The Pomodoro timer keeps blocks honest." },
          { step: "Afternoon", title: "Research", body: "Drop PDFs and articles into the research notebook. Tag passages by theme. Add inline links from draft to source." },
          { step: "Friday", title: "Review", body: "Read the week's work in the editor. Move loose standalone notes into the right notebook. Tag anything new." },
          { step: "Sunday", title: "Export", body: "Export the week's chapters to Markdown for backup or to PDF for a clean read-through on a tablet." },
        ]}
        tips={[
          { title: "Treat notebooks as containers, not categories", body: "One notebook per project. Inside, structure by part or chapter. Tags handle every cross-cutting concern that doesn't fit a folder." },
          { title: "Use focus mode for the messy first draft", body: "The cleanest way to silence the editor's voice is to remove every UI element except the text. Focus mode does exactly that." },
          { title: "Keep a 'cuts' notebook", body: "Anything you delete from the draft that you might want back. Saves you from cutting brutally." },
          { title: "Tag scenes by POV", body: "Useful when you're tracking how often each character drives the story. Click the tag, count the notes." },
          { title: "Set the word-count goal to something achievable", body: "A 500-word target you hit every day beats a 2,000-word target you miss four days a week." },
          { title: "Export to Markdown often", body: "Even if you never need the backup, it forces you to feel the manuscript as a whole rather than a list of scenes." },
        ]}
        faqs={[
          { q: "Does it replace Scrivener?", a: "For many writers, yes - especially if you live in Markdown and want something cross-platform. Scrivener has a deeper manuscript binder and a more powerful Compile feature. Notespace is faster, browser-based, and easier to share from." },
          { q: "Can I write offline?", a: "Edits queue locally when you go offline and sync automatically when you reconnect. You won't lose work to a flight or a dropped connection." },
          { q: "Will AI write my book?", a: "No, and that's intentional. AI is for explaining a term or summarizing source material - not for generating prose." },
          { q: "Are my drafts backed up?", a: "Every save is persisted to the cloud. You can also export to Markdown or PDF for a local copy." },
          { q: "Can I write in non-English languages?", a: "Yes. The editor is Unicode and works in any language. AI features support most major languages." },
          { q: "Does it integrate with my publishing workflow?", a: "Markdown export plus pandoc covers most publishing pipelines. Direct integrations with Substack, Medium, and WordPress are on the roadmap." },
          { q: "Can collaborators leave comments?", a: "Not yet - Notespace is single-author focused today. Public share links give read-only access to drafts; back-and-forth happens elsewhere." },
        ]}
      />
    </>
  );
}
