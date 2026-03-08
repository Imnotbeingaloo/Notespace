import { useCallback } from "react";
import {
  Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered,
  Quote, Code, Link2, Image, Strikethrough, Minus, CheckSquare, Highlighter } from
"lucide-react";

interface MarkdownToolbarProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
}

type FormatAction = {
  icon: React.ElementType;
  label: string;
  action: () => void;
};

// Group separators: after Highlight (idx 3), after H3 (idx 6), after Checklist (idx 9), after Code (idx 11)
const separatorAfter = new Set([3, 6, 9, 11]);

function focusEditor(el: HTMLDivElement | null) {
  if (el) el.focus();
}

function insertHTML(html: string) {
  document.execCommand("insertHTML", false, html);
}

export function MarkdownToolbar({ editorRef }: MarkdownToolbarProps) {
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
    // Move cursor after
    range.setStartAfter(el);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    // Trigger input event
    editorRef.current?.dispatchEvent(new Event("input", { bubbles: true }));
  }, [editorRef]);

  const insertCheckbox = useCallback(() => {
    focusEditor(editorRef.current);
    const html = '<div><input type="checkbox" class="mr-2 accent-primary rounded"> Task item</div>';
    insertHTML(html);
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
  { icon: List, label: "Bullet List", action: () => exec("insertUnorderedList") },
  { icon: ListOrdered, label: "Numbered List", action: () => exec("insertOrderedList") },
  { icon: CheckSquare, label: "Checklist", action: insertCheckbox },
  { icon: Quote, label: "Blockquote", action: () => exec("formatBlock", "blockquote") },
  { icon: Code, label: "Inline Code", action: () => wrapWithTag("code") },
  { icon: Link2, label: "Link", action: insertLink },
  { icon: Image, label: "Image", action: insertImage },
  { icon: Minus, label: "Divider", action: insertDivider }];


  return (
    <div className="flex items-center gap-0.5 px-4 py-2 overflow-x-auto scrollbar-none sm:px-[2px]">
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
    </div>);

}