import { useCallback, useRef, useState } from "react";
import { Type, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";

interface HeadingSizePickerProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
}

export function HeadingSizePicker({ editorRef }: HeadingSizePickerProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string>("20");
  const savedRangeRef = useRef<Range | null>(null);

  // Snapshot the editor selection BEFORE the popover steals focus.
  const saveSelection = useCallback(() => {
    const editor = editorRef.current;
    const sel = window.getSelection();
    if (!editor || !sel || sel.rangeCount === 0) {
      savedRangeRef.current = null;
      return;
    }
    const range = sel.getRangeAt(0);
    // Only save if the range is inside the editor.
    if (editor.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
    } else {
      savedRangeRef.current = null;
    }
  }, [editorRef]);

  const apply = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const px = Math.max(8, Math.min(200, Math.round(Number(value) || 0)));
    if (!px) return;

    const saved = savedRangeRef.current;
    if (!saved || saved.collapsed) {
      toast({
        title: "Select some text first",
        description: "Text size only applies to a selection.",
      });
      return;
    }

    // Restore the saved selection so execCommand acts on the right range.
    editor.focus();
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(saved);

    const container = document.createElement("div");
    container.appendChild(saved.cloneContents());
    document.execCommand("insertHTML", false, buildSizedSpan(px, container.innerHTML));

    editor.dispatchEvent(new Event("input", { bubbles: true }));
    savedRangeRef.current = null;
    setOpen(false);
  }, [editorRef, value]);

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
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
              }}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 hover:scale-105 flex-shrink-0 inline-flex items-center gap-0.5"
              aria-label="Text size"
            >
              <Type className="h-4 w-4" />
              <ChevronDown className="h-2.5 w-2.5" />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">Text size (px)</TooltipContent>
      </Tooltip>
      <PopoverContent
        className="w-52 p-3"
        align="start"
        sideOffset={8}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <label className="block text-xs font-medium text-muted-foreground mb-2">
          Size in px (8–200)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={8}
            max={200}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                apply();
              }
            }}
            className="w-20 rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            autoFocus
          />
          <button
            type="button"
            onClick={apply}
            className="rounded-md bg-primary px-3 py-1 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Apply
          </button>
        </div>
        <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
          Select text in the editor first, then choose a size.
        </p>
      </PopoverContent>
    </Popover>
  );
}
