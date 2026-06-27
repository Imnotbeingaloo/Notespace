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
  { path: "/use-cases", changefreq: "monthly", priority: "0.8" },
  { path: "/use-cases/students", changefreq: "monthly", priority: "0.9" },
  { path: "/use-cases/writers", changefreq: "monthly", priority: "0.9" },
  { path: "/use-cases/researchers", changefreq: "monthly", priority: "0.9" },
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
  "/shared/",
  "/auth",
];

/** Indexing bots that must honor the Disallow rules above. */
export const INDEXING_BOTS: string[] = ["Googlebot", "Bingbot", "*"];
