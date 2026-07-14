/**
 * Glossary of note-taking, PKM, and study terms.
 * Each entry becomes /learn/:slug and is included in the sitemap.
 */

export interface GlossaryEntry {
  slug: string;
  term: string;
  short: string; // one-line definition for the index card
  category: "Method" | "System" | "Concept" | "Tool";
  body: string[]; // paragraphs for the detail page
  related?: string[]; // slugs
  faqs?: { q: string; a: string }[];
}

export const GLOSSARY: GlossaryEntry[] = [
  {
    slug: "zettelkasten",
    term: "Zettelkasten",
    short:
      "A note-taking method built on small, atomic notes linked to each other so ideas compound over time.",
    category: "Method",
    body: [
      "Zettelkasten is German for 'slip box.' It's a note-taking method popularized by sociologist Niklas Luhmann, who used a physical card catalog of roughly 90,000 numbered index cards to write more than 70 books and 400 articles over 30 years.",
      "The core idea is small. Every note captures one idea, in your own words, with a unique ID. Notes link to other notes. Over time the box becomes a network - not a folder hierarchy - and ideas surface through the links rather than through search.",
      "Modern Zettelkasten lives in apps like Obsidian, Roam, and Notebook Archive. The mechanics are simpler now (you don't need to handwrite IDs), but the discipline is the same: atomic notes, your own words, explicit links.",
      "Zettelkasten is overkill for daily notes. It earns its weight for long-running research, a thesis, a book, or any project where the same concepts come back across years.",
    ],
    related: ["pkm", "evergreen-notes", "atomic-notes"],
    faqs: [
      { q: "Do I need a special app for Zettelkasten?", a: "No. Index cards work. Any note app with backlinks works. The method is what matters." },
      { q: "How many notes before it pays off?", a: "Honestly, a few hundred. Below that, search is faster than browsing the network." },
    ],
  },
  {
    slug: "cornell-notes",
    term: "Cornell Notes",
    short:
      "A two-column note layout designed at Cornell University to make lecture notes easier to review and self-test.",
    category: "Method",
    body: [
      "Cornell Notes were developed in the 1950s by Walter Pauk, an education professor at Cornell. The page is split into three regions: a narrow 'cue' column on the left, a wide 'notes' column on the right, and a 'summary' bar at the bottom.",
      "During the lecture you write in the right column. Afterward you fill the cue column with keywords, questions, and prompts that the notes answer. The summary at the bottom is one or two sentences that compress the whole page.",
      "The point isn't the layout - it's the workflow. Cornell forces a second pass over the material within 24 hours, which is when most forgetting happens. Self-testing with the cue column beats re-reading.",
      "Notebook Archive ships a Cornell template you can open with one click. The cue column is a callout block, the summary is a horizontal rule and short paragraph at the bottom.",
    ],
    related: ["spaced-repetition", "active-recall"],
  },
  {
    slug: "pkm",
    term: "Personal Knowledge Management (PKM)",
    short:
      "The practice of capturing, organizing, and retrieving the information you encounter so it compounds over a career.",
    category: "Concept",
    body: [
      "Personal Knowledge Management - PKM - is the umbrella term for capturing, organizing, and reusing the information you read, hear, and produce. It covers everything from a bullet-journal to a Zettelkasten to a Notion workspace.",
      "Good PKM is boring. It captures fast, retrieves fast, and gets out of your way. Bad PKM is fiddly: hours spent on plugins, folders, and templates, with very little writing or thinking.",
      "The two failure modes are over-collecting (saving everything, reading nothing) and over-structuring (designing the system instead of using it). Most working PKM systems end up small and stubborn.",
      "Notebook Archive is intentionally narrow PKM: notebooks, notes, tags, search. No databases, no relations, no formulas. The trade-off is fewer levers in exchange for less maintenance.",
    ],
    related: ["zettelkasten", "para-method", "second-brain"],
  },
  {
    slug: "para-method",
    term: "PARA Method",
    short:
      "Tiago Forte's four-folder structure - Projects, Areas, Resources, Archive - for organizing any digital workspace.",
    category: "System",
    body: [
      "PARA stands for Projects, Areas, Resources, and Archive. It's a four-folder system designed by Tiago Forte, author of Building a Second Brain. The idea is that any piece of digital content fits cleanly in exactly one of those four.",
      "Projects are short-term efforts with a deadline. Areas are ongoing responsibilities with a standard to maintain. Resources are reference topics you care about. Archive is everything inactive.",
      "PARA's strength is portability. The same four folders work in your file system, your note app, your cloud drive, and your task manager. Context-switching is cheaper because the structure is the same everywhere.",
      "In Notebook Archive, PARA maps cleanly to four top-level notebooks. Or skip it - tags and global search are often enough to make PARA's structure unnecessary.",
    ],
    related: ["pkm", "second-brain"],
  },
  {
    slug: "second-brain",
    term: "Second Brain",
    short:
      "A digital system that captures your ideas, references, and writing so your biological brain doesn't have to hold everything.",
    category: "Concept",
    body: [
      "'Second Brain' is the marketing term Tiago Forte uses for an external knowledge system. The premise: human memory is unreliable, and offloading captured ideas into a searchable external store lets you think with more raw material.",
      "In practice, a Second Brain is a note app with deliberate capture habits, light organization, and a habit of revisiting old notes when working on new projects.",
      "Skeptical version: every notebook in history has been someone's second brain. The new branding is about treating capture as a discipline, not the tools themselves.",
      "Notebook Archive works well as a Second Brain because capture is fast, search is global, and notes export to plain Markdown. Nothing is locked in.",
    ],
    related: ["pkm", "para-method", "zettelkasten"],
  },
  {
    slug: "atomic-notes",
    term: "Atomic Notes",
    short:
      "One idea per note, expressed in your own words, with a clear title - the building block of a Zettelkasten.",
    category: "Concept",
    body: [
      "An atomic note holds exactly one idea. The title summarizes the idea as a complete sentence. The body argues it, explains it, or gives an example. The note links to related ideas instead of nesting them.",
      "The point of atomicity is recombination. Small notes link easily; long notes don't. When a new project pulls from your old notes, atomic notes can be re-shuffled without dragging unrelated material along.",
      "The discipline that makes atomic notes work is rewording. Quoted material is reference, not yours. Until you can state the idea in your own words, it isn't a note - it's a highlight.",
    ],
    related: ["zettelkasten", "evergreen-notes"],
  },
  {
    slug: "evergreen-notes",
    term: "Evergreen Notes",
    short:
      "Andy Matuschak's term for atomic, concept-oriented notes that you revisit and refine over years.",
    category: "Concept",
    body: [
      "Evergreen notes are a refinement of atomic notes, coined by researcher Andy Matuschak. The four principles: notes should be atomic, concept-oriented, densely linked, and written for yourself.",
      "'Concept-oriented' is the load-bearing word. The title states a claim or concept, not a topic. 'Spaced repetition compounds retention' is concept-oriented. 'Spaced repetition' is just a topic.",
      "Evergreen notes are meant to be edited forever. When you encounter the same idea again, you don't make a new note - you sharpen the existing one. The corpus grows slowly but the quality compounds.",
    ],
    related: ["zettelkasten", "atomic-notes"],
  },
  {
    slug: "spaced-repetition",
    term: "Spaced Repetition",
    short:
      "A study technique that schedules review of material at expanding intervals, fighting the forgetting curve.",
    category: "Method",
    body: [
      "Spaced repetition is a study technique built on Hermann Ebbinghaus's forgetting curve research from the 1880s. The finding: memory decays predictably, and reviewing material right before you forget it dramatically extends retention.",
      "Software like Anki, SuperMemo, and Mochi automate the scheduling. You see a card, rate how well you remembered it, and the algorithm picks the next review date.",
      "Spaced repetition is one of the most evidence-backed study methods that exists. It's also one of the most under-used, because making cards is friction and the payoff is months away.",
      "Notebook Archive doesn't ship a spaced-repetition algorithm. The Flashcards template gives you a place to draft cards; export to Anki or Mochi when you're ready.",
    ],
    related: ["active-recall", "cornell-notes"],
  },
  {
    slug: "active-recall",
    term: "Active Recall",
    short:
      "Practicing retrieval - quizzing yourself - instead of re-reading. The single biggest study upgrade for most students.",
    category: "Method",
    body: [
      "Active recall is the practice of trying to retrieve information from memory rather than recognizing it on a page. Closing the book and writing down everything you remember is active recall. Highlighting the same paragraph for the third time is not.",
      "Cognitive research consistently shows that retrieval practice beats re-reading by a wide margin for long-term retention. The struggle is the point - effortful recall is what strengthens the memory trace.",
      "The simplest implementation: after each study session, close the materials and write a one-page brain-dump of what you remember. Cross-check with the source. The gaps are where you actually need to study.",
    ],
    related: ["spaced-repetition", "cornell-notes"],
  },
  {
    slug: "markdown",
    term: "Markdown",
    short:
      "A lightweight plain-text formatting syntax that's become the default file format for note-taking apps.",
    category: "Tool",
    body: [
      "Markdown is a plain-text formatting syntax invented by John Gruber in 2004. It uses simple punctuation - asterisks for bold, pound signs for headings, brackets for links - to mark up text that renders to HTML.",
      "Markdown won the note-taking world because the source file is human-readable. Open a .md file in any text editor, on any operating system, and the content is intact. No proprietary binary format, no vendor lock-in.",
      "Notebook Archive uses standard Markdown plus a handful of common extensions (tables, task lists, fenced code blocks). Every note exports to a .md file you can open in Obsidian, VS Code, or plain Notepad.",
    ],
    related: ["pkm"],
  },
  {
    slug: "backlinks",
    term: "Backlinks",
    short:
      "Automatic reverse-link tracking - knowing every other note that links to the one you're reading.",
    category: "Concept",
    body: [
      "A backlink is a reverse link. When note A links to note B, B knows about it. Open B and you see a list of every note that mentions it - without anyone manually maintaining the list.",
      "Backlinks are what turn a folder of notes into a network. Hierarchical folders force one location per note; backlinks let one note belong to many contexts at once.",
      "Roam Research popularized backlinks in the modern note-taking world; Obsidian followed; most serious PKM apps now ship them. Notebook Archive uses tags for the same job - lighter weight, less powerful, but enough for most workflows.",
    ],
    related: ["zettelkasten", "pkm"],
  },
  {
    slug: "bullet-journal",
    term: "Bullet Journal",
    short:
      "Ryder Carroll's analog method for combining a planner, to-do list, and journal in one notebook.",
    category: "Method",
    body: [
      "The Bullet Journal - 'BuJo' to its practitioners - was created by designer Ryder Carroll in 2013. It's a system for using one paper notebook as a planner, task list, journal, and reference book at the same time.",
      "The core mechanics are 'rapid logging' (short symbol-prefixed entries), 'collections' (themed pages on any topic), and 'migration' (rewriting unfinished tasks at the end of each month, which forces a review).",
      "BuJo is paper-first by design. The handwriting is the point - it slows you down enough to think. Digital adaptations exist (including a template in Notebook Archive) but lose some of the original benefit.",
    ],
  },
];

export function getEntry(slug: string) {
  return GLOSSARY.find((e) => e.slug === slug);
}
