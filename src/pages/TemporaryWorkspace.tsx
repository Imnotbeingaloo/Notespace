import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, FolderPlus, FolderInput, Loader2, Trash, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { NotebookProvider, useNotebooks, type Note } from "@/context/NotebookContext";
import { NoteEditor } from "@/components/NoteEditor";
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
import { toast } from "@/components/ui/sonner";

interface TempRow {
  id: string;
  title: string;
  content: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

function formatRemaining(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "Expired";
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

function TemporaryWorkspaceInner() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notebooks, createNotebook, createNote, setOverride } = useNotebooks();

  const [row, setRow] = useState<TempRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [remaining, setRemaining] = useState("24h 00m");
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [chosenNotebookId, setChosenNotebookId] = useState<string>("");
  const [permDrawerOpen, setPermDrawerOpen] = useState(false);
  const [working, setWorking] = useState(false);
  const dirtyRef = useRef(false);
  const skipGuardRef = useRef(false);
  const saveTimerRef = useRef<number | null>(null);
  const rowRef = useRef<TempRow | null>(null);
  rowRef.current = row;

  // Load or create the temp row
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: existing } = await supabase
        .from("temporary_notes")
        .select("*")
        .gt("expires_at", new Date().toISOString())
        .order("updated_at", { ascending: false })
        .limit(1);
      if (cancelled) return;
      let r = existing?.[0] as TempRow | undefined;
      if (!r) {
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
        r = inserted as TempRow;
      }
      if (!cancelled) { setRow(r); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [user, navigate]);

  // Persist updates with debounce
  const persist = useCallback((updates: Partial<TempRow>) => {
    const cur = rowRef.current;
    if (!cur) return;
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      supabase.from("temporary_notes").update(updates).eq("id", cur.id).then(() => {});
    }, 500);
  }, []);

  // Register override note so NoteEditor renders the temp note
  useEffect(() => {
    if (!row) return;
    const note: Note = {
      id: row.id,
      notebook_id: null,
      title: row.title,
      content: row.content,
      attachments: [],
      tags: [],
      created_at: row.created_at,
      updated_at: row.updated_at,
      deleted_at: null,
    };
    setOverride({
      note,
      onUpdate: (updates) => {
        dirtyRef.current = true;
        setRow((prev) => prev ? { ...prev, ...updates } as TempRow : prev);
        const { attachments, tags, ...persistable } = updates as any;
        persist(persistable);
      },
    });
    return () => setOverride(null);
  }, [row?.id, setOverride, persist]);

  // Countdown
  useEffect(() => {
    if (!row) return;
    const tick = () => setRemaining(formatRemaining(row.expires_at));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [row?.expires_at]);

  const hasContent = !!(row && (row.content.trim() || row.title.trim() !== "Temporary Note"));

  // Back-button & tab-close guards
  useEffect(() => {
    if (!hasContent) return;
    window.history.pushState({ tempGuard: true }, "");
    const onPop = () => {
      if (!hasContent || skipGuardRef.current) return;
      window.history.pushState({ tempGuard: true }, "");
      setLeaveOpen(true);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [hasContent]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasContent) { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasContent]);

  const handleExitClick = () => {
    if (hasContent) setLeaveOpen(true);
    else {
      if (row) supabase.from("temporary_notes").delete().eq("id", row.id).then(() => {});
      skipGuardRef.current = true;
      navigate("/app");
    }
  };

  const handleSaveAsNotebook = async () => {
    if (!row) return;
    setWorking(true);
    const nbName = (row.title || "Saved Note").slice(0, 60);
    const newNbId = await createNotebook(nbName);
    if (newNbId) {
      const noteId = await createNote(newNbId, row.title || "Untitled", row.content);
      await supabase.from("temporary_notes").delete().eq("id", row.id);
      toast.success("Saved as a new notebook.");
      skipGuardRef.current = true;
      navigate(`/app?notebook=${newNbId}${noteId ? `&note=${noteId}` : ""}`, { replace: true });
    } else {
      toast.error("Couldn't create the notebook.");
    }
    setWorking(false);
  };

  const handleSaveIntoExisting = async () => {
    if (!row || !chosenNotebookId) return;
    setWorking(true);
    const noteId = await createNote(chosenNotebookId, row.title || "Untitled", row.content);
    await supabase.from("temporary_notes").delete().eq("id", row.id);
    toast.success("Saved into notebook.");
    setPickerOpen(false);
    skipGuardRef.current = true;
    navigate(`/app?notebook=${chosenNotebookId}${noteId ? `&note=${noteId}` : ""}`, { replace: true });
    setWorking(false);
  };

  const handleDiscard = async () => {
    if (!row) return;
    setWorking(true);
    await supabase.from("temporary_notes").delete().eq("id", row.id);
    toast("Temporary note discarded.");
    skipGuardRef.current = true;
    navigate("/app", { replace: true });
    setWorking(false);
  };

  if (loading || !row) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
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
            <span className="group inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-300 cursor-default">
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
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </TooltipProvider>

      {/* Full NoteEditor — receives the override note from context */}
      <div className="flex-1 flex flex-col min-h-0 pt-14">
        <NoteEditor />
      </div>

      {/* Leave confirmation dialog */}
      <Dialog open={leaveOpen} onOpenChange={setLeaveOpen}>
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
              onClick={handleDiscard}
              disabled={working}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-60"
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

export default function TemporaryWorkspace() {
  return (
    <NotebookProvider>
      <TemporaryWorkspaceInner />
    </NotebookProvider>
  );
}
