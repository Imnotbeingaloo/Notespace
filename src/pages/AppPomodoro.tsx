import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { useAuth } from "@/context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { NoindexHead } from "@/components/NoindexHead";

export default function AppPomodoroPage() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-background flex flex-col">
      <NoindexHead title="Pomodoro · Notespace" />
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
        <button
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/home"))}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        <h1 className="ml-2 font-serif text-sm font-bold text-foreground">Pomodoro</h1>
      </div>
      <div className="flex-1 flex items-start justify-center px-4 py-6 sm:py-10">
        <PomodoroTimer variant="inline" />
      </div>
    </div>
  );
}
