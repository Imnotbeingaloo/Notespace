import { useCallback, useState } from "react";
import { Type, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";

interface HeadingSizePickerProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
}

// Ruled paper line grid = 1.75rem = 28px at 16px root.
// Round line-height up to a multiple so surrounding notebook rules stay aligned.
const RULE_PX = 28;

function findHeadingBlock(node: Node | null, editor: HTMLElement): HTMLElement | null {
  let el: Node | null = node;
  while (el && el !== editor) {
    if (el instanceof HTMLElement && /^H[1-6]$/.test(el.tagName)) return el;
    el = el.parentNode;
  }
  return null;
}

export function HeadingSizePicker({ editorRef }: HeadingSizePickerProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string>("32");

  const apply = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const px = Math.max(10, Math.min(96, Math.round(Number(value) || 0)));
    if (!px) return;

    const sel = window.getSelection();
    const anchor = sel?.anchorNode ?? null;
    const heading = findHeadingBlock(anchor, editor);
    if (!heading) {
      toast({
        title: "Place your cursor in a heading first",
        description: "Click inside an H1, H2, or H3, then pick a size.",
      });
      return;
    }

    const rows = Math.max(1, Math.ceil(px / RULE_PX));
    const lh = rows * RULE_PX;
    heading.style.fontSize = `${px}px`;
    heading.style.lineHeight = `${lh}px`;

    editor.dispatchEvent(new Event("input", { bubbles: true }));
    setOpen(false);
  }, [editorRef, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 hover:scale-105 flex-shrink-0 inline-flex items-center gap-0.5"
              aria-label="Heading size"
            >
              <Type className="h-4 w-4" />
              <ChevronDown className="h-3 w-3" />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">Heading size (px)</TooltipContent>
      </Tooltip>
      <PopoverContent
        className="w-48 p-3"
        align="start"
        sideOffset={8}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <label className="block text-xs font-medium text-muted-foreground mb-2">
          Size in px (10–96)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={10}
            max={96}
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
          Applies only to the heading your cursor is in.
        </p>
      </PopoverContent>
    </Popover>
  );
}
