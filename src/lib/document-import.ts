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
// line injected by free PDF sites (OceanofPDF, PDFDrive, Z-Library, etc.),
// or boilerplate page numbers like "Page 4 of 12". We strip these so the
// imported note doesn't carry "Downloaded from oceanofpdf.com" all over it.
const WATERMARK_PATTERNS: RegExp[] = [
  /\b(ocean\s*of\s*pdf|oceanofpdf|pdfdrive|z-?library|libgen|annas[-\s]?archive|sci-?hub|free\s*pdf|epubpub|epub\.pub|pdfroom|getfreebooks|allitebooks|bookboon|pdfcoffee|scribd)\b/i,
  /\bdownload(ed)?\s+(this\s+)?(book|ebook|pdf|file|chapter)?\s*(from|at|via|by)\b/i,
  /\b(visit|check)\s+(us\s+)?(at|on)\s+\S+\.(com|net|org|io|co|info)\b/i,
  /^\s*(https?:\/\/|www\.)\S+\s*$/i,
  /^\s*page\s+\d+\s+of\s+\d+\s*$/i,
  /^\s*-?\s*\d{1,4}\s*-?\s*$/, // bare page number lines like "12" or "- 12 -"
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

export function formatImportedDocument(rawText: string, fileName: string) {
  const ext = extensionOf(fileName);
  const normalized = rawText.replace(/\r\n?/g, "\n").replace(/[\t ]+$/gm, "").trim();
  if (!normalized) return "";

  // Markdown files: only strip watermark lines, otherwise trust the source.
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

  // Title goes first as a centered H1. The `# ` prefix becomes <h1> in the
  // editor; the HybridEditor centers h1s via prose-h1:text-center.
  if (title && !sourceLines[0]?.trim().startsWith("#")) {
    output.push(`# ${title}`, "");
  }

  // Reconstruct paragraphs: PDF text extraction returns hard-wrapped lines
  // that belong to the same paragraph. Join contiguous non-empty body lines
  // with a single space; an empty source line (or heading) ends the paragraph.
  let buffer: string[] = [];
  const flushParagraph = () => {
    if (buffer.length === 0) return;
    const joined = buffer.join(" ").replace(/\s{2,}/g, " ").trim();
    if (joined) {
      output.push(joined);
      output.push(""); // blank line between paragraphs for proper editor spacing
    }
    buffer = [];
  };

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
      output.push(`## ${trimmed}`, "");
      return;
    }

    // Pre-existing markdown markers (headings, lists, blockquotes, hr, code)
    // should stand on their own and not be glued into the previous paragraph.
    if (/^(#{1,6}\s|[-*+]\s+|\d+[.)]\s+|>\s|```|---\s*$)/.test(trimmed)) {
      flushParagraph();
      output.push(trimmed);
      // Blank line after block-level markers so the editor renders spacing.
      if (/^(#{1,6}\s|---\s*$|```)/.test(trimmed)) output.push("");
      return;
    }

    buffer.push(trimmed);
  });
  flushParagraph();

  return `${output.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n\n`;
}