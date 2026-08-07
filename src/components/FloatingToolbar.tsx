import { useEffect, useRef, useState } from "react";
import {
  Bold, Italic, Underline, Strikethrough, Code, Link2, Highlighter,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Rows3, Sparkles,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { sanitizeUrl } from "@/lib/url-sanitize";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLastHighlightColor } from "@/hooks/use-last-highlight-color";
import { useParagraphSpacing, type SpacingTier } from "@/hooks/use-paragraph-spacing";

interface FloatingToolbarProps {
  selectionRect: DOMRect | null;
  onAction: (command: string, value?: string) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const HIGHLIGHT_COLORS: { name: string; value: string }[] = [
  { name: "Yellow", value: "#fde68a" },
  { name: "Green", value: "#bbf7d0" },
  { name: "Blue", value: "#bfdbfe" },
  { name: "Pink", value: "#fbcfe8" },
  { name: "Purple", value: "#ddd6fe" },
  { name: "Orange", value: "#fed7aa" },
];

const SPACING_TIERS: { tier: SpacingTier; label: string }[] = [
  { tier: "tight", label: "Tight" },
  { tier: "normal", label: "Normal" },
  { tier: "relaxed", label: "Relaxed" },
];

export function FloatingToolbar({ selectionRect, onAction, containerRef }: FloatingToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [lastColor, setLastColor] = useLastHighlightColor();
  const [spacing, setSpacing] = useParagraphSpacing();

  useEffect(() => {
    if (!selectionRect || !containerRef.current) {
      setPosition(null);
      return;
    }
    // Position on the next frame so the toolbar appears as soon as the
    // selection settles — a timed delay made it feel broken.
    const frame = requestAnimationFrame(() => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      // The toolbar is absolutely positioned inside the editor's *wrapper*, so
      // offsets must be measured from that box — using the editor box shifted
      // the toolbar up by the wrapper padding and clipped the current line.
      const originEl = (containerRef.current.offsetParent as HTMLElement | null) ?? containerRef.current;
      const originRect = originEl.getBoundingClientRect();
      const toolbarWidth = 400;
      const toolbarHeight = 40;
      let left = selectionRect.left + selectionRect.width / 2 - originRect.left - toolbarWidth / 2;
      left = Math.max(0, Math.min(left, Math.max(0, originRect.width - toolbarWidth)));
      // Default: sit BELOW the selection so it never covers the line being read
      // or written. Flip above only when there is no room underneath.
      let top = selectionRect.bottom - originRect.top + 10;
      const roomBelow = containerRect.bottom - selectionRect.bottom;
      if (roomBelow < toolbarHeight + 16) {
        const above = selectionRect.top - originRect.top - toolbarHeight - 10;
        if (above > 0) top = above;
      }
      setPosition({ top, left });
    });
    return () => cancelAnimationFrame(frame);
  }, [selectionRect, containerRef]);

