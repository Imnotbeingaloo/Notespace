import { useCallback, useState } from "react";
import { List, ListOrdered, CheckSquare, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ListStylePickerProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
}

function focusEditor(el: HTMLDivElement | null) {
  if (el) el.focus();
}

interface ListOption {
  icon: React.ElementType;
  label: string;
  action: (editorRef: React.RefObject<HTMLDivElement | null>) => void;
  preview: string;
}

const listOptions: ListOption[] = [
  {
    icon: List,
    label: "Bullet List",
    preview: "• Item",
    action: (ref) => {
      focusEditor(ref.current);
      document.execCommand("insertUnorderedList");
    },
  },
  {
    icon: ListOrdered,
    label: "Numbered List",
    preview: "1. Item",
    action: (ref) => {
      focusEditor(ref.current);
      document.execCommand("insertOrderedList");
    },
  },
  {
    icon: CheckSquare,
    label: "Checklist",
    preview: "☐ Task",
    action: (ref) => {
      focusEditor(ref.current);
      const html = '<div><input type="checkbox" class="mr-2 accent-primary rounded"> Task item</div>';
      document.execCommand("insertHTML", false, html);
      ref.current?.dispatchEvent(new Event("input", { bubbles: true }));
    },
  },
  {
    icon: List,
    label: "Disc List",
    preview: "● Item",
    action: (ref) => {
      focusEditor(ref.current);
      document.execCommand("insertUnorderedList");
      // Apply disc style
      const sel = window.getSelection();
      if (sel?.anchorNode) {
        const ul = sel.anchorNode.parentElement?.closest("ul");
        if (ul) ul.style.listStyleType = "disc";
      }
    },
  },
  {
    icon: List,
    label: "Circle List",
    preview: "○ Item",
    action: (ref) => {
      focusEditor(ref.current);
      document.execCommand("insertUnorderedList");
      const sel = window.getSelection();
      if (sel?.anchorNode) {
        const ul = sel.anchorNode.parentElement?.closest("ul");
        if (ul) ul.style.listStyleType = "circle";
      }
    },
  },
  {
    icon: List,
    label: "Square List",
    preview: "■ Item",
    action: (ref) => {
      focusEditor(ref.current);
      document.execCommand("insertUnorderedList");
      const sel = window.getSelection();
      if (sel?.anchorNode) {
        const ul = sel.anchorNode.parentElement?.closest("ul");
        if (ul) ul.style.listStyleType = "square";
      }
    },
  },
  {
    icon: ListOrdered,
    label: "Lettered List (A, B, C)",
    preview: "A. Item",
    action: (ref) => {
      focusEditor(ref.current);
      document.execCommand("insertOrderedList");
      const sel = window.getSelection();
      if (sel?.anchorNode) {
        const ol = sel.anchorNode.parentElement?.closest("ol");
        if (ol) ol.style.listStyleType = "upper-alpha";
      }
    },
  },
  {
    icon: ListOrdered,
    label: "Lowercase Letters (a, b, c)",
    preview: "a. Item",
    action: (ref) => {
      focusEditor(ref.current);
      document.execCommand("insertOrderedList");
      const sel = window.getSelection();
      if (sel?.anchorNode) {
        const ol = sel.anchorNode.parentElement?.closest("ol");
        if (ol) ol.style.listStyleType = "lower-alpha";
      }
    },
  },
  {
    icon: ListOrdered,
    label: "Roman Numerals (I, II, III)",
    preview: "I. Item",
    action: (ref) => {
      focusEditor(ref.current);
      document.execCommand("insertOrderedList");
      const sel = window.getSelection();
      if (sel?.anchorNode) {
        const ol = sel.anchorNode.parentElement?.closest("ol");
        if (ol) ol.style.listStyleType = "upper-roman";
      }
    },
  },
  {
    icon: ListOrdered,
    label: "Lowercase Roman (i, ii, iii)",
    preview: "i. Item",
    action: (ref) => {
      focusEditor(ref.current);
      document.execCommand("insertOrderedList");
      const sel = window.getSelection();
      if (sel?.anchorNode) {
        const ol = sel.anchorNode.parentElement?.closest("ol");
        if (ol) ol.style.listStyleType = "lower-roman";
      }
    },
  },
];

export function ListStylePicker({ editorRef }: ListStylePickerProps) {
  const [open, setOpen] = useState(false);

  const handleAction = useCallback((option: ListOption) => {
    option.action(editorRef);
    setOpen(false);
  }, [editorRef]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 hover:scale-105 flex-shrink-0 inline-flex items-center gap-0.5"
          title="Lists"
        >
          <List className="h-4 w-4" />
          <ChevronDown className="h-2.5 w-2.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-1.5" align="start" sideOffset={8}>
        <div className="space-y-0.5">
          {listOptions.map((option) => (
            <button
              key={option.label}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleAction(option); }}
              className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
            >
              <option.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="flex-1 text-left">{option.label}</span>
              <span className="text-xs text-muted-foreground font-mono">{option.preview}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
