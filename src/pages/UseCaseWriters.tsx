import { useEffect } from "react";
import { UseCaseLayout } from "@/components/UseCaseLayout";
import { SeoHead } from "@/components/SeoHead";

export default function UseCaseWriters() {
  useEffect(() => {
    const ld = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Notebook Archive for Writers",
      description:
        "A quiet, structured note-taking app for writers. Draft long-form work with focus mode, word count goals, and frictionless export.",
      url: "https://notebookarchive.lovable.app/use-cases/writers",
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(ld);
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <>
      <SeoHead
        title="Note-Taking App for Writers — Notebook Archive"
        description="A calm Markdown editor with focus mode, word-count goals, and tags that organize ideas across drafts."
        path="/use-cases/writers"
      />
      <UseCaseLayout
        eyebrow="For writers"
        title={<>A quiet editor for <span className="text-primary">long-form work</span>.</>}
        intro="Markdown, focus mode, and a sidebar that disappears when you don't need it. Designed for the days you actually write."
        primaryCta={{ label: "Open the editor", to: "/auth" }}
        sections={[
          {
            title: "A canvas that gets out of the way",
            body:
              "Focus mode hides every element except your draft. Word count, character count, and read time live in a footer you can ignore until you want them. Headings, callouts, and tables are a keystroke away.",
            bullets: [
              "Markdown editor with a calm toolbar",
              "Focus mode for distraction-free sessions",
              "Live word count and read time",
            ],
          },
          {
            title: "Structure that scales with the manuscript",
            body:
              "Use notebooks for projects, nested notebooks for chapters or arcs, and tags for themes, characters, or research strands. Smart tags surface everywhere a name appears — useful when a side character becomes central.",
          },
          {
            title: "A daily word-count goal you can actually hit",
            body:
              "Set a target, watch the weekly graph fill in. The goal is optional and off by default — turn it on only when you want the accountability.",
          },
          {
            title: "Own your words",
            body:
              "Export to Markdown or PDF in one click. Notes are private by default. AI is opt-in, never trained on your work, and only sees what you explicitly send it.",
          },
        ]}
        workflow={[
          { step: "Morning", title: "Draft", body: "Focus mode on, sidebar hidden, write to your daily target." },
          { step: "Afternoon", title: "Research", body: "Drop PDFs and articles into a research notebook, tag passages by theme." },
          { step: "Friday", title: "Export", body: "Compile the week's progress to PDF or Markdown for your editor or backup." },
        ]}
        faqs={[
          {
            q: "Does it replace Scrivener?",
            a: "For many writers, yes — especially if you live in Markdown. Scrivener has a deeper manuscript binder; Notebook Archive is faster, web-based, and easier to share from.",
          },
          {
            q: "Can I write offline?",
            a: "Edits queue locally when you go offline and sync automatically when you reconnect.",
          },
          {
            q: "Will AI write my book?",
            a: "No, and that's intentional. AI is for explaining a term or summarizing source material — not for generating prose.",
          },
          {
            q: "Are my drafts backed up?",
            a: "Every save is persisted to the cloud. You can also export to Markdown or PDF for a local copy.",
          },
        ]}
      />
    </>
  );
}