  /** Wrap the current selection in a span carrying one inline style. */
  const wrapWithStyle = (apply: (span: HTMLSpanElement) => void) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    const span = document.createElement("span");
    apply(span);
    try {
      span.appendChild(range.extractContents());
      range.insertNode(span);
      const after = document.createRange();
      after.setStartAfter(span);
      after.collapse(true);
      sel.removeAllRanges();
      sel.addRange(after);
    } catch { /* ignore */ }
    containerRef.current?.dispatchEvent(new Event("input", { bubbles: true }));
  };

  const askAIAboutSelection = () => {
    const text = window.getSelection()?.toString().trim() || "";
    window.dispatchEvent(new CustomEvent("notespace:ask-ai", { detail: { text } }));
  };


  const wrapWithHighlight = (color: string) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    const span = document.createElement("span");
    span.style.backgroundColor = color;
    span.style.borderRadius = "2px";
    span.style.padding = "0 2px";
    try {
      span.appendChild(range.extractContents());
      range.insertNode(span);
      const after = document.createRange();
      after.setStartAfter(span);
      after.collapse(true);
      sel.removeAllRanges();
      sel.addRange(after);
    } catch { /* ignore */ }
    containerRef.current?.dispatchEvent(new Event("input", { bubbles: true }));
  };

  const handleSimple = (command: string) => {
    if (command === "code") {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      const selected = range.toString();
      const codeEl = document.createElement("code");
      codeEl.textContent = selected || "code";
      range.deleteContents();
      range.insertNode(codeEl);
      range.setStartAfter(codeEl);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      containerRef.current?.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }
    if (command === "createLink") {
      const rawUrl = prompt("Enter URL:", "https://");
      const safeUrl = sanitizeUrl(rawUrl);
      if (!safeUrl) return;
      onAction(command, safeUrl);
      return;
    }
    onAction(command);
  };

  const ToolButton = ({ icon: Icon, label, onClick, active }: { icon: any; label: string; onClick: () => void; active?: boolean }) => (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={label}
      aria-label={label}
      className={`p-1.5 rounded-lg transition-all duration-150 hover:bg-muted ${
        active ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );

  const Divider = () => <div className="w-px h-4 bg-border mx-0.5" />;

  return (
    <AnimatePresence>
      {position && (
        <motion.div
          ref={toolbarRef}
          initial={{ opacity: 0, y: 4, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute z-50 flex items-center gap-0.5 px-1.5 py-1 rounded-xl border border-border bg-popover shadow-lg"
          style={{ top: position.top, left: position.left }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <ToolButton icon={Bold} label="Bold" onClick={() => handleSimple("bold")} />

          {/* Italic + font family picker */}
          <div className="flex items-center">
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleSimple("italic"); }}
              title="Italic"
              aria-label="Italic"
              className="p-1.5 rounded-l-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
            >
              <Italic className="h-3.5 w-3.5" />
            </button>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  title="Font family"
                  aria-label="Font family"
                  className="px-1 py-1.5 rounded-r-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150 text-[9px] leading-none"
                >
                  ▾
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-1" align="center" sideOffset={6} onOpenAutoFocus={(e) => e.preventDefault()}>
                {FONT_FAMILIES.map((f) => (
                  <button
                    key={f.name}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      wrapWithStyle((span) => { span.style.fontFamily = f.stack; });
                    }}
                    className="w-full text-left px-2 py-1.5 text-sm rounded-md text-foreground hover:bg-muted transition-colors"
                    style={{ fontFamily: f.stack }}
                  >
                    {f.name}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          </div>

          <ToolButton icon={Underline} label="Underline" onClick={() => handleSimple("underline")} />
          <ToolButton icon={Strikethrough} label="Strikethrough" onClick={() => handleSimple("strikeThrough")} />
          <Divider />
          <ToolButton icon={Sparkles} label="Ask AI about this" onClick={askAIAboutSelection} />

          <Divider />

          {/* Highlight swatch: one-click applies last color; caret opens palette */}
          <div className="flex items-center">
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); wrapWithHighlight(lastColor); }}
              title="Highlight"
              aria-label="Apply highlight"
              className="p-1.5 rounded-l-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150 relative"
            >
              <Highlighter className="h-3.5 w-3.5" />
              <span
                className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-[3px] w-3 rounded-sm border border-border/60"
                style={{ backgroundColor: lastColor }}
              />
            </button>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  title="Choose highlight color"
                  aria-label="Choose highlight color"
                  className="px-1 py-1.5 rounded-r-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150 text-[9px] leading-none"
                >
                  ▾
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="center" sideOffset={6} onOpenAutoFocus={(e) => e.preventDefault()}>
                <div className="flex items-center gap-1.5">
                  {HIGHLIGHT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); setLastColor(c.value); wrapWithHighlight(c.value); }}
                      className={`h-6 w-6 rounded-md border transition-transform hover:scale-110 ${
                        lastColor === c.value ? "border-foreground ring-2 ring-primary/40" : "border-border"
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                      aria-label={`Highlight ${c.name}`}
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <Divider />

          <ToolButton icon={Code} label="Code" onClick={() => handleSimple("code")} />
          <ToolButton icon={Link2} label="Link" onClick={() => handleSimple("createLink")} />
          <Divider />

          <ToolButton icon={AlignLeft} label="Align left" onClick={() => handleSimple("justifyLeft")} />
          <ToolButton icon={AlignCenter} label="Align center" onClick={() => handleSimple("justifyCenter")} />
          <ToolButton icon={AlignRight} label="Align right" onClick={() => handleSimple("justifyRight")} />
          <ToolButton icon={AlignJustify} label="Justify" onClick={() => handleSimple("justifyFull")} />
          <Divider />

          {/* Paragraph spacing tier (document-wide preference) */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                title={`Line spacing: ${spacing}`}
                aria-label="Line spacing"
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
              >
                <Rows3 className="h-3.5 w-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-1" align="center" sideOffset={6} onOpenAutoFocus={(e) => e.preventDefault()}>
              {SPACING_TIERS.map((s) => (
                <button
                  key={s.tier}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); setSpacing(s.tier); }}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded-md transition-colors ${
                    spacing === s.tier ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
