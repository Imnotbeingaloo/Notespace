/**
 * Data for "Notespace vs X" comparison pages.
 * Each entry powers /compare/:slug. Keep tone honest - acknowledge what
 * the competitor does well, then show where Notespace fits better.
 */

export interface ComparisonRow {
  capability: string;
  na: string;
  other: string;
  /** "na" = NA wins, "other" = competitor wins, "tie" = both. */
  winner?: "na" | "other" | "tie";
}

export interface ComparisonData {
  slug: string;
  competitor: string;
  /** SEO title. ~55 chars. */
  metaTitle: string;
  /** SEO description. ~150 chars. */
  metaDescription: string;
  /** One-line page subtitle. */
  tagline: string;
  /** Honest opening: what's the competitor good at? */
  competitorStrength: string;
  /** Where the competitor falls short for the audience we serve. */
  competitorGap: string;
  /** Audience this comparison helps most. */
  bestFor: string;
  /** Side-by-side rows. */
  rows: ComparisonRow[];
  /** "Pick X if..." vs "Pick NA if..." */
  pickThem: string[];
  pickUs: string[];
  /** FAQ unique to this comparison. */
  faqs: { q: string; a: string }[];
}

const COMMON_ROWS = (other: string, otherText: Record<string, string>): ComparisonRow[] => [
  {
    capability: "Writing surface",
    na: "Clean markdown editor with toolbar, tables, and live preview. No blocks to wrangle.",
    other: otherText.writing,
  },
  {
    capability: "AI that helps",
    na: "Explain, edit, summarize, and ask questions about your own notes. Streaming. Built in.",
    other: otherText.ai,
  },
  {
    capability: "Organization",
    na: "Nested notebooks + smart tags + global ⌘K search across everything.",
    other: otherText.org,
  },
  {
    capability: "File handling",
    na: "Upload PDFs, docs, and media up to 1 GB. Instant text extraction for search.",
    other: otherText.files,
  },
  {
    capability: "Focus tools",
    na: "Focus mode, daily word-count goal, weekly chart, study planner.",
    other: otherText.focus,
  },
  {
    capability: "Pricing",
    na: "Free plan that's actually usable. Pro $19/mo. Team $29/mo.",
    other: otherText.pricing,
  },
];

