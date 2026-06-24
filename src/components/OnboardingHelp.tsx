import { useState, useEffect, useRef } from "react";
import { HelpCircle, Highlighter, Code, Link2, Image as ImageIcon, Minus, Table2, Search, Maximize2, Timer, ArrowRight, ArrowUp, TableProperties } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AnimatePresence, motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

type Tip = { Icon?: React.ElementType; glyph?: string; title: string; body: string };

const toolbarTips: Tip[] = [
  { Icon: Highlighter, title: "Highlight", body: "Paints a yellow highlight behind the selected text — great for marking key passages you'll come back to." },
  { Icon: Code, title: "Inline code", body: "Wraps the selected text in a monospaced code style. Use for variable names, file paths, or short snippets." },
  { Icon: Link2, title: "Insert link", body: "Highlight any text first and click this — the title pre-fills with what you selected and you just paste the URL." },
  { Icon: ImageIcon, title: "Insert image", body: "Opens your file picker. Images upload to your private storage and embed inline. PNG, JPG, WEBP up to 10MB." },
  { Icon: Minus, title: "Divider", body: "Drops a horizontal rule to break sections — useful between topics or before a summary." },
  { Icon: Table2, title: "Table", body: "Pick a size from the popover. Once inserted, the table edit toolbar appears for adding rows, columns, or deleting cells." },
  { Icon: TableProperties, title: "Edit table", body: "When the cursor is inside a table, the table toolbar appears next to the main one — add/remove rows & columns, delete the whole table, all inline." },
  { glyph: "Ω", title: "Insert symbol", body: "Opens a picker for math symbols, arrows, currency, and Greek letters. Click any glyph to drop it at your cursor — no shortcuts to memorise." },
  { Icon: Search, title: "Find & Replace", body: "Press ⌘F (or Ctrl+F) inside a note to search & replace. Supports regex via the toggle." },
  { Icon: Maximize2, title: "Focus Mode", body: "Top bar button — hides the sidebar and chrome so only your note remains. Click again to exit." },
  { Icon: Timer, title: "Pomodoro Timer", body: "25-minute work + 5-minute break sessions in a floating corner widget. Toggle from the top bar." },
];

const DISMISS_KEY = "onboarding-hint-dismissed";
// Escalating idle thresholds (ms) — 5s, 15s, 30s, then 30s thereafter.
const IDLE_STEPS_MS = [5000, 15000, 30000];
const SHOW_MS = 6000;

export function OnboardingHelp() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const idleTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const showCountRef = useRef(0);
  const dismissedRef = useRef(false);
  const openRef = useRef(false);
  const hintOpenRef = useRef(false);
  const shownAtRef = useRef(0);
  // Min time the hint must remain visible before any activity can dismiss it.
  const MIN_VISIBLE_MS = 3000;

  const clearIdle = () => {
    if (idleTimerRef.current) {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  };
  const clearHide = () => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const currentDelay = () => IDLE_STEPS_MS[Math.min(showCountRef.current, IDLE_STEPS_MS.length - 1)];

  const armIdle = () => {
    clearIdle();
    if (dismissedRef.current || openRef.current) return;
    idleTimerRef.current = window.setTimeout(() => {
      idleTimerRef.current = null;
      if (dismissedRef.current || openRef.current) return;
      setHintOpen(true);
      hintOpenRef.current = true;
      showCountRef.current += 1;
      clearHide();
      hideTimerRef.current = window.setTimeout(() => {
        setHintOpen(false);
        hintOpenRef.current = false;
        hideTimerRef.current = null;
        // Don't auto-restart — only re-arm when the user becomes idle again.
      }, SHOW_MS);
    }, currentDelay());
  };

  // Init from storage
  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") {
        dismissedRef.current = true;
        setDontShowAgain(true);
      }
    } catch {}
  }, []);

  useEffect(() => { openRef.current = open; }, [open]);

  // Activity listener — any interaction immediately hides the hint and
  // restarts the idle timer (no continuous looping).
  useEffect(() => {
    if (dismissedRef.current) return;

    const onActivity = () => {
      if (dismissedRef.current) return;
      if (hintOpenRef.current) {
        setHintOpen(false);
        hintOpenRef.current = false;
        clearHide();
      }
      armIdle();
    };

    const events = ["mousemove", "keydown", "scroll", "click", "touchstart", "pointerdown"];
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    armIdle();

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      clearIdle();
      clearHide();
    };
  }, []);

  // Pause/resume around the dialog
  useEffect(() => {
    if (open) {
      setHintOpen(false);
      hintOpenRef.current = false;
      clearIdle();
      clearHide();
    } else if (!dismissedRef.current) {
      armIdle();
    }
  }, [open]);

  const dismissForever = () => {
    dismissedRef.current = true;
    try { localStorage.setItem(DISMISS_KEY, "1"); } catch {}
    setHintOpen(false);
    hintOpenRef.current = false;
    clearIdle();
    clearHide();
  };

  const undismiss = () => {
    dismissedRef.current = false;
    try { localStorage.removeItem(DISMISS_KEY); } catch {}
    showCountRef.current = 0;
    armIdle();
  };

  const handleHelpClick = () => {
    try {
      setDontShowAgain(localStorage.getItem(DISMISS_KEY) === "1");
    } catch {}
    setOpen(true);
  };

  const handleDontShowToggle = (checked: boolean) => {
    setDontShowAgain(checked);
    if (checked) dismissForever();
    else undismiss();
  };

  return (
    <>
      <div className="relative flex items-center">
        <AnimatePresence>
          {hintOpen && !isMobile && (
            <motion.button
              type="button"
              key="hint-desktop"
              onClick={() => { setHintOpen(false); hintOpenRef.current = false; clearHide(); clearIdle(); }}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.25 }}
              className="absolute right-full mr-2 flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-foreground/80 cursor-pointer"
              aria-label="Hide hint"
            >
              <span>Confused? Click here</span>
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex text-primary"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </motion.span>
            </motion.button>
          )}
          {hintOpen && isMobile && (
            <motion.button
              type="button"
              key="hint-mobile"
              onClick={() => { setHintOpen(false); hintOpenRef.current = false; clearHide(); clearIdle(); }}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="absolute top-full right-0 mt-1.5 flex flex-col items-end gap-1 z-50"
              aria-label="Hide hint"
            >
              <motion.span
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex text-primary mr-[10px]"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </motion.span>
              <span className="whitespace-nowrap rounded-md bg-popover/95 backdrop-blur px-2 py-1 text-[11px] font-medium text-foreground shadow-md border border-border">
                Confused? Tap here
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        <Button
          onClick={handleHelpClick}
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-xl shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="Help"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Toolbar cheatsheet</DialogTitle>
            <DialogDescription>
              The buttons that aren't obvious — what each one actually does.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
            <Checkbox id="dont-show-hint" checked={dontShowAgain} onCheckedChange={(c) => handleDontShowToggle(!!c)} />
            <label htmlFor="dont-show-hint" className="text-xs text-muted-foreground cursor-pointer select-none">
              Don't show the "Confused? Click here" hint again
            </label>
          </div>
          <ul className="mt-4 space-y-2">
            {toolbarTips.map(({ Icon, glyph, title, body }) => (
              <li key={title} className="flex gap-3 rounded-xl border border-border bg-card/50 p-3">
                <div className="w-9 h-9 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  {Icon ? <Icon className="h-4 w-4" /> : <span className="text-base font-medium leading-none">{glyph}</span>}
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
