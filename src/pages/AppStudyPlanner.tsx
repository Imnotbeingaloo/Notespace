import { useNavigate, Navigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { StudyPlanner } from "@/components/StudyPlanner";
import { useAuth } from "@/context/AuthContext";
import { NotebookProvider } from "@/context/NotebookContext";
import { NoindexHead } from "@/components/NoindexHead";

function StudyPlannerContent() {
  const navigate = useNavigate();
  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      <NoindexHead title="Study Planner · Notespace" />
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border shrink-0">
        <button
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/home"))}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
      </div>
      <div className="flex-1 flex min-h-0">
        <StudyPlanner
          showClose={false}
          onClose={() => (window.history.length > 1 ? navigate(-1) : navigate("/home"))}
        />
      </div>
    </div>
  );
}

export default function AppStudyPlannerPage() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  if (!user) {
    const from = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/auth" replace state={{ from }} />;
  }

  return (
    <NotebookProvider>
      <StudyPlannerContent />
    </NotebookProvider>
  );
}
