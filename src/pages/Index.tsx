import { useState, useCallback, useEffect, useRef } from "react";
import { NotebookProvider } from "@/context/NotebookContext";
import { AppSidebar } from "@/components/AppSidebar";
import { NoteEditor } from "@/components/NoteEditor";
import { StudyPlanner } from "@/components/StudyPlanner";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { useAuth } from "@/context/AuthContext";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { CalendarDays, Loader2, Crosshair, Minimize2, Timer } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { OnboardingHelp } from "@/components/OnboardingHelp";
import { SplashScreen } from "@/components/SplashScreen";
import { HomeView } from "@/components/HomeView";
import { LoadingScreen } from "@/components/LoadingScreen";
import { CreateNotebookDialog } from "@/components/CreateNotebookDialog";

import { useNotebooks } from "@/context/NotebookContext";

function AppContent() {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth >= 768;
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [pomodoroOpen, setPomodoroOpen] = useState(false);
  const [pomodoroEnabled] = usePomodoroEnabled();
  const [focusAutoOpenPomodoro, setFocusAutoOpenPomodoro] = useFocusAutoOpenPomodoro();
  const [findReplaceOpen, setFindReplaceOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const urlNotebook = searchParams.get("notebook");
  const urlNote = searchParams.get("note");
  // Default to Home view unless a deep link is present
  const [showHome, setShowHome] = useState(!urlNotebook);
  const [opening, setOpening] = useState(false);
  const navigate = useNavigate();

  // Close sidebar when switching into mobile viewport so the
  // backdrop overlay doesn't cover the screen on first mobile render.
  const prevIsMobileRef = useRef<boolean | null>(null);
  useEffect(() => {
    if (prevIsMobileRef.current === null) {
      if (isMobile) setSidebarOpen(false);
    } else if (prevIsMobileRef.current !== isMobile) {
      setSidebarOpen(!isMobile);
    }
    prevIsMobileRef.current = isMobile;
  }, [isMobile]);
  const { setActiveNotebookId, setActiveNoteId, notebooks, activeNotebookId, activeNoteId, loading: notebooksLoading, refreshData, createScratchNote, isScratchNotebook, moveNoteToNotebook, activeNote, activeNotebook, updateNote, createNotebook } = useNotebooks();
  const hydratingDeepLink = !!urlNotebook && notebooksLoading && !notebooks.find((n) => n.id === urlNotebook);
  const deepLinkMissing = !!urlNotebook && !notebooksLoading && !notebooks.find((n) => n.id === urlNotebook);
  const [retryingDeepLink, setRetryingDeepLink] = useState(false);
  const lastHydratedUrlRef = useRef<string | null>(null);
  const [scratchLeavePending, setScratchLeavePending] = useState<null | { fromNotebookId: string; noteId: string; targetView: () => void }>(null);
  const [createNotebookOpen, setCreateNotebookOpen] = useState(false);

  const handleRetryDeepLink = useCallback(async () => {
    setRetryingDeepLink(true);
    try { await refreshData(); } finally { setRetryingDeepLink(false); }
  }, [refreshData]);
  const handleExitToWebsite = useCallback(() => {
    navigate("/", { state: { fromApp: true } });
  }, [navigate]);

  // Hydrate selection from URL ONCE per URL change (not when notebooks length changes,
  // which would otherwise revert a freshly-created notebook back to the old URL value)
  useEffect(() => {
    if (!urlNotebook) return;
    const hydrationKey = `${urlNotebook}|${urlNote ?? ""}`;
    if (lastHydratedUrlRef.current === hydrationKey) return;
    const nb = notebooks.find((n) => n.id === urlNotebook);
    if (!nb) return; // wait until notebooks load
    lastHydratedUrlRef.current = hydrationKey;
    setActiveNotebookId(urlNotebook);
    const target = urlNote && nb.notes.find((x) => x.id === urlNote) ? urlNote : nb.notes[0]?.id ?? null;
    setActiveNoteId(target);
    setShowHome(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlNotebook, urlNote, notebooks.length]);

  // Keep URL in sync when active selection changes (editor mode)
  useEffect(() => {
    if (showHome) return;
    if (!activeNotebookId) return;
    const next = new URLSearchParams(searchParams);
    next.set("notebook", activeNotebookId);
    if (activeNoteId) next.set("note", activeNoteId);
    else next.delete("note");
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNotebookId, activeNoteId, showHome]);

  const openHome = useCallback(() => {
    setShowHome(true);
    if (isMobile) setSidebarOpen(false);
    // Clear deep-link params
    const next = new URLSearchParams(searchParams);
    next.delete("notebook");
    next.delete("note");
    setSearchParams(next, { replace: true });
  }, [isMobile, searchParams, setSearchParams]);

  const openNotebookFromHome = useCallback(
    (notebookId: string) => {
      setOpening(true);
      setActiveNotebookId(notebookId);
      const nb = notebooks.find((n) => n.id === notebookId);
      const firstNoteId = nb?.notes?.[0]?.id ?? null;
      setActiveNoteId(firstNoteId);
      setShowHome(false);
      const next = new URLSearchParams(searchParams);
      next.set("notebook", notebookId);
      if (firstNoteId) next.set("note", firstNoteId);
      else next.delete("note");
      setSearchParams(next, { replace: true });
      window.setTimeout(() => setOpening(false), 700);
    },
    [setActiveNotebookId, setActiveNoteId, notebooks, searchParams, setSearchParams]
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background relative">
      {/* Mobile overlay backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {!focusMode && !showHome && (
          <motion.div
            initial={false}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`overflow-hidden ${
              isMobile
                ? `fixed inset-y-0 left-0 z-40 transition-transform duration-300 ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                  }`
                : ""
            }`}
          >
            <AppSidebar
              collapsed={!isMobile && sidebarCollapsed}
              onToggle={() => isMobile ? setSidebarOpen((p) => !p) : setSidebarCollapsed((p) => !p)}
              onSelectNote={() => { setShowHome(false); if (isMobile) setSidebarOpen(false); }}
              onOpenPlanner={() => setPlannerOpen(true)}
              onOpenHome={() => { if (showHome) { handleExitToWebsite(); } else { openHome(); } }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor / Home */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar — hidden on Home (Home is chrome-free) */}
        {!showHome && (
        <TooltipProvider>
          <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              {!focusMode && isMobile && !sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                  Open Sidebar
                </button>
              )}
            </div>
            <div className="flex items-center gap-1">
              <OnboardingHelp />
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant={focusMode || pomodoroOpen ? "default" : "ghost"}
                        size="sm"
                        className="h-8 rounded-xl shrink-0 gap-1.5 px-2.5"
                      >
                        <Focus className="h-4 w-4" />
                        <span className="hidden sm:inline text-xs font-medium">Focus</span>
                        <ChevronDown className="h-3 w-3 opacity-60" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom"><p>Focus tools</p></TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                    Focus tools
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setFocusMode((p) => {
                        const next = !p;
                        if (pomodoroEnabled && focusAutoOpenPomodoro) setPomodoroOpen(next);
                        else if (!next) setPomodoroOpen(false);
                        return next;
                      });
                    }}
                    className="flex items-start gap-2 cursor-pointer"
                  >
                    {focusMode ? <Minimize2 className="h-4 w-4 mt-0.5 text-primary" /> : <Maximize2 className="h-4 w-4 mt-0.5" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{focusMode ? "Exit Deep Focus" : "Deep Focus"}</p>
                      <p className="text-[11px] text-muted-foreground">Hide sidebar & chrome for distraction-free writing.</p>
                    </div>
                  </DropdownMenuItem>
                  {pomodoroEnabled && (
                    <DropdownMenuItem
                      onSelect={(e) => { e.preventDefault(); setPomodoroOpen((p) => !p); }}
                      className="flex items-start gap-2 cursor-pointer"
                    >
                      <Timer className={`h-4 w-4 mt-0.5 ${pomodoroOpen ? "text-primary" : ""}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{pomodoroOpen ? "Hide Pomodoro" : "Pomodoro Timer"}</p>
                        <p className="text-[11px] text-muted-foreground">25/5 work + break cycles in the corner.</p>
                      </div>
                    </DropdownMenuItem>
                  )}
                  {pomodoroEnabled && (
                    <>
                      <DropdownMenuSeparator />
                      <label className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={focusAutoOpenPomodoro}
                          onChange={(e) => setFocusAutoOpenPomodoro(e.target.checked)}
                          className="h-3.5 w-3.5 rounded border-border accent-primary"
                        />
                        <span>Auto-open Pomodoro in Deep Focus</span>
                      </label>
                    </>
                  )}
                  {!pomodoroEnabled && (
                    <>
                      <DropdownMenuSeparator />
                      <p className="px-2 py-1.5 text-[11px] text-muted-foreground">
                        Enable the Pomodoro timer in Settings → Appearance.
                      </p>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setPlannerOpen((p) => !p)}
                    variant={plannerOpen ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8 rounded-xl shrink-0"
                  >
                    <CalendarDays className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{plannerOpen ? "Close Study Planner" : "Open Study Planner"}</p>
                </TooltipContent>
              </Tooltip>
              <KeyboardShortcuts />
            </div>
          </div>
        </TooltipProvider>
        )}
        <div className="flex-1 flex min-h-0 relative">
          <div className="flex-1 min-w-0 flex flex-col">
            {hydratingDeepLink || retryingDeepLink ? (
              <LoadingScreen label="Opening notebook…" />
            ) : deepLinkMissing ? (
              <div className="flex-1 flex items-center justify-center p-6">
                <div role="alert" className="max-w-sm w-full rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
                  <p className="font-serif text-base font-bold text-foreground mb-1">Couldn't open this notebook</p>
                  <p className="text-xs text-muted-foreground mb-4">It may have been deleted, or there was a connection problem.</p>
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={handleRetryDeepLink} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:opacity-90">Retry</button>
                    <button onClick={openHome} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60">Go Home</button>
                  </div>
                </div>
              </div>
            ) : opening ? (
              <LoadingScreen label="Opening notebook…" />
            ) : showHome ? (
              <HomeView
                onOpenNotebook={openNotebookFromHome}
                onCreateNotebook={() => setCreateNotebookOpen(true)}
                onCreateScratchNote={() => navigate("/app/temporary")}
              />
            ) : (
              <NoteEditor focusMode={focusMode} findReplaceOpen={findReplaceOpen} onFindReplaceChange={setFindReplaceOpen} />
            )}
          </div>
          <AnimatePresence>
            {plannerOpen && (
              <div className="fixed inset-0 z-50 flex justify-end max-lg:bg-card lg:pointer-events-none">
                <div className="w-full lg:w-auto lg:pointer-events-auto">
                  <StudyPlanner onClose={() => setPlannerOpen(false)} />
                </div>
              </div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {pomodoroOpen && (
              <PomodoroTimer onClose={() => setPomodoroOpen(false)} />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Create Notebook dialog (used by topbar button + Home tile) */}
      <CreateNotebookDialog
        open={createNotebookOpen}
        onOpenChange={setCreateNotebookOpen}
        onCreate={async (name, emoji) => {
          const id = await createNotebook(name, emoji);
          if (id) {
            setCreateNotebookOpen(false);
            openNotebookFromHome(id);
          }
        }}
      />

      {/* Temporary-note FAB removed — entry points are sidebar + home button + route */}
    </div>
  );
}

const AppPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [splashDone, setSplashDone] = useState(false);
  const handleSplashComplete = useCallback(() => setSplashDone(true), []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <NotebookProvider>
      {!splashDone && <SplashScreen onComplete={handleSplashComplete} />}
      <AppContent />
    </NotebookProvider>
  );
};

export default AppPage;
