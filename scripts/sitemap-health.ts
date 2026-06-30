/**
 * Sitemap health check.
 *
 * Fetches public/sitemap.xml from the live site, then for every <loc>:
 *   - asserts HTTP 200
 *   - asserts <link rel="canonical"> matches the URL (rendered HTML)
 *   - asserts no <meta name="robots" content="noindex">
 *
 * Note: this is a hybrid SPA, so the canonical/robots checks read the
 * post-render DOM via Playwright when --render is passed. Without it,
 * we only check the static HTML and skip canonical for SPA routes
 * (Googlebot executes JS, so the SPA canonical still ships).
 *
 * Usage:
 *   bunx tsx scripts/sitemap-health.ts                # static check (fast)
 *   bunx tsx scripts/sitemap-health.ts --render       # render with Playwright
 */

const BASE = "https://notespace.lovable.app";
const SITEMAP = `${BASE}/sitemap.xml`;
const RENDER = process.argv.includes("--render");

interface Result {
  url: string;
  status: number | string;
  canonical: string | null;
  noindex: boolean;
  ok: boolean;
  reason?: string;
}

async function fetchText(url: string): Promise<{ status: number; body: string }> {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 SitemapHealth" } });
  return { status: res.status, body: await res.text() };
}

function parseLocs(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

function readHead(html: string) {
  const canon = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1] ?? null;
  const noindex = /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html);
  return { canon, noindex };
}

async function checkStatic(url: string): Promise<Result> {
  try {
    const { status, body } = await fetchText(url);
    const { canon, noindex } = readHead(body);
    // The static HTML for SPA routes ships the index.html canonical (homepage).
    // Real per-route canonical is injected by react-helmet-async after hydration.
    // Static check only validates 200 + noindex; canonical needs --render.
    const ok = status === 200 && !noindex;
    return { url, status, canonical: canon, noindex, ok, reason: ok ? undefined : `static ${status}${noindex ? " noindex" : ""}` };
  } catch (e) {
    return { url, status: "ERR", canonical: null, noindex: false, ok: false, reason: String(e) };
  }
}

async function checkRendered(url: string): Promise<Result> {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const res = await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
    const status = res?.status() ?? 0;
    const canon = await page.locator('link[rel="canonical"]').first().getAttribute("href").catch(() => null);
    const noindex = !!(await page.locator('meta[name="robots"][content*="noindex"]').count());
    const ok = status === 200 && canon === url && !noindex;
    const reason = !ok
      ? [status !== 200 && `status=${status}`, canon !== url && `canonical=${canon}`, noindex && "noindex"]
          .filter(Boolean)
          .join(" ")
      : undefined;
    return { url, status, canonical: canon, noindex, ok, reason };
  } finally {
    await browser.close();
  }
}

async function main() {
  const sm = await fetchText(SITEMAP);
  if (sm.status !== 200) {
    console.error(`sitemap.xml returned ${sm.status}`);
    process.exit(1);
  }
  const urls = parseLocs(sm.body);
  console.log(`Checking ${urls.length} URLs (render=${RENDER})...\n`);

  const results: Result[] = [];
  const concurrency = RENDER ? 3 : 10;
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const out = await Promise.all(batch.map((u) => (RENDER ? checkRendered(u) : checkStatic(u))));
    results.push(...out);
    process.stdout.write(`  ${results.length}/${urls.length}\r`);
  }

  const bad = results.filter((r) => !r.ok);
  console.log(`\n\nOK: ${results.length - bad.length}/${results.length}`);
  if (bad.length) {
    console.log(`\nProblems:`);
    for (const b of bad) console.log(`  ${b.url}\n    -> ${b.reason}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
