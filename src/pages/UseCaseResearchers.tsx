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
        title="Note-Taking App for Researchers - Notebook Archive"
        description="Annotate papers, summarize PDFs, and retrieve quotes across every notebook. Built for serious research."
        path="/use-cases/researchers"
      />
      <UseCaseLayout
        eyebrow="For researchers"
        title={<>A serious notebook for <span className="text-primary">serious research</span>.</>}
        intro="Read, annotate, and cross-reference without losing a single source. Built for literature reviews, fieldwork, and long projects."
        primaryCta={{ label: "Start free", to: "/auth" }}
        overview={[
          "Research projects accumulate material the way old hard drives accumulate files - fast, in inconsistent formats, with relevance that only becomes clear months later. The note-taking system you choose at the start of a project determines whether month 18 is productive or paralyzing.",
          "Notebook Archive is structured for the long arc of research: deep nested notebooks for organizing literature by topic, tags for the methodological threads that cut across topics, a global search that treats every PDF and note as one corpus, and AI explanations for the moments when a paper introduces a concept you need to internalize without an hour of background reading.",
          "It is not a reference manager - Zotero or Mendeley still own that workflow. It is the place where your reading, annotation, and writing happen, with citations exported into whatever pipeline you already use.",
        ]}
        sections={[
          {
            title: "Every source in one place",
            body:
              "Upload papers as PDFs and capture quotes inline. Annotate with your own commentary, tag by methodology or theme, and link back to the original document whenever you need to verify a claim. The original PDF stays attached to the note - verification is always one click away.",
            bullets: [
              "PDF text extraction with searchable transcripts (up to 1 GB per file)",
              "Standalone notes for quick observations and field captures",
              "Smart tags aggregate themes across notebooks",
              "Inline image embeds for figures, tables, and diagrams",
            ],
          },
          {
            title: "Cross-notebook search that actually finds things",
            body:
              "Global search (⌘K) looks across every notebook and tag at once. The query runs against your notes and against the extracted text of every PDF. The result list shows context. You can find that one quote you remember reading three months ago without browsing folders.",
          },
          {
            title: "AI explanations, on your terms",
            body:
              "Highlight a paragraph in a paper and ask for a plain-language summary or definition. Answers stream in beside the note. The AI never sees content you didn't send it, never trains on your work, and never inserts itself into the writing. Useful for breaking through a dense methods section without leaving the editor.",
          },
          {
            title: "Built for long projects",
            body:
              "A doctoral project runs four to six years. The system you start with has to survive switching laptops, changing supervisors, and a meaningful revision of your research question. Notebook Archive is structured to absorb that change: deep nesting, tag-based cross-referencing, and Markdown export mean nothing is locked in.",
            bullets: [
              "Arbitrary nesting depth - fields, sub-fields, projects, papers",
              "Tag-based pivots when your research question shifts",
              "Markdown and PDF export for archival and submission",
              "Public share links for sharing findings with co-authors or supervisors",
            ],
          },
          {
            title: "Private, portable, audit-friendly",
            body:
              "Notes are private by default with row-level security on the database. Export to Markdown or PDF whenever you need a local copy, a record for compliance, or material to attach to a paper's supplementary information. Nothing is locked into a proprietary format. If you ever stop using Notebook Archive, the entire corpus is yours to take.",
          },
          {
            title: "Works alongside Zotero and your reference manager",
            body:
              "Notebook Archive is where you read, think, and write - not where you manage citations. Keep your bibliography in Zotero, Mendeley, or BibTeX. Drop the PDFs into Notebook Archive for annotation and synthesis. Export your draft to Markdown, run it through pandoc with your .bib file, and your final document carries proper citations.",
          },
        ]}
        scenarios={[
          {
            situation: "You're writing a literature review and need to find every paper you've read that uses regression discontinuity.",
            problem: "You tagged some papers but not all of them, and your folder structure groups by topic not by method.",
            solution: "Search ⌘K for 'regression discontinuity'. Every paper where the phrase appears in the extracted text surfaces, regardless of folder. Add the #rdd tag to the ones that matter - next time the lookup is a single click.",
          },
          {
            situation: "Your supervisor asks for your annotated bibliography on a topic.",
            problem: "Your notes are scattered across a notebook with 400+ papers in it.",
            solution: "Filter the notebook by the topic tag, export to Markdown. Send the file directly or paste it into a shared document. Each entry includes your annotations and links back to the source PDF.",
          },
          {
            situation: "You read a brilliant paragraph two years ago and need it for a paper you're writing now.",
            problem: "You don't remember which paper it was in.",
            solution: "Search for a phrase you remember. Global search hits the extracted PDF text. The quote is found in seconds; the original PDF opens to verify and properly cite.",
          },
          {
            situation: "You're at a conference. A talk gives you an idea you don't want to lose.",
            problem: "You don't have your laptop and your phone keyboard is small.",
            solution: "Open Notebook Archive in the mobile browser. Create a standalone note in two taps. Type the idea, add #conference_2026 and the relevant topic tag. Sort it into a proper notebook when you're back at your desk.",
          },
        ]}
        painPoints={[
          {
            problem: "I already use Zotero / Mendeley / EndNote.",
            answer: "Keep using it. Notebook Archive replaces the place you write, annotate, and synthesize - not the place you manage citations. Bibliography stays in your reference manager; the writing happens here.",
          },
          {
            problem: "I need formal citation export - BibTeX, APA, Chicago.",
            answer: "Honest answer: native citation export isn't shipped. The standard workflow is to write in Notebook Archive, export to Markdown, run it through pandoc with your .bib file, and let pandoc generate citations in whatever style your venue requires." ,
          },
          {
            problem: "I work with sensitive data - interviews, medical, classified.",
            answer: "Notes are encrypted at rest, private by default, and never sent to AI unless you explicitly send them. For genuinely sensitive material that can't leave a controlled environment, run the AI features off - the editor and storage are still usable on their own." ,
          },
          {
            problem: "I co-author papers with multiple collaborators.",
            answer: "Public share links give read-only access to a note. Real-time co-editing is on the roadmap but not shipped - the current workflow is to export, share, and merge edits manually. If real-time collaboration is a hard requirement, this is the wrong tool today." ,
          },
          {
            problem: "PDFs of scanned documents don't have text.",
            answer: "Notebook Archive extracts embedded text, not OCR. For scanned material, run it through a separate OCR tool first (tesseract, ABBYY) and upload the resulting text-layer PDF. OCR is on the roadmap." ,
          },
          {
            problem: "I need version history for journal submissions.",
            answer: "Frequent autosave keeps recent state safe. Granular version history isn't shipped yet - the workaround is to export to Markdown periodically and commit to a local git repo. Built-in versions are planned." ,
          },
        ]}
        comparison={{
          headingOther: "Obsidian / Roam",
          rows: [
            { capability: "Where it runs", notebookArchive: "Browser, any device, no install.", others: "Native app; Roam is web." },
            { capability: "PDF text search", notebookArchive: "Native, across every PDF you upload.", others: "Requires plugins; varies in quality." },
            { capability: "AI for source comprehension", notebookArchive: "Inline, on content you upload.", others: "Plugin-based or external." },
            { capability: "Structure", notebookArchive: "Nested notebooks + tags + standalone notes.", others: "Bidirectional links and graph view." },
            { capability: "Setup time", notebookArchive: "Minutes.", others: "Hours to weeks to settle on a system." },
            { capability: "Mobile", notebookArchive: "Browser, fully responsive.", others: "Native apps available; quality varies." },
            { capability: "Best for", notebookArchive: "Literature reviews, fieldwork, applied research.", others: "Personal knowledge management and connected thinking." },
          ],
        }}
        quote={{
          text: "The first system I've used where finding a quote from year one of my PhD takes less time than it took to read it the first time.",
          attribution: "the kind of feedback we hear most often from doctoral researchers",
        }}
        workflow={[
          { step: "Read", title: "Annotate the paper", body: "Upload the PDF, highlight quotes into the editor, tag by theme and method. Add your own commentary inline." },
          { step: "Synthesize", title: "Link the literature", body: "Use tags and global search to surface every note about a method, claim, or author. Build outlines from those clusters." },
          { step: "Write", title: "Draft the section", body: "Pull quotes and notes into a draft notebook. Export to Markdown when ready, run pandoc with your .bib file for citations." },
          { step: "Archive", title: "Close out the project", body: "Export the entire project to Markdown for long-term archival. The corpus stays portable across institutions and decades." },
        ]}
        tips={[
          { title: "Tag by method, not just by topic", body: "Topic clusters are obvious from notebook structure. The high-value tags are methodological - #rdd, #ethnography, #meta_analysis - because they cut across topics in ways folders can't." },
          { title: "One notebook per literature, not per paper", body: "Group papers into a single topical notebook; one note per paper. Sub-notebooks are for genuinely distinct sub-literatures." },
          { title: "Capture verbatim quotes, not paraphrases", body: "Drift between paraphrase and quote is the most common citation error. When you quote, mark it as a quote. Your future self will thank you when you're writing footnotes." },
          { title: "Use standalone notes for ideas, notebook notes for sources", body: "Keeps the source corpus clean and your idea stream visible. Sweep ideas into the right notebook when they mature." },
          { title: "Export monthly", body: "Markdown export to a local backup folder. Hedges against any platform risk and forces you to feel the corpus as a whole." },
          { title: "Re-tag at milestones", body: "Every six months, browse the tag cloud and consolidate near-duplicates. Tagging hygiene compounds." },
        ]}
        faqs={[
          { q: "How large can the PDFs be?", a: "Up to 1 GB per file. Text extraction runs locally in your browser for speed and privacy." },
          { q: "Can I share findings with collaborators?", a: "Yes - public share links generate a read-only page secured by token. Revoke access in one click. Real-time co-editing is on the roadmap but not shipped." },
          { q: "Is there a citation manager?", a: "Not yet a full reference manager. The intended workflow is Zotero (or similar) for citations, Notebook Archive for reading, synthesis, and writing, pandoc to merge the two at export." },
          { q: "How is my data stored?", a: "Encrypted at rest, private by default, accessible only to you unless you explicitly share. AI access is opt-in per request and never trains models." },
          { q: "Does it support LaTeX?", a: "Markdown export carries through to pandoc, which produces LaTeX. Inline LaTeX equations render in the editor via Markdown math syntax." },
          { q: "Can I use it for qualitative coding?", a: "Tags work well as a lightweight coding system. For axial or selective coding at scale, dedicated QDA software (NVivo, MAXQDA) is still more powerful." },
          { q: "What happens if you shut down?", a: "Markdown export gives you the entire corpus in a universal, plain-text format. No data is locked in. We're transparent about this because we'd want the same guarantee in your shoes." },
        ]}
      />
    </>
  );
}
