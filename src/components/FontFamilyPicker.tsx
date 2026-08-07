import { useCallback, useRef, useState } from "react";
import { CaseSensitive, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";

/** Faces already loaded by the app plus dependable system stacks, so switching
 *  font never causes a flash of unstyled text. */
export const FONT_FAMILIES: { name: string; stack: string }[] = [
  { name: "Body (Inter)", stack: "Inter, system-ui, sans-serif" },
  { name: "Serif (Merriweather)", stack: "Merriweather, Georgia, serif" },
  { name: "Mono (JetBrains)", stack: "'JetBrains Mono', ui-monospace, monospace" },
  { name: "Georgia", stack: "Georgia, 'Times New Roman', serif" },
  { name: "Palatino", stack: "'Palatino Linotype', Palatino, Georgia, serif" },
  { name: "Courier", stack: "'Courier New', Courier, monospace" },
  { name: "Trebuchet", stack: "'Trebuchet MS', Verdana, sans-serif" },
];

interface FontFamilyPickerProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
}

export function FontFamilyPicker({ editorRef }: FontFamilyPickerProps) {
  const [open, setOpen] = useState(false);
  const savedRangeRef = useRef<Range | null>(null);

  const saveSelection = useCallback(() => {
    const editor = editorRef.current;
    const sel = window.getSelection();
    if (!editor || !sel || sel.rangeCount === 0) {
      savedRangeRef.current = null;
      return;
    }
    const range = sel.getRangeAt(0);
    savedRangeRef.current = editor.contains(range.commonAncestorContainer)
      ? range.cloneRange()
      : null;
  }, [editorRef]);

  const apply = useCallback((stack: string) => {
    const editor = editorRef.current;
    const saved = savedRangeRef.current;
    if (!editor) return;
    if (!saved || saved.collapsed) {
      toast({ title: "Select some text first", description: "Fonts only apply to a selection." });
      return;
    }
    editor.focus();
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(saved);
    const container = document.createElement("div");
    container.appendChild(saved.cloneContents());
    // execCommand keeps the change on the browser's native undo stack.
    document.execCommand(
      "insertHTML",
      false,
      `<span style="font-family:${stack}">${container.innerHTML}</span>`
    );
    editor.dispatchEvent(new Event("input", { bubbles: true }));
    savedRangeRef.current = null;
    setOpen(false);
  }, [editorRef]);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) saveSelection();
        setOpen(next);
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); saveSelection(); }}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 hover:scale-105 flex-shrink-0 inline-flex items-center gap-0.5"
              aria-label="Font family"
            >
              <CaseSensitive className="h-4 w-4" />
              <ChevronDown className="h-2.5 w-2.5" />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">Font family</TooltipContent>
      </Tooltip>
      <PopoverContent className="w-52 p-1" align="start" sideOffset={8} onOpenAutoFocus={(e) => e.preventDefault()}>
        {FONT_FAMILIES.map((f) => (
          <button
            key={f.name}
            type="button"
            onMouseDown={(e) => { e.preventDefault(); apply(f.stack); }}
            className="w-full text-left px-2 py-1.5 text-sm rounded-md text-foreground hover:bg-muted transition-colors"
            style={{ fontFamily: f.stack }}
          >
            {f.name}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
