import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, RotateCcw, BookOpen, FileText, ArrowLeft, Clock, AlertTriangle, CheckSquare, Square, Sparkles } from "lucide-react";
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

function UrgencyBadge({ days }: { days: number }) {
  if (days <= 3) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-destructive/15 text-destructive border border-destructive/20">
        <Clock className="h-3 w-3" />
        {days === 0 ? "Expiring today" : `${days}d left`}
      </span>
    );
  }
  if (days <= 10) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/20">
        <Clock className="h-3 w-3" />
        {days}d left
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border border-border">
      <Clock className="h-3 w-3" />
      {days}d left
    </span>
  );
}

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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        e.preventDefault();
        if (allKeys.size > 0) {
          setSelected((prev) => prev.size === allKeys.size ? new Set() : new Set(allKeys));
        }
      }
      if ((e.key === "Delete" || e.key === "Backspace") && someSelected && !confirmOpen) {
        e.preventDefault();
        handleBulkDelete();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [allKeys, someSelected, confirmOpen, handleBulkDelete]);

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
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/app")}
              className="shrink-0 rounded-xl hover:bg-muted"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-sans font-bold text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-destructive" />
                </div>
                Trash
              </h1>
              <p className="text-sm text-muted-foreground mt-2 ml-[52px]">
                Items are automatically deleted after {TRASH_EXPIRY_DAYS} days
              </p>
            </div>
          </div>

          {/* Stats bar */}
          {trashCount > 0 && (
            <div className="flex flex-wrap items-center gap-3 sm:ml-[52px]">
              <div className="flex items-center gap-4 sm:gap-6 text-sm text-muted-foreground flex-wrap">
                {trashedNotebooks.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" />
                    {trashedNotebooks.length} notebook{trashedNotebooks.length !== 1 ? "s" : ""}
                  </span>
                )}
                {trashedNotes.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4" />
                    {trashedNotes.length} note{trashedNotes.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="ml-auto">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleEmptyTrash}
                  className="rounded-xl gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Empty Trash
                </Button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Bulk action bar */}
        {trashCount > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 mb-6 px-2"
          >
            <button
              onClick={toggleAll}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {allSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
              {allSelected ? "Deselect all" : "Select all"}
            </button>
            {someSelected && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-muted-foreground font-medium">{selected.size} selected</span>
                <Button variant="outline" size="sm" onClick={handleBulkRestore} className="text-xs gap-1.5 h-8 rounded-xl">
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restore
                </Button>
                <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="text-xs gap-1.5 h-8 rounded-xl">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* Empty state */}
        {trashCount === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center py-24"
          >
            <div className="w-20 h-20 rounded-3xl bg-muted/80 flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Trash2 className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Trash is empty</h2>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Items you delete will appear here for {TRASH_EXPIRY_DAYS} days before being permanently removed.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/app")}
              className="mt-6 rounded-xl gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Notebooks
            </Button>
          </motion.div>
        )}

        {/* Trashed Notebooks */}
        {trashedNotebooks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4 px-2 flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5" />
              Notebooks
            </h2>
            <div className="grid gap-3">
              <AnimatePresence>
                {trashedNotebooks.map((nb, i) => {
                  const days = daysRemaining(nb.deleted_at!);
                  const key = nbKey(nb.id);
                  const isSelected = selected.has(key);
                  return (
                    <motion.div
                      key={nb.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -30, transition: { duration: 0.2 } }}
                      transition={{ delay: i * 0.05 }}
                      className={`group relative rounded-2xl border-2 bg-card p-5 transition-all duration-200 hover:shadow-md ${
                        isSelected
                          ? "border-primary/40 bg-primary/[0.03] shadow-sm"
                          : "border-border hover:border-muted-foreground/20"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="pt-0.5">
                          <Checkbox checked={isSelected} onCheckedChange={() => toggleItem(key)} className="shrink-0" />
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-2xl shrink-0">
                          {nb.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1.5">
                            <h3 className="font-semibold text-foreground truncate">{nb.name}</h3>
                            <UrgencyBadge days={days} />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Deleted {formatDeletedDate(nb.deleted_at!)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => restoreNotebook(nb.id)}
                            className="text-xs gap-1.5 h-8 rounded-xl"
                          >
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
                            className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 h-8 rounded-xl"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Trashed Notes */}
        {trashedNotes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4 px-2 flex items-center gap-2">
              <FileText className="h-3.5 w-3.5" />
              Notes
            </h2>
            <div className="grid gap-3">
              <AnimatePresence>
                {trashedNotes.map(({ note, notebookId, notebookName }, i) => {
                  const days = daysRemaining(note.deleted_at!);
                  const key = noteKey(note.id);
                  const isSelected = selected.has(key);
                  return (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -30, transition: { duration: 0.2 } }}
                      transition={{ delay: i * 0.05 }}
                      className={`group relative rounded-2xl border-2 bg-card p-5 transition-all duration-200 hover:shadow-md ${
                        isSelected
                          ? "border-primary/40 bg-primary/[0.03] shadow-sm"
                          : "border-border hover:border-muted-foreground/20"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="pt-0.5">
                          <Checkbox checked={isSelected} onCheckedChange={() => toggleItem(key)} className="shrink-0" />
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center shrink-0">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1.5">
                            <h3 className="font-semibold text-foreground truncate">{note.title}</h3>
                            <UrgencyBadge days={days} />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            from <span className="font-medium text-foreground/70">{notebookName}</span> · Deleted {formatDeletedDate(note.deleted_at!)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => restoreNote(notebookId, note.id)}
                            className="text-xs gap-1.5 h-8 rounded-xl"
                          >
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
                            className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 h-8 rounded-xl"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Info banner */}
        {trashCount > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex items-start gap-3 px-5 py-4 rounded-2xl bg-muted/40 border border-border"
          >
            <AlertTriangle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Trashed items are automatically and permanently deleted after {TRASH_EXPIRY_DAYS} days. Restore items you want to keep.
            </p>
          </motion.div>
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
