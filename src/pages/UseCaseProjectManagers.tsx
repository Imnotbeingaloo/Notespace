import { UseCaseLayout } from "@/components/UseCaseLayout";
import { SeoHead } from "@/components/SeoHead";
import { breadcrumbsJsonLd } from "@/lib/seo-breadcrumbs";

export default function UseCaseProjectManagers() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Notespace for Project Managers",
      description:
        "AI note taking for meetings: extract action items, summarize stakeholder calls, and organize project documentation in one searchable workspace.",
      url: "https://notebookarchive.lovable.app/use-cases/project-managers",
    },
    breadcrumbsJsonLd([
      { name: "Use cases", path: "/use-cases" },
      { name: "Project managers", path: "/use-cases/project-managers" },
    ]),
  ];

  return (
    <>
      <SeoHead
        title="Best AI Note Taking App for Meetings - Notespace for Project Managers"
        description="Capture meetings, extract action items, and keep stakeholder context organized. The note-taking system built for project managers running multiple workstreams."
        path="/use-cases/project-managers"
        jsonLd={jsonLd}
      />

      <UseCaseLayout
        eyebrow="For project managers"
        title={<>The notebook that survives <span className="text-primary">every status meeting</span>.</>}
        intro="Capture decisions, extract action items, and keep every workstream's context in one searchable place - from kickoff to retrospective."
        primaryCta={{ label: "Start free", to: "/auth" }}
        overview={[
          "A project manager's week is meetings. Kickoffs, stakeholder check-ins, standups, escalations, retros. Each one produces decisions, action items, dependencies, and risks that need to land somewhere - and most of them land in a notebook that becomes unreadable by month two.",
          "Notespace is structured for that volume. One notebook per project, sub-notebooks per workstream, tags for the people and risks that cut across them, and a global search that finds the meeting where a decision was made without paging through twelve weeks of notes.",
          "It is not a Jira replacement. Jira owns tickets, sprints, and burndowns. Notespace owns the unstructured reality around them - the conversations, the context, the why behind the ticket.",
        ]}
        sections={[
          {
            title: "Capture meetings without losing the room",
            body:
              "Open a note in the relevant notebook, type while the meeting runs. Markdown headings keep agenda items separate; checkboxes capture action items inline. AI explanations summarize a long thread on demand - useful when a stakeholder spends ten minutes on context you need to compress into two sentences for the rest of the team.",
            bullets: [
              "Checkbox action items with owner tags (#alex, #priya)",
              "Inline AI summary for long meeting threads",
              "Standalone notes for one-off conversations outside any project",
              "PDF upload for decks, briefs, and contracts referenced in the meeting",
            ],
          },
          {
            title: "Cross-project search that actually finds the decision",
            body:
              "Global search (⌘K) hits every notebook, tag, and PDF at once. Find the meeting where the API contract was agreed, the email thread where scope expanded, or the retro item you swore you'd revisit. Search runs against extracted PDF text too, so a contract you uploaded three months ago is one query away.",
          },
          {
            title: "Action items, not lost items",
            body:
              "Tag action items with the owner and a date. A weekly search for your own tag surfaces everything outstanding across every project. No more chasing items across three tools and a Slack DM thread.",
          },
          {
            title: "Stakeholder context in one place",
            body:
              "One sub-notebook per stakeholder or workstream. Every meeting, every decision, every preference logged where you'll find it the next time their name appears in your calendar. New PM joins the team? Read the notebook. Onboarding is a search, not a series of 1:1s.",
            bullets: [
              "Sub-notebooks per stakeholder, vendor, or workstream",
              "Tags for risks, blockers, and dependencies",
              "Markdown export for status reports and handovers",
              "Public share links for read-only stakeholder summaries",
            ],
          },
          {
            title: "Private, portable, audit-ready",
            body:
              "Notes are encrypted at rest and private by default. Export to Markdown or PDF for compliance, handovers, or end-of-project archives. Nothing is locked into a proprietary format - when a project ends or the team changes tools, the corpus is yours to take.",
          },
          {
            title: "Works alongside Jira, Linear, and Slack",
            body:
              "Notespace is not where tickets live. It's where the context around tickets lives - the meeting that produced the ticket, the decision that changed its scope, the stakeholder who needs to be in the loop. Tickets stay in your tracker; the why stays here, linked when useful.",
          },
        ]}
        scenarios={[
          {
            situation: "Stakeholder asks why a decision was made three months ago.",
            problem: "The meeting wasn't recorded and you've had forty meetings since.",
            solution: "Search ⌘K for the feature name. The original meeting note surfaces with the decision, the trade-offs discussed, and who agreed to what. Two minutes from question to answer.",
          },
          {
            situation: "You're handing off a project to another PM.",
            problem: "The full context lives in your head and across two years of meetings.",
            solution: "Export the project notebook to Markdown. Send the file. Add a 30-minute walkthrough. The new PM has every decision, every stakeholder note, and every retro item from day one.",
          },
          {
            situation: "Weekly status update is due and you're behind.",
            problem: "Pulling together the last week's progress across three workstreams normally takes an hour.",
            solution: "Filter the project notebook by this week's notes. Use AI summary on each workstream's section. Paste the summaries into your template. Twenty minutes, not sixty.",
          },
          {
            situation: "Retro is tomorrow and you want concrete examples.",
            problem: "You remember a few incidents but not the specifics.",
            solution: "Search for #blocker and #risk tags in the project notebook. Every flagged moment of the sprint surfaces with full context. Retro talks about what actually happened, not what people remember.",
          },
        ]}
        painPoints={[
          {
            problem: "We already use Confluence / Notion for documentation.",
            answer: "Keep using it for permanent docs (PRDs, runbooks, team wikis). Notespace is faster for the working layer - the live meeting notes, the daily captures, the personal stash that feeds into formal docs. Many PMs use both.",
          },
          {
            problem: "I need automatic meeting transcription.",
            answer: "Honest answer: live transcription isn't shipped. The workflow today is to type meeting notes live (most PMs already do) or to use a separate transcription tool (Otter, Granola, Fireflies) and paste the transcript into a note for AI summarization. Native transcription is on the roadmap.",
          },
          {
            problem: "My team needs to collaborate on the same notes.",
            answer: "Public share links give read-only access to a note. Real-time co-editing is on the roadmap but not shipped. If multiple PMs need to edit the same notebook simultaneously, the current workflow is one owner per notebook with shared read links.",
          },
          {
            problem: "I need Gantt charts, dependencies, and resource planning.",
            answer: "Notespace is not a project planning tool - keep using Jira, Linear, Asana, MS Project, or whatever your team has standardized on. This is the unstructured layer around those tools, not a replacement.",
          },
          {
            problem: "Our security policy forbids cloud notes.",
            answer: "Notes are encrypted at rest, private by default, and AI features are opt-in per request - content is never sent unless you explicitly ask. For environments that forbid any cloud storage at all, this isn't the right tool.",
          },
          {
            problem: "I work across many time zones and asynchronous teams.",
            answer: "Standalone notes work well for async captures - log a quick note in two taps from any device, sort it into the right project later. Public share links let async stakeholders read updates without a login.",
          },
        ]}
        comparison={{
          headingOther: "Notion / Confluence",
          rows: [
            { capability: "Speed of capture", notebookArchive: "Two-click new note, Markdown editor opens instantly.", others: "Block-based editor with a heavier shell." },
            { capability: "Meeting summarization", notebookArchive: "Inline AI summary on selection.", others: "Plugin or AI add-on, varies by tier." },
            { capability: "PDF text search", notebookArchive: "Native, across every PDF you upload.", others: "Limited; depends on plan and plugins." },
            { capability: "Structure", notebookArchive: "Nested notebooks + tags + standalone notes.", others: "Pages, databases, and properties." },
            { capability: "Best for", notebookArchive: "The PM's working notes - meetings, captures, retros.", others: "Permanent team documentation and structured databases." },
            { capability: "Mobile", notebookArchive: "Browser, fully responsive, two-tap capture.", others: "Native app available; quality varies." },
            { capability: "Setup time", notebookArchive: "Minutes - one notebook per project, start typing.", others: "Hours to design templates and databases." },
          ],
        }}
        quote={{
          text: "Status updates used to take me an hour. Now I filter the project notebook by week, summarize each workstream, and paste. Twenty minutes, every Friday.",
          attribution: "what we hear most often from senior PMs",
        }}
        workflow={[
          { step: "Capture", title: "Type the meeting live", body: "Open the project notebook, new note with the meeting name. Markdown headings for agenda items, checkboxes for action items, owner tags inline." },
          { step: "Tag", title: "Mark risks and owners", body: "Tag #blocker, #risk, and owner names as they come up. The tags compound over the project and surface clusters at retros." },
          { step: "Summarize", title: "Send to stakeholders", body: "Use inline AI to compress the meeting into a 5-line summary. Share publicly or paste into your status email." },
          { step: "Retrospect", title: "Close the loop", body: "Filter the notebook by tag at retro time. Every flagged moment surfaces with full context. Decisions become improvements, not folklore." },
        ]}
        tips={[
          { title: "One notebook per project, sub-notebooks per workstream", body: "Resists collapse as the project grows. Workstream sub-notebooks keep the right people focused on the right notes." },
          { title: "Owner tags on every action item", body: "#alex, #priya, #me. A weekly search for your own tag surfaces every outstanding item across every project." },
          { title: "Standalone notes for in-between captures", body: "Hallway conversations and elevator pitches don't belong in a project notebook until you've thought about them. Standalone notes hold them until they earn a home." },
          { title: "Meeting note template per recurring meeting", body: "Markdown stays simple. Copy-paste a template - Agenda, Decisions, Action Items, Risks - at the start of each recurring meeting." },
          { title: "Export weekly to a backup folder", body: "Markdown export to local disk. Insurance against platform risk, useful for audits, and forces you to feel the project as a whole." },
          { title: "Use share links for stakeholder summaries", body: "One-off public read-only links beat sending a Word doc that gets edited and lost. Revoke when the project ends." },
        ]}
        faqs={[
          { q: "Is this an AI note-taking app for meetings?", a: "Yes. AI summarizes long meeting threads on demand, extracts action items, and compresses stakeholder context into shareable updates. AI is opt-in per request - content is never sent unless you ask." },
          { q: "Does it transcribe meetings automatically?", a: "Not yet. The standard workflow is to type notes live (most PMs already do) or paste a transcript from a separate tool (Otter, Granola) and use AI to summarize. Native transcription is on the roadmap." },
          { q: "Can my team edit the same note?", a: "Public read-only share links work today. Real-time co-editing is on the roadmap. If simultaneous editing is required, the current workflow is one owner per notebook with shared read links." },
          { q: "Does it replace Jira or Asana?", a: "No. Tickets and sprints belong in your tracker. Notespace owns the unstructured context - meetings, decisions, retros - that feeds into and follows from the tickets." },
          { q: "How is my data stored?", a: "Encrypted at rest, private by default, accessible only to you unless you explicitly share. AI access is opt-in per request and never trains models." },
          { q: "Can I export a project for handover?", a: "Yes. Export the entire notebook to Markdown or PDF. The new PM gets every meeting, decision, and tagged risk from day one." },
          { q: "What happens if you shut down?", a: "Markdown export gives you the entire corpus in a universal, plain-text format. No data is locked in. We're transparent about this because we'd want the same guarantee in your shoes." },
        ]}
      />
    </>
  );
}
