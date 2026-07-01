import { useState, useEffect, useRef } from "react";
import { HelpCircle, Highlighter, Code, Link2, Image as ImageIcon, Minus, Table2, Search, Maximize2, Timer, ArrowRight, TableProperties, BookOpen, FileText, Plus, Upload, Tag, CalendarDays, Sparkles, Keyboard, Settings as SettingsIcon, Trash2, Menu, Bell, Mic, Layers, Share2, Wand2, Languages, ClipboardType } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/sonner";
import { AnimatePresence, motion } from "framer-motion";

type Tip = { Icon?: React.ElementType; glyph?: string; title: string; body: string; accent?: "flashcards" };
type Section = { id: string; label: string; tips: Tip[] };

const sections: Section[] = [
  {
    id: "toolbar",
    label: "Editor",
    tips: [
      { Icon: Highlighter, title: "Highlight", body: "Paints a yellow highlight behind selected text - great for marking key passages." },
      { Icon: Code, title: "Inline code", body: "Wraps the selection in a monospaced code style. Use for variable names, file paths, or short snippets." },
      { Icon: Link2, title: "Insert link", body: "Highlight text first, then click. The title pre-fills with your selection - just paste the URL." },
      { Icon: ImageIcon, title: "Insert image", body: "Opens your file picker. Images upload to private storage and embed inline. PNG, JPG, WEBP up to 10MB." },
      { Icon: Minus, title: "Divider", body: "Drops a horizontal rule to break sections - useful between topics or before a summary." },
      { Icon: Table2, title: "Table", body: "Pick a size from the popover. The table edit toolbar appears once your cursor is inside." },
      { Icon: TableProperties, title: "Edit table", body: "When inside a table, the table toolbar appears next to the main one - add/remove rows & columns inline." },
      { glyph: "Ω", title: "Insert symbol", body: "Picker for math symbols, arrows, currency, and Greek letters. Click any glyph to drop it at your cursor." },
      { glyph: "#", title: "Markdown shortcuts", body: "Type `# `, `## `, `### `, `- `, `1. `, `> ` and they convert as you finish typing." },
    ],
  },
  {
    id: "sidebar",
    label: "Sidebar",
    tips: [
      { Icon: BookOpen, title: "Notebooks", body: "Notebooks group related notes. Orange accent + book icon. Click the chevron to expand or collapse - independent of selection." },
      { Icon: FileText, title: "Standalone notes", body: "Top-level notes that don't belong to a notebook. Sky-blue accent + file icon." },
      { Icon: Plus, title: "Create", body: "One button for everything. Choose Notebook, Note, or paste in from a file." },
      { Icon: Upload, title: "Upload", body: "Drop in PDF, EPUB, DOCX, TXT, MD, CSV, JSON or images up to 1GB. Text extracted automatically." },
      { Icon: Tag, title: "Smart Tags", body: "Tags aggregate across every notebook. Click a tag to filter notes that carry it." },
      { Icon: CalendarDays, title: "Study schedule", body: "Upcoming study plans for the next 3 days surface here." },
      { Icon: Trash2, title: "Trash", body: "Deleted notes/notebooks live here for 30 days. Restore or permanently delete." },
      { Icon: Menu, title: "Collapse", body: "Hamburger collapses the sidebar to an icon strip. Hover the logo to expand again." },
      { Icon: Share2, title: "Share notes", body: "Public link or share by email. Public links can be toggled discoverable/hidden from search engines." },
    ],
  },
  {
    id: "ai",
    label: "AI",
    tips: [
      { Icon: Sparkles, title: "Ask AI", body: "Side panel with two modes. Edit rewrites your selection in place; Explain answers questions about the note. Three quick-action chips above the bar cover the common asks." },
      { Icon: Wand2, title: "AI Edit intents", body: "Type verbs like rewrite, fix, shorten, expand, simplify, translate, or convert in Explain mode and Ask AI automatically routes them to the edit engine." },
      { Icon: ClipboardType, title: "Auto-format on paste", body: "Paste plain text over 200 characters and the editor offers to format it with AI - headings, lists, structure - with a live progress toast." },
      { Icon: Mic, title: "Voice transcription", body: "Mic button records, transcribes with Whisper, and cleans it up with an LLM. The result is inserted exactly where your cursor was blinking. Word-level timestamps available." },
      { Icon: Layers, title: "Flashcards", body: "Generate a deck from any note. Grade each card Correct or Wrong with a swipe-style animation; the deck reshuffles what you got wrong.", accent: "flashcards" },
      { Icon: BookOpen, title: "Explain topic", body: "Highlight a term or phrase and open the Explain panel for a streamed, in-depth explanation without leaving your note." },
      { Icon: Languages, title: "Summarize & analyze", body: "Ask AI can summarize key points, extract action items, list what's missing, or analyze structure - all grounded in the current note." },
    ],
  },
  {
    id: "focus",
    label: "Focus",
    tips: [
      { Icon: Search, title: "Find & Replace", body: "Press ⌘F (or Ctrl+F) inside a note to search and replace. Supports regex via the toggle." },
      { Icon: Maximize2, title: "Focus Mode", body: "Top bar button - hides the sidebar and chrome so only your note remains." },
      { Icon: Timer, title: "Pomodoro Timer", body: "25-minute work + 5-minute break sessions in a floating corner widget." },
      { Icon: Keyboard, title: "Shortcuts", body: "Press ⌘? (or Ctrl+?) anywhere for the full shortcut sheet." },
      { Icon: SettingsIcon, title: "Settings", body: "Theme, paper style, word-count goal, temporary notes, and account controls in the gear icon." },
    ],
  },
];

