/**
 * Shared sizing rules for enlarged text inside the editor.
 *
 * Classic (notebook-paper) mode has its own typographic rules: every line box
 * must be a whole multiple of the 28px ruled grid, and the text has to sit ON
 * the bottom rule of its band — never be sliced through the middle by one.
 * We achieve that by giving the span a tight text line-height and pushing it
 * down with padding, so the leftover space lands above the glyphs (blank rule
 * territory) instead of being split evenly around them.
 *
 * Modern mode has the opposite rule: no grid, no padding, natural leading.
 * The span carries `data-nssize`, and `index.css` neutralises the grid styles
 * whenever the editor is not in classic mode — so switching Classic <-> Modern
 * converts every sized run automatically, with no rewrite of the stored note.
 */
export const RULE_PX = 28;

export function sizedSpanStyle(px: number) {
  const textLh = Math.ceil(px * 1.15);
  const rows = Math.max(1, Math.ceil(textLh / RULE_PX));
  const boxHeight = rows * RULE_PX;
  const padTop = Math.max(0, boxHeight - textLh);
  return `font-size:${px}px;line-height:${textLh}px;padding-top:${padTop}px;display:inline-block;vertical-align:baseline`;
}

export function buildSizedSpan(px: number, innerHtml: string) {
  return `<span data-nssize="${px}" style="${sizedSpanStyle(px)}">${innerHtml}</span>`;
}
