import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle, useState } from "react";
import { marked } from "marked";
import TurndownService from "turndown";
import { FloatingToolbar } from "@/components/FloatingToolbar";

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

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
});

// Configure turndown for clean markdown output
function createTurndown() {
  const td = new TurndownService({
    headingStyle: "atx",
    hr: "---",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
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

  return td;
}

const turndown = createTurndown();

function markdownToHtml(md: string): string {
  if (!md) return "";
  return marked.parse(md, { async: false }) as string;
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
    const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);

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

    // Track selection for floating toolbar
    const handleSelectionChange = useCallback(() => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !editorRef.current) {
        setSelectionRect(null);
        return;
      }
      // Check selection is within our editor
      if (!editorRef.current.contains(sel.anchorNode)) {
        setSelectionRect(null);
        return;
      }
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (rect.width > 0) {
        setSelectionRect(rect);
      } else {
        setSelectionRect(null);
      }
    }, []);

    useEffect(() => {
      document.addEventListener("selectionchange", handleSelectionChange);
      return () => document.removeEventListener("selectionchange", handleSelectionChange);
    }, [handleSelectionChange]);

    useImperativeHandle(ref, () => ({
      insertAtCursor: (text: string) => {
        const el = editorRef.current;
        if (!el) return;
        el.focus();

        const imgMatch = text.match(/!\[([^\]]*)\]\(([^)]+)\)/);
        if (imgMatch) {
          const html = `<img src="${imgMatch[2]}" alt="${imgMatch[1]}" class="rounded-2xl border shadow-md max-w-full max-h-[400px] h-auto object-contain my-3" loading="lazy" />`;
          document.execCommand("insertHTML", false, html);
        } else {
          document.execCommand("insertText", false, text);
        }
        emitChange();
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
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) return;
      }
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
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

    return (
      <div className="w-full px-3 sm:px-8 py-4 sm:py-6 min-h-[400px] relative">
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
          className="wysiwyg-editor w-full min-h-[350px] bg-transparent border-none outline-none text-foreground leading-relaxed text-base sm:text-[17px] prose prose-base max-w-none prose-headings:font-sans prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-lg prose-a:text-primary prose-blockquote:border-l-primary/30 prose-blockquote:text-muted-foreground prose-hr:border-border"
        />
      </div>
    );
  }
);

HybridEditor.displayName = "HybridEditor";
