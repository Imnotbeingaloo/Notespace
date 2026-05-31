import { useEffect, useMemo, useState } from "react";
import { Loader2, BookOpen, FolderPlus, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useNotebooks } from "@/context/NotebookContext";
import {
  validateSidebarFile,
  buildStoragePath,
  isTextDocument,
  isPdfFile,
  friendlyUploadMessage,
} from "@/lib/file-validation";
import { extractPdfText } from "@/lib/pdf-extract";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SidebarUploadDialogProps {
  open: boolean;
  file: File | null;
  onClose: () => void;
  onProcessingChange?: (processing: boolean) => void;
}

type Stage = "choose" | "uploading" | "done" | "error";

export function SidebarUploadDialog({ open, file, onClose, onProcessingChange }: SidebarUploadDialogProps) {
  const { user } = useAuth();
  const { notebooks, createNotebook, createNote, updateNote, setActiveNotebookId, setActiveNoteId } = useNotebooks();
  const [stage, setStage] = useState<Stage>("choose");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [picking, setPicking] = useState<"new" | "existing" | null>(null);

  useEffect(() => {
    onProcessingChange?.(stage === "uploading");
    return () => onProcessingChange?.(false);
  }, [stage, onProcessingChange]);

  useEffect(() => {
    if (!open) onProcessingChange?.(false);
  }, [open, onProcessingChange]);

  useEffect(() => {
    if (open && file) {
      // Validate up-front so the user gets a clear error before choosing a destination.
      if (!validateSidebarFile(file)) {
        setErrorMsg("This file isn't allowed. See the toast above for details.");
        setStage("error");
      } else {
        setStage("choose");
        setProgress(0);
        setErrorMsg(null);
        setPicking(null);
        setSearch("");
      }
    }
  }, [open, file]);

  const activeNotebooks = useMemo(
    () => notebooks.filter((n) => !n.deleted_at),
    [notebooks]
  );

  const filtered = useMemo(
    () => activeNotebooks.filter((n) => n.name.toLowerCase().includes(search.toLowerCase())),
    [activeNotebooks, search]
  );

  function uniqueNotebookName(base: string) {
    const existing = new Set(activeNotebooks.map((n) => n.name.trim().toLowerCase()));
    let candidate = base;
    let i = 2;
    while (existing.has(candidate.trim().toLowerCase())) {
      candidate = `${base} ${i}`;
      i += 1;
    }
    return candidate;
  }

  if (!file) return null;

  const message = friendlyUploadMessage(file);

  async function uploadBinary(targetNotebookId: string, targetNoteId: string) {
    if (!user || !file) throw new Error("Not signed in.");
    setProgress(15);
    const path = buildStoragePath(user.id, targetNoteId, file.name);
    const { error } = await supabase.storage
      .from("note-attachments")
      .upload(path, file, { upsert: false });
    if (error) throw error;
    setProgress(70);
    const { data: signed, error: signErr } = await supabase.storage
      .from("note-attachments")
      .createSignedUrl(path, 60 * 60 * 24 * 7);
    if (signErr || !signed?.signedUrl) {
      throw signErr || new Error("Could not generate a URL for the uploaded file.");
    }
    setProgress(90);
    const link = file.type.startsWith("image/")
      ? `![${file.name}](${signed.signedUrl})`
      : `[📎 ${file.name}](${signed.signedUrl})`;
    const body = `# ${file.name}\n\n${link}\n`;
    await updateNote(targetNotebookId, targetNoteId, {
      content: body,
      attachments: [{
        name: file.name,
        url: signed.signedUrl,
        path,
        type: file.type,
        size: file.size,
      }],
    });
    setProgress(100);
  }

  async function uploadTextDoc(targetNotebookId: string, targetNoteId: string) {
    if (!file) throw new Error("No file.");
    setProgress(40);
    const text = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
    setProgress(85);
    await updateNote(targetNotebookId, targetNoteId, {
      content: `# ${file.name}\n\n${text}`,
    });
    setProgress(100);
  }

  async function uploadPdfDoc(targetNotebookId: string, targetNoteId: string) {
    if (!file) throw new Error("No file.");
    setProgress(20);
    const { text, pageCount, isScanned } = await extractPdfText(file, (p) => setProgress(20 + Math.round(p * 0.6)));
    console.info("[upload-diagnostics] PDF extraction finished", { fileName: file.name, pageCount, isScanned, textLength: text.length });
    if (pageCount > 5) {
      toast.info(`"${file.name}" has ${pageCount} pages — importing it as a full notebook note.`, { duration: 6000 });
    }
    if (isScanned || !text.trim()) {
      // Fall back to attaching the binary if we couldn't read it.
      await uploadBinary(targetNotebookId, targetNoteId);
      return;
    }
    setProgress(90);
    await updateNote(targetNotebookId, targetNoteId, {
      content: `# ${file.name}\n\n_Extracted from ${pageCount} page${pageCount === 1 ? "" : "s"}_\n\n${text}`,
    });
    setProgress(100);
  }

  async function performUpload(targetNotebookId: string, targetNoteId: string) {
    if (isTextDocument(file!)) {
      await uploadTextDoc(targetNotebookId, targetNoteId);
    } else if (isPdfFile(file!)) {
      await uploadPdfDoc(targetNotebookId, targetNoteId);
    } else {
      await uploadBinary(targetNotebookId, targetNoteId);
    }
  }

  async function handleNewNotebook() {
    if (!file) return;
    setPicking("new");
    setStage("uploading");
    setProgress(5);
    try {
      const baseName = uniqueNotebookName(file.name.replace(/\.[^.]+$/, "").slice(0, 80) || "Imported");
      const newNbId = await createNotebook(baseName);
      if (!newNbId) throw new Error("Could not create notebook.");
      const newNoteId = await createNote(newNbId, file.name);
      if (!newNoteId) throw new Error("Could not create note.");
      await performUpload(newNbId, newNoteId);
      setActiveNotebookId(newNbId);
      setActiveNoteId(newNoteId);
      setStage("done");
      toast.success(`Added "${file.name}" to a new notebook`);
      setTimeout(onClose, 900);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e?.message || "Upload failed.");
      setStage("error");
      toast.error(`Upload failed: ${e?.message || "unknown error"}`);
    }
  }

  async function handleExistingNotebook(nbId: string) {
    if (!file) return;
    setPicking("existing");
    setStage("uploading");
    setProgress(5);
    try {
      const newNoteId = await createNote(nbId, file.name);
      if (!newNoteId) throw new Error("Could not create note.");
      await performUpload(nbId, newNoteId);
      setActiveNotebookId(nbId);
      setActiveNoteId(newNoteId);
      setStage("done");
      toast.success(`Added "${file.name}" to existing notebook`);
      setTimeout(onClose, 900);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e?.message || "Upload failed.");
      setStage("error");
      toast.error(`Upload failed: ${e?.message || "unknown error"}`);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && stage !== "uploading") onClose(); }}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => { if (stage === "uploading") e.preventDefault(); }}
        onEscapeKeyDown={(e) => { if (stage === "uploading") e.preventDefault(); }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="truncate">{file.name}</span>
          </DialogTitle>
          <DialogDescription>
            {stage === "choose" && "Where should this file go?"}
            {stage === "uploading" && message}
            {stage === "done" && "Done!"}
            {stage === "error" && (errorMsg || "Something went wrong.")}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {stage === "choose" && picking === null && (
            <motion.div
              key="choose"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="space-y-2"
            >
              <button
                onClick={handleNewNotebook}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted text-left transition-colors"
              >
                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <FolderPlus className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">Add as a new notebook</div>
                  <div className="text-xs text-muted-foreground">Creates a notebook named after this file.</div>
                </div>
              </button>

              <button
                onClick={() => setPicking("existing")}
                disabled={activeNotebooks.length === 0}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted text-left transition-colors disabled:opacity-50"
              >
                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">Add to an existing notebook</div>
                  <div className="text-xs text-muted-foreground">
                    {activeNotebooks.length === 0 ? "No notebooks yet." : `Pick one of your ${activeNotebooks.length} notebooks.`}
                  </div>
                </div>
              </button>
            </motion.div>
          )}

          {stage === "choose" && picking === "existing" && (
            <motion.div
              key="pick"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="space-y-2"
            >
              <Input
                autoFocus
                placeholder="Search notebooks…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="max-h-64 overflow-y-auto -mx-1 px-1 space-y-1">
                {filtered.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6">No notebooks match.</p>
                )}
                {filtered.map((nb) => (
                  <button
                    key={nb.id}
                    onClick={() => handleExistingNotebook(nb.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted text-left text-sm transition-colors"
                  >
                    <span>{nb.emoji}</span>
                    <span className="truncate">{nb.name}</span>
                  </button>
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setPicking(null)}>
                Back
              </Button>
            </motion.div>
          )}

          {stage === "uploading" && (
            <motion.div
              key="up"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3 py-2"
            >
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>{message}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          )}

          {stage === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 py-2"
            >
              <CheckCircle2 className="h-5 w-5" />
              <span>Upload complete.</span>
            </motion.div>
          )}

          {stage === "error" && (
            <motion.div
              key="err"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="flex items-start gap-2 text-sm text-destructive">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
                <Button size="sm" onClick={() => setStage("choose")}>Try again</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
