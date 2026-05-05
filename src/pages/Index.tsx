import { useState, useCallback } from "react";
import { NotebookProvider } from "@/context/NotebookContext";
import { AppSidebar } from "@/components/AppSidebar";
import { NoteEditor } from "@/components/NoteEditor";
import { StudyPlanner } from "@/components/StudyPlanner";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { ArrowUpRight, CalendarDays, Home as HomeIcon, Loader2, Maximize2, Minimize2, Timer } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { SplashScreen } from "@/components/SplashScreen";
import { HomeView } from "@/components/HomeView";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Link } from "react-router-dom";
import { useNotebooks } from "@/context/NotebookContext";

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [pomodoroOpen, setPomodoroOpen] = useState(false);
  const [findReplaceOpen, setFindReplaceOpen] = useState(false);
  // Default to Home view
  const [showHome, setShowHome] = useState(true);
  const [opening, setOpening] = useState(false);
  const isMobile = useIsMobile();
  const { setActiveNotebookId, setActiveNoteId, notebooks } = useNotebooks();

  const openHome = useCallback(() => {
    setShowHome(true);
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

  const openNotebookFromHome = useCallback(
    (notebookId: string) => {
      setOpening(true);
      setActiveNotebookId(notebookId);
      const nb = notebooks.find((n) => n.id === notebookId);
      const firstNoteId = nb?.notes?.[0]?.id ?? null;
      setActiveNoteId(firstNoteId);
      setShowHome(false);
      window.setTimeout(() => setOpening(false), 700);
    },
    [setActiveNotebookId, setActiveNoteId, notebooks]
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
        {!focusMode && (
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
              onOpenHome={openHome}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor / Home */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar — minimal, only essential actions */}
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setFocusMode((p) => !p)}
                    variant={focusMode ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8 rounded-xl shrink-0"
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
                  >
                    <Timer className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{pomodoroOpen ? "Close Pomodoro" : "Pomodoro Timer"}</p>
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
              <KeyboardShortcuts />
            </div>
          </div>
        </TooltipProvider>
        <div className="flex-1 flex min-h-0 relative">
          <div className="flex-1 min-w-0 flex flex-col">
            {showHome ? (
              <HomeView onOpenNote={openNoteFromHome} />
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
