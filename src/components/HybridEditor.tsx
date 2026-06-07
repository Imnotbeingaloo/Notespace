import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import TurndownService from "turndown";
import { FloatingToolbar } from "@/components/FloatingToolbar";
import { usePaperStyle } from "@/hooks/use-paper-style";

export interface HybridEditorHandle {
  insertAtCursor: (text: string) => void;
  getValue: () => string;
  getEditorElement: () => HTMLDivElement | null;
  setContent: (md: string) => void;
  saveSelection: () => void;
}

interface HybridEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
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

  return td;
}

const turndown = createTurndown();

function markdownToHtml(md: string): string {
  if (!md) return "";
  // Convert the blank-line sentinel back into real empty paragraphs the browser will render.
  const normalized = md.replace(/&#8203;\u200B/g, "\u200B");
  const raw = marked.parse(normalized, { async: false }) as string;
  const cleaned = DOMPurify.sanitize(raw, { ADD_ATTR: ["target"] });
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

export const HybridEditor = forwardRef<HybridEditorHandle, HybridEditorProps>(
  ({ content, onChange, placeholder }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const lastMdRef = useRef(content);
    const isTypingRef = useRef(false);
    const savedRangeRef = useRef<Range | null>(null);
    const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
    const [paperStyle] = usePaperStyle();

    // Set HTML content from markdown
    const setHtmlFromMd = useCallback((md: string) => {
      if (!editorRef.current) return;
      const html = markdownToHtml(md);
      editorRef.current.innerHTML = html || "";
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
      const html = editorRef.current.innerHTML;
      const md = htmlToMarkdown(html);
      lastMdRef.current = md;
      isTypingRef.current = true;
      onChange(md);
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
          // Looks like markdown (headings, paragraphs, links, lists, tables) — render it.
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
        return htmlToMarkdown(editorRef.current.innerHTML);
      },
      getEditorElement: () => editorRef.current,
      setContent: (md: string) => {
        lastMdRef.current = md;
        isTypingRef.current = false;
        setHtmlFromMd(md);
      },
      saveSelection: () => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
          savedRangeRef.current = sel.getRangeAt(0).cloneRange();
        }
      },
    }));

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
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
      }
    }, []);

    const handlePaste = useCallback((e: React.ClipboardEvent) => {
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) return; // let the browser handle image paste
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
      if (text) {
        document.execCommand("insertText", false, text);
        emitChange();
      }
    }, [emitChange]);

    const handleToolbarAction = useCallback((command: string, value?: string) => {
      editorRef.current?.focus();
      document.execCommand(command, false, value);
      emitChange();
    }, [emitChange]);

    // When notebook-paper is active, drop the wrapper's horizontal padding so the
    // ruled lines and red margin fill the writing area edge-to-edge.
    const wrapperClass = paperStyle
      ? "w-full min-h-full h-full relative flex flex-col"
      : "w-full px-3 sm:px-8 py-4 sm:py-6 min-h-full h-full relative flex flex-col";
    return (
      <div className={wrapperClass}>
        <FloatingToolbar
          selectionRect={selectionRect}
          onAction={handleToolbarAction}
          containerRef={editorRef}
        />
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={emitChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          data-placeholder={placeholder}
          className={`wysiwyg-editor w-full flex-1 min-h-full bg-transparent border-none outline-none text-foreground leading-relaxed text-base sm:text-[17px] prose prose-base max-w-none prose-headings:font-sans prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-lg prose-a:text-primary prose-blockquote:border-l-primary/30 prose-blockquote:text-muted-foreground prose-hr:border-border${paperStyle ? " notebook-paper" : ""}`}
        />
      </div>
    );
  }
);

HybridEditor.displayName = "HybridEditor";
