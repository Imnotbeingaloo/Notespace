/**
 * Single source of truth for which routes are public (indexable + in sitemap)
 * vs private (noindex + disallowed in robots.txt).
 *
 * Used by:
 *   - scripts/generate-sitemap.ts  → writes public/sitemap.xml
 *   - tests/seo-routing.test.ts    → asserts robots.txt + sitemap match this list
 *
 * Keep this in sync when you add or remove a <Route> in src/App.tsx.
 */

export interface PublicRoute {
  path: string;
  changefreq?: "weekly" | "monthly" | "yearly";
  priority?: string;
}

/** Routes that crawlers should index and that go into sitemap.xml. */
export const PUBLIC_ROUTES: PublicRoute[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/features", changefreq: "monthly", priority: "0.8" },
  { path: "/how-it-works", changefreq: "monthly", priority: "0.8" },
  { path: "/pricing", changefreq: "monthly", priority: "0.9" },
  { path: "/about", changefreq: "monthly", priority: "0.6" },
  { path: "/blog", changefreq: "weekly", priority: "0.8" },
  { path: "/blog/best-ai-note-taking-apps-2026", changefreq: "monthly", priority: "0.9" },
  { path: "/blog/best-note-taking-app-for-writers", changefreq: "monthly", priority: "0.9" },
  { path: "/blog/ai-note-taking-app-for-students", changefreq: "monthly", priority: "0.9" },
  { path: "/blog/ki-notizen-app", changefreq: "monthly", priority: "0.9" },
  { path: "/blog/notion-alternatives-2026", changefreq: "monthly", priority: "0.9" },
  { path: "/blog/obsidian-alternatives-2026", changefreq: "monthly", priority: "0.9" },
  { path: "/blog/evernote-alternatives-2026", changefreq: "monthly", priority: "0.9" },
  { path: "/blog/onenote-alternatives-2026", changefreq: "monthly", priority: "0.9" },
  { path: "/blog/best-note-taking-app-2026", changefreq: "monthly", priority: "1.0" },
  { path: "/blog/ai-voice-notes-meeting-transcription", changefreq: "monthly", priority: "0.9" },
  { path: "/blog/best-ai-writing-assistants-for-note-takers", changefreq: "monthly", priority: "0.9" },
  { path: "/blog/ai-literature-review-guide", changefreq: "monthly", priority: "0.9" },
  { path: "/blog/how-to-make-a-study-plan", changefreq: "monthly", priority: "0.9" },
  { path: "/blog/how-to-make-a-study-plan-for-exams", changefreq: "monthly", priority: "0.9" },
  { path: "/blog/how-to-make-a-revision-timetable", changefreq: "monthly", priority: "0.9" },
  { path: "/blog/gcse-revision-guide-2026", changefreq: "monthly", priority: "0.9" },
  { path: "/blog/a-level-revision-guide-2026", changefreq: "monthly", priority: "0.9" },
  { path: "/blog/hsc-vce-study-notes-guide", changefreq: "monthly", priority: "0.8" },
  { path: "/study-planner", changefreq: "monthly", priority: "0.9" },
  { path: "/revision-timetable", changefreq: "monthly", priority: "0.9" },
  { path: "/templates/revision-timetable-template", changefreq: "monthly", priority: "0.9" },
  { path: "/use-cases", changefreq: "monthly", priority: "0.8" },
  { path: "/use-cases/students", changefreq: "monthly", priority: "0.9" },
  { path: "/use-cases/writers", changefreq: "monthly", priority: "0.9" },
  { path: "/use-cases/researchers", changefreq: "monthly", priority: "0.9" },
  { path: "/use-cases/project-managers", changefreq: "monthly", priority: "0.9" },
  { path: "/compare", changefreq: "monthly", priority: "0.8" },
  { path: "/compare/notion", changefreq: "monthly", priority: "0.9" },
  { path: "/compare/obsidian", changefreq: "monthly", priority: "0.9" },
  { path: "/compare/evernote", changefreq: "monthly", priority: "0.9" },
  { path: "/compare/onenote", changefreq: "monthly", priority: "0.9" },
  { path: "/compare/roam", changefreq: "monthly", priority: "0.9" },
  { path: "/compare/bear", changefreq: "monthly", priority: "0.9" },
  { path: "/compare/mem", changefreq: "monthly", priority: "0.9" },
  { path: "/compare/reflect", changefreq: "monthly", priority: "0.9" },
  { path: "/compare/apple-notes", changefreq: "monthly", priority: "0.9" },
  { path: "/compare/google-keep", changefreq: "monthly", priority: "0.9" },
  { path: "/templates", changefreq: "monthly", priority: "0.9" },
  { path: "/templates/study-planner", changefreq: "monthly", priority: "0.9" },
  { path: "/templates/lecture", changefreq: "monthly", priority: "0.8" },
  { path: "/templates/cornell", changefreq: "monthly", priority: "0.8" },
  { path: "/templates/research", changefreq: "monthly", priority: "0.8" },
  { path: "/templates/study-guide", changefreq: "monthly", priority: "0.8" },
  { path: "/templates/flashcards", changefreq: "monthly", priority: "0.8" },
  { path: "/templates/essay-outline", changefreq: "monthly", priority: "0.8" },
  { path: "/templates/reading-notes", changefreq: "monthly", priority: "0.8" },
  { path: "/templates/problem-set", changefreq: "monthly", priority: "0.8" },
  { path: "/templates/weekly-review", changefreq: "monthly", priority: "0.8" },
  { path: "/templates/meeting", changefreq: "monthly", priority: "0.8" },
  { path: "/templates/book-notes", changefreq: "monthly", priority: "0.8" },
  { path: "/learn", changefreq: "monthly", priority: "0.8" },
  { path: "/learn/zettelkasten", changefreq: "monthly", priority: "0.8" },
  { path: "/learn/cornell-notes", changefreq: "monthly", priority: "0.8" },
  { path: "/learn/pkm", changefreq: "monthly", priority: "0.8" },
  { path: "/learn/para-method", changefreq: "monthly", priority: "0.8" },
  { path: "/learn/second-brain", changefreq: "monthly", priority: "0.8" },
  { path: "/learn/atomic-notes", changefreq: "monthly", priority: "0.8" },
  { path: "/learn/evergreen-notes", changefreq: "monthly", priority: "0.8" },
  { path: "/learn/spaced-repetition", changefreq: "monthly", priority: "0.8" },
  { path: "/learn/active-recall", changefreq: "monthly", priority: "0.8" },
  { path: "/learn/markdown", changefreq: "monthly", priority: "0.8" },
  { path: "/learn/backlinks", changefreq: "monthly", priority: "0.8" },
  { path: "/learn/bullet-journal", changefreq: "monthly", priority: "0.8" },
];


/**
 * App-only routes. These must:
 *   - NOT appear in sitemap.xml
 *   - have a Disallow rule in robots.txt for every indexing bot
 *   - emit `<meta name="robots" content="noindex,nofollow">` at render time
 *
 * Each entry is the literal robots.txt Disallow value (path prefix).
 */
export const PRIVATE_ROUTE_PATTERNS: string[] = [
  "/app",
  "/app/",
  "/home",
  "/trash",
  // NOTE: /shared/* is intentionally NOT here. The shared-note page emits
  // its own <meta name="robots"> tag (noindex by default, opt-in indexable
  // via the per-share `is_discoverable` flag). Blocking it in robots.txt
  // would prevent crawlers from ever seeing those per-page directives.
  "/auth",
  "/admin",
  "/admin/",
];


/** Indexing bots that must honor the Disallow rules above. */
export const INDEXING_BOTS: string[] = ["Googlebot", "Bingbot", "*"];
