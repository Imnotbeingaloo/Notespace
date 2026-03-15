import { useCallback, useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Bold, Italic, Heading1, Heading2, Heading3,
  Quote, Code, Link2, Image, Strikethrough, Minus, Highlighter } from
"lucide-react";
import { ListStylePicker } from "@/components/ListStylePicker";
import { AlignmentPicker } from "@/components/AlignmentPicker";
import { TableInsert } from "@/components/TableInsert";
import { TableEditToolbar } from "@/components/TableEditToolbar";
import { Search } from "lucide-react";

interface MarkdownToolbarProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  onFindReplace?: () => void;
  children?: React.ReactNode;
}

type FormatAction = {
  icon: React.ElementType;
  label: string;
  action: () => void;
};

// Group separators: after Highlight (idx 3), after H3 (idx 6), after Code (idx 7)
const separatorAfter = new Set([3, 6, 7]);

function focusEditor(el: HTMLDivElement | null) {
  if (el) el.focus();
}

export function MarkdownToolbar({ editorRef, onFindReplace, children }: MarkdownToolbarProps) {
  const exec = useCallback((command: string, value?: string) => {
    focusEditor(editorRef.current);
    document.execCommand(command, false, value);
  }, [editorRef]);

  const wrapWithTag = useCallback((tag: string) => {
    focusEditor(editorRef.current);
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const selected = range.toString();
    const el = document.createElement(tag);
    el.textContent = selected || "code";
    range.deleteContents();
    range.insertNode(el);
    range.setStartAfter(el);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    editorRef.current?.dispatchEvent(new Event("input", { bubbles: true }));
  }, [editorRef]);

  const insertLink = useCallback(() => {
    focusEditor(editorRef.current);
    const sel = window.getSelection();
    const selected = sel?.toString() || "link text";
    const url = prompt("Enter URL:", "https://");
    if (!url) return;
    const html = `<a href="${url}">${selected}</a>`;
    document.execCommand("insertHTML", false, html);
    editorRef.current?.dispatchEvent(new Event("input", { bubbles: true }));
  }, [editorRef]);

  const insertImage = useCallback(() => {
    focusEditor(editorRef.current);
    const url = prompt("Enter image URL:");
    if (!url) return;
    const html = `<img src="${url}" alt="image" class="rounded-2xl border border-border shadow-md max-w-full max-h-[400px] h-auto object-contain my-3" loading="lazy" />`;
    document.execCommand("insertHTML", false, html);
    editorRef.current?.dispatchEvent(new Event("input", { bubbles: true }));
  }, [editorRef]);

  const insertDivider = useCallback(() => {
    focusEditor(editorRef.current);
    document.execCommand("insertHTML", false, "<hr /><p><br></p>");
    editorRef.current?.dispatchEvent(new Event("input", { bubbles: true }));
  }, [editorRef]);

  const actions: FormatAction[] = [
    { icon: Bold, label: "Bold", action: () => exec("bold") },
    { icon: Italic, label: "Italic", action: () => exec("italic") },
    { icon: Strikethrough, label: "Strikethrough", action: () => exec("strikeThrough") },
    { icon: Highlighter, label: "Highlight", action: () => exec("hiliteColor", "#fef08a") },
    { icon: Heading1, label: "Heading 1", action: () => exec("formatBlock", "h1") },
    { icon: Heading2, label: "Heading 2", action: () => exec("formatBlock", "h2") },
    { icon: Heading3, label: "Heading 3", action: () => exec("formatBlock", "h3") },
    { icon: Quote, label: "Blockquote", action: () => exec("formatBlock", "blockquote") },
    { icon: Code, label: "Inline Code", action: () => wrapWithTag("code") },
    { icon: Link2, label: "Link", action: insertLink },
    { icon: Image, label: "Image", action: insertImage },
    { icon: Minus, label: "Divider", action: insertDivider },
  ];

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", checkScroll); ro.disconnect(); };
  }, [checkScroll]);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -120 : 120, behavior: "smooth" });
  };

  return (
    <div className="relative flex items-center">
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll("left")}
          className="absolute left-0 z-10 p-1 rounded-r-lg bg-background/90 border-r border-border text-muted-foreground hover:text-foreground transition-colors lg:hidden"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      <div ref={scrollRef} className="flex items-center gap-0.5 px-2 py-2 overflow-x-auto scrollbar-none">
        {actions.map((a, i) =>
        <div key={a.label} className="contents">
            <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              a.action();
            }}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 hover:scale-105 flex-shrink-0"
            title={a.label}>
              <a.icon className="h-4 w-4" />
            </button>
            {separatorAfter.has(i) &&
          <div className="w-px h-5 bg-border mx-1 flex-shrink-0" />
          }
          </div>
        )}
        {/* List styles dropdown */}
        <div className="w-px h-5 bg-border mx-1 flex-shrink-0" />
        <ListStylePicker editorRef={editorRef} />
        {/* Alignment dropdown */}
        <AlignmentPicker editorRef={editorRef} />
        {/* Table insertion & editing */}
        <TableInsert editorRef={editorRef} />
        <TableEditToolbar editorRef={editorRef} />
        <div className="w-px h-5 bg-border mx-1 flex-shrink-0" />
        {children}
      </div>

      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll("right")}
          className="absolute right-0 z-10 p-1 rounded-l-lg bg-background/90 border-l border-border text-muted-foreground hover:text-foreground transition-colors lg:hidden"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>);
}
