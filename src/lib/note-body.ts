export const MIN_FLASHCARD_BODY_CHARS = 100;

const normalizeLine = (value: string) =>
  value
    .replace(/[#*_`>\-\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

/**
 * Returns only the learner-written body text that flashcards are allowed to use.
 * Note titles, markdown headings, and HTML headings are intentionally removed.
 */
export function getFlashcardSourceText(content = "", title = "") {
  const normalizedTitle = normalizeLine(title);
  const withoutHtmlHeadings = content.replace(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi, "\n");
  const roughText = withoutHtmlHeadings
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/p\s*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");

  const lines = roughText.split(/\r?\n/);
  const bodyLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const next = lines[i + 1]?.trim() ?? "";
    const isAtxHeading = /^#{1,6}\s+\S/.test(line);
    const isSetextHeading = /^[=-]{2,}\s*$/.test(next);
    const isSetextMarker = /^[=-]{2,}\s*$/.test(line);
    const sameAsTitle = !!normalizedTitle && normalizeLine(line) === normalizedTitle;

    if (isAtxHeading || isSetextMarker || sameAsTitle) continue;
    if (isSetextHeading) {
      i += 1;
      continue;
    }

    bodyLines.push(line);
  }

  return bodyLines.join("\n").replace(/\s+/g, " ").trim();
}
