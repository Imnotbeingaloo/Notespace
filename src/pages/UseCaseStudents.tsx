import { useEffect } from "react";
import { UseCaseLayout } from "@/components/UseCaseLayout";
import { SeoHead } from "@/components/SeoHead";

export default function UseCaseStudents() {
  useEffect(() => {
    const ld = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Notebook Archive for Students",
      description:
        "An AI note-taking app for students: organize lectures by course, summarize PDFs, and revise faster.",
      url: "https://notebookarchive.lovable.app/use-cases/students",
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
        title="Note-Taking App for Students — Notebook Archive"
        description="Organize lectures by course, summarize PDFs, and revise smarter. The note-taking app students reach for during finals."
        path="/use-cases/students"
      />
      <UseCaseLayout
        eyebrow="For students"
        title={<>A note-taking app that <span className="text-primary">survives finals week</span>.</>}
        intro="Lectures, readings, and problem sets in one place. Summaries on demand. No clutter, no learning curve."
        primaryCta={{ label: "Start free", to: "/auth" }}
        sections={[
          {
            title: "One notebook per course",
            body:
              "Create a notebook for each class and keep lecture notes, reading summaries, and assignment drafts inside it. Standalone notes capture stray ideas without polluting your course archive.",
            bullets: [
              "Nested notebooks for modules, weeks, or topics",
              "Standalone notes for quick captures",
              "Smart tags surface cross-course themes automatically",
            ],
          },
          {
            title: "Turn dense PDFs into study notes",
            body:
              "Upload a chapter or lecture slide deck. Notebook Archive extracts the text and lets you ask focused questions — definitions, examples, summaries — without leaving the editor.",
            bullets: [
              "PDF text extraction up to 1 GB per file",
              "AI explanations stream in beside the note",
              "Highlight a passage, choose Explain, and read a clear answer",
            ],
          },
          {
            title: "Revise with structure",
            body:
              "The study planner schedules focused sessions per notebook. A daily streak and Pomodoro timer keep you honest. The temporary workspace gives you a scratchpad that vanishes when you close it.",
          },
          {
            title: "Honest about AI",
            body:
              "Notebook Archive is built for understanding, not for cheating. AI explanations help you grasp ideas faster — they don't write your essay for you. Your work stays your own.",
          },
        ]}
        workflow={[
          { step: "Mon", title: "Capture lectures", body: "Type or paste lecture notes into the course notebook. Add #tags as you go." },
          { step: "Wed", title: "Summarize reading", body: "Drop the PDF into the editor, ask for definitions and key arguments, save the answer." },
          { step: "Sun", title: "Plan the week", body: "Open the study planner, schedule revision blocks per notebook, run a Pomodoro." },
        ]}
        faqs={[
          {
            q: "Is there a free plan?",
            a: "Yes. The free tier covers most students — multiple notebooks, AI explanations, PDF uploads, and exports.",
          },
          {
            q: "Will it work on my laptop and phone?",
            a: "Yes. Notebook Archive runs in any modern browser and adapts to mobile, so you can capture a quick note between classes.",
          },
          {
            q: "Can I export my notes?",
            a: "Markdown or PDF, one click. Your work is portable — nothing is locked into a proprietary format.",
          },
          {
            q: "Is my data private?",
            a: "Yes. Notes are private by default with row-level security on the database. AI only accesses content you explicitly send it.",
          },
        ]}
      />
    </>
  );
}
