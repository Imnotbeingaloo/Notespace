/**
 * Search Console dashboard (CLI).
 *
 * Pulls the live state from GSC for the project property and prints:
 *   - sitemap submission status (submitted, indexed, errors, warnings,
 *     last downloaded)
 *   - URL inspection verdicts for every URL in /sitemap.xml
 *   - a per-day history file at .seo/gsc-history.jsonl so you can chart
 *     discovered/indexed URL counts over time
 *
 * Run via the connector gateway. Requires LOVABLE_API_KEY and
 * GOOGLE_SEARCH_CONSOLE_API_KEY in the environment.
 *
 *   bunx tsx scripts/gsc-dashboard.ts            # summary + append history
 *   bunx tsx scripts/gsc-dashboard.ts --inspect  # also inspect every URL
 */

import { mkdirSync, appendFileSync, readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";

const SITE = "https://notebookarchive.lovable.app/";
const SITE_ENC = encodeURIComponent(SITE);
const GW = "https://connector-gateway.lovable.dev/google_search_console";
const HISTORY = resolve(".seo/gsc-history.jsonl");

const LOVABLE = process.env.LOVABLE_API_KEY;
const GSC = process.env.GOOGLE_SEARCH_CONSOLE_API_KEY;
if (!LOVABLE || !GSC) {
  console.error("Missing LOVABLE_API_KEY or GOOGLE_SEARCH_CONSOLE_API_KEY in env.");
  process.exit(1);
}

const HEADERS = {
  Authorization: `Bearer ${LOVABLE}`,
  "X-Connection-Api-Key": GSC,
  "Content-Type": "application/json",
};

async function gscGet(path: string) {
  const r = await fetch(`${GW}${path}`, { headers: HEADERS });
  if (!r.ok) throw new Error(`${path} -> ${r.status} ${await r.text()}`);
  return r.json();
}

async function inspect(url: string) {
  const r = await fetch(`${GW}/v1/urlInspection/index:inspect`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ inspectionUrl: url, siteUrl: SITE }),
  });
  if (!r.ok) return { url, error: `${r.status}` };
  const d = (await r.json()) as { inspectionResult?: { indexStatusResult?: Record<string, unknown> } };
  const s = d.inspectionResult?.indexStatusResult ?? {};
  return {
    url,
    verdict: s.verdict as string | undefined,
    coverage: s.coverageState as string | undefined,
    canonical: s.googleCanonical as string | undefined,
    lastCrawl: s.lastCrawlTime as string | undefined,
  };
}

async function main() {
  console.log(`\n=== Sitemaps (${SITE}) ===`);
  const sm = (await gscGet(`/webmasters/v3/sites/${SITE_ENC}/sitemaps`)) as {
    sitemap?: Array<{
      path: string;
      lastSubmitted?: string;
      lastDownloaded?: string;
      errors?: string;
      warnings?: string;
      contents?: Array<{ submitted?: string; indexed?: string }>;
    }>;
  };
  const entries: Array<{
    submitted: number;
    indexed: number;
    errors: number;
    warnings: number;
  }> = [];
  for (const s of sm.sitemap ?? []) {
    const c = s.contents?.[0] ?? {};
    const row = {
      submitted: Number(c.submitted ?? 0),
      indexed: Number(c.indexed ?? 0),
      errors: Number(s.errors ?? 0),
      warnings: Number(s.warnings ?? 0),
    };
    entries.push(row);
    console.log(`  ${s.path}`);
    console.log(`    submitted=${row.submitted}  indexed=${row.indexed}  errors=${row.errors}  warnings=${row.warnings}`);
    console.log(`    lastSubmitted=${s.lastSubmitted}  lastDownloaded=${s.lastDownloaded}`);
  }

  // Append a daily history row so you can chart discovered/indexed over time.
  mkdirSync(dirname(HISTORY), { recursive: true });
  const today = new Date().toISOString().slice(0, 10);
  const line = JSON.stringify({ date: today, sitemaps: entries }) + "\n";
  // dedupe: only append if today's row isn't already there
  const prev = existsSync(HISTORY) ? readFileSync(HISTORY, "utf8") : "";
  if (!prev.includes(`"date":"${today}"`)) {
    appendFileSync(HISTORY, line);
    console.log(`\n  history -> ${HISTORY} (appended ${today})`);
  } else {
    console.log(`\n  history -> ${HISTORY} (already has ${today})`);
  }

  if (!process.argv.includes("--inspect")) return;

  console.log(`\n=== URL inspection ===`);
  const xml = await fetch(`${SITE}sitemap.xml`, { headers: { "User-Agent": "Mozilla/5.0" } }).then((r) => r.text());
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());

  const buckets: Record<string, string[]> = {};
  for (let i = 0; i < urls.length; i += 3) {
    const out = await Promise.all(urls.slice(i, i + 3).map(inspect));
    for (const r of out) {
      const k = ("coverage" in r ? r.coverage : `error ${r.error}`) ?? "unknown";
      (buckets[k] ??= []).push(r.url);
      process.stdout.write(`  ${Object.values(buckets).reduce((a, b) => a + b.length, 0)}/${urls.length}\r`);
    }
  }
  console.log("\n");
  for (const [state, list] of Object.entries(buckets)) {
    console.log(`  [${list.length}] ${state}`);
    for (const u of list.slice(0, 20)) console.log(`      ${u}`);
    if (list.length > 20) console.log(`      ... +${list.length - 20} more`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
