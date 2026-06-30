// Runs before `vite dev` and `vite build` (predev/prebuild hooks).
// Writes public/sitemap.xml from the PUBLIC_ROUTES list in site-routes.ts
// so app-only routes (/app, /home, /trash, /shared/*, /auth) are never indexed.

import { writeFileSync } from "fs";
import { resolve } from "path";
import { PUBLIC_ROUTES, PRIVATE_ROUTE_PATTERNS } from "./site-routes";

const BASE_URL = "https://notebookarchive.lovable.app";

function isPrivate(path: string): boolean {
  return PRIVATE_ROUTE_PATTERNS.some((p) => path === p || path.startsWith(p));
}

const LASTMOD = new Date().toISOString().slice(0, 10);

function generateSitemap() {
  const entries = PUBLIC_ROUTES.filter((e) => !isPrivate(e.path));

  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      `    <lastmod>${LASTMOD}</lastmod>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

const xml = generateSitemap();
writeFileSync(resolve("public/sitemap.xml"), xml);
console.log(
  `sitemap.xml written (${PUBLIC_ROUTES.length} public routes, ${PRIVATE_ROUTE_PATTERNS.length} private patterns excluded)`,
);