const DISMISS_KEY = "onboarding-hint-dismissed";
const SESSION_COUNT_KEY = "onboarding-hint-session-count";
const FIRST_SEEN_KEY = "onboarding-hint-first-seen-at";
// Only treat the user as "new" within this window. After it expires the hint stops appearing.
const NEW_USER_WINDOW_MS = 60 * 60 * 1000; // 1 hour
// Escalating idle thresholds: 1st = 5s, 2nd = 15s, 3rd = 30s, then stop.
const IDLE_STEPS = [5000, 15000, 30000];
const SHOW_MS = 3500;

export function OnboardingHelp() {
  const [open, setOpen] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const idleTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const dismissedRef = useRef(false);
  const sessionCountRef = useRef(0);
  const openRef = useRef(false);

  const clearIdle = () => { if (idleTimerRef.current) { window.clearTimeout(idleTimerRef.current); idleTimerRef.current = null; } };
  const clearHide = () => { if (hideTimerRef.current) { window.clearTimeout(hideTimerRef.current); hideTimerRef.current = null; } };

  const armIdle = () => {
    clearIdle();
    if (dismissedRef.current || openRef.current) return;
    const step = sessionCountRef.current;
    if (step >= IDLE_STEPS.length) return;
    const delay = IDLE_STEPS[step];
    idleTimerRef.current = window.setTimeout(() => {
      idleTimerRef.current = null;
      if (dismissedRef.current || openRef.current) return;
      setHintOpen(true);
      sessionCountRef.current = step + 1;
      try { sessionStorage.setItem(SESSION_COUNT_KEY, String(sessionCountRef.current)); } catch {}
      clearHide();
      hideTimerRef.current = window.setTimeout(() => {
        setHintOpen(false);
        hideTimerRef.current = null;
      }, SHOW_MS);
    }, delay);
  };

  useEffect(() => {
    try {
      // Mark first-seen-at on initial load so we can gate the hint to new users only.
      const firstSeen = localStorage.getItem(FIRST_SEEN_KEY);
      if (!firstSeen) {
        localStorage.setItem(FIRST_SEEN_KEY, String(Date.now()));
      } else if (Date.now() - parseInt(firstSeen, 10) > NEW_USER_WINDOW_MS) {
        // Not a new user anymore - permanently silence the idle hint.
        dismissedRef.current = true;
        localStorage.setItem(DISMISS_KEY, "1");
      }
      if (localStorage.getItem(DISMISS_KEY) === "1") { dismissedRef.current = true; setDontShowAgain(true); }
      const c = parseInt(sessionStorage.getItem(SESSION_COUNT_KEY) ?? "0", 10);
      if (!Number.isNaN(c)) sessionCountRef.current = c;
    } catch {}
  }, []);

  useEffect(() => { openRef.current = open; }, [open]);

  useEffect(() => {
    if (dismissedRef.current) return;
    const onActivity = () => { if (!dismissedRef.current) armIdle(); };
    const events = ["keydown", "click", "touchstart", "pointerdown", "mousemove"];
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    armIdle();
    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      clearIdle(); clearHide();
    };
  }, []);

  const dismissForever = () => {
    dismissedRef.current = true;
    try { localStorage.setItem(DISMISS_KEY, "1"); } catch {}
    setHintOpen(false);
    clearIdle(); clearHide();
  };

  const handleDontShowToggle = (checked: boolean) => {
    setDontShowAgain(checked);
    if (checked) {
      dismissedRef.current = true;
      try { localStorage.setItem(DISMISS_KEY, "1"); } catch {}
    } else {
      dismissedRef.current = false;
      try { localStorage.removeItem(DISMISS_KEY); } catch {}
    }
  };

  const handleHelpClick = () => {
    try { setDontShowAgain(localStorage.getItem(DISMISS_KEY) === "1"); } catch {}
    setHintOpen(false);
    setOpen(true);
  };

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
              <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }} className="inline-flex text-primary">
                <ArrowRight className="h-3.5 w-3.5" />
              </motion.span>
            </motion.button>
          )}
        </AnimatePresence>
        <Button onClick={handleHelpClick} variant="ghost" size="icon" className="h-8 w-8 rounded-xl shrink-0 text-muted-foreground hover:text-foreground" aria-label="Help">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </div>

      <div className="md:hidden">
        {/* Top-right floating help. Sits above the editor chrome but offset so
            it never overlaps the back button, AI buttons, or attach controls. */}
        <div
          className="fixed z-40 right-3 flex flex-col items-end pointer-events-none"
          style={{ top: "calc(env(safe-area-inset-top, 0px) + 0.625rem)" }}
        >
          <Button
            onClick={handleHelpClick}
            variant="default"
            size="icon"
            className="h-10 w-10 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 pointer-events-auto"
            aria-label="Help"
            data-testid="onboarding-help-mobile"
          >
            <HelpCircle className="h-[18px] w-[18px]" />
          </Button>
          <AnimatePresence>
            {hintOpen && (
              <motion.button type="button" key="hint-mobile" onClick={dismissForever}
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className="mt-1.5 text-[11px] font-medium text-foreground/80 whitespace-nowrap pointer-events-auto bg-background/80 backdrop-blur px-2 py-0.5 rounded-md">
                Confused? Tap here
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>



      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col gap-4">
          <DialogHeader className="text-left">
            <DialogTitle className="font-serif text-2xl">Quick guide</DialogTitle>
            <DialogDescription>A walkthrough of the parts of the app that aren't obvious.</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue={sections[0].id} className="flex-1 flex flex-col min-h-0">
            <TabsList className="w-full grid grid-cols-4">
              {sections.map((s) => (
                <TabsTrigger key={s.id} value={s.id} className="text-xs sm:text-sm">{s.label}</TabsTrigger>
              ))}
            </TabsList>

            {sections.map((s) => (
              <TabsContent key={s.id} value={s.id} className="flex-1 min-h-0 overflow-y-auto pr-1 mt-3 scrollbar-thin">
                <ul className="space-y-2">
                  {s.tips.map(({ Icon, glyph, title, body, accent }) => (
                    <li key={title} className="flex gap-3 rounded-xl border border-border bg-card/50 p-3">
                      <div className={
                        accent === "flashcards"
                          ? "w-9 h-9 shrink-0 rounded-lg bg-[hsl(280_60%_55%/0.15)] text-[hsl(280_65%_60%)] flex items-center justify-center"
                          : "w-9 h-9 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center"
                      }>
                        {Icon ? <Icon className="h-4 w-4" /> : <span className="text-base font-medium leading-none">{glyph}</span>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </TabsContent>
            ))}
          </Tabs>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 flex-1">
              <Checkbox id="dont-show-hint" checked={dontShowAgain} onCheckedChange={(c) => handleDontShowToggle(!!c)} />
              <label htmlFor="dont-show-hint" className="text-xs text-muted-foreground cursor-pointer select-none">
                Don't show the "Confused? Click here" hint again
              </label>
            </div>
            {import.meta.env.DEV && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 shrink-0"
              data-testid="test-notifications-btn"
              onClick={() => {
                const variants = [
                  () => toast.success("Changes saved", { description: "Your note was saved successfully." }),
                  () => toast.error("Link has expired", {
                    description: "The share link you tried to open is no longer active.",
                    action: { label: "Get new link", onClick: () => {} },
                  }),
                  () => toast.warning("Broken link", { description: "One of the links in this note didn't resolve." }),
                  () => toast.info("Links imported", { description: "Your import finished without errors." }),
                ];
                variants.forEach((fire, i) => setTimeout(fire, i * 350));
              }}
            >
              <Bell className="h-3.5 w-3.5" />
              Test notifications
            </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
