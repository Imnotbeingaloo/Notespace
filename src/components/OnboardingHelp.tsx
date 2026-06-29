import { useState, useEffect, useRef } from "react";
import { HelpCircle, Highlighter, Code, Link2, Image as ImageIcon, Minus, Table2, Search, Maximize2, Timer, ArrowRight, TableProperties, Keyboard, Sparkles, FolderTree, Bot, Upload, Tag, CalendarDays } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AnimatePresence, motion } from "framer-motion";

type Tip = { Icon?: React.ElementType; glyph?: string; title: string; body: string };

const toolbarTips: Tip[] = [
  { Icon: Highlighter, title: "Highlight", body: "Paints a yellow highlight behind the selected text - great for marking key passages you'll come back to." },
  { Icon: Code, title: "Inline code", body: "Wraps the selected text in a monospaced code style. Use for variable names, file paths, or short snippets." },
  { Icon: Link2, title: "Insert link", body: "Highlight any text first and click this - the title pre-fills with what you selected and you just paste the URL." },
  { Icon: ImageIcon, title: "Insert image", body: "Opens your file picker. Images upload to your private storage and embed inline. PNG, JPG, WEBP up to 10MB." },
  { Icon: Minus, title: "Divider", body: "Drops a horizontal rule to break sections - useful between topics or before a summary." },
  { Icon: Table2, title: "Table", body: "Pick a size from the popover. Once inserted, the table edit toolbar appears for adding rows, columns, or deleting cells." },
  { Icon: TableProperties, title: "Edit table", body: "When the cursor is inside a table, the table toolbar appears next to the main one - add/remove rows & columns, delete the whole table, all inline." },
  { glyph: "Ω", title: "Insert symbol", body: "Opens a picker for math symbols, arrows, currency, and Greek letters. Click any glyph to drop it at your cursor." },
];

const sidebarTips: Tip[] = [
  { Icon: FolderTree, title: "Notebooks vs Notes", body: "Notebooks are containers (with a 'Notebook' badge and chevron). Notes live inside them or float on their own at the top of the sidebar." },
  { Icon: ArrowRight, title: "Expand a notebook", body: "Click the chevron to the left of a notebook to expand or collapse its notes - it won't switch your selection." },
  { Icon: Upload, title: "Drag & drop", body: "Drag a note onto another notebook to move it. Drop a note into the dashed area to make it standalone. Drag a notebook onto another to nest it." },
  { Icon: Tag, title: "Smart tags", body: "Tags you use across notes get aggregated in the Tags section of the sidebar. Click a tag to filter." },
  { Icon: CalendarDays, title: "Upcoming plans", body: "Scheduled study sessions appear at the bottom of the sidebar so they stay in view as you work." },
];

const aiTips: Tip[] = [
  { Icon: Bot, title: "Ask AI", body: "Open the AI panel from the editor. 'Explain' answers questions about your note; 'Edit' rewrites or transforms it with your approval before applying." },
  { Icon: Sparkles, title: "Auto-format on paste", body: "Paste 200+ characters of plain text and the AI cleans up structure (headings, lists, paragraphs) automatically. A progress toast shows when it's running." },
  { Icon: Search, title: "Quick chips", body: "Above the AI input you'll find 3 contextual chips per mode - Improve, Continue, Format (Edit) and Explain, Summarize, Missing (Explain)." },
];

const shortcutTips: Tip[] = [
  { glyph: "⌘K", title: "Global search", body: "Open the search palette from anywhere - jump to any note across all notebooks, filter by tag, and preview matches." },
  { glyph: "⌘F", title: "Find & replace", body: "Inside a note, search and replace text. Toggle regex from the popover for power matches." },
  { Icon: Maximize2, title: "Focus Mode", body: "Top bar button - hides the sidebar and chrome so only your note remains. Click again to exit." },
  { Icon: Timer, title: "Pomodoro Timer", body: "25-minute work + 5-minute break sessions in a floating widget. Toggle from the top bar." },
  { glyph: "Alt+T", title: "Re-open last toast", body: "Brings back the most recent notification if you missed it." },
];

const sections: { id: string; label: string; tips: Tip[] }[] = [
  { id: "toolbar", label: "Toolbar", tips: toolbarTips },
  { id: "sidebar", label: "Sidebar", tips: sidebarTips },
  { id: "ai", label: "AI panel", tips: aiTips },
  { id: "shortcuts", label: "Shortcuts & extras", tips: shortcutTips },
];

const DISMISS_KEY = "onboarding-hint-dismissed";
const DISMISS_DATE_KEY = "onboarding-hint-dismissed-date";
const IDLE_STEPS_MS = [10000];
const SHOW_MS = 3000;

const todayStr = () => new Date().toISOString().slice(0, 10);

