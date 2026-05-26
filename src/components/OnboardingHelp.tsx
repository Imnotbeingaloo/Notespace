import { useState, useEffect, useRef } from "react";
import { HelpCircle, Highlighter, Code, Link2, Image as ImageIcon, Minus, Table, Search, Crosshair, Timer } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const toolbarTips = [
  { Icon: Highlighter, title: "Highlight", body: "Paints a yellow highlight behind the selected text — great for marking key passages you'll come back to." },
  { Icon: Code, title: "Inline code", body: "Wraps the selected text in a monospaced code style. Use for variable names, file paths, or short snippets." },
  { Icon: Link2, title: "Insert link", body: "Highlight any text first and click this — the title pre-fills with what you selected and you just paste the URL." },
  { Icon: ImageIcon, title: "Insert image", body: "Opens your file picker. Images upload to your private storage and embed inline. PNG, JPG, WEBP up to 10MB." },
  { Icon: Minus, title: "Divider", body: "Drops a horizontal rule to break sections — useful between topics or before a summary." },
  { Icon: Table, title: "Table", body: "Pick a size from the popover. Once inserted, the table edit toolbar appears for adding rows, columns, or deleting cells." },
  { Icon: Search, title: "Find & Replace", body: "Press ⌘F (or Ctrl+F) inside a note to search & replace. Supports regex via the toggle." },
  { Icon: Crosshair, title: "Focus Mode", body: "Top bar button — hides the sidebar and chrome so only your note remains. Click again to exit." },
  { Icon: Timer, title: "Pomodoro Timer", body: "25-minute work + 5-minute break sessions in a floating corner widget. Toggle from the top bar." },
];

export function OnboardingHelp() {
  const [open, setOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const idleTimerRef = useRef<number | null>(null);
  const dismissedRef = useRef(false);

  // Show the tooltip automatically after 5s of inactivity (once per session).
  useEffect(() => {
    if (dismissedRef.current) return;
    const reset = () => {
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = window.setTimeout(() => {
        if (!dismissedRef.current && !open) {
          setTooltipOpen(true);
          // Auto-hide after 6s
          window.setTimeout(() => setTooltipOpen(false), 6000);
          dismissedRef.current = true;
        }
      }, 5000);
    };
    const events = ["mousemove", "keydown", "scroll", "click", "touchstart"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    };
  }, [open]);

  return (
    <>
      <Tooltip open={tooltipOpen || undefined} onOpenChange={setTooltipOpen}>
        <TooltipTrigger asChild>
          <Button
            onClick={() => { setOpen(true); setTooltipOpen(false); dismissedRef.current = true; }}
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-xl shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="Help"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-primary text-primary-foreground font-medium">
          <p>Confused? Click here</p>
        </TooltipContent>
      </Tooltip>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Toolbar cheatsheet</DialogTitle>
            <DialogDescription>
              The buttons that aren't obvious — what each one actually does.
            </DialogDescription>
          </DialogHeader>
          <ul className="mt-2 space-y-2">
            {toolbarTips.map(({ Icon, title, body }) => (
              <li key={title} className="flex gap-3 rounded-xl border border-border bg-card/50 p-3">
                <div className="w-9 h-9 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}
