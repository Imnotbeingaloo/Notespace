import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, RotateCcw, BookOpen, FileText, ArrowLeft, Clock, AlertTriangle, CheckSquare, Square } from "lucide-react";
import { NotebookProvider, useNotebooks } from "@/context/NotebookContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const TRASH_EXPIRY_DAYS = 30;

function daysRemaining(deletedAt: string): number {
  const deleted = new Date(deletedAt);
  const expiry = new Date(deleted.getTime() + TRASH_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  const now = new Date();
  return Math.max(0, Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

function formatDeletedDate(d: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(d));
}

type TrashItemId = { type: "notebook"; id: string } | { type: "note"; id: string; notebookId: string };

function TrashPageContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    trashedNotebooks,
    trashedNotes,
    restoreNotebook,
    restoreNote,
    permanentlyDeleteNotebook,
    permanentlyDeleteNote,
  } = useNotebooks();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmDesc, setConfirmDesc] = useState("");
  const [confirmLabel, setConfirmLabel] = useState("Delete");
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) navigate("/auth");
  }, [user, navigate]);

  const showConfirm = (title: string, desc: string, action: () => void, label = "Delete Forever") => {
    setConfirmTitle(title);
    setConfirmDesc(desc);
    setConfirmLabel(label);
    setConfirmAction(() => action);
    setConfirmOpen(true);
  };

  const trashCount = trashedNotebooks.length + trashedNotes.length;

  // Build unique keys for selection
  const nbKey = (id: string) => `nb:${id}`;
  const noteKey = (id: string) => `note:${id}`;

  const allKeys = useMemo(() => {
    const keys = new Set<string>();
    trashedNotebooks.forEach((nb) => keys.add(nbKey(nb.id)));
    trashedNotes.forEach(({ note }) => keys.add(noteKey(note.id)));
    return keys;
  }, [trashedNotebooks, trashedNotes]);

  const allSelected = selected.size > 0 && selected.size === allKeys.size;
  const someSelected = selected.size > 0;

  // Keyboard shortcuts: Ctrl+A to select all, Delete to bulk delete
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        e.preventDefault();
        if (allKeys.size > 0) {
          setSelected((prev) => prev.size === allKeys.size ? new Set() : new Set(allKeys));
        }
      }

      if ((e.key === "Delete" || e.key === "Backspace") && selected.size > 0 && !confirmOpen) {
        e.preventDefault();
        handleBulkDeleteRef.current();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [allKeys, selected.size, confirmOpen]);

  const toggleItem = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allKeys));
    }
  };

  const handleBulkRestore = async () => {
    for (const key of selected) {
      if (key.startsWith("nb:")) {
        await restoreNotebook(key.slice(3));
      } else if (key.startsWith("note:")) {
        const noteId = key.slice(5);
        const found = trashedNotes.find(({ note }) => note.id === noteId);
        if (found) await restoreNote(found.notebookId, noteId);
      }
    }
    setSelected(new Set());
  };

  const handleBulkDelete = () => {
    showConfirm(
      "Delete selected items?",
      `${selected.size} item${selected.size !== 1 ? "s" : ""} will be permanently deleted. This cannot be undone.`,
      async () => {
        for (const key of selected) {
          if (key.startsWith("nb:")) {
            await permanentlyDeleteNotebook(key.slice(3));
          } else if (key.startsWith("note:")) {
            const noteId = key.slice(5);
            const found = trashedNotes.find(({ note }) => note.id === noteId);
            if (found) await permanentlyDeleteNote(found.notebookId, noteId);
          }
        }
        setSelected(new Set());
      },
      "Delete Selected"
    );
  };

  const handleEmptyTrash = () => {
    const parts: string[] = [];
    if (trashedNotebooks.length > 0) parts.push(`${trashedNotebooks.length} notebook${trashedNotebooks.length !== 1 ? "s" : ""}`);
    if (trashedNotes.length > 0) parts.push(`${trashedNotes.length} note${trashedNotes.length !== 1 ? "s" : ""}`);
    const summary = parts.join(" and ");
    showConfirm(
      "Empty Trash?",
      `${summary} will be permanently deleted. This cannot be undone.`,
      async () => {
        for (const nb of trashedNotebooks) {
          await permanentlyDeleteNotebook(nb.id);
        }
        for (const { note, notebookId } of trashedNotes) {
          await permanentlyDeleteNote(notebookId, note.id);
        }
        setSelected(new Set());
      },
      "Empty Trash"
    );
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/app")} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-sans font-bold text-foreground flex items-center gap-2">
              <Trash2 className="h-6 w-6 text-muted-foreground" />
              Trash
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Items are automatically deleted after {TRASH_EXPIRY_DAYS} days.
            </p>
          </div>
          {trashCount > 0 && (
            <Button variant="destructive" size="sm" onClick={handleEmptyTrash}>
              Empty Trash
            </Button>
          )}
        </div>

        {/* Bulk action bar */}
        {trashCount > 0 && (
          <div className="flex items-center gap-3 mb-4 px-1">
            <button
              onClick={toggleAll}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {allSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
              {allSelected ? "Deselect all" : "Select all"}
            </button>
            {someSelected && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-muted-foreground">{selected.size} selected</span>
                <Button variant="outline" size="sm" onClick={handleBulkRestore} className="text-xs gap-1 h-7">
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restore
                </Button>
                <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="text-xs gap-1 h-7">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {trashCount === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-7 w-7 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-medium text-foreground mb-1">Trash is empty</h2>
            <p className="text-sm text-muted-foreground">Items you delete will appear here.</p>
          </motion.div>
        )}

        {/* Trashed Notebooks */}
        {trashedNotebooks.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-1">Notebooks</h2>
            <div className="space-y-2">
              <AnimatePresence>
                {trashedNotebooks.map((nb) => {
                  const days = daysRemaining(nb.deleted_at!);
                  const key = nbKey(nb.id);
                  const isSelected = selected.has(key);
                  return (
                    <motion.div
                      key={nb.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border bg-card transition-colors ${isSelected ? "border-primary/50 bg-primary/5" : "border-border"}`}
                    >
                      <Checkbox checked={isSelected} onCheckedChange={() => toggleItem(key)} className="shrink-0" />
                      <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-base mr-1">{nb.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground truncate">{nb.name}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span>Deleted {formatDeletedDate(nb.deleted_at!)}</span>
                          <span className={`flex items-center gap-1 ${days <= 5 ? "text-destructive" : ""}`}>
                            <Clock className="h-3 w-3" />
                            {days === 0 ? "Expiring today" : `${days}d left`}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => restoreNotebook(nb.id)} className="text-xs gap-1">
                        <RotateCcw className="h-3.5 w-3.5" />
                        Restore
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          showConfirm(
                            "Delete permanently?",
                            `"${nb.name}" and all its notes will be permanently deleted.`,
                            () => permanentlyDeleteNotebook(nb.id)
                          )
                        }
                        className="text-xs text-destructive hover:text-destructive gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Trashed Notes */}
        {trashedNotes.length > 0 && (
          <div>
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-1">Notes</h2>
            <div className="space-y-2">
              <AnimatePresence>
                {trashedNotes.map(({ note, notebookId, notebookName }) => {
                  const days = daysRemaining(note.deleted_at!);
                  const key = noteKey(note.id);
                  const isSelected = selected.has(key);
                  return (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border bg-card transition-colors ${isSelected ? "border-primary/50 bg-primary/5" : "border-border"}`}
                    >
                      <Checkbox checked={isSelected} onCheckedChange={() => toggleItem(key)} className="shrink-0" />
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground truncate">{note.title}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span className="truncate">from {notebookName}</span>
                          <span>· Deleted {formatDeletedDate(note.deleted_at!)}</span>
                          <span className={`flex items-center gap-1 ${days <= 5 ? "text-destructive" : ""}`}>
                            <Clock className="h-3 w-3" />
                            {days === 0 ? "Expiring today" : `${days}d left`}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => restoreNote(notebookId, note.id)} className="text-xs gap-1">
                        <RotateCcw className="h-3.5 w-3.5" />
                        Restore
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          showConfirm(
                            "Delete permanently?",
                            `"${note.title}" will be permanently deleted.`,
                            () => permanentlyDeleteNote(notebookId, note.id)
                          )
                        }
                        className="text-xs text-destructive hover:text-destructive gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Info banner */}
        {trashCount > 0 && (
          <div className="mt-8 flex items-start gap-3 px-4 py-3 rounded-xl bg-muted/50 border border-border">
            <AlertTriangle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Trashed items are automatically and permanently deleted after {TRASH_EXPIRY_DAYS} days. Restore items you want to keep.
            </p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmTitle}
        description={confirmDesc}
        confirmLabel={confirmLabel}
        onConfirm={confirmAction}
      />
    </div>
  );
}

export default function TrashPage() {
  return (
    <NotebookProvider>
      <TrashPageContent />
    </NotebookProvider>
  );
}
