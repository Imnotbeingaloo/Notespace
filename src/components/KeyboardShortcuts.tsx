import { useState, useEffect } from "react";
import { Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
const mod = isMac ? "⌘" : "Ctrl";

const shortcuts = [
  { category: "Editing", items: [
    { keys: `${mod} + B`, description: "Bold" },
    { keys: `${mod} + I`, description: "Italic" },
    { keys: `${mod} + U`, description: "Underline" },
    { keys: `${mod} + Z`, description: "Undo" },
    { keys: `${mod} + Shift + Z`, description: "Redo" },
  ]},
  { category: "Search & Navigation", items: [
    { keys: `${mod} + F`, description: "Find & Replace" },
    { keys: `${mod} + K`, description: "Global Search" },
    { keys: "Enter", description: "Next match (in Find)" },
    { keys: "Shift + Enter", description: "Previous match (in Find)" },
  ]},
  { category: "Tools", items: [
    { keys: `${mod} + Shift + S`, description: "Insert Symbol" },
    { keys: `${mod} + Shift + F`, description: "Toggle Focus Mode" },
    { keys: "Esc", description: "Close panel / dialog" },
  ]},
];

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "?" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setOpen((p) => !p);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl shrink-0">
              <Keyboard className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom"><p>Keyboard Shortcuts ({mod}+?)</p></TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 mt-2">
          {shortcuts.map((group) => (
            <div key={group.category}>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {group.category}
              </h4>
              <div className="space-y-1.5">
                {group.items.map((shortcut) => (
                  <div key={shortcut.keys} className="flex items-center justify-between py-1">
                    <span className="text-sm text-foreground">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.split(" + ").map((key, i) => (
                        <span key={i}>
                          {i > 0 && <span className="text-muted-foreground text-xs mx-0.5">+</span>}
                          <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-md border border-border bg-muted text-[11px] font-mono font-medium text-muted-foreground">
                            {key}
                          </kbd>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
