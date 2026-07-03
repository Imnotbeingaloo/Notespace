/**
 * Runtime helpers for the comma-highlight reading overlay.
 *
 * We can't style punctuation via pure CSS, so when the overlay is ON we wrap
 * commas in `<span class="comma-mark">` on blur (so the caret is never inside
 * the mutation) and strip those wrappers on focus (so typing/undo behaves
 * exactly as before).
 */

const SKIP_TAGS = new Set(["CODE", "PRE", "SCRIPT", "STYLE", "A", "MARK"]);
const MARK_CLASS = "comma-mark";

function shouldSkip(node: Node): boolean {
  const parent = (node as Text).parentElement;
  if (!parent) return true;
  if (parent.classList?.contains(MARK_CLASS)) return true;
  let el: HTMLElement | null = parent;
  while (el) {
    if (SKIP_TAGS.has(el.tagName)) return true;
    el = el.parentElement;
  }
  return false;
}

/** Wrap every `,` in a `.comma-mark` span. Safe to call repeatedly. */
export function wrapCommas(root: HTMLElement): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const targets: Text[] = [];
  let n: Node | null;
  while ((n = walker.nextNode())) {
    const t = n as Text;
    if (!t.data.includes(",")) continue;
    if (shouldSkip(t)) continue;
    targets.push(t);
  }
  for (const t of targets) {
    const parts = t.data.split(/(,)/);
    if (parts.length === 1) continue;
    const frag = document.createDocumentFragment();
    for (const part of parts) {
      if (part === ",") {
        const span = document.createElement("span");
        span.className = MARK_CLASS;
        span.textContent = ",";
        frag.appendChild(span);
      } else if (part) {
        frag.appendChild(document.createTextNode(part));
      }
    }
    t.replaceWith(frag);
  }
}

/** Remove all `.comma-mark` spans, restoring plain text nodes. */
export function unwrapCommas(root: HTMLElement): void {
  const marks = root.querySelectorAll<HTMLSpanElement>(`.${MARK_CLASS}`);
  marks.forEach((el) => {
    const parent = el.parentNode;
    if (!parent) return;
    parent.replaceChild(document.createTextNode(el.textContent || ","), el);
  });
  // Merge adjacent text nodes so subsequent walks see contiguous strings.
  root.normalize();
}
