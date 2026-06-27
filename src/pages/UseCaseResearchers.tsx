import { useEffect } from "react";
import { UseCaseLayout } from "@/components/UseCaseLayout";
import { SeoHead } from "@/components/SeoHead";

export default function UseCaseResearchers() {
  useEffect(() => {
    const ld = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Notebook Archive for Researchers",
      description:
        "Annotate papers, pull quotes from PDFs, and search across every notebook. A note-taking app for serious research workflows.",
      url: "https://notebookarchive.lovable.app/use-cases/researchers",
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
        title="Note-Taking App for Researchers — Notebook Archive"
        description="Annotate papers, summarize PDFs, and retrieve quotes across every notebook. Built for serious research."
        path="/use-cases/researchers"
      />
      <UseCaseLayout
        eyebrow="For researchers"
        title={<>A serious notebook for <span className="text-primary">serious research</span>.</>}
        intro="Read, annotate, and cross-reference without losing a single source. Built for literature reviews, fieldwork, and long projects."
        primaryCta={{ label: "Start free", to: "/auth" }}
        sections={[
          {
            title: "Every source in one place",
            body:
              "Upload papers as PDFs and capture quotes inline. Annotate with your own commentary, tag by methodology or theme, and link back to the original document whenever you need to verify.",
            bullets: [
              "PDF text extraction with searchable transcripts",
              "Standalone notes for quick observations",
              "Smart tags aggregate themes across notebooks",
            ],
          },
          {
            title: "Cross-notebook search that actually finds things",
            body:
              "Global search (⌘K) looks across every notebook and tag. Use it to find that one quote you remember reading three months ago — without browsing folders.",
          },
          {
            title: "AI explanations, on your terms",
            body:
              "Highlight a paragraph in a paper and ask for a plain-language summary or definition. Answers stream in beside the note. The AI never sees content you didn't send it.",
          },
          {
            title: "Private, portable, audit-friendly",
            body:
              "Notes are private by default with row-level security on the database. Export to Markdown or PDF whenever you need a local copy or a record for compliance.",
          },
        ]}
        workflow={[
          { step: "Read", title: "Annotate the paper", body: "Upload the PDF, highlight quotes into the editor, tag by theme." },
          { step: "Synthesize", title: "Link the literature", body: "Use tags and global search to surface every note about a method or claim." },
          { step: "Write", title: "Draft the section", body: "Pull quotes and notes into a draft notebook, export to Markdown when ready." },
        ]}
        faqs={[
          {
            q: "How large can the PDFs be?",
            a: "Up to 1 GB per file. Text extraction runs locally in your browser for speed and privacy.",
          },
          {
            q: "Can I share findings with collaborators?",
            a: "Yes — public share links generate a read-only page secured by token. Revoke access in one click.",
          },
          {
            q: "Is there a citation manager?",
            a: "Not yet a full reference manager, but tags and structured notebooks cover most lit-review workflows. Citation export is on the roadmap.",
          },
          {
            q: "How is my data stored?",
            a: "Encrypted at rest, private by default, accessible only to you unless you explicitly share. AI access is opt-in per request.",
          },
        ]}
      />
    </>
  );
}
