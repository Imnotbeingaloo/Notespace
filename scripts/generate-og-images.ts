/**
 * Generate per-post OG images as clean, brand-styled cards using Playwright.
 * No AI imagery — just typography on cream paper with brand colors.
 *
 * Usage: npx tsx scripts/generate-og-images.ts
 */
import { mkdirSync } from "fs";
import { resolve } from "path";
import { chromium } from "playwright";

interface OgSpec {
  slug: string;
  eyebrow: string;
  title: string;
  subtitle: string;
}

const POSTS: OgSpec[] = [
  {
    slug: "how-to-make-a-study-plan",
    eyebrow: "Study Guide",
    title: "How to make a study plan",
    subtitle: "A simple, step-by-step guide with a free weekly template.",
  },
  {
    slug: "how-to-make-a-study-plan-for-exams",
    eyebrow: "Exam Prep",
    title: "Study plan for exams",
    subtitle: "Six-week exam plan you'll actually follow.",
  },
  {
    slug: "how-to-make-a-revision-timetable",
    eyebrow: "GCSE & A-level",
    title: "Revision timetable",
    subtitle: "Plan smart. Revise effectively. Stay in control.",
  },
  {
    slug: "templates-study-planner",
    eyebrow: "Template",
    title: "Study planner",
    subtitle: "Open the ready-made study planner in Notebook Archive.",
  },
];

const html = (s: OgSpec) => `<!doctype html>
<html><head><meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Inter:wght@400;600&display=swap" rel="stylesheet" />
<style>
  html,body{margin:0;padding:0;}
  body{width:1200px;height:630px;background:#f6f1e6;font-family:'Inter',sans-serif;color:#0f2a30;position:relative;overflow:hidden;}
  .rule{position:absolute;left:96px;top:0;bottom:0;width:2px;background:#d97757;opacity:.7;}
  .holes{position:absolute;left:36px;top:80px;display:flex;flex-direction:column;gap:120px;}
  .hole{width:18px;height:18px;border-radius:50%;background:#e3dccf;}
  .pad{padding:88px 96px 88px 150px;display:flex;flex-direction:column;height:100%;box-sizing:border-box;justify-content:space-between;}
  .eyebrow{display:inline-block;background:#d97757;color:#fff;font-weight:600;font-size:20px;letter-spacing:.14em;text-transform:uppercase;padding:8px 18px 8px 18px;clip-path:polygon(0 0,calc(100% - 14px) 0,100% 50%,calc(100% - 14px) 100%,0 100%);}
  h1{font-family:'Merriweather',serif;font-weight:900;font-size:104px;line-height:1.02;margin:28px 0 24px;letter-spacing:-.02em;color:#0f3338;}
  .accent{height:6px;width:160px;background:#d97757;border-radius:3px;margin-bottom:28px;}
  p{font-size:30px;line-height:1.35;color:#3a4f55;max-width:880px;margin:0;}
  .foot{display:flex;align-items:center;gap:18px;font-size:22px;color:#0f3338;font-weight:600;letter-spacing:.04em;}
  .dot{width:34px;height:34px;border-radius:50%;background:#0f3338;display:inline-flex;align-items:center;justify-content:center;color:#f6f1e6;font-family:'Merriweather',serif;font-weight:900;font-size:20px;}
</style></head>
<body>
  <div class="rule"></div>
  <div class="holes"><div class="hole"></div><div class="hole"></div><div class="hole"></div><div class="hole"></div></div>
  <div class="pad">
    <div>
      <div class="eyebrow">${s.eyebrow}</div>
      <h1>${s.title}</h1>
      <div class="accent"></div>
      <p>${s.subtitle}</p>
    </div>
    <div class="foot"><span class="dot">N</span> Notebook Archive</div>
  </div>
</body></html>`;

async function main() {
  const outDir = resolve("public/og");
  mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  for (const post of POSTS) {
    await page.setContent(html(post), { waitUntil: "networkidle" });
    await page.waitForTimeout(250);
    await page.screenshot({
      path: resolve(outDir, `og-${post.slug}.jpg`),
      type: "jpeg",
      quality: 88,
      fullPage: false,
      clip: { x: 0, y: 0, width: 1200, height: 630 },
    });
    console.log("og:", post.slug);
  }
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
