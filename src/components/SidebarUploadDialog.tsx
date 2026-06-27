import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, BookOpen, FolderPlus, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/sonner";
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
import { formatImportedDocument } from "@/lib/document-import";
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

type Stage = "choose" | "attaching" | "done" | "error";

/**
 * Pre-processed payload - populated by the background upload that fires as soon
 * as the user picks a file. By the time they choose a destination, the heavy
 * work (storage upload OR PDF extraction OR text read) is already finished.
 */
interface PreparedPayload {
  kind: "binary" | "text" | "pdf";
  body: string;
  attachments?: { name: string; url: string; path: string; type: string; size: number }[];
  pageCount?: number;
}

export function SidebarUploadDialog({ open, file, onClose, onProcessingChange }: SidebarUploadDialogProps) {
  const { user } = useAuth();
  const { notebooks, createNotebook, createNote, updateNote, setActiveNotebookId, setActiveNoteId } = useNotebooks();
  const [stage, setStage] = useState<Stage>("choose");
  const [bgProgress, setBgProgress] = useState(0);
  const [prepLabel, setPrepLabel] = useState("Checking file…");
  const [bgReady, setBgReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [picking, setPicking] = useState<"new" | "existing" | null>(null);
  const preparedRef = useRef<PreparedPayload | null>(null);
  const prepErrorRef = useRef<Error | null>(null);

  useEffect(() => {
    onProcessingChange?.(stage === "attaching" || (stage === "choose" && !bgReady));
    return () => onProcessingChange?.(false);
  }, [stage, bgReady, onProcessingChange]);

  useEffect(() => {
    if (!open) onProcessingChange?.(false);
  }, [open, onProcessingChange]);

  // Kick off the upload immediately when the dialog opens with a file.
  useEffect(() => {
    if (!open || !file || !user) return;
    if (!validateSidebarFile(file)) {
      setErrorMsg("This file isn't allowed. See the toast above for details.");
      setStage("error");
      return;
    }
    setStage("choose");
    setPicking(null);
    setSearch("");
    setErrorMsg(null);
    setBgProgress(0);
    setPrepLabel("Checking file…");
    setBgReady(false);
    preparedRef.current = null;
    prepErrorRef.current = null;

    let cancelled = false;
    (async () => {
      try {
        const payload = await prepareFile(file, user.id, (p, label) => {
          if (!cancelled) setBgProgress(p);
          if (!cancelled && label) setPrepLabel(label);
        });
        if (cancelled) return;
        preparedRef.current = payload;
        setBgReady(true);
        if (payload.kind === "pdf" && (payload.pageCount ?? 0) > 5) {
          toast.info(`"${file.name}" has ${payload.pageCount} pages - we'll import the full extracted text.`, { duration: 6000 });
        }
      } catch (e: any) {
        if (cancelled) return;
        prepErrorRef.current = e;
        setErrorMsg(e?.message || "We couldn't prepare this file.");
        setStage("error");
      }
    })();
    return () => { cancelled = true; };
  }, [open, file, user]);

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

  /** Heavy lifting that happens BEFORE the user has chosen a destination. */
  async function prepareFile(
    f: File,
    userId: string,
    onProgress: (p: number, label?: string) => void,
  ): Promise<PreparedPayload> {
    if (isTextDocument(f)) {
      onProgress(20, "Reading file…");
      const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(f);
      });
      onProgress(78, "Formatting document…");
      const body = formatImportedDocument(text, f.name);
      onProgress(100, "Ready to add to notebook");
      return { kind: "text", body };
    }
    if (isPdfFile(f)) {
      onProgress(10, "Reading PDF…");
      const { text, pageCount, isScanned } = await extractPdfText(f, (p) => onProgress(10 + Math.round(p * 0.72), "Extracting PDF text…"));
      console.info("[upload-diagnostics] PDF prepared", { name: f.name, pageCount, isScanned, textLength: text.length });
      if (isScanned || !text.trim()) {
        return prepareBinary(f, userId, onProgress);
      }
      onProgress(90, "Formatting extracted text…");
      const body = formatImportedDocument(text, f.name);
      onProgress(100, "Ready to add to notebook");
      return {
        kind: "pdf",
        pageCount,
        body,
      };
    }
    return prepareBinary(f, userId, onProgress);
  }

  async function prepareBinary(
    f: File,
    userId: string,
    onProgress: (p: number, label?: string) => void,
  ): Promise<PreparedPayload> {
    onProgress(15, "Uploading file…");
    // Stage under a temporary noteId - we'll associate it with the real note when the user picks.
    const stagingNoteId = `staging-${crypto.randomUUID()}`;
    const path = buildStoragePath(userId, stagingNoteId, f.name);
    const { error } = await supabase.storage
      .from("note-attachments")
      .upload(path, f, { upsert: false });
    if (error) throw error;
    onProgress(75, "Creating secure file link…");
    const { data: signed, error: signErr } = await supabase.storage
      .from("note-attachments")
      .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    if (signErr || !signed?.signedUrl) {
      throw signErr || new Error("Could not generate a URL for the uploaded file.");
    }
    onProgress(100, "Ready to add to notebook");
    const link = f.type.startsWith("image/")
      ? `![${f.name}](${signed.signedUrl})`
      : `[📎 ${f.name}](${signed.signedUrl})`;
    return {
      kind: "binary",
      body: `${link}\n\n\n`,
      attachments: [{ name: f.name, url: signed.signedUrl, path, type: f.type, size: f.size }],
    };
  }

  async function attachPreparedTo(targetNotebookId: string, targetNoteId: string) {
    const payload = preparedRef.current;
    if (!payload) throw new Error("Upload isn't ready yet - please try again in a moment.");
    await updateNote(targetNotebookId, targetNoteId, {
      content: payload.body,
      ...(payload.attachments ? { attachments: payload.attachments } : {}),
    });
  }

  async function handleNewNotebook() {
    if (!file) return;
    setPicking("new");
    setStage("attaching");
    try {
      const baseName = uniqueNotebookName(file.name.replace(/\.[^.]+$/, "").slice(0, 80) || "Imported");
      const newNbId = await createNotebook(baseName);
      if (!newNbId) throw new Error("Could not create notebook.");
      const newNoteId = await createNote(newNbId, file.name);
      if (!newNoteId) throw new Error("Could not create note.");
      // Wait for prep if user was extra fast.
      while (!bgReady && !prepErrorRef.current) {
        await new Promise((r) => setTimeout(r, 100));
      }
      if (prepErrorRef.current) throw prepErrorRef.current;
      await attachPreparedTo(newNbId, newNoteId);
      setActiveNotebookId(newNbId);
      setActiveNoteId(newNoteId);
      setStage("done");
      toast.success(`Added "${file.name}" to a new notebook`);
      setTimeout(onClose, 700);
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
    setStage("attaching");
    try {
      const newNoteId = await createNote(nbId, file.name);
      if (!newNoteId) throw new Error("Could not create note.");
      while (!bgReady && !prepErrorRef.current) {
        await new Promise((r) => setTimeout(r, 100));
      }
      if (prepErrorRef.current) throw prepErrorRef.current;
      await attachPreparedTo(nbId, newNoteId);
      setActiveNotebookId(nbId);
      setActiveNoteId(newNoteId);
      setStage("done");
      toast.success(`Added "${file.name}" to existing notebook`);
      setTimeout(onClose, 700);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e?.message || "Upload failed.");
      setStage("error");
      toast.error(`Upload failed: ${e?.message || "unknown error"}`);
    }
  }

  const busy = stage === "attaching";

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !busy) onClose(); }}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => { if (busy) e.preventDefault(); }}
        onEscapeKeyDown={(e) => { if (busy) e.preventDefault(); }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-8 min-w-0">
            <FileText className="h-4 w-4 text-primary flex-shrink-0" />
            {(() => {
              const dot = file.name.lastIndexOf(".");
              const base = dot > 0 ? file.name.slice(0, dot) : file.name;
              const ext = dot > 0 ? file.name.slice(dot) : "";
              const shortBase = base.length > 14 ? `${base.slice(0, 14)}...` : base;
              return (
                <span className="block min-w-0 flex-1" title={file.name}>{shortBase}{ext}</span>
              );
            })()}
          </DialogTitle>

          <DialogDescription>
            {stage === "choose" && (bgReady ? "Ready - where should this go?" : message)}
            {stage === "attaching" && "Attaching to your notebook…"}
            {stage === "done" && "Done!"}
            {stage === "error" && (errorMsg || "Something went wrong.")}
          </DialogDescription>
        </DialogHeader>

        {/* Background-upload progress bar - visible while prep is running so the user
            knows the upload is already happening even before they pick a destination. */}
        {stage === "choose" && !bgReady && (
          <div className="space-y-2 -mt-1 rounded-xl bg-primary/5 p-3">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5 text-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                {prepLabel}
              </span>
              <span>{bgProgress}%</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className={`h-1.5 w-1.5 rounded-full ${bgProgress >= 35 ? "bg-primary" : "bg-muted-foreground/35"}`} />
              <span>uploaded</span>
              <span className={`h-1.5 w-1.5 rounded-full ${bgProgress >= 80 ? "bg-primary" : "bg-muted-foreground/35"}`} />
              <span>formatted</span>
              <span className={`h-1.5 w-1.5 rounded-full ${bgProgress >= 100 ? "bg-primary" : "bg-muted-foreground/35"}`} />
              <span>ready</span>
            </div>
            <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${bgProgress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

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

          {stage === "attaching" && (
            <motion.div
              key="up"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-sm text-foreground py-2"
            >
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Attaching to your notebook…</span>
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
                <Button size="sm" onClick={() => { setStage("choose"); setBgReady(false); setBgProgress(0); }}>Try again</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
