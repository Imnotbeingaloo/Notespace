import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import TurndownService from "turndown";
import { AnimatePresence } from "framer-motion";
import { FloatingToolbar } from "@/components/FloatingToolbar";
import { ImageEditToolbar, type ImageAlign } from "@/components/ImageEditToolbar";
import { SpellSuggest } from "@/components/SpellSuggest";
import { getSuggestions, isCheckableWord } from "@/lib/spellcheck";
import { usePaperStyle } from "@/hooks/use-paper-style";
import { toast } from "@/components/ui/sonner";
import { dismissToast } from "@/lib/toast-queue";
import { formatTextWithAI } from "@/lib/ai-format";
import { useCommaHighlight } from "@/hooks/use-comma-highlight";
import { wrapCommas, unwrapCommas } from "@/lib/comma-highlight";

export interface HybridEditorHandle {
  insertAtCursor: (text: string) => void;
  getValue: () => string;
  getEditorElement: () => HTMLDivElement | null;
  setContent: (md: string) => void;
  /** Replace the entire editor body but keep it in the browser's undo stack. */
  replaceAllUndoable: (md: string) => void;
  /** Insert at top / cursor / end of the document, preserving undo history. */
  mergeAt: (md: string, position: "top" | "cursor" | "end") => void;
  saveSelection: () => void;
}

interface HybridEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  /** Upload + insert image files pasted or dropped straight into the body. */
  onImageFiles?: (files: File[]) => void;
}

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
});

// Sentinel used to round-trip intentional empty paragraphs through markdown.
// Plain `&nbsp;` collapses; this token is unambiguous and easy to detect on re-render.
const BLANK_LINE_TOKEN = "&#8203;\u200B";

// Configure turndown for clean markdown output
function createTurndown() {
  const td = new TurndownService({
    headingStyle: "atx",
    hr: "---",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    // Preserve empty paragraphs / line spacing instead of collapsing them.
    blankReplacement: (_content, node: any) => {
      if (node.nodeName === "P" || node.nodeName === "DIV") {
        return `\n\n${BLANK_LINE_TOKEN}\n\n`;
      }
      return "";
    },
  });

  td.addRule("checkbox", {
    filter: (node) =>
      node.nodeName === "INPUT" &&
      (node as HTMLInputElement).type === "checkbox",
    replacement: (_content, node) => {
      const checked = (node as HTMLInputElement).checked;
      return checked ? "[x] " : "[ ] ";
    },
  });

  td.addRule("strikethrough", {
    filter: ["del", "s"],
    replacement: (content) => `~~${content}~~`,
  });

  // Treat any paragraph- or div-level node that contains only zero-width / nbsp
  // characters (or an empty <br>) as an intentional blank line. This guarantees
  // that pressing Enter to create vertical space survives the markdown round-trip.
  td.addRule("blank-paragraph", {
    filter: (node) => {
      if (node.nodeName !== "P" && node.nodeName !== "DIV") return false;
      const children = Array.from(node.childNodes);
      const onlyBr = children.length > 0 && children.every(
        (c) => c.nodeName === "BR" || (c.nodeType === 3 && !((c.textContent || "").replace(/\u200B|\u00A0|\s/g, "")))
      );
      const text = (node.textContent || "").replace(/\u200B|\u00A0/g, "").trim();
      return onlyBr || text.length === 0;
    },
    replacement: () => `\n\n${BLANK_LINE_TOKEN}\n\n`,
  });

  // Preserve user-chosen inline styles (text alignment, per-heading font sizes)
  // by emitting the block as raw HTML. Markdown has no syntax for these, so
  // without this rule they would silently vanish on every save.
  const STYLE_RE = /(text-align\s*:\s*(?:center|right|justify))|(font-size\s*:)/i;
  td.addRule("preserve-styled-block", {
    filter: (node) => {
      if (!(node instanceof HTMLElement)) return false;
      if (!/^(P|DIV|H[1-6]|BLOCKQUOTE|LI)$/.test(node.nodeName)) return false;
      const style = node.getAttribute("style") || "";
      return STYLE_RE.test(style);
    },
    replacement: (_content, node) => {
      const el = node as HTMLElement;
      return `\n\n${el.outerHTML}\n\n`;
    },
  });

  // Images carry sizing / float-alignment as inline styles. Markdown's
  // `![alt](src)` syntax cannot express either, so emit raw HTML instead —
  // otherwise every resize or align is thrown away on the next save.
  td.addRule("preserve-image", {
    filter: "img",
    replacement: (_content, node) => {
      const el = node as HTMLImageElement;
      return el.outerHTML;
    },
  });

  return td;
}

