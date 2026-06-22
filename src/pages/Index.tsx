import { useState, useCallback, useEffect, useRef } from "react";
import { NotebookProvider } from "@/context/NotebookContext";
import { AppSidebar } from "@/components/AppSidebar";
import { NoteEditor } from "@/components/NoteEditor";
import { StudyPlanner } from "@/components/StudyPlanner";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { useAuth } from "@/context/AuthContext";
import { Navigate, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { CalendarDays, Loader2, Maximize2, Minimize2, Timer } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { OnboardingHelp } from "@/components/OnboardingHelp";
import { SplashScreen } from "@/components/SplashScreen";
import { HomeView } from "@/components/HomeView";
import { LoadingScreen } from "@/components/LoadingScreen";
import { CreateNotebookDialog } from "@/components/CreateNotebookDialog";
import { NewNotePrompt } from "@/components/NewNotePrompt";
import { RenameDuplicateDialog } from "@/components/RenameDuplicateDialog";
import { useTempNotesEnabled } from "@/hooks/use-temp-notes-enabled";

import { useNotebooks } from "@/context/NotebookContext";

function AppContent() {
  const [tempNotesEnabled] = useTempNotesEnabled();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth >= 768;
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [pomodoroOpen, setPomodoroOpen] = useState(false);

  const [findReplaceOpen, setFindReplaceOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const urlNotebook = searchParams.get("notebook");
  const urlNote = searchParams.get("note");
  // /home → Home view; /app → editor (unless no deep link, then Home)
  const isHomeRoute = location.pathname === "/home";
  const [showHome, setShowHome] = useState(isHomeRoute || !urlNotebook);
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
  const { setActiveNotebookId, setActiveNoteId, notebooks, activeNotebookId, activeNoteId, loading: notebooksLoading, refreshData, createScratchNote, createStandaloneNote, isScratchNotebook, moveNoteToNotebook, activeNote, activeNotebook, updateNote, createNotebook, createNote } = useNotebooks();

  // Dynamic browser tab title — reflects the current note / notebook / view
  useEffect(() => {
    const base = "Notebook Archive";
    let title = base;
    if (showHome) {
      title = `Home · ${base}`;
    } else if (activeNote?.title && activeNotebook?.name) {
      title = `${activeNote.title} — ${activeNotebook.name} · ${base}`;
    } else if (activeNotebook?.name) {
      title = `${activeNotebook.name} · ${base}`;
    }
    document.title = title;
    return () => {
      document.title = base;
    };
  }, [showHome, activeNote?.title, activeNotebook?.name]);

  const hydratingDeepLink = !!urlNotebook && notebooksLoading && !notebooks.find((n) => n.id === urlNotebook);
  const deepLinkMissing = !!urlNotebook && !notebooksLoading && !notebooks.find((n) => n.id === urlNotebook);
  const [retryingDeepLink, setRetryingDeepLink] = useState(false);
  const lastHydratedUrlRef = useRef<string | null>(null);
  const [scratchLeavePending, setScratchLeavePending] = useState<null | { fromNotebookId: string; noteId: string; targetView: () => void }>(null);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [homeCreateKind, setHomeCreateKind] = useState<null | "notebook" | "note">(null);

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
    const next = new URLSearchParams(searchParams);
    if (activeNotebookId) next.set("notebook", activeNotebookId);
    else next.delete("notebook");
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
    navigate("/home", { replace: false });
  }, [isMobile, navigate]);

  // React to route changes: switching to /home forces Home view, /app shows editor when a notebook is selected.
  useEffect(() => {
    if (location.pathname === "/home") setShowHome(true);
    else if (location.pathname === "/app" && urlNotebook) setShowHome(false);
  }, [location.pathname, urlNotebook]);

  const openNotebookFromHome = useCallback(
    (notebookId: string) => {
      setOpening(true);
      setActiveNotebookId(notebookId);
      const nb = notebooks.find((n) => n.id === notebookId);
      const firstNoteId = nb?.notes?.[0]?.id ?? null;
      setActiveNoteId(firstNoteId);
      setShowHome(false);
      const params = new URLSearchParams();
      params.set("notebook", notebookId);
      if (firstNoteId) params.set("note", firstNoteId);
      navigate(`/app?${params.toString()}`);
      window.setTimeout(() => setOpening(false), 700);
    },
    [setActiveNotebookId, setActiveNoteId, notebooks, navigate]
  );

  const openNoteFromHome = useCallback(
    (notebookId: string | null, noteId: string) => {
      setOpening(true);
      setActiveNotebookId(notebookId);
      setActiveNoteId(noteId);
      setShowHome(false);
      const params = new URLSearchParams();
      if (notebookId) params.set("notebook", notebookId);
      params.set("note", noteId);
      navigate(`/app?${params.toString()}`);
      window.setTimeout(() => setOpening(false), 500);
    },
    [setActiveNotebookId, setActiveNoteId, navigate]
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setFocusMode((p) => !p)}
                    variant={focusMode ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8 rounded-xl shrink-0"
                    aria-label={focusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
                  >
                    {focusMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{focusMode ? "Exit Focus Mode" : "Focus Mode"}</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setPomodoroOpen((p) => !p)}
                    variant={pomodoroOpen ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8 rounded-xl shrink-0"
                    aria-label={pomodoroOpen ? "Hide Pomodoro Timer" : "Show Pomodoro Timer"}
                  >
                    <Timer className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{pomodoroOpen ? "Hide Pomodoro" : "Pomodoro Timer"}</p>
                </TooltipContent>
              </Tooltip>
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
            ) : homeCreateKind === "note" ? (
              <NewNotePrompt
                notebookName="New Note"
                notebookEmoji="📝"
                noteCount={0}
                onCreateNew={async (title?: string, content?: string) => {
                  setHomeCreateKind(null);
                  setOpening(true);
                  try {
                    const created = await createStandaloneNote(title, undefined);
                    if (created) {
                      if (content) {
                        await updateNote(created.noteId, { content });
                      }
                      setShowHome(false);
                      const next = new URLSearchParams(searchParams);
                      next.delete("notebook");
                      next.set("note", created.noteId);
                      setSearchParams(next, { replace: true });
                    }
                  } finally {
                    window.setTimeout(() => setOpening(false), 400);
                  }
                }}
                onImportAndCreate={async (content: string, fileName: string) => {
                  setHomeCreateKind(null);
                  setOpening(true);
                  try {
                    const baseTitle = fileName.replace(/\.[^.]+$/, "") || "Imported Note";
                    const created = await createStandaloneNote(baseTitle, undefined);
                    if (created) {
                      await updateNote(created.noteId, { content });
                      setShowHome(false);
                      const next = new URLSearchParams(searchParams);
                      next.delete("notebook");
                      next.set("note", created.noteId);
                      setSearchParams(next, { replace: true });
                    }
                  } finally {
                    window.setTimeout(() => setOpening(false), 400);
                  }
                }}
              />
            ) : showHome ? (
              <HomeView
                onOpenNotebook={openNotebookFromHome}
                onOpenNote={openNoteFromHome}
                onCreateNotebookDirect={() => setHomeCreateKind("notebook")}
                onCreateNoteDirect={() => setHomeCreateKind("note")}
                onCreateScratchNote={tempNotesEnabled ? () => navigate("/app/temporary") : undefined}
                onCreateSimpleNote={() => setCreateMenuOpen(true)}
                onExitToWebsite={handleExitToWebsite}
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

      {/* Unified Create dialog — choose Note or Notebook in one popup */}
      <CreateNotebookDialog
        mode="choose"
        open={createMenuOpen}
        onOpenChange={setCreateMenuOpen}
        onCreateNotebook={async (name, emoji) => {
          const id = await createNotebook(name, emoji);
          if (id) {
            setCreateMenuOpen(false);
            openNotebookFromHome(id);
          }
        }}
        onCreateNote={async (name, emoji) => {
          setCreateMenuOpen(false);
          setOpening(true);
          try {
            const created = await createStandaloneNote(name, emoji);
            if (created) {
              const { noteId } = created;
              setShowHome(false);
              const next = new URLSearchParams(searchParams);
              next.delete("notebook");
              next.set("note", noteId);
              setSearchParams(next, { replace: true });
            }
          } finally {
            window.setTimeout(() => setOpening(false), 400);
          }
        }}
      />

      {/* Global duplicate-title prompt (note move/rename) */}
      {/* Home dropdown — single-kind create dialog (Notebook OR Note picked from dropdown) */}
      <CreateNotebookDialog
        mode="single"
        kind={homeCreateKind ?? "notebook"}
        open={!!homeCreateKind}
        onOpenChange={(o) => !o && setHomeCreateKind(null)}
        onCreate={async (name, emoji) => {
          if (homeCreateKind === "note") {
            setHomeCreateKind(null);
            setOpening(true);
            try {
              const created = await createStandaloneNote(name, emoji);
              if (created) {
                setShowHome(false);
                const next = new URLSearchParams(searchParams);
                next.delete("notebook");
                next.set("note", created.noteId);
                setSearchParams(next, { replace: true });
              }
            } finally {
              window.setTimeout(() => setOpening(false), 400);
            }
          } else {
            const id = await createNotebook(name, emoji);
            setHomeCreateKind(null);
            if (id) openNotebookFromHome(id);
          }
        }}
      />

      <RenameDuplicateDialog />

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
