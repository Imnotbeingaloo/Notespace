import { useState } from "react";
import { NotebookProvider } from "@/context/NotebookContext";
import { AppSidebar } from "@/components/AppSidebar";
import { NoteEditor } from "@/components/NoteEditor";
import { StudyPlanner } from "@/components/StudyPlanner";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { CalendarDays, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const AppPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);
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

        {/* Sidebar: overlay on mobile, inline on desktop */}
        <div
          className={`${
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
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
            <div>
              {isMobile && !sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                  Open Sidebar
                </button>
              )}
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
            {/* Study Planner panel — full overlay on mobile/tablet, inline side panel on desktop */}
            <AnimatePresence>
              {plannerOpen && (
                <div className="fixed inset-0 z-50 bg-card lg:relative lg:inset-auto lg:bg-transparent lg:z-auto">
                  <StudyPlanner onClose={() => setPlannerOpen(false)} />
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
