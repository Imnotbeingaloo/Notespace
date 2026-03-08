import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, RotateCcw, BookOpen, FileText, ArrowLeft, Clock, AlertTriangle } from "lucide-react";
import { NotebookProvider, useNotebooks } from "@/context/NotebookContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
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

  const handleEmptyTrash = () => {
    showConfirm(
      "Empty Trash?",
      `All ${trashCount} item${trashCount !== 1 ? "s" : ""} will be permanently deleted. This cannot be undone.`,
      async () => {
        for (const nb of trashedNotebooks) {
          await permanentlyDeleteNotebook(nb.id);
        }
        for (const { note, notebookId } of trashedNotes) {
          await permanentlyDeleteNote(notebookId, note.id);
        }
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
                  return (
                    <motion.div
                      key={nb.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card"
                    >
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => restoreNotebook(nb.id)}
                        className="text-xs gap-1"
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
                  return (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card"
                    >
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => restoreNote(notebookId, note.id)}
                        className="text-xs gap-1"
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