export const COMPARISONS: ComparisonData[] = [
  {
    slug: "notion",
    competitor: "Notion",
    metaTitle: "Notespace vs Notion - which one for note-taking? (2026)",
    metaDescription:
      "Notion is a database. Notespace is a notebook. An honest head-to-head if you only want to write, organize, and recall - not configure pages.",
    tagline: "If you only ever used Notion for notes, this is for you.",
    competitorStrength:
      "Notion is the best all-in-one workspace on the market. Databases, wikis, project boards, calendars - if your team needs one tool to do everything, Notion earns its place.",
    competitorGap:
      "But Notion treats writing like an afterthought. Every page is a database of blocks; every note is a setup project. If you came for notes and stayed for configuration, you already know the feeling.",
    bestFor: "Writers, students, and researchers who want a quiet notebook, not a workspace.",
    rows: COMMON_ROWS("Notion", {
      writing: "Block editor. Every paragraph is an object you drag, configure, and reformat. Powerful but heavy.",
      ai: "Notion AI is a separate $10/mo add-on. Good summaries, but lives outside the page flow.",
      org: "Pages inside pages inside databases. Flexible, but most users end up with a graveyard of half-built pages.",
      files: "5 MB per file on the free tier. Unlimited on paid, but no text extraction for search.",
      focus: "None built in. You wire your own with templates and plugins.",
      pricing: "Free for individuals (limited blocks). Plus $10/mo. AI is +$10/mo on top.",
    }),
    pickThem: [
      "You need a team wiki, project tracker, and CRM in one tool.",
      "You love building dashboards and customizing every page.",
      "Databases are how you think.",
    ],
    pickUs: [
      "You want to open a notebook and write - not configure one.",
      "You want AI explanation, editing, and search included, not a separate plan.",
      "You write in prose, not blocks.",
    ],
    faqs: [
      {
        q: "Can I import my Notion pages?",
        a: "Yes - export Notion as Markdown & CSV, then drag the .md files into Notespace. Tables, headings, and bullets come over cleanly. Embedded databases become a list of pages.",
      },
      {
        q: "Does Notespace have databases?",
        a: "No, by design. We have notebooks, notes, and smart tags. If you need a relational database, Notion is the right tool. If you need a place to write and find things later, we are.",
      },
      {
        q: "What about collaboration?",
        a: "Notespace has shareable notes and team plans. Notion is stronger for live multi-cursor editing in shared docs. If real-time collaboration is your main job, Notion wins that round.",
      },
    ],
  },
  {
    slug: "obsidian",
    competitor: "Obsidian",
    metaTitle: "Notespace vs Obsidian - the honest comparison (2026)",
    metaDescription:
      "Obsidian gives you ownership and plugins. Notespace gives you something that just works. An honest comparison for note-takers in 2026.",
    tagline: "Ownership and graph view vs. open-and-write.",
    competitorStrength:
      "Obsidian is brilliant for people who want to own their notes as plain markdown files. The plugin ecosystem is huge, the graph view is iconic, and your vault is yours forever.",
    competitorGap:
      "But Obsidian is a tool you have to build. Sync costs extra. Mobile is a configuration project. AI requires a paid plugin and your own API key. Most users spend more time tuning the vault than writing in it.",
    bestFor: "People who like Obsidian's philosophy but are tired of being their own sysadmin.",
    rows: COMMON_ROWS("Obsidian", {
      writing: "Markdown editor with strong keyboard support. Live preview takes plugins to feel modern.",
      ai: "No built-in AI. Plugins like Smart Connections work, but you bring your own OpenAI key.",
      org: "Folders + tags + backlinks. Powerful, but you maintain the structure yourself.",
      files: "Files live in your vault. No automatic text extraction from PDFs without plugins.",
      focus: "Strong markdown + zen mode plugin. Daily-note workflow is community-built.",
      pricing: "Free for personal use. Sync is $10/mo. Publish is $20/mo. AI plugins billed separately.",
    }),
    pickThem: [
      "You want your notes as plain markdown files you own forever.",
      "You enjoy configuring plugins and tweaking your setup.",
      "Local-first, offline-only is non-negotiable.",
    ],
    pickUs: [
      "You want the markdown editor without the maintenance.",
      "You want AI, sync, and mobile working on day one.",
      "You'd rather write than configure.",
    ],
    faqs: [
      {
        q: "Can I import my Obsidian vault?",
        a: "Yes - drag your .md files in. Internal [[wikilinks]] are preserved as plain text; we're working on resolving them automatically.",
      },
      {
        q: "Do I lose ownership of my notes?",
        a: "You can export everything as markdown anytime. We don't lock you in - we just spare you the daily maintenance.",
      },
      {
        q: "Is there a graph view?",
        a: "Not yet. If the graph is the reason you use Obsidian, stay there. We focus on writing flow over visualization.",
      },
    ],
  },
  {
    slug: "evernote",
    competitor: "Evernote",
    metaTitle: "Notespace vs Evernote - a modern alternative (2026)",
    metaDescription:
      "Evernote pioneered the digital shoebox - and stayed there. Notespace is what a note app feels like when it's built in 2026.",
    tagline: "The digital shoebox, modernized.",
    competitorStrength:
      "Evernote invented this whole category. Web clipper, OCR on images, decades of stored notes - if it's already your second brain, the gravity is real.",
    competitorGap:
      "But the editor stayed in 2015. The free tier keeps shrinking. AI features arrived late and feel bolted on. And the price - now over $130/year for Personal - keeps climbing.",
    bestFor: "Long-time Evernote users who want their archive without the bloat.",
    rows: COMMON_ROWS("Evernote", {
      writing: "Block-style editor that feels older than it looks. Markdown support is limited.",
      ai: "AI Edit and Search added in 2024. Decent but gated behind the highest tier.",
      org: "Notebooks + stacks + tags. Familiar but flat - real nesting is shallow.",
      files: "200 MB notes on Personal. Strong attachment OCR is the legacy advantage.",
      focus: "None built in. Tasks exist but feel separate from the writing.",
      pricing: "Free is heavily limited (50 notes). Personal $14.99/mo. Professional $17.99/mo.",
    }),
    pickThem: [
      "You have 10+ years of notes in Evernote and the web clipper is critical.",
      "OCR on photos and scanned receipts is core to your workflow.",
      "You don't mind the price for the legacy ecosystem.",
    ],
    pickUs: [
      "You want a modern editor with real markdown.",
      "You want AI that actually helps, not as an upsell.",
      "You're done paying $130+/year for an app that updates slowly.",
    ],
    faqs: [
      {
        q: "Can I import my Evernote notebooks?",
        a: "Export from Evernote as .enex, convert to markdown with a free tool (Yarle is the popular one), then drag the files in. We're building a direct .enex importer.",
      },
      {
        q: "What about the web clipper?",
        a: "We don't have a browser clipper yet. If clipping articles is core to your workflow, this is a real gap today. On the roadmap.",
      },
      {
        q: "Will my OCR'd image text come over?",
        a: "Image attachments come over as files. We don't re-OCR them on import - that's an Evernote strength we acknowledge.",
      },
    ],
  },
  {
    slug: "onenote",
    competitor: "OneNote",
    metaTitle: "Notespace vs OneNote - a focused alternative (2026)",
    metaDescription:
      "OneNote gives you an infinite canvas. Notespace gives you a focused writing surface that won't get messy in six months.",
    tagline: "Infinite canvas vs. focused writing surface.",
    competitorStrength:
      "OneNote is free, generous on storage, deeply integrated with Microsoft 365, and has a freeform canvas you can't get anywhere else. For tablet + stylus workflows, it's elite.",
    competitorGap:
      "But OneNote pages get messy fast - text boxes everywhere, no real markdown, weak search across notebooks. AI lives behind a Microsoft 365 Copilot subscription. And exporting your notes is a one-way pain.",
    bestFor: "OneNote users who love the idea but lose notes in their own notebooks.",
    rows: COMMON_ROWS("OneNote", {
      writing: "Freeform text boxes on an infinite canvas. Powerful for sketching, weak for structured writing.",
      ai: "Copilot integration requires Microsoft 365 Copilot ($30/user/mo on top of M365).",
      org: "Notebooks > sections > pages. Search works inside a notebook, less well across them.",
      files: "Generous storage via OneDrive. Strong handwriting and ink support.",
      focus: "No focus mode. Templates exist but feel dated.",
      pricing: "Free with a Microsoft account. M365 adds storage and Copilot AI.",
    }),
    pickThem: [
      "You take notes on a Surface or iPad with a stylus.",
      "You're deep in the Microsoft 365 ecosystem.",
      "Freeform layout with images and ink anywhere is core to you.",
    ],
    pickUs: [
      "You want structured writing, not a freeform canvas.",
      "You want strong cross-notebook search and AI without extra bills.",
      "Your notes are mostly text, not handwriting and diagrams.",
    ],
    faqs: [
      {
        q: "Can I import from OneNote?",
        a: "OneNote's export is notoriously sticky. Export individual sections as .docx or .pdf, then import to Notespace. We're investigating a direct importer.",
      },
      {
        q: "Does Notespace support stylus and handwriting?",
        a: "Not yet. If ink is central to your workflow, OneNote wins this round.",
      },
      {
        q: "How does the AI compare to Copilot?",
        a: "Ours is included, theirs is $30/user/mo extra. We focus on note-level help (explain, edit, ask). Copilot does more in Office apps but less inside OneNote specifically.",
      },
    ],
  },
  {
    slug: "roam",
    competitor: "Roam Research",
    metaTitle: "Notespace vs Roam Research - bidirectional vs simple",
    metaDescription:
      "Roam invented bidirectional notes. Notespace gives you the writing flow without the learning curve and the monthly bill.",
    tagline: "Bidirectional brilliance vs. open-and-write simplicity.",
    competitorStrength:
      "Roam pioneered networked thought - bidirectional links, block references, daily notes. For researchers who think in graphs, it's a category-defining tool.",
    competitorGap:
      "But Roam has a steep learning curve, a thinning team since 2022, and a $15/mo price tag with no free tier. Most users bounce off the block model in week one.",
    bestFor: "People drawn to Roam's idea but who never made it past the daily note.",
    rows: COMMON_ROWS("Roam Research", {
      writing: "Block-based outliner. Powerful for thinking in fragments, awkward for long-form.",
      ai: "Limited. Third-party integrations exist but feel community-built.",
      org: "Bidirectional links + daily notes. No traditional folders - you build structure via tags.",
      files: "Attachments allowed but feel secondary to the linked-block model.",
      focus: "None built in. Workflow is the focus.",
      pricing: "$15/mo or $165/year. Believer plan $500/5yr. No free tier.",
    }),
    pickThem: [
      "Bidirectional linking is how you think.",
      "You've already invested in the block-reference workflow.",
      "Daily notes are your atomic unit.",
    ],
    pickUs: [
      "You tried Roam and the block model never clicked.",
      "You want backlinks and tags without the outliner overhead.",
      "You want a free tier to test before committing.",
    ],
    faqs: [
      {
        q: "Does Notespace have bidirectional links?",
        a: "Smart tags surface related notes globally, which covers most of what people want from backlinks. True bidirectional links are on the roadmap.",
      },
      {
        q: "Can I import from Roam?",
        a: "Export your Roam graph as JSON or markdown. Markdown imports cleanly; JSON requires a one-time conversion.",
      },
      {
        q: "What about block references?",
        a: "We don't have block-level references. Notes are the atomic unit. If block transclusion is core to your work, Roam stays better at it.",
      },
    ],
  },
  {
    slug: "bear",
    competitor: "Bear",
    metaTitle: "Notespace vs Bear - more than just a beautiful editor",
    metaDescription:
      "Bear is the prettiest markdown editor on Mac. Notespace matches the writing feel and adds AI, web access, and study tools.",
    tagline: "Beautiful Mac-only editor vs. cross-platform with AI.",
    competitorStrength:
      "Bear has arguably the best-feeling markdown editor on macOS and iOS. Typography is gorgeous, the writing flow is meditative, and Pro is reasonably priced.",
    competitorGap:
      "But Bear is Apple-only. There's no web access, no Windows or Linux, no AI assistance, and search is fast but flat. If you ever use a non-Apple device, you're locked out.",
    bestFor: "Bear users who got a new work laptop that isn't a Mac.",
    rows: COMMON_ROWS("Bear", {
      writing: "Beautiful markdown editor. Inline preview, gorgeous typography. Best on iPad.",
      ai: "None built in. Has to be added via Shortcuts and your own API key.",
      org: "Tags only - no folders. Nested tags via slashes work well.",
      files: "Attachments allowed but feel like an afterthought.",
      focus: "Clean by default. No dedicated focus mode or planner.",
      pricing: "Free for basic. Pro $2.99/mo or $29.99/year. Apple only.",
    }),
    pickThem: [
      "You live entirely in the Apple ecosystem.",
      "Editor aesthetics are the most important thing to you.",
      "Tags-only organization fits how you think.",
    ],
    pickUs: [
      "You use a Mac at home and Windows or Linux at work.",
      "You want AI and study tools built in.",
      "You want notebooks plus tags, not tags alone.",
    ],
    faqs: [
      {
        q: "Can I import from Bear?",
        a: "Yes - export your Bear notes as markdown (File > Export Notes), then drag the .md files in. Tags survive as plain-text hashtags.",
      },
      {
        q: "Will the editor feel as good as Bear's?",
        a: "Honest answer: Bear's typography on iPad is hard to beat. Our editor is clean and fast on every device - we trade a little aesthetic polish for cross-platform availability.",
      },
      {
        q: "Do I get a web version?",
        a: "Yes. Notespace runs in any modern browser. Bear doesn't have one.",
      },
    ],
  },
  {
    slug: "mem",
    competitor: "Mem",
    metaTitle: "Notespace vs Mem - AI-first notes, compared (2026)",
    metaDescription:
      "Mem put AI at the center of notes. Notespace puts writing at the center, with AI where it actually helps - not everywhere.",
    tagline: "AI everywhere vs. AI where it helps.",
    competitorStrength:
      "Mem was early on the AI-native note app. The chat-with-your-notes flow is genuinely useful, and auto-tagging removes friction from capture.",
    competitorGap:
      "But Mem leans heavily on chat as the primary interface. The editor is thinner than competitors, organization is fully AI-driven (you give up control), and the Pro plan is $14.99/mo.",
    bestFor: "People who liked Mem's idea but want a real editor underneath the AI.",
    rows: COMMON_ROWS("Mem", {
      writing: "Minimal editor. Quick capture is excellent; long-form writing is less of a focus.",
      ai: "Strong - chat with notes, smart writes, auto-tagging. Central to the product.",
      org: "AI-organized. You let Mem decide structure. Less control if you prefer manual.",
      files: "Supports uploads but file handling isn't a headline feature.",
      focus: "Chat-driven. No focus mode or writing goals.",
      pricing: "Free tier with limits. Mem X $14.99/mo for full AI.",
    }),
    pickThem: [
      "Chat-with-your-notes is your primary interaction.",
      "You want AI to organize everything for you.",
      "Quick capture matters more than long-form writing.",
    ],
    pickUs: [
      "You want a real editor for long-form writing.",
      "You want AI as a tool, not the main UI.",
      "You want to keep manual control of your structure.",
    ],
    faqs: [
      {
        q: "Can I chat with my notes in Notespace?",
        a: "Yes - Ask AI works across your selected notebook or note. The difference is it's one tool among many, not the main interface.",
      },
      {
        q: "Is the AI as good as Mem's?",
        a: "For explain, edit, and ask: yes. For auto-organization across your whole library: Mem still does more of that automatically.",
      },
      {
        q: "Can I import from Mem?",
        a: "Mem's export is limited. Export individual notes as markdown and drag them in. Bulk export is something Mem itself doesn't make easy.",
      },
    ],
  },
  {
    slug: "reflect",
    competitor: "Reflect",
    metaTitle: "Notespace vs Reflect - daily-notes app comparison",
    metaDescription:
      "Reflect is beautiful daily notes with AI. Notespace is a full notebook system with AI and a free tier that's actually usable.",
    tagline: "Daily-notes elegance vs. full notebook system.",
    competitorStrength:
      "Reflect is the most polished daily-notes app available. The editor is elegant, AI is built in via your own key, end-to-end encryption is the default, and the daily-note flow is the cleanest in the category.",
    competitorGap:
      "But Reflect is daily-notes-first. If you want notebooks, projects, or per-subject organization, it fights you. No free tier, $10/mo, and AI uses your own OpenAI credits on top.",
    bestFor: "People who tried Reflect but needed notebooks alongside daily notes.",
    rows: COMMON_ROWS("Reflect", {
      writing: "Beautiful editor, fast keyboard flow, end-to-end encrypted.",
      ai: "Built in but uses your OpenAI API key. You pay both subscriptions.",
      org: "Daily notes + backlinks. Notebooks exist but feel secondary.",
      files: "Attachments supported. PDF text extraction is limited.",
      focus: "Clean defaults. No dedicated focus mode or study planner.",
      pricing: "$10/mo or $100/year. No free tier. AI billed separately via OpenAI.",
    }),
    pickThem: [
      "Daily notes are the center of your workflow.",
      "End-to-end encryption is a hard requirement.",
      "You already have an OpenAI account you're happy to use.",
    ],
    pickUs: [
      "You want notebooks for projects, not just daily notes.",
      "You want a free tier to start.",
      "You want AI included, not metered through your own API key.",
    ],
    faqs: [
      {
        q: "Does Notespace have a daily-note workflow?",
        a: "You can create a daily-notes notebook and pin it. We don't auto-create today's note like Reflect does - that's something we may add.",
      },
      {
        q: "What about end-to-end encryption?",
        a: "We use transport encryption and at-rest encryption at the database level. We don't offer end-to-end encryption today. If E2EE is non-negotiable, Reflect wins.",
      },
      {
        q: "Can I import from Reflect?",
        a: "Export your Reflect notes as markdown and drag them in. Backlinks survive as plain-text references.",
      },
    ],
  },
  {
    slug: "apple-notes",
    competitor: "Apple Notes",
    metaTitle: "Notespace vs Apple Notes - when to upgrade (2026)",
    metaDescription:
      "Apple Notes is free and ubiquitous. Notespace is what to use when you outgrow it - real markdown, AI, search, and cross-device flow.",
    tagline: "The default vs. the next step.",
    competitorStrength:
      "Apple Notes is free, instant, and on every Apple device you own. For grocery lists, quick captures, and shared family notes, it's hard to beat.",
    competitorGap:
      "But Apple Notes hits a wall when notes get serious. No real markdown, weak organization at scale, AI is barely there (Apple Intelligence is limited and device-gated), and there's no web access from a non-Apple device.",
    bestFor: "Apple Notes power users who feel the app fighting their workflow.",
    rows: COMMON_ROWS("Apple Notes", {
      writing: "Rich text. Quick checklists and sketches. No real markdown.",
      ai: "Apple Intelligence (limited, on supported devices only). Summaries are basic.",
      org: "Folders + tags + Smart Folders. Works until you have hundreds of notes.",
      files: "Generous via iCloud. Scan-to-PDF and image OCR are strong.",
      focus: "None.",
      pricing: "Free with any Apple device. iCloud storage from $0.99/mo.",
    }),
    pickThem: [
      "Your notes are short, casual, and Apple-only.",
      "Shared family notes via iCloud are core.",
      "You never need a non-Apple device for notes.",
    ],
    pickUs: [
      "Your notes are getting long and you need real structure.",
      "You want AI explanations, editing, and search.",
      "You use a Windows or Linux device for any part of your work.",
    ],
    faqs: [
      {
        q: "Can I import from Apple Notes?",
        a: "Apple Notes doesn't have a clean bulk export. Select notes and use Print > Save as PDF, or use the Notes Exporter open-source tool. Then drag the files in.",
      },
      {
        q: "Will I lose the iCloud sync convenience?",
        a: "Notespace syncs across devices automatically too - you just sign in. The difference is it works on every device, not only Apple ones.",
      },
      {
        q: "Is there an iOS app?",
        a: "Notespace runs as a fast web app on iOS Safari with offline support. A native iOS app is on the roadmap.",
      },
    ],
  },
  {
    slug: "google-keep",
    competitor: "Google Keep",
    metaTitle: "Notespace vs Google Keep - beyond sticky notes (2026)",
    metaDescription:
      "Google Keep is great for sticky notes. Notespace is built for when those notes turn into real writing, projects, and research.",
    tagline: "Sticky notes vs. real notebook.",
    competitorStrength:
      "Google Keep is free, instant, integrated with everything Google, and the colored-card UI makes capture frictionless. For quick lists and reminders, it's the right tool.",
    competitorGap:
      "But Keep was never built for serious notes. No markdown, no real organization beyond labels and colors, AI is non-existent inside Keep, and search is limited to title and body text.",
    bestFor: "Keep users whose notes have outgrown the sticky-note format.",
    rows: COMMON_ROWS("Google Keep", {
      writing: "Rich text on cards. No markdown, no headings, no tables.",
      ai: "None inside Keep. Gemini lives in other Google apps.",
      org: "Labels + colors. No nested structure. Search is basic.",
      files: "Image attachments allowed. PDF support is weak.",
      focus: "None.",
      pricing: "Free with a Google account.",
    }),
    pickThem: [
      "All you need is sticky notes and shared lists.",
      "You live in Gmail and Google Docs.",
      "You don't want any structure at all.",
    ],
    pickUs: [
      "Your notes need headings, tables, and real formatting.",
      "You want AI to explain and rewrite your notes.",
      "You're managing more than 50 notes and search is failing you.",
    ],
    faqs: [
      {
        q: "Can I import from Google Keep?",
        a: "Use Google Takeout to export Keep. You'll get HTML/JSON files; convert to markdown and drag them in. We're working on a direct importer.",
      },
      {
        q: "Will I lose the colored-card UI?",
        a: "Yes - we use notebooks and tags instead of color. If colored cards are the reason you use Keep, stay there.",
      },
      {
        q: "How does it integrate with Google?",
        a: "Sign in with Google works. Direct Gmail/Calendar integrations are on the roadmap, not built today.",
      },
    ],
  },
];

export function getComparison(slug: string): ComparisonData | undefined {
  return COMPARISONS.find((c) => c.slug === slug);
}
