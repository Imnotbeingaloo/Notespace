const MARKDOWN_EXTENSIONS = new Set([".md", ".markdown"]);

function extensionOf(fileName: string) {
  const dot = fileName.lastIndexOf(".");
  return dot === -1 ? "" : fileName.slice(dot).toLowerCase();
}

function titleFromFile(fileName: string) {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Patterns that almost always indicate a watermark / footer / page-chrome
// line injected by free PDF sites, or boilerplate page numbers. We strip
// these so the imported note doesn't carry spammy footer noise.
const WATERMARK_PATTERNS: RegExp[] = [
  /\b(ocean\s*of\s*pdf|oceanofpdf|pdfdrive|z-?library|libgen|annas[-\s]?archive|sci-?hub|free\s*pdf|epubpub|epub\.pub|pdfroom|getfreebooks|allitebooks|bookboon|pdfcoffee|scribd)\b/i,
  /\bdownload(ed)?\s+(this\s+)?(book|ebook|pdf|file|chapter)?\s*(from|at|via|by)\b/i,
  /\b(visit|check)\s+(us\s+)?(at|on)\s+\S+\.(com|net|org|io|co|info)\b/i,
  /^\s*(https?:\/\/|www\.)\S+\s*$/i,
  /^\s*page\s+\d+\s+of\s+\d+\s*$/i,
  /^\s*-?\s*\d{1,4}\s*-?\s*$/,
  /\bfor\s+more\s+(free\s+)?(books|ebooks|pdfs?|content)\b/i,
  /\b(all|©|copyright)\s+rights?\s+reserved\b/i,
  /\bthis\s+(book|file|pdf|document)\s+(is\s+)?(was\s+)?(provided|shared|distributed)\s+(by|from|for)\b/i,
  /^\s*\[?\s*free\s+(download|ebook|pdf)\s*\]?\s*$/i,
];

function isWatermark(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  return WATERMARK_PATTERNS.some((re) => re.test(trimmed));
}

function looksLikeHeading(line: string, nextLine?: string) {
  const text = line.trim();
  if (!text || text.length < 3 || text.length > 90) return false;
  if (/^#{1,6}\s/.test(text) || /^[-*+]\s+/.test(text) || /^\d+[.)]\s+/.test(text)) return false;
  if (!nextLine?.trim()) return false;
  if (/[.!?]$/.test(text)) return false;
  if (/^chapter\s+\d+/i.test(text) || /^section\s+\d+/i.test(text)) return true;
  if (/^[A-Z0-9\s:&,/'()-]{4,}$/.test(text)) return true;
  const words = text.split(/\s+/);
  const titleWords = words.filter((word) => /^[A-Z0-9]/.test(word)).length;
  return words.length <= 9 && titleWords >= Math.ceil(words.length * 0.65);
}

// Turn a plain paragraph into a lightly formatted one:
// - **bold** phrases that appear in ALL CAPS (3+ chars, not the whole line)
// - <mark>Term:</mark> highlighting for definition-style leads ("Term: definition")
// - **bold** for short bracketed labels [Note], [Important], etc.
function enrichInline(text: string): string {
  let out = text;

  // Definition-style highlighting: "Term: rest of paragraph" → highlight the term.
  // Only trigger when the term is short (<= 40 chars) and doesn't contain a period.
  const defMatch = out.match(/^([A-Z][^:.\n]{1,40}):\s+(.+)$/);
  if (defMatch) {
    out = `<mark>${defMatch[1]}:</mark> ${defMatch[2]}`;
  }

  // Bold ALL-CAPS phrases embedded inside a longer line (not if the whole line
  // is caps — that becomes a heading elsewhere).
  const hasLower = /[a-z]/.test(out);
  if (hasLower) {
    out = out.replace(/\b([A-Z][A-Z0-9\s]{2,30}[A-Z0-9])\b(?=\s|[,.;:!?])/g, (m) => {
      // Skip if it's just an acronym like "NASA" (single word, no space) —
      // those aren't emphasis.
      if (!/\s/.test(m)) return m;
      return `**${m.trim()}**`;
    });
  }

  // Bracketed labels: [Important], [Note], [Warning] → **[Important]**
  out = out.replace(/(^|\s)\[([A-Z][A-Za-z ]{1,20})\](?=\s|:|$)/g, "$1**[$2]**");

  return out;
}

export function formatImportedDocument(rawText: string, fileName: string) {
  const ext = extensionOf(fileName);
  const normalized = rawText.replace(/\r\n?/g, "\n").replace(/[\t ]+$/gm, "").trim();
  if (!normalized) return "";

  // Markdown files: strip watermarks, trust the source, still enrich long
  // paragraphs with inline highlighting for definition-style leads.
  if (MARKDOWN_EXTENSIONS.has(ext)) {
    const kept = normalized
      .split("\n")
      .filter((line) => !isWatermark(line))
      .join("\n")
      .replace(/\n{3,}/g, "\n\n");
    return `${kept.trim()}\n\n`;
  }

  const sourceLines = normalized.split("\n");
  const output: string[] = [];
  const title = titleFromFile(fileName);

  // Title goes first as a centered H1. The editor renders `# ` as an <h1>,
  // and prose-h1:text-center centers it visually.
  if (title && !sourceLines[0]?.trim().startsWith("#")) {
    output.push(`# ${title}`, "", "---", "");
  }

  // Reconstruct paragraphs from hard-wrapped lines. Join contiguous non-empty
  // body lines with a single space; an empty source line ends the paragraph.
  let buffer: string[] = [];
  const flushParagraph = () => {
    if (buffer.length === 0) return;
    const joined = buffer.join(" ").replace(/\s{2,}/g, " ").trim();
    if (joined) {
      output.push(enrichInline(joined));
      output.push(""); // paragraph spacing
    }
    buffer = [];
  };

  let headingsEmitted = 0;

  sourceLines.forEach((line, index) => {
    const trimmed = line.replace(/\s{2,}/g, " ").trim();
    const next = sourceLines[index + 1];

    if (!trimmed) {
      flushParagraph();
      return;
    }

    if (isWatermark(trimmed)) return;

    if (looksLikeHeading(trimmed, next)) {
      flushParagraph();
      // Add a divider before every non-first heading so sections read clean.
      if (headingsEmitted > 0) {
        // Make sure there's a blank line before the divider.
        while (output.length && output[output.length - 1] === "") output.pop();
        output.push("", "---", "");
      }
      output.push(`## ${trimmed}`, "");
      headingsEmitted += 1;
      return;
    }

    // Pre-existing markdown markers (headings, lists, blockquotes, hr, code)
    // should stand on their own and not be glued into the previous paragraph.
    if (/^(#{1,6}\s|[-*+]\s+|\d+[.)]\s+|>\s|```|---\s*$)/.test(trimmed)) {
      flushParagraph();
      // List items and blockquotes: run inline enrichment so bold/highlight
      // still surfaces inside bullets.
      const isListOrQuote = /^([-*+]\s+|\d+[.)]\s+|>\s)/.test(trimmed);
      output.push(isListOrQuote ? trimmed.replace(/^([-*+]\s+|\d+[.)]\s+|>\s)(.*)$/, (_m, prefix, rest) => `${prefix}${enrichInline(rest)}`) : trimmed);
      if (/^(#{1,6}\s|---\s*$|```)/.test(trimmed)) output.push("");
      return;
    }

    buffer.push(trimmed);
  });
  flushParagraph();

  return `${output.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n\n`;
}
