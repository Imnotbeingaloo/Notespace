import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Download, FolderPlus, FolderInput, Loader2, Trash, X, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { NotebookProvider, useNotebooks } from "@/context/NotebookContext";
import { HybridEditor, type HybridEditorHandle } from "@/components/HybridEditor";
import { ScratchIcon } from "@/components/ScratchIcon";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

interface TempNote {
  id: string;
  title: string;
  content: string;
  expires_at: string;
}

function formatRemaining(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "Expired";
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

function downloadMarkdown(title: string, content: string) {
  const blob = new Blob([`# ${title}\n\n${content}`], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title || "temporary-note"}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

function TemporaryWorkspaceInner() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notebooks, createNotebook, createNote, updateNote } = useNotebooks();

  const [note, setNote] = useState<TempNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [remaining, setRemaining] = useState("24h 00m");
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [chosenNotebookId, setChosenNotebookId] = useState<string>("");
  const [permDrawerOpen, setPermDrawerOpen] = useState(false);
  const [working, setWorking] = useState(false);
  const editorRef = useRef<HybridEditorHandle>(null);
  const dirtyRef = useRef(false);
  const skipGuardRef = useRef(false);
  const saveTimerRef = useRef<number | null>(null);

  // Create / load the temp note on mount
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      // Reuse the most recent non-expired temp note in this session, else create new
      const { data: existing } = await supabase
        .from("temporary_notes")
        .select("*")
        .gt("expires_at", new Date().toISOString())
        .order("updated_at", { ascending: false })
        .limit(1);

      if (cancelled) return;

      let row = existing?.[0] as TempNote | undefined;
      if (!row) {
        const { data: inserted, error } = await supabase
          .from("temporary_notes")
          .insert({ user_id: user.id, title: "Temporary Note", content: "" })
          .select()
          .single();
        if (error) {
          toast.error("Couldn't start a temporary note.");
          navigate("/app", { replace: true });
          return;
        }
        row = inserted as TempNote;
      }
      if (!cancelled) {
        setNote(row);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, navigate]);

  // Live countdown
  useEffect(() => {
    if (!note) return;
    const tick = () => setRemaining(formatRemaining(note.expires_at));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [note]);

  // Debounced autosave
  const persist = useCallback((updates: Partial<TempNote>) => {
    if (!note) return;
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      supabase.from("temporary_notes").update(updates).eq("id", note.id).then(() => {});
    }, 500);
  }, [note]);

  const handleTitleChange = (v: string) => {
    if (!note) return;
    dirtyRef.current = true;
    setNote({ ...note, title: v });
    persist({ title: v });
  };

  const handleContentChange = (v: string) => {
    if (!note) return;
    dirtyRef.current = true;
    setNote({ ...note, content: v });
    persist({ content: v });
  };

  // Router navigation guard via history.pushState + popstate (back button)
  const hasContent = !!(note && (note.content.trim() || note.title.trim() !== "Temporary Note"));
  const pendingPopRef = useRef(false);

  useEffect(() => {
    if (!hasContent) return;
    // Push a sentinel so the first Back press lands here and we can intercept
    window.history.pushState({ tempGuard: true }, "");
    const onPop = (e: PopStateEvent) => {
      if (hasContent) {
        // Re-push to keep user on the page until they choose
        window.history.pushState({ tempGuard: true }, "");
        pendingPopRef.current = true;
        setLeaveOpen(true);
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [hasContent]);

  // Tab-close guard
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasContent) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasContent]);

  const proceedNavigation = () => {
    skipGuardRef.current = true;
    pendingPopRef.current = false;
  };
  const cancelNavigation = () => {
    setLeaveOpen(false);
    pendingPopRef.current = false;
  };

  const handleSaveAsNotebook = async () => {
    if (!note) return;
    setWorking(true);
    const nbName = (note.title || "Saved Note").slice(0, 60);
    const newNbId = await createNotebook(nbName);
    if (newNbId) {
      const noteId = await createNote(newNbId, note.title || "Untitled", note.content);
      await supabase.from("temporary_notes").delete().eq("id", note.id);
      toast.success("Saved as a new notebook.");
      proceedNavigation();
      navigate(`/app?notebook=${newNbId}${noteId ? `&note=${noteId}` : ""}`, { replace: true });
    } else {
      toast.error("Couldn't create the notebook.");
    }
    setWorking(false);
  };

  const handleSaveIntoExisting = async () => {
    if (!note || !chosenNotebookId) return;
    setWorking(true);
    const noteId = await createNote(chosenNotebookId, note.title || "Untitled", note.content);
    await supabase.from("temporary_notes").delete().eq("id", note.id);
    toast.success("Saved into notebook.");
    setPickerOpen(false);
    proceedNavigation();
    navigate(`/app?notebook=${chosenNotebookId}${noteId ? `&note=${noteId}` : ""}`, { replace: true });
    setWorking(false);
  };

  const handleDownload = () => {
    if (!note) return;
    downloadMarkdown(note.title, note.content);
  };

  const handleDiscard = async () => {
    if (!note) return;
    setWorking(true);
    await supabase.from("temporary_notes").delete().eq("id", note.id);
    toast("Temporary note discarded.");
    proceedNavigation();
    navigate("/app", { replace: true });
    setWorking(false);
  };

  const handleExitClick = () => {
    if (hasContent) setLeaveOpen(true);
    else {
      // empty — silently delete and exit
      if (note) supabase.from("temporary_notes").delete().eq("id", note.id).then(() => {});
      skipGuardRef.current = true;
      navigate("/app");
    }
  };

  if (loading || !note) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Floating top cluster */}
      <TooltipProvider delayDuration={150}>
        <div className="fixed top-3 left-3 right-3 z-30 flex items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5 pointer-events-auto bg-background/80 backdrop-blur border border-border rounded-full pl-2 pr-3 py-1.5 shadow-sm">
            <button
              type="button"
              onClick={handleExitClick}
              aria-label="Back to app"
              className="flex items-center gap-1.5 group"
              title="Back to your notebooks"
            >
              <img src="/logo.png" alt="" className="h-6 w-6 object-contain" />
              <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors hidden sm:inline">
                Notebook Archive
              </span>
            </button>
            <span className="text-muted-foreground/40 mx-1">/</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-300">
              <ScratchIcon className="h-3.5 w-3.5" />
              Temporary
            </span>
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-full px-3 py-1.5 text-[11px] font-medium">
              <Clock className="h-3.5 w-3.5" />
              Auto-deletes in {remaining}
            </div>

            <Sheet open={permDrawerOpen} onOpenChange={setPermDrawerOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SheetTrigger asChild>
                    <button
                      aria-label="Browse permanent notes"
                      className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-background border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-sm"
                    >
                      <BookOpen className="h-4 w-4" />
                    </button>
                  </SheetTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">Browse your notebooks</TooltipContent>
              </Tooltip>
              <SheetContent side="right" className="w-[320px] sm:w-[380px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Your notebooks</SheetTitle>
                </SheetHeader>
                <p className="text-xs text-muted-foreground mt-1">Open in a new tab — your temporary work stays untouched.</p>
                <div className="mt-4 space-y-3">
                  {notebooks.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">No notebooks yet.</p>
                  )}
                  {notebooks.map((nb) => (
                    <div key={nb.id} className="rounded-xl border border-border p-3 bg-card">
                      <button
                        type="button"
                        onClick={() => window.open(`/app?notebook=${nb.id}`, "_blank")}
                        className="flex items-center gap-2 w-full text-left"
                      >
                        <span className="text-lg">{nb.emoji}</span>
                        <span className="font-medium text-sm text-foreground truncate flex-1">{nb.name}</span>
                        <span className="text-[10px] text-muted-foreground">{nb.notes?.length ?? 0}</span>
                      </button>
                      {(nb.notes?.length ?? 0) > 0 && (
                        <ul className="mt-2 space-y-1 pl-7">
                          {nb.notes!.slice(0, 5).map((n) => (
                            <li key={n.id}>
                              <button
                                type="button"
                                onClick={() => window.open(`/app?notebook=${nb.id}&note=${n.id}`, "_blank")}
                                className="text-[11px] text-muted-foreground hover:text-primary truncate text-left w-full"
                              >
                                {n.title || "Untitled"}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </TooltipProvider>

      {/* Editor */}
      <div className="max-w-3xl mx-auto pt-20 pb-12 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <input
            value={note.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Temporary note title…"
            className="w-full bg-transparent border-none outline-none font-serif text-3xl sm:text-4xl font-bold text-foreground placeholder:text-muted-foreground/40 mb-2 px-3 sm:px-8"
          />
          <p className="px-3 sm:px-8 text-[11px] text-muted-foreground/70 font-mono mb-4">
            This note will be deleted automatically. Use “Leave” to save it permanently.
          </p>
          <HybridEditor
            ref={editorRef}
            content={note.content}
            onChange={handleContentChange}
            placeholder="Start typing — nothing here is saved permanently…"
          />
        </motion.div>
      </div>

      {/* Leave confirmation dialog */}
      <Dialog open={leaveOpen} onOpenChange={(o) => { if (!o) cancelNavigation(); setLeaveOpen(o); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScratchIcon className="h-5 w-5 text-amber-600" />
              Save before leaving?
            </DialogTitle>
            <DialogDescription>
              This document is temporary and will be deleted in 24 hours. Choose how you'd like to handle it before leaving.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 mt-3">
            <button
              onClick={handleSaveAsNotebook}
              disabled={working}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              <FolderPlus className="h-4 w-4" />
              Save as new notebook
            </button>

            <button
              onClick={() => setPickerOpen(true)}
              disabled={working || notebooks.length === 0}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors disabled:opacity-60"
            >
              <FolderInput className="h-4 w-4" />
              Save into existing notebook
            </button>

            <button
              onClick={handleDownload}
              disabled={working}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors"
            >
              <Download className="h-4 w-4" />
              Download as Markdown
            </button>

            <button
              onClick={handleDiscard}
              disabled={working}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-60"
            >
              <Trash className="h-4 w-4" />
              Discard
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Existing notebook picker */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Pick a notebook</DialogTitle>
            <DialogDescription>The note will be added as a new entry inside the notebook you choose.</DialogDescription>
          </DialogHeader>
          <Select value={chosenNotebookId} onValueChange={setChosenNotebookId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose notebook…" />
            </SelectTrigger>
            <SelectContent>
              {notebooks.map((nb) => (
                <SelectItem key={nb.id} value={nb.id}>
                  {nb.emoji} {nb.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => setPickerOpen(false)}
              className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveIntoExisting}
              disabled={!chosenNotebookId || working}
              className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-60"
            >
              Save here
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function TemporaryWorkspacePage() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  return (
    <NotebookProvider>
      <TemporaryWorkspaceInner />
    </NotebookProvider>
  );
}