export function OnboardingHelp() {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState(sections[0].id);
  const [hintOpen, setHintOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const idleTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const showCountRef = useRef(0);
  const dismissedRef = useRef(false);
  const openRef = useRef(false);
  const hintOpenRef = useRef(false);
  const shownAtRef = useRef(0);
  const MIN_VISIBLE_MS = 3000;

  const clearIdle = () => { if (idleTimerRef.current) { window.clearTimeout(idleTimerRef.current); idleTimerRef.current = null; } };
  const clearHide = () => { if (hideTimerRef.current) { window.clearTimeout(hideTimerRef.current); hideTimerRef.current = null; } };

  const currentDelay = () => IDLE_STEPS_MS[Math.min(showCountRef.current, IDLE_STEPS_MS.length - 1)];

  const armIdle = () => {
    clearIdle();
    if (dismissedRef.current || openRef.current) return;
    idleTimerRef.current = window.setTimeout(() => {
      idleTimerRef.current = null;
      if (dismissedRef.current || openRef.current) return;
      setHintOpen(true);
      hintOpenRef.current = true;
      shownAtRef.current = Date.now();
      showCountRef.current += 1;
      clearHide();
      hideTimerRef.current = window.setTimeout(() => {
        setHintOpen(false);
        hintOpenRef.current = false;
        hideTimerRef.current = null;
      }, SHOW_MS);
    }, currentDelay());
  };

  useEffect(() => {
    try {
      const permanent = localStorage.getItem(DISMISS_KEY) === "1";
      const dayDismissed = localStorage.getItem(DISMISS_DATE_KEY) === todayStr();
      if (permanent) setDontShowAgain(true);
      if (permanent || dayDismissed) {
        dismissedRef.current = true;
        setHintOpen(false);
        hintOpenRef.current = false;
        clearIdle();
        clearHide();
      }
    } catch {}
  }, []);

  useEffect(() => { openRef.current = open; }, [open]);

  useEffect(() => {
    if (dismissedRef.current) return;
    const onActivity = () => {
      if (dismissedRef.current) return;
      if (hintOpenRef.current) {
        if (Date.now() - shownAtRef.current < MIN_VISIBLE_MS) return;
        setHintOpen(false);
        hintOpenRef.current = false;
        clearHide();
      }
      armIdle();
    };
    const events = ["keydown", "click", "touchstart", "pointerdown"];
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    armIdle();
    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      clearIdle();
      clearHide();
    };
  }, []);

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
    try {
      localStorage.removeItem(DISMISS_KEY);
      localStorage.removeItem(DISMISS_DATE_KEY);
    } catch {}
    showCountRef.current = 0;
    armIdle();
  };

  const handleHelpClick = () => {
    try { setDontShowAgain(localStorage.getItem(DISMISS_KEY) === "1"); } catch {}
    setOpen(true);
  };

  const handleDontShowToggle = (checked: boolean) => {
    setDontShowAgain(checked);
    if (checked) dismissForever();
    else undismiss();
  };

  const activeTips = sections.find((s) => s.id === section)?.tips ?? [];

  return (
    <>
      <div className="relative hidden md:flex items-center">
        <AnimatePresence>
          {hintOpen && (
            <motion.button
              type="button"
              key="hint-desktop"
              onClick={dismissForever}
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

      <div className="md:hidden">
        <div className="fixed z-40 right-4" style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}>
          <AnimatePresence>
            {hintOpen && (
              <motion.button
                type="button"
                key="hint-mobile"
                onClick={dismissForever}
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: -8, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="absolute bottom-full right-0 mb-1 whitespace-nowrap rounded-full bg-foreground text-background text-xs font-medium px-3 py-1.5 shadow-lg"
                aria-label="Hide hint"
              >
                Need help? Tap →
              </motion.button>
            )}
          </AnimatePresence>
          <Button
            onClick={handleHelpClick}
            variant="default"
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
            aria-label="Help"
          >
            <HelpCircle className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden p-0 flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-3">
            <DialogTitle className="font-serif text-xl">Help &amp; quick reference</DialogTitle>
            <DialogDescription>
              Everything that isn't obvious - grouped by where you'll find it.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-2 flex items-center gap-1 border-b border-border overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-t-md whitespace-nowrap transition-colors ${
                  section === s.id
                    ? "text-foreground border-b-2 border-primary -mb-px"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
              <Checkbox id="dont-show-hint" checked={dontShowAgain} onCheckedChange={(c) => handleDontShowToggle(!!c)} />
              <label htmlFor="dont-show-hint" className="text-xs text-muted-foreground cursor-pointer select-none">
                Don't show the "Confused? Click here" hint again
              </label>
            </div>
            <ul className="space-y-2">
              {activeTips.map(({ Icon, glyph, title, body }) => (
                <li key={title} className="flex gap-3 rounded-xl border border-border bg-card/50 p-3">
                  <div className="w-9 h-9 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    {Icon ? <Icon className="h-4 w-4" /> : <span className="text-[13px] font-semibold leading-none">{glyph}</span>}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
