import { useState } from "react";
import { NotebookProvider } from "@/context/NotebookContext";
import { AppSidebar } from "@/components/AppSidebar";
import { NoteEditor } from "@/components/NoteEditor";
import { StudyPlanner } from "@/components/StudyPlanner";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { CalendarDays, Loader2, Maximize2, Minimize2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const AppPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const isMobile = useIsMobile();

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
      <div className="flex h-screen w-full overflow-hidden bg-background relative">
        {/* Mobile overlay backdrop */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar: overlay on mobile, inline on desktop, hidden in focus mode */}
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
                onSelectNote={() => isMobile && setSidebarOpen(false)}
                onOpenPlanner={() => setPlannerOpen(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              {focusMode && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setFocusMode(false)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-xl shrink-0"
                    >
                      <Minimize2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Exit Focus Mode</p>
                  </TooltipContent>
                </Tooltip>
              )}
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
            <TooltipProvider>
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
            </TooltipProvider>
          </div>
          <div className="flex-1 flex min-h-0 relative">
            <div className="flex-1 min-w-0 flex flex-col">
              <NoteEditor />
            </div>
            {/* Study Planner panel — overlays on top so editor layout never resizes */}
            <AnimatePresence>
              {plannerOpen && (
                <div className="fixed inset-0 z-50 flex justify-end max-lg:bg-card lg:pointer-events-none">
                  <div className="w-full lg:w-auto lg:pointer-events-auto">
                    <StudyPlanner onClose={() => setPlannerOpen(false)} />
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </NotebookProvider>
  );
};

export default AppPage;
