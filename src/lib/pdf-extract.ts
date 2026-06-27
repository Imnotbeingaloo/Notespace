// PDF text extraction using pdfjs-dist. Worker loaded via Vite ?url import.
import * as pdfjs from "pdfjs-dist";
// @ts-ignore - Vite worker URL import
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

(pdfjs as any).GlobalWorkerOptions.workerSrc = workerUrl;

export interface PdfExtractionResult {
  text: string;
  pageCount: number;
  isScanned: boolean;
}

interface PdfItem {
  str: string;
  height: number;
  y: number;
  hasEOL?: boolean;
}

// Build a structured markdown representation from raw PDF text items.
// Preserves paragraph breaks, detects likely headings via relative font size,
// and converts simple bullet/numbered lines into markdown lists.
function buildPageMarkdown(items: PdfItem[]): string {
  if (items.length === 0) return "";

  // Group items into lines using their Y position (PDF coords go bottom-up).
  const lines: { text: string; height: number }[] = [];
  let current: PdfItem[] = [];
  let currentY: number | null = null;
  const Y_TOLERANCE = 2;

  for (const it of items) {
    if (currentY === null || Math.abs(it.y - currentY) <= Y_TOLERANCE) {
      current.push(it);
      currentY = currentY ?? it.y;
    } else {
      if (current.length) {
        const text = current.map((c) => c.str).join("").replace(/\s+/g, " ").trim();
        const maxH = Math.max(...current.map((c) => c.height || 0));
        if (text) lines.push({ text, height: maxH });
      }
      current = [it];
      currentY = it.y;
    }
  }
  if (current.length) {
    const text = current.map((c) => c.str).join("").replace(/\s+/g, " ").trim();
    const maxH = Math.max(...current.map((c) => c.height || 0));
    if (text) lines.push({ text, height: maxH });
  }

  if (lines.length === 0) return "";

  // Compute median body height; lines noticeably taller are headings.
  const heights = lines.map((l) => l.height).filter((h) => h > 0).sort((a, b) => a - b);
  const median = heights.length ? heights[Math.floor(heights.length / 2)] : 0;

  const out: string[] = [];
  let prevWasList = false;

  const pushBlankOnce = () => {
    if (out.length && out[out.length - 1] !== "") out.push("");
  };

  for (const { text, height } of lines) {
    // Bullet / dash list
    const bulletMatch = text.match(/^[•·●○◦▪►‣\-*]\s+(.*)$/);
    // Numbered list e.g. "1." "1)" "(1)"
    const numberedMatch = text.match(/^(?:\(?\d+[.)])\s+(.*)$/);

    if (bulletMatch) {
      if (!prevWasList) pushBlankOnce();
      out.push(`- ${bulletMatch[1].trim()}`);
      prevWasList = true;
      continue;
    }
    if (numberedMatch) {
      if (!prevWasList) pushBlankOnce();
      out.push(`1. ${numberedMatch[1].trim()}`);
      prevWasList = true;
      continue;
    }

    // Heading detection: clearly larger than body text, short-ish, no terminal period.
    const isHeading =
      median > 0 &&
      height >= median * 1.25 &&
      text.length <= 120 &&
      !/[.?!]$/.test(text);

    if (isHeading) {
      const level = height >= median * 1.7 ? 1 : height >= median * 1.4 ? 2 : 3;
      pushBlankOnce();
      out.push(`${"#".repeat(level)} ${text}`);
      out.push("");
      prevWasList = false;
      continue;
    }

    if (prevWasList) pushBlankOnce();
    out.push(text);
    prevWasList = false;
  }

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

// Strip common header/footer noise: standalone page numbers, "Page X of Y", etc.
function stripPageChrome(text: string): string {
  return text
    .replace(/^\s*(?:page\s+)?\d+\s*(?:\/|of)\s*\d+\s*$/gim, "")
    .replace(/^\s*[-–-]?\s*\d{1,4}\s*[-–-]?\s*$/gm, "")
    .trim();
}

// Join pages so a paragraph or section that wraps across a page break stays continuous.
// If the previous page ends mid-sentence and the next page starts with lowercase text
// (not a heading or list), merge them with a space instead of a paragraph break.
function joinPages(pages: string[]): string {
  let result = "";
  for (let i = 0; i < pages.length; i++) {
    const cur = pages[i].trim();
    if (!cur) continue;
    if (!result) {
      result = cur;
      continue;
    }
    const prevEnd = result.slice(-1);
    const firstLine = cur.split("\n", 1)[0];
    const continuesParagraph =
      !/[.?!:)"']$/.test(prevEnd) &&
      !/^#{1,6}\s/.test(firstLine) &&
      !/^[-*]\s/.test(firstLine) &&
      !/^\d+\.\s/.test(firstLine) &&
      /^[a-z(,;]/.test(firstLine);
    result += continuesParagraph ? " " + cur : "\n\n" + cur;
  }
  return result;
}

export async function extractPdfText(file: File, onProgress?: (pct: number) => void): Promise<PdfExtractionResult> {
  const buf = await file.arrayBuffer();
  const pdf = await (pdfjs as any).getDocument({ data: buf }).promise;
  const pageCount = pdf.numPages;
  const pageTexts: string[] = [];
  let totalAlpha = 0;

  for (let p = 1; p <= pageCount; p++) {
    const page = await pdf.getPage(p);
    const tc = await page.getTextContent();
    const items: PdfItem[] = tc.items
      .filter((i: any) => "str" in i)
      .map((i: any) => ({
        str: i.str,
        height: i.height || (i.transform ? Math.abs(i.transform[3]) : 0),
        y: i.transform ? i.transform[5] : 0,
        hasEOL: i.hasEOL,
      }));
    const md = stripPageChrome(buildPageMarkdown(items));
    if (md) pageTexts.push(md);
    totalAlpha += (md.match(/[a-zA-Z]/g) || []).length;
    onProgress?.(Math.round((p / pageCount) * 100));
  }

  // Join pages so a section that spans page boundaries flows naturally,
  // then insert `---` BEFORE each heading (except the first) so each completed
  // section is visually separated from the next.
  let text = joinPages(pageTexts)
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Insert a divider before every heading except the very first one.
  const lines = text.split("\n");
  const withDividers: string[] = [];
  let seenFirstHeading = false;
  for (const line of lines) {
    if (/^#{1,6}\s/.test(line)) {
      if (seenFirstHeading) {
        // Ensure a blank line, then `---`, then a blank line before the heading.
        while (withDividers.length && withDividers[withDividers.length - 1] === "") {
          withDividers.pop();
        }
        withDividers.push("", "---", "");
      }
      seenFirstHeading = true;
    }
    withDividers.push(line);
  }
  text = withDividers.join("\n").replace(/\n{3,}/g, "\n\n").trim();

  const isScanned = totalAlpha < pageCount * 40;
  return { text, pageCount, isScanned };
}
