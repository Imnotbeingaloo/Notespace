import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { marked } from "marked";
import TurndownService from "turndown";

export interface HybridEditorHandle {
  insertAtCursor: (text: string) => void;
  getValue: () => string;
  getEditorElement: () => HTMLDivElement | null;
}

interface HybridEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

// Configure turndown for clean markdown output
function createTurndown() {
  const td = new TurndownService({
    headingStyle: "atx",
    hr: "---",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
  });

  // Handle checkboxes
  td.addRule("checkbox", {
    filter: (node) =>
      node.nodeName === "INPUT" &&
      (node as HTMLInputElement).type === "checkbox",
    replacement: (_content, node) => {
      const checked = (node as HTMLInputElement).checked;
      return checked ? "[x] " : "[ ] ";
    },
  });

  // Handle strikethrough
  td.addRule("strikethrough", {
    filter: ["del", "s"],
    replacement: (content) => `~~${content}~~`,
  });

  return td;
}

const turndown = createTurndown();

function markdownToHtml(md: string): string {
  if (!md) return "";
  // Use marked synchronously
  const html = marked.parse(md, { async: false }) as string;
  return html;
}

function htmlToMarkdown(html: string): string {
  if (!html || html === "<br>") return "";
  return turndown.turndown(html);
}

function saveCursorPosition(el: HTMLElement) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  if (!el.contains(range.startContainer)) return null;
  return range.cloneRange();
}

function restoreCursorPosition(range: Range | null) {
  if (!range) return;
  const sel = window.getSelection();
  if (!sel) return;
  sel.removeAllRanges();
  sel.addRange(range);
}

export const HybridEditor = forwardRef<HybridEditorHandle, HybridEditorProps>(
  ({ content, onChange, placeholder }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const lastContentRef = useRef(content);
    const isInternalChangeRef = useRef(false);

    // Convert markdown to HTML and set on mount / note change
    useEffect(() => {
      if (content !== lastContentRef.current) {
        lastContentRef.current = content;
        if (editorRef.current && !isInternalChangeRef.current) {
          const html = markdownToHtml(content);
          editorRef.current.innerHTML = html;
        }
        isInternalChangeRef.current = false;
      }
    }, [content]);

    // Initial render
    useEffect(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = markdownToHtml(content);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleInput = useCallback(() => {
      if (!editorRef.current) return;
      const html = editorRef.current.innerHTML;
      const md = htmlToMarkdown(html);
      lastContentRef.current = md;
      isInternalChangeRef.current = true;
      onChange(md);
    }, [onChange]);

    useImperativeHandle(ref, () => ({
      insertAtCursor: (text: string) => {
        const el = editorRef.current;
        if (!el) return;
        el.focus();

        // Check if it's an image markdown
        const imgMatch = text.match(/!\[([^\]]*)\]\(([^)]+)\)/);
        if (imgMatch) {
          const img = document.createElement("img");
          img.src = imgMatch[2];
          img.alt = imgMatch[1];
          img.className = "rounded-2xl border border-border shadow-md max-w-full max-h-[400px] h-auto object-contain my-3";
          img.loading = "lazy";

          const sel = window.getSelection();
          if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode(img);
            range.setStartAfter(img);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
          } else {
            el.appendChild(img);
          }
        } else {
          // Insert plain text/symbol at cursor
          const sel = window.getSelection();
          if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            range.deleteContents();
            const textNode = document.createTextNode(text);
            range.insertNode(textNode);
            range.setStartAfter(textNode);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
          } else {
            el.appendChild(document.createTextNode(text));
          }
        }
        handleInput();
      },
      getValue: () => {
        if (!editorRef.current) return "";
        return htmlToMarkdown(editorRef.current.innerHTML);
      },
      getEditorElement: () => editorRef.current,
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
      // Paste as plain text to avoid HTML mess from external sources
      // But allow pasting images
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          return; // Let browser handle image paste
        }
      }

      // For text, check if it has HTML
      const html = e.clipboardData.getData("text/html");
      if (html) {
        e.preventDefault();
        // Convert pasted HTML to markdown then back to our clean HTML
        const md = htmlToMarkdown(html);
        const cleanHtml = markdownToHtml(md);
        document.execCommand("insertHTML", false, cleanHtml);
        handleInput();
        return;
      }

      const text = e.clipboardData.getData("text/plain");
      if (text) {
        e.preventDefault();
        document.execCommand("insertText", false, text);
        handleInput();
      }
    }, [handleInput]);

    return (
      <div className="w-full px-3 sm:px-8 py-4 sm:py-6 min-h-[400px]">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          data-placeholder={placeholder}
          className="wysiwyg-editor w-full min-h-[350px] bg-transparent border-none outline-none text-foreground leading-relaxed text-sm sm:text-[15px] prose prose-sm max-w-none prose-headings:font-sans prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-lg prose-a:text-primary prose-blockquote:border-l-primary/30 prose-blockquote:text-muted-foreground prose-hr:border-border"
        />
      </div>
    );
  }
);

HybridEditor.displayName = "HybridEditor";
