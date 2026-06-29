#!/usr/bin/env node
/**
 * Blog content lint.
 *
 * Enforces, per blog page under src/pages/Blog*.tsx (excluding BlogIndex):
 *   1. Imports the shared Callout component (../components/blog/Callout).
 *   2. Each "How we picked" and "Frequently asked" section is followed by
 *      a <Callout ...> within 40 lines.
 *   3. Every heading (<h2>/<h3>) has >= 4 lines of substantive prose
 *      (paragraphs, list items, callout bodies) before the next heading.
 *
 * Exit code is non-zero on any violation, so this can be wired into CI.
 * Run: `node scripts/lint-blogs.mjs`     (audit)
 *      `node scripts/lint-blogs.mjs --json` (machine-readable)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pagesDir = path.resolve(__dirname, "../src/pages");
const MIN_LINES_PER_HEADING = 4;
const CALLOUT_PROXIMITY_LINES = 40;

const files = fs
  .readdirSync(pagesDir)
  .filter((f) => /^Blog.*\.tsx$/.test(f) && f !== "BlogIndex.tsx" && f !== "BlogVisuals.tsx")
  .map((f) => path.join(pagesDir, f));

const SECTION_HEADERS = [/how we picked/i, /frequently asked/i, /häufige fragen/i, /how we picked/i];

const findings = [];

function countContentLines(slice) {
  // Count substantive lines: prose, list items, FAQ details, mapped cards,
  // and Callout bodies. Skip pure structural/closing markup.
  let n = 0;
  for (const raw of slice) {
    const line = raw.trim();
    if (!line) continue;
    if (/^<\/?(h1|h2|h3|h4)/i.test(line)) continue;
    if (/^<\/(section|div|article|aside|ul|ol|figure|details|summary)>?$/i.test(line)) continue;
    if (/^[)}\]];?$/.test(line)) continue;
    if (/^<(p|li|Callout|details|summary|Card)[\s>]/i.test(line)) { n++; continue; }
    if (/\.map\s*\(/.test(line)) { n += 2; continue; } // mapped lists render multiple items
    if (line.length > 25) n++;
  }
  return n;
}

for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  const lines = src.split("\n");
  const rel = path.relative(process.cwd(), file);

  // 1. Callout import
  if (!/from\s+["']@\/components\/blog\/Callout["']/.test(src)) {
    findings.push({ file: rel, rule: "import", message: "Missing Callout import" });
  }

  // Collect heading positions
  const headings = [];
  lines.forEach((l, i) => {
    const m = l.match(/<h([23])[^>]*>([\s\S]*?)<\/h\1>/);
    if (m) headings.push({ idx: i, level: +m[1], text: m[2].replace(/<[^>]+>/g, "").trim() });
  });

  for (let h = 0; h < headings.length; h++) {
    const { idx, text } = headings[h];
    const nextIdx = headings[h + 1]?.idx ?? lines.length;
    const slice = lines.slice(idx + 1, nextIdx);

    // Rule 3: min content lines per heading
    const contentLines = countContentLines(slice);
    if (contentLines < MIN_LINES_PER_HEADING) {
      findings.push({
        file: rel,
        rule: "thin-section",
        message: `Heading "${text}" has ${contentLines} content line(s) (<${MIN_LINES_PER_HEADING})`,
        line: idx + 1,
      });
    }

    // Rule 2: required Callout near "How we picked" / "Frequently asked"
    if (SECTION_HEADERS.some((rx) => rx.test(text))) {
      const window = lines.slice(Math.max(0, idx - 10), Math.min(idx + CALLOUT_PROXIMITY_LINES, nextIdx));
      const hasCallout = window.some((l) => /<Callout[\s>]/.test(l));
      if (!hasCallout) {
        findings.push({
          file: rel,
          rule: "missing-callout",
          message: `Section "${text}" has no <Callout> within ${CALLOUT_PROXIMITY_LINES} lines`,
          line: idx + 1,
        });
      }
    }
  }
}

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ files: files.length, findings }, null, 2));
} else {
  console.log(`Scanned ${files.length} blog files.`);
  if (findings.length === 0) {
    console.log("✓ No issues found.");
  } else {
    console.log(`✗ ${findings.length} issue(s):\n`);
    const byFile = findings.reduce((acc, f) => ((acc[f.file] ??= []).push(f), acc), {});
    for (const [f, items] of Object.entries(byFile)) {
      console.log(`  ${f}`);
      for (const it of items) {
        console.log(`    [${it.rule}]${it.line ? ` L${it.line}` : ""} ${it.message}`);
      }
    }
  }
}

process.exit(findings.length === 0 ? 0 : 1);
