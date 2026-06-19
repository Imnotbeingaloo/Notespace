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
  if (MARKDOWN_EXTENSIONS.has(ext)) return `${normalized}\n\n`;

  const sourceLines = normalized.split("\n");
  const output: string[] = [];
  const title = titleFromFile(fileName);

  if (title && !sourceLines[0]?.trim().startsWith("#")) {
    output.push(`# ${title}`, "");
  }

  sourceLines.forEach((line, index) => {
    const trimmed = line.replace(/\s{2,}/g, " ").trim();
    const next = sourceLines[index + 1];

    if (!trimmed) {
      if (output.at(-1) !== "") output.push("");
      return;
    }

    if (looksLikeHeading(trimmed, next)) {
      if (output.at(-1) !== "") output.push("");
      output.push(`## ${trimmed}`, "");
      return;
    }

    output.push(trimmed);
  });

  return `${output.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n\n`;
}