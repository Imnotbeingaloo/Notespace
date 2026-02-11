import { useState } from "react";
import { NotebookProvider } from "@/context/NotebookContext";
import { AppSidebar } from "@/components/AppSidebar";
import { NoteEditor } from "@/components/NoteEditor";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const AppPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((p) => !p)} />
        <NoteEditor />
      </div>
    </NotebookProvider>
  );
};

export default AppPage;
