import { useCallback } from "react";
import {
  Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered,
  Quote, Code, Link2, Image, Strikethrough, Minus, CheckSquare
} from "lucide-react";

interface MarkdownToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onContentChange: (content: string) => void;
}

type FormatAction = {
  icon: React.ElementType;
  label: string;
  action: (textarea: HTMLTextAreaElement) => { newContent: string; cursorPos: number };
};

function wrapSelection(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string
): { newContent: string; cursorPos: number } {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const selected = text.substring(start, end);
  const replacement = before + (selected || "text") + after;
  const newContent = text.substring(0, start) + replacement + text.substring(end);
  const cursorPos = selected ? start + replacement.length : start + before.length + 4;
  return { newContent, cursorPos };
}

function insertAtCursor(
  textarea: HTMLTextAreaElement,
  insert: string,
  cursorOffset?: number
): { newContent: string; cursorPos: number } {
  const start = textarea.selectionStart;
  const text = textarea.value;
  const newContent = text.substring(0, start) + insert + text.substring(start);
  return { newContent, cursorPos: start + (cursorOffset ?? insert.length) };
}

function prependLine(
  textarea: HTMLTextAreaElement,
  prefix: string
): { newContent: string; cursorPos: number } {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const lineStart = text.lastIndexOf("\n", start - 1) + 1;
  const lineEnd = text.indexOf("\n", end);
  const actualEnd = lineEnd === -1 ? text.length : lineEnd;
  const line = text.substring(lineStart, actualEnd);
  const newLine = prefix + line;
  const newContent = text.substring(0, lineStart) + newLine + text.substring(actualEnd);
  return { newContent, cursorPos: start + prefix.length };
}

const actions: FormatAction[] = [
  {
    icon: Bold,
    label: "Bold",
    action: (ta) => wrapSelection(ta, "**", "**"),
  },
  {
    icon: Italic,
    label: "Italic",
    action: (ta) => wrapSelection(ta, "_", "_"),
  },
  {
    icon: Strikethrough,
    label: "Strikethrough",
    action: (ta) => wrapSelection(ta, "~~", "~~"),
  },
  {
    icon: Heading1,
    label: "Heading 1",
    action: (ta) => prependLine(ta, "# "),
  },
  {
    icon: Heading2,
    label: "Heading 2",
    action: (ta) => prependLine(ta, "## "),
  },
  {
    icon: Heading3,
    label: "Heading 3",
    action: (ta) => prependLine(ta, "### "),
  },
  {
    icon: List,
    label: "Bullet List",
    action: (ta) => prependLine(ta, "- "),
  },
  {
    icon: ListOrdered,
    label: "Numbered List",
    action: (ta) => prependLine(ta, "1. "),
  },
  {
    icon: CheckSquare,
    label: "Checklist",
    action: (ta) => prependLine(ta, "- [ ] "),
  },
  {
    icon: Quote,
    label: "Blockquote",
    action: (ta) => prependLine(ta, "> "),
  },
  {
    icon: Code,
    label: "Inline Code",
    action: (ta) => wrapSelection(ta, "`", "`"),
  },
  {
    icon: Link2,
    label: "Link",
    action: (ta) => {
      const selected = ta.value.substring(ta.selectionStart, ta.selectionEnd);
      return insertAtCursor(ta, `[${selected || "link text"}](url)`, selected ? selected.length + 3 : 11);
    },
  },
  {
    icon: Image,
    label: "Image",
    action: (ta) => insertAtCursor(ta, "![alt text](image-url)", 12),
  },
  {
    icon: Minus,
    label: "Divider",
    action: (ta) => insertAtCursor(ta, "\n---\n", 5),
  },
];

// Group separators: after Strikethrough (idx 2), after H3 (idx 5), after Checklist (idx 8), after Code (idx 10)
const separatorAfter = new Set([2, 5, 8, 10]);

export function MarkdownToolbar({ textareaRef, onContentChange }: MarkdownToolbarProps) {
  const handleAction = useCallback(
    (action: FormatAction["action"]) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      textarea.focus();
      const { newContent, cursorPos } = action(textarea);
      textarea.value = newContent;
      textarea.setSelectionRange(cursorPos, cursorPos);
      onContentChange(newContent);
    },
    [textareaRef, onContentChange]
  );

  return (
    <div className="flex items-center gap-0.5 px-4 sm:px-8 py-2 border-b border-border bg-muted/30 overflow-x-auto scrollbar-none">
      {actions.map((a, i) => (
        <div key={a.label} className="contents">
          <button
            type="button"
            onClick={() => handleAction(a.action)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 hover:scale-105 flex-shrink-0"
            title={a.label}
          >
            <a.icon className="h-4 w-4" />
          </button>
          {separatorAfter.has(i) && (
            <div className="w-px h-5 bg-border mx-1 flex-shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}
