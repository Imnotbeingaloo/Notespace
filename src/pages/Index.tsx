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
            collapsed={false}
            onToggle={() => setSidebarOpen((p) => !p)}
            onSelectNote={() => isMobile && setSidebarOpen(false)}
          />
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile top bar */}
          {isMobile && !sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 px-4 py-3 border-b border-border text-sm text-muted-foreground"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              Open Sidebar
            </button>
          )}
          <div className="flex-1 flex min-h-0">
            <div className="flex-1 min-w-0 flex flex-col">
              <NoteEditor />
            </div>
            {/* Study Planner panel */}
            <AnimatePresence>
              {plannerOpen && <StudyPlanner onClose={() => setPlannerOpen(false)} />}
            </AnimatePresence>
          </div>
        </div>

        {/* Floating planner toggle */}
        {!plannerOpen && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setPlannerOpen(true)}
                  size="icon"
                  className="fixed bottom-6 left-6 z-50 h-12 w-12 rounded-2xl shadow-lg shadow-primary/25"
                >
                  <CalendarDays className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Study Planner</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </NotebookProvider>
  );
};

export default AppPage;