const turndown = createTurndown();

function markdownToHtml(md: string): string {
  if (!md) return "";
  // Convert the blank-line sentinel back into real empty paragraphs the browser will render.
  const normalized = md.replace(/&#8203;\u200B/g, "\u200B");
  const raw = marked.parse(normalized, { async: false }) as string;
  const cleaned = DOMPurify.sanitize(raw, { ADD_ATTR: ["target", "loading", "style", "width", "height"] });
  // Replace paragraphs that contain only zero-width chars (one or many) with
  // explicit <br> blank lines so consecutive Enters survive a round trip.
  return cleaned
    .replace(/<p>(?:\s|\u200B)+<\/p>/g, "<p><br></p>")
    .replace(/<p>\s*(?:\u200B\s*)+<\/p>/g, "<p><br></p>");
}

function htmlToMarkdown(html: string): string {
  if (!html || html === "<br>" || html.trim() === "") return "";
  try {
    return turndown.turndown(html);
  } catch {
    return "";
  }
}

// Attributes/tags the editor must be allowed to persist. Anything the user can
// produce with the toolbar (alignment, font family, font size, colours,
// highlights, underline, image sizing) has to survive sanitisation, otherwise
// the formatting silently disappears on the next load.
const EDITOR_SANITIZE_CONFIG = {
  ADD_ATTR: ["target", "loading", "style", "width", "height", "align", "colspan", "rowspan", "data-align"],
  ADD_TAGS: ["mark", "u", "sub", "sup"],
};

export function sanitizeEditorHtml(html: string): string {
  return DOMPurify.sanitize(html, EDITOR_SANITIZE_CONFIG);
}

/**
 * The editor stores rich HTML, not markdown — markdown cannot express
 * underline, alignment, font family, font size, text colour or highlights, so
 * round-tripping through it was silently discarding formatting on every save.
 * Older notes are still markdown, so detect and upgrade them on load.
 */
export function looksLikeHtml(value: string): boolean {
  return /<(p|div|h[1-6]|ul|ol|li|table|blockquote|pre|img|span|strong|em|u|mark|br)\b[^>]*>/i.test(value);
}

/** Normalise any stored note body (markdown or HTML) into editor HTML. */
export function noteBodyToHtml(value: string): string {
  if (!value) return "";
  return looksLikeHtml(value) ? sanitizeEditorHtml(value) : markdownToHtml(value);
}


export const HybridEditor = forwardRef<HybridEditorHandle, HybridEditorProps>(
  ({ content, onChange, placeholder, onImageFiles }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const lastMdRef = useRef(content);
    const isTypingRef = useRef(false);
    const savedRangeRef = useRef<Range | null>(null);
    const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
    const [paperStyle] = usePaperStyle();
    const [commaHighlightOn] = useCommaHighlight();
    const [selectedImg, setSelectedImg] = useState<HTMLImageElement | null>(null);
    const [imgBox, setImgBox] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
    const [spell, setSpell] = useState<{ top: number; left: number; word: string; suggestions: string[] } | null>(null);

    // Wrap/unwrap commas on focus transitions. Keeps the caret out of the
    // mutation and preserves undo history because the wrap is stripped
    // immediately when the user re-enters the editor.
    const handleFocus = useCallback(() => {
      if (!commaHighlightOn || !editorRef.current) return;
      unwrapCommas(editorRef.current);
    }, [commaHighlightOn]);

    const handleBlur = useCallback(() => {
      if (!commaHighlightOn || !editorRef.current) return;
      // Losing focus because the whole window/tab went away is not a real blur —
      // rewriting the DOM here would invalidate the saved caret range.
      if (document.visibilityState === "hidden" || !document.hasFocus()) return;
      try { wrapCommas(editorRef.current); } catch { /* ignore */ }
    }, [commaHighlightOn]);

    // If the toggle flips while blurred, apply immediately; if it flips off,
    // strip any existing marks.
    useEffect(() => {
      const el = editorRef.current;
      if (!el) return;
      const isFocused = document.activeElement === el;
      if (commaHighlightOn && !isFocused) {
        try { wrapCommas(el); } catch { /* ignore */ }
      } else if (!commaHighlightOn) {
        unwrapCommas(el);
      }
    }, [commaHighlightOn]);

    // Set HTML content from the stored note body (rich HTML, or legacy markdown)
    const setHtmlFromMd = useCallback((md: string) => {
      if (!editorRef.current) return;
      editorRef.current.innerHTML = noteBodyToHtml(md) || "";
    }, []);

    // On mount or when content changes externally (e.g., note switch, AI edit)
    useEffect(() => {
      if (content !== lastMdRef.current && !isTypingRef.current) {
        lastMdRef.current = content;
        setHtmlFromMd(content);
      }
      isTypingRef.current = false;
    }, [content, setHtmlFromMd]);

    // Initial render
    useEffect(() => {
      setHtmlFromMd(content);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const emitChange = useCallback(() => {
      if (!editorRef.current) return;
      // Persist the editor's own HTML. Markdown cannot represent underline,
      // alignment, font family/size, colour or highlights, so serialising
      // through it was throwing that formatting away on every keystroke.
      const html = editorRef.current.innerHTML;
      const value = html === "<br>" || html.trim() === "" ? "" : html;
      lastMdRef.current = value;
      isTypingRef.current = true;
      onChange(value);
    }, [onChange]);


    // Track selection for floating toolbar AND remember the last caret position
    // inside the editor so we can restore it after the user clicks attach/upload buttons.
    const handleSelectionChange = useCallback(() => {
      const sel = window.getSelection();
      if (!sel || !editorRef.current) {
        setSelectionRect(null);
        return;
      }
      if (!editorRef.current.contains(sel.anchorNode)) {
        setSelectionRect(null);
        return;
      }
      // Always remember the latest range while focus is in the editor.
      if (sel.rangeCount > 0) {
        savedRangeRef.current = sel.getRangeAt(0).cloneRange();
      }
      if (sel.isCollapsed) {
        setSelectionRect(null);
        return;
      }
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectionRect(rect.width > 0 ? rect : null);
    }, []);

    useEffect(() => {
      document.addEventListener("selectionchange", handleSelectionChange);
      return () => document.removeEventListener("selectionchange", handleSelectionChange);
    }, [handleSelectionChange]);

    // Switching browser tabs makes the browser drop the contenteditable
    // selection, so coming back would drop the caret at the start of the line.
    // Remember where the caret was when the tab is hidden and put it back when
    // the tab (and the editor) regain focus.
    useEffect(() => {
      const el = editorRef.current;
      if (!el) return;
      let wasFocused = false;

      const onHidden = () => {
        wasFocused = document.activeElement === el;
        const sel = window.getSelection();
        if (wasFocused && sel && sel.rangeCount > 0 && el.contains(sel.anchorNode)) {
          savedRangeRef.current = sel.getRangeAt(0).cloneRange();
        }
      };

      const restore = () => {
        if (!wasFocused) return;
        const range = savedRangeRef.current;
        if (!range || !el.contains(range.startContainer)) return;
        requestAnimationFrame(() => {
          el.focus({ preventScroll: true });
          const sel = window.getSelection();
          if (!sel) return;
          sel.removeAllRanges();
          sel.addRange(range);
        });
      };

      const onVisibility = () => {
        if (document.visibilityState === "hidden") onHidden();
        else restore();
      };

      document.addEventListener("visibilitychange", onVisibility);
      window.addEventListener("blur", onHidden);
      window.addEventListener("focus", restore);
      return () => {
        document.removeEventListener("visibilitychange", onVisibility);
        window.removeEventListener("blur", onHidden);
        window.removeEventListener("focus", restore);
      };
    }, []);

    const restoreSelection = useCallback(() => {
      const el = editorRef.current;
      const range = savedRangeRef.current;
      if (!el) return;
      el.focus();
      if (range && el.contains(range.startContainer)) {
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    }, []);

    useImperativeHandle(ref, () => ({
      insertAtCursor: (text: string) => {
        const el = editorRef.current;
        if (!el) return;
        restoreSelection();

        const imgMatch = text.match(/!\[([^\]]*)\]\(([^)]+)\)/);
        const fileLinkMatch = !imgMatch && /^\[📎[^\]]*\]\([^)]+\)$/.test(text.trim());
        if (imgMatch) {
          // Image followed by two blank lines so the user can keep typing below.
          const html = `<img src="${imgMatch[2]}" alt="${imgMatch[1]}" class="rounded-2xl border shadow-md max-w-full max-h-[400px] h-auto object-contain my-3" loading="lazy" /><p><br></p><p><br></p>`;
          document.execCommand("insertHTML", false, html);
        } else if (fileLinkMatch) {
          const safe = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
          document.execCommand("insertHTML", false, `${safe}<p><br></p><p><br></p>`);
        } else if (/(^|\n)\s{0,3}#{1,6}\s|\n\n|\[[^\]]+\]\([^)]+\)|^[-*]\s|\|.+\|/m.test(text)) {
          // Looks like markdown (headings, paragraphs, links, lists, tables) - render it.
          const html = markdownToHtml(text) + "<p><br></p><p><br></p>";
          document.execCommand("insertHTML", false, html);
        } else if (text.includes("\n")) {
          const safe = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\n/g, "<br>");
          document.execCommand("insertHTML", false, safe);
        } else {
          document.execCommand("insertText", false, text);
        }
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          savedRangeRef.current = sel.getRangeAt(0).cloneRange();
        }
        emitChange();
      },
      getValue: () => {
        if (!editorRef.current) return "";
        const html = editorRef.current.innerHTML;
        return html === "<br>" || html.trim() === "" ? "" : html;
      },

      getEditorElement: () => editorRef.current,
      setContent: (md: string) => {
        lastMdRef.current = md;
        isTypingRef.current = false;
        setHtmlFromMd(md);
      },
      replaceAllUndoable: (md: string) => {
        const el = editorRef.current;
        if (!el) return;
        el.focus();
        document.execCommand("selectAll");
        const html = noteBodyToHtml(md) || "<p><br></p>";
        // execCommand keeps the change in the browser's native undo history,
        // so Ctrl+Z restores the previous note body.
        document.execCommand("insertHTML", false, html);
        emitChange();
      },
      mergeAt: (md: string, position: "top" | "cursor" | "end") => {
        const el = editorRef.current;
        if (!el) return;
        el.focus();
        if (position === "cursor") {
          // Reuse the existing cursor-insert path so saved selection is honored.
          restoreSelection();
          const html = noteBodyToHtml(md) + "<p><br></p>";
          document.execCommand("insertHTML", false, html);
        } else {
          const sel = window.getSelection();
          const range = document.createRange();
          if (position === "top") {
            range.setStart(el, 0);
            range.setEnd(el, 0);
          } else {
            range.selectNodeContents(el);
            range.collapse(false);
          }
          sel?.removeAllRanges();
          sel?.addRange(range);
          const html = position === "top"
            ? noteBodyToHtml(md) + "<p><br></p>"
            : "<p><br></p>" + noteBodyToHtml(md);
          document.execCommand("insertHTML", false, html);
        }
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          savedRangeRef.current = sel.getRangeAt(0).cloneRange();
        }
        emitChange();
      },
      saveSelection: () => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
          savedRangeRef.current = sel.getRangeAt(0).cloneRange();
        }
      },
    }));

    /**
     * A heading / enlarged / styled line must not bleed onto the next line.
     * After Enter creates a fresh empty block we downgrade it back to a plain
     * paragraph and clear any inherited inline styling and character marks.
     */
    const resetFormattingOnNewLine = useCallback(() => {
      const el = editorRef.current;
      const sel = window.getSelection();
      if (!el || !sel || sel.rangeCount === 0) return;
      let node: Node | null = sel.anchorNode;
      let block: HTMLElement | null = null;
      while (node && node !== el) {
        if (node.nodeType === 1) {
          const tag = (node as HTMLElement).tagName;
          if (/^(P|DIV|H[1-6]|LI|BLOCKQUOTE)$/.test(tag)) { block = node as HTMLElement; break; }
        }
        node = node.parentNode;
      }
      if (!block || block.textContent?.trim()) return;
      // Headings continue as body text, styled wrappers are dropped entirely.
      if (/^H[1-6]$/.test(block.tagName)) {
        const p = document.createElement("p");
        p.innerHTML = "<br>";
        block.replaceWith(p);
        block = p;
      } else {
        block.removeAttribute("style");
        if (block.querySelector("span,font,strong,em,u,mark,b,i")) block.innerHTML = "<br>";
      }
      const range = document.createRange();
      range.setStart(block, 0);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      for (const cmd of ["bold", "italic", "underline", "strikeThrough"]) {
        if (document.queryCommandState(cmd)) document.execCommand(cmd);
      }
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (e.key === "Enter" && !e.shiftKey && !mod) {
        requestAnimationFrame(() => { resetFormattingOnNewLine(); emitChange(); });
        return;
      }
      if (!mod) return;

      if (e.key === "b" || e.key === "B") {
        e.preventDefault();
        document.execCommand("bold");
      } else if (e.key === "i" || e.key === "I") {
        e.preventDefault();
        document.execCommand("italic");
      } else if (e.key === "u" || e.key === "U") {
        e.preventDefault();
        document.execCommand("underline");
      } else if (e.key === "z" || e.key === "Z") {
        // Explicit undo/redo so the browser's native contentEditable history
        // is invoked even when React event handlers would otherwise swallow
        // the keystroke. Shift+Z (or Ctrl+Y) = redo.
        e.preventDefault();
        document.execCommand(e.shiftKey ? "redo" : "undo");
        emitChange();
      } else if (e.key === "y" || e.key === "Y") {
        e.preventDefault();
        document.execCommand("redo");
        emitChange();
      }
    }, [emitChange, resetFormattingOnNewLine]);

    const handlePaste = useCallback((e: React.ClipboardEvent) => {
      const items = Array.from(e.clipboardData.items);
      // Pasted screenshots / copied images: upload them and insert into the body.
      // (contentEditable would otherwise inline a huge base64 blob, or drop it.)
      const imageFiles = items
        .filter((it) => it.kind === "file" && it.type.startsWith("image/"))
        .map((it) => it.getAsFile())
        .filter((f): f is File => !!f);
      if (imageFiles.length > 0 && onImageFiles) {
        e.preventDefault();
        onImageFiles(imageFiles);
        return;
      }

      // Prefer HTML so structure (lists, headings, bold, links, tables) is preserved.
      const html = e.clipboardData.getData("text/html");
      const text = e.clipboardData.getData("text/plain");
      if (html && html.trim()) {
        e.preventDefault();
        // Strip Office/Google Docs cruft, then sanitize.
        const cleanedSource = html
          .replace(/<!--[\s\S]*?-->/g, "")
          .replace(/<(meta|style|script|link)[\s\S]*?<\/\1>/gi, "")
          .replace(/<(meta|link)[^>]*>/gi, "")
          .replace(/\sclass="[^"]*"/g, "")
          .replace(/\sstyle="[^"]*"/g, "");
        const safe = DOMPurify.sanitize(cleanedSource, {
          ALLOWED_TAGS: [
            "p","br","strong","em","b","i","u","s","del","mark","sub","sup",
            "h1","h2","h3","h4","h5","h6",
            "ul","ol","li",
            "blockquote","pre","code",
            "a","hr",
            "table","thead","tbody","tr","th","td",
            "span","div",
          ],
          ALLOWED_ATTR: ["href","target","rel","colspan","rowspan"],
        });
        document.execCommand("insertHTML", false, safe);
        emitChange();
        return;
      }
      e.preventDefault();
      if (!text) return;

      // Plain unformatted text long enough to be worth structuring → AI format pass.
      // We insert the raw text first (so nothing is lost if the request fails),
      // mark it with a sentinel, and stream-replace it once the AI responds.
      const AUTO_FORMAT_THRESHOLD = 200;
      if (text.length >= AUTO_FORMAT_THRESHOLD) {
        const sentinel = `\u2063AIFMT-${Math.random().toString(36).slice(2, 10)}\u2063`;
        document.execCommand("insertText", false, sentinel);
        emitChange();

        const toastId = toast.loading("Formatting your text", {
          description: "This will only take a few seconds.",
          duration: Infinity,
        });

        const total = text.length;
        formatTextWithAI(text, (chunkSoFar) => {
          const pct = Math.min(99, Math.round((chunkSoFar.length / total) * 100));
          toast.update(toastId, {
            description: `Structuring paragraphs and headings… ${pct}%`,
          });
        })
          .then((formatted) => {
            const el = editorRef.current;
            if (!el) return;
            const currentHtml = el.innerHTML;
            if (currentHtml.includes(sentinel)) {
              const replaced = currentHtml.replace(sentinel, markdownToHtml(formatted));
              lastMdRef.current = replaced;
              isTypingRef.current = false;
              setHtmlFromMd(replaced);
              onChange(replaced);
            }
            dismissToast(toastId);
            toast.success("Text formatted");
          })
          .catch((err) => {
            // Leave the raw text in place, just strip the sentinel.
            const el = editorRef.current;
            if (el) {
              const currentHtml = el.innerHTML.replace(sentinel, "");
              lastMdRef.current = currentHtml;
              setHtmlFromMd(currentHtml);
              onChange(currentHtml);
            }

            dismissToast(toastId);
            toast.error("Couldn't auto-format", { description: err?.message });
          });
        return;
      }

      document.execCommand("insertText", false, text);
      emitChange();
    }, [emitChange, onChange, setHtmlFromMd, onImageFiles]);

    const handleToolbarAction = useCallback((command: string, value?: string) => {
      editorRef.current?.focus();
      document.execCommand(command, false, value);
      emitChange();
    }, [emitChange, resetFormattingOnNewLine]);

    /* ---------------------- Image selection / resize / align ---------------------- */

    const measureImg = useCallback((img: HTMLImageElement | null) => {
      const wrap = wrapperRef.current;
      if (!img || !wrap) { setImgBox(null); return; }
      const w = wrap.getBoundingClientRect();
      const r = img.getBoundingClientRect();
      setImgBox({ top: r.top - w.top, left: r.left - w.left, width: r.width, height: r.height });
    }, []);

    useEffect(() => {
      if (!selectedImg) return;
      const update = () => measureImg(selectedImg);
      update();
      window.addEventListener("resize", update);
      window.addEventListener("scroll", update, true);
      return () => {
        window.removeEventListener("resize", update);
        window.removeEventListener("scroll", update, true);
      };
    }, [selectedImg, measureImg]);

    const currentAlign: ImageAlign = (() => {
      if (!selectedImg) return "center";
      const f = selectedImg.style.float;
      if (f === "left") return "left";
      if (f === "right") return "right";
      return "center";
    })();

    const currentWidthPct = (() => {
      if (!selectedImg) return 100;
      const w = selectedImg.style.width;
      if (w.endsWith("%")) return parseFloat(w);
      const parent = selectedImg.parentElement?.getBoundingClientRect().width || 1;
      return Math.round((selectedImg.getBoundingClientRect().width / parent) * 100);
    })();

    const applyAlign = useCallback((align: ImageAlign) => {
      const img = selectedImg;
      if (!img) return;
      img.style.maxWidth = "100%";
      if (align === "center") {
        img.style.float = "none";
        img.style.display = "block";
        img.style.margin = "0.75rem auto";
      } else {
        img.style.float = align;
        img.style.display = "inline";
        img.style.margin = align === "left" ? "0.35rem 1rem 0.5rem 0" : "0.35rem 0 0.5rem 1rem";
      }
      measureImg(img);
      emitChange();
    }, [selectedImg, emitChange, measureImg]);

    const applyWidth = useCallback((pct: number) => {
      const img = selectedImg;
      if (!img) return;
      const clamped = Math.max(10, Math.min(100, Math.round(pct)));
      img.style.width = `${clamped}%`;
      img.style.height = "auto";
      img.style.maxHeight = "none";
      img.style.maxWidth = "100%";
      measureImg(img);
      emitChange();
    }, [selectedImg, emitChange, measureImg]);

    const removeImage = useCallback(() => {
      const img = selectedImg;
      if (!img) return;
      img.remove();
      setSelectedImg(null);
      setImgBox(null);
      emitChange();
    }, [selectedImg, emitChange]);

    // Corner drag → freeform width, expressed as a % of the containing block so
    // it stays responsive on smaller screens.
    const startResize = useCallback((e: React.PointerEvent) => {
      const img = selectedImg;
      if (!img) return;
      e.preventDefault();
      e.stopPropagation();
      const parentWidth = img.parentElement?.getBoundingClientRect().width || img.getBoundingClientRect().width;
      const startX = e.clientX;
      const startWidth = img.getBoundingClientRect().width;
      const onMove = (ev: PointerEvent) => {
        const next = ((startWidth + (ev.clientX - startX)) / parentWidth) * 100;
        const clamped = Math.max(10, Math.min(100, next));
        img.style.width = `${clamped.toFixed(1)}%`;
        img.style.height = "auto";
        img.style.maxHeight = "none";
        img.style.maxWidth = "100%";
        measureImg(img);
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        emitChange();
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    }, [selectedImg, emitChange, measureImg]);

    /* ------------------------------- Spellcheck ------------------------------- */

    const handleEditorClick = useCallback((e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      setSpell(null);
      if (target?.tagName === "IMG") {
        const img = target as HTMLImageElement;
        setSelectedImg(img);
        measureImg(img);
      } else {
        setSelectedImg(null);
        setImgBox(null);
      }
    }, [measureImg]);

    const spellRangeRef = useRef<Range | null>(null);

    const handleDoubleClick = useCallback(() => {
      const sel = window.getSelection();
      const wrap = wrapperRef.current;
      if (!sel || sel.isCollapsed || sel.rangeCount === 0 || !wrap) return;
      const word = sel.toString().trim();
      if (!isCheckableWord(word)) return;
      const range = sel.getRangeAt(0).cloneRange();
      const rect = range.getBoundingClientRect();
      const wrapRect = wrap.getBoundingClientRect();
      const top = rect.bottom - wrapRect.top + 8;
      const left = Math.max(0, rect.left - wrapRect.left);
      getSuggestions(word).then((suggestions) => {
        if (suggestions.length === 0) return;
        // Bail out if the user moved on while the dictionary was loading.
        const live = window.getSelection();
        if (!live || live.toString().trim() !== word) return;
        spellRangeRef.current = range;
        setSpell({ top, left, word, suggestions });
      });
    }, []);

    const applySuggestion = useCallback((replacement: string) => {
      const el = editorRef.current;
      const range = spellRangeRef.current;
      if (!el) return;
      el.focus();
      // Re-select the misspelled word explicitly — focusing the editor can
      // collapse the caret, which would otherwise insert instead of replace.
      if (range && el.contains(range.startContainer)) {
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      document.execCommand("insertText", false, replacement);
      spellRangeRef.current = null;
      setSpell(null);
      emitChange();
    }, [emitChange, resetFormattingOnNewLine]);

    // Auto-resizing pane: `min-h-full` lets the editor fill the visible area
    // when empty but grow with content. The ancestor scroll container only
    // surfaces a scrollbar once the editor's natural height exceeds the pane.
    const wrapperClass = paperStyle
      ? "w-full min-h-full relative flex flex-col box-border"
      : "w-full min-h-full px-3 sm:px-8 py-4 sm:py-6 relative flex flex-col box-border";
    return (
      <div ref={wrapperRef} className={wrapperClass} data-testid="hybrid-editor-wrapper">
        <FloatingToolbar
          selectionRect={spell || selectedImg ? null : selectionRect}
          onAction={handleToolbarAction}
          containerRef={editorRef}
        />

        <AnimatePresence>
          {spell && (
            <SpellSuggest
              key="spell"
              top={spell.top}
              left={spell.left}
              word={spell.word}
              suggestions={spell.suggestions}
              onPick={applySuggestion}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedImg && imgBox && (
            <ImageEditToolbar
              key="img-toolbar"
              top={Math.max(0, imgBox.top - 42)}
              left={imgBox.left}
              align={currentAlign}
              widthPct={currentWidthPct}
              onAlign={applyAlign}
              onWidth={applyWidth}
              onRemove={removeImage}
            />
          )}
        </AnimatePresence>

        {selectedImg && imgBox && (
          <>
            <div
              aria-hidden
              className="absolute pointer-events-none rounded-2xl ring-2 ring-primary/70"
              style={{ top: imgBox.top, left: imgBox.left, width: imgBox.width, height: imgBox.height }}
            />
            <div
              role="slider"
              aria-label="Resize image"
              aria-valuenow={Math.round(currentWidthPct)}
              aria-valuemin={10}
              aria-valuemax={100}
              tabIndex={0}
              onPointerDown={startResize}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") { e.preventDefault(); applyWidth(currentWidthPct + 5); }
                if (e.key === "ArrowLeft") { e.preventDefault(); applyWidth(currentWidthPct - 5); }
              }}
              className="absolute z-50 h-3.5 w-3.5 rounded-full border-2 border-background bg-primary cursor-nwse-resize shadow"
              style={{ top: imgBox.top + imgBox.height - 7, left: imgBox.left + imgBox.width - 7 }}
            />
          </>
        )}

        <div
          ref={editorRef}
          contentEditable
          spellCheck
          suppressContentEditableWarning
          onInput={emitChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onClick={handleEditorClick}
          onDoubleClick={handleDoubleClick}
          // Highlighting a misspelled word by dragging should offer corrections too.
          onMouseUp={() => window.setTimeout(handleDoubleClick, 0)}

          data-placeholder={placeholder}
          data-testid="hybrid-editor-content"
          className={`wysiwyg-editor w-full flex-1 h-auto bg-transparent border-none outline-none text-foreground leading-relaxed text-base sm:text-[17px] prose prose-base max-w-none prose-headings:font-sans prose-headings:text-foreground prose-p:text-foreground prose-p:my-3 prose-li:text-foreground prose-strong:text-foreground prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-lg prose-a:text-primary prose-blockquote:border-l-primary/30 prose-blockquote:text-muted-foreground prose-hr:border-border${paperStyle ? " notebook-paper" : ""}`}
        />
      </div>
    );
  }
);



HybridEditor.displayName = "HybridEditor";
