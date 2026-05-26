import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const tips = [
  { title: "Create a notebook", body: "Use the + button in the sidebar to start a new notebook. Each notebook holds a stream of notes." },
  { title: "Write in Markdown", body: "Headings, lists, tables, code — the toolbar above the editor covers everything you need." },
  { title: "Ask the AI", body: "Highlight any phrase and hit ‘Explain’ to get a streaming explanation in a side panel." },
  { title: "Focus Mode", body: "Click the expand icon top-right to hide the sidebar. Enable Pomodoro in Settings → Appearance to pair it with Focus." },
  { title: "Find what you wrote", body: "Press ⌘K to search across every notebook. Click any tag chip to filter." },
];

export function OnboardingHelp() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => setOpen(true)}
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-xl shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="Help"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Confused? Click here</p>
        </TooltipContent>
      </Tooltip>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">A quick tour</DialogTitle>
            <DialogDescription>
              Five things that unlock most of Notebook Archive.
            </DialogDescription>
          </DialogHeader>
          <ol className="mt-2 space-y-3">
            {tips.map((t, i) => (
              <li key={t.title} className="flex gap-3 rounded-xl border border-border bg-card/50 p-3">
                <div className="w-7 h-7 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{t.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{t.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </DialogContent>
      </Dialog>
    </>
  );
}
