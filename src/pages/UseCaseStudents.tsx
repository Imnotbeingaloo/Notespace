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
        title="Note-Taking App for Students - Notebook Archive"
        description="Organize lectures by course, summarize PDFs, and revise smarter. The note-taking app students reach for during finals."
        path="/use-cases/students"
      />
      <UseCaseLayout
        eyebrow="For students"
        title={<>A note-taking app that <span className="text-primary">survives finals week</span>.</>}
        intro="Lectures, readings, and problem sets in one place. Summaries on demand. No clutter, no learning curve."
        primaryCta={{ label: "Start free", to: "/auth" }}
        overview={[
          "Most note-taking apps are built for knowledge workers writing memos. Students have a different problem: twelve courses a year, dozens of PDFs per class, lectures that come at you in real time, and exams that test recall of material you saw months ago.",
          "Notebook Archive is shaped around that reality. Notebooks act as courses. Tags pull together themes that cut across subjects. PDFs become searchable. AI explains what a definition actually means without writing your essay for you. And it stays out of your way the rest of the time - no team channels, no project boards, no notification badges demanding attention.",
          "It's the same workflow whether you're taking a single online course or carrying a full undergraduate load - and it scales without you having to redesign your system every semester.",
        ]}
        sections={[
          {
            title: "One notebook per course",
            body:
              "Create a notebook for each class and keep lecture notes, reading summaries, and assignment drafts inside it. Nest sub-notebooks for modules, weeks, or labs. Standalone notes capture stray ideas - a question to ask in office hours, a connection to another course - without polluting your course archive.",
            bullets: [
              "Nested notebooks for modules, weeks, or topics",
              "Standalone notes for quick captures that don't belong anywhere yet",
              "Smart tags surface cross-course themes automatically (#mitosis, #romanticism, #regression)",
              "Drag-and-drop reorganization when your folder structure stops making sense",
            ],
          },
          {
            title: "Turn dense PDFs into study notes",
            body:
              "Upload a chapter, lecture slide deck, or scanned reading. Notebook Archive extracts the text locally in your browser and lets you ask focused questions - definitions, examples, summaries, edge cases - without leaving the editor. Answers stream in beside the note so you can take what's useful and discard the rest.",
            bullets: [
              "PDF text extraction up to 1 GB per file",
              "AI explanations stream in beside the note, not in a popup",
              "Highlight a passage, choose Explain, get a clear answer",
              "Save AI answers as part of the note - or delete them and try again",
            ],
          },
          {
            title: "Revise with structure, not panic",
            body:
              "The study planner schedules focused sessions per notebook so revision is something you do steadily across the term, not a 48-hour panic before the exam. A daily streak rewards consistency. A Pomodoro timer keeps you honest during long sessions. The temporary workspace gives you a scratchpad - for working a practice problem or jotting an exam-prep outline - that vanishes when you close it.",
            bullets: [
              "Per-notebook study schedule with daily streak tracking",
              "Built-in 25/5 Pomodoro timer with completed-session log",
              "Temporary workspace for throwaway scratch work",
              "Optional daily word-count goal for essay-heavy courses",
            ],
          },
          {
            title: "Find anything, instantly",
            body:
              "Global search (⌘K) looks across every notebook and every tag at once. Searching for a half-remembered definition from a lecture three months ago takes seconds. Tag chips in the sidebar let you pivot from a single concept to every note that touches it.",
          },
          {
            title: "Honest about AI",
            body:
              "Notebook Archive is built for understanding, not for cheating. AI explanations help you grasp ideas faster - they don't write your essay, fabricate citations, or submit answers for you. Your work stays your own, and your university's academic-integrity policy stays uncomplicated.",
          },
          {
            title: "Light on your laptop, light on your data plan",
            body:
              "Runs in the browser. No install. PDF extraction happens locally, so a 200 MB textbook chapter doesn't require uploading 200 MB to a server first. Notes sync in the background; edits queue offline and push when you reconnect.",
          },
        ]}
        scenarios={[
          {
            situation: "It's 9 PM the night before a midterm and you can't find your notes on enzyme kinetics.",
            problem: "Your folders are spread across Google Docs, a OneNote binder you abandoned, and screenshots in your phone's camera roll.",
            solution: "Open Notebook Archive, hit ⌘K, type 'enzyme kinetics'. Every mention across every notebook surfaces in one list - including the tagged passages from the textbook PDF you uploaded six weeks ago.",
          },
          {
            situation: "Your professor assigns a 60-page reading the night before lecture.",
            problem: "You don't have time to read it cover to cover, and skimming means you'll miss the parts that matter.",
            solution: "Drop the PDF into a new note, ask Notebook Archive to summarize the central argument and list the key terms. Skim the original for those sections only. You arrive at lecture able to follow along - and you have a searchable summary for revision.",
          },
          {
            situation: "You've been taking a single course's notes in one giant document for a month.",
            problem: "It's 18,000 words long. Scrolling is painful. Finding the lecture on the French Revolution takes forever.",
            solution: "Break it into a nested notebook - one note per lecture, tagged by week. The sidebar gives you a clean table of contents. Global search still treats them all as one body of material.",
          },
          {
            situation: "Group project. Your teammate needs the meeting notes you took.",
            problem: "Email is messy. They don't want to make an account.",
            solution: "Generate a public share link from the note. They open it in their browser as a clean read-only page. You revoke access when the project's done.",
          },
        ]}
        painPoints={[
          {
            problem: "I already have notes in Notion / OneNote / Google Docs.",
            answer: "Copy-paste works for short notes. For long ones, export from your current tool to Markdown or PDF and import. Notebook Archive doesn't lock you in either - Markdown and PDF export are one click.",
          },
          {
            problem: "I'm a visual learner. I draw diagrams.",
            answer: "The editor supports image embeds. Take a photo of a hand-drawn diagram, drop it into a note. Mermaid diagrams and tables render natively in Markdown.",
          },
          {
            problem: "The AI hallucinates. I can't trust it on technical material.",
            answer: "True of every LLM. Notebook Archive's AI is for explanation and summarization of material you provide - not for stating facts from training data. When it summarizes a paper you uploaded, the source is right there to verify against.",
          },
          {
            problem: "I lose internet on the train.",
            answer: "Edits queue locally and sync automatically when you reconnect. You won't lose work to a tunnel.",
          },
          {
            problem: "My laptop is slow.",
            answer: "There's nothing to install. Runs in any modern browser. The editor stays responsive even with thousands of notes because rendering is virtualized.",
          },
          {
            problem: "I'm worried about privacy.",
            answer: "Notes are private by default with row-level security on the database. The AI only sees content you explicitly send it. Nothing trains models.",
          },
        ]}
        comparison={{
          headingOther: "Notion / OneNote",
          rows: [
            { capability: "Setup time before first note", notebookArchive: "About 30 seconds - pick a notebook, start typing.", others: "An afternoon of templates, databases, and properties." },
            { capability: "PDF handling", notebookArchive: "Upload, text-extract, ask questions - in the editor.", others: "Attach the file; opening it leaves your workspace." },
            { capability: "AI for studying", notebookArchive: "Inline explanations of what you uploaded.", others: "Generic writing assistant or a paid add-on." },
            { capability: "Search across everything", notebookArchive: "⌘K, instant, every notebook and tag.", others: "Workspace-scoped, often slow on large vaults." },
            { capability: "Export your work", notebookArchive: "Markdown or PDF, one click, no lock-in.", others: "Possible but tedious; some formatting is lost." },
            { capability: "Distractions while studying", notebookArchive: "None. No chat, no comments, no badges.", others: "Built for teams - invitations and mentions everywhere." },
          ],
        }}
        quote={{
          text: "I stopped re-organizing my notes every Sunday and started actually using them. That's the whole pitch.",
          attribution: "the kind of feedback we hear most often from students",
        }}
        workflow={[
          { step: "Mon", title: "Capture lectures", body: "Type or paste lecture notes into the course notebook. Add #tags inline as concepts come up - you'll thank yourself in week 10." },
          { step: "Wed", title: "Summarize reading", body: "Drop the assigned PDF into the editor, ask for definitions and key arguments, save the answer alongside the source." },
          { step: "Fri", title: "Catch loose threads", body: "Open standalone notes from the week. Move anything course-specific into the right notebook. Delete what no longer matters." },
          { step: "Sun", title: "Plan the week", body: "Open the study planner, schedule revision blocks per notebook, run a Pomodoro. Hit your daily streak before bed." },
        ]}
        tips={[
          { title: "Tag aggressively in week one", body: "It's easier to add #tags as you go than to retrofit them in week eight. Aim for 2-3 tags per substantial note." },
          { title: "One notebook per course, not per project", body: "Sub-notebooks handle the project structure. A flat notebook list at the top means ⌘K stays fast and the sidebar stays readable." },
          { title: "Use standalone notes as a holding bay", body: "Anything you're not sure where to put goes in a standalone note. Sweep them into notebooks at the end of the week." },
          { title: "Pomodoro before exams, not during", body: "The 25/5 cadence is great for reading and problem sets. During actual cramming, set a longer focus block and skip the breaks." },
          { title: "Export at the end of every term", body: "Markdown export gives you a local backup of an entire course. Useful if you ever want to revisit the material years later." },
          { title: "Use the temporary workspace for practice problems", body: "It clears when you close it, so you can work messily without polluting your course notebook." },
        ]}
        faqs={[
          { q: "Is there a free plan?", a: "Yes. The free tier covers most students - multiple notebooks, AI explanations, PDF uploads, and exports. Pro unlocks higher AI limits and larger uploads." },
          { q: "Will it work on my laptop and phone?", a: "Yes. Notebook Archive runs in any modern browser and adapts to mobile, so you can capture a quick note between classes." },
          { q: "Can I export my notes?", a: "Markdown or PDF, one click. Your work is portable - nothing is locked into a proprietary format." },
          { q: "Is my data private?", a: "Yes. Notes are private by default with row-level security on the database. AI only accesses content you explicitly send it. Nothing trains models." },
          { q: "Does it work offline?", a: "Edits queue locally when you go offline and sync automatically when you reconnect. Existing notes remain readable." },
          { q: "How big can the PDFs be?", a: "Up to 1 GB per file. Text extraction runs in your browser, so uploads are fast and the original stays available." },
          { q: "Can I share notes with study group members?", a: "Generate a public share link that opens as a clean read-only page. No account required on their end. Revoke access in one click when you're done." },
          { q: "Will using AI get me in trouble for academic integrity?", a: "Notebook Archive's AI explains and summarizes - it doesn't write essays or submit work for you. Treat its answers the way you'd treat a tutor's explanation: useful for understanding, not for copying." },
        ]}
      />
    </>
  );
}
