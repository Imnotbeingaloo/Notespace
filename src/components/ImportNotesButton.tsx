import { useRef, useState, useCallback, useEffect } from "react";
import { FileUp, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { toast as sonner } from "@/components/ui/sonner";
import { extractPdfText } from "@/lib/pdf-extract";
import { formatImportedDocument } from "@/lib/document-import";
import {
  MAX_PROCESSABLE_SIZE,
  validateFile,
  buildStoragePath,
  isTextDocument,
  isPdfFile,
  isImageFile,
} from "@/lib/file-validation";
import { ImportActionDialog, type ImportChoice, type MergePosition } from "@/components/ImportActionDialog";
import { UploadRoutingDialog, type UploadTarget } from "@/components/UploadRoutingDialog";
import { BatchImportDialog, type BatchChoice } from "@/components/BatchImportDialog";
import { UploadProgressToast } from "@/components/UploadProgressToast";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { hashFile } from "@/lib/file-hash";
import { toolPill } from "@/lib/tool-colors";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useNotebooks } from "@/context/NotebookContext";
import { logImport } from "@/lib/import-analytics";
import { removeAttachmentObjects } from "@/lib/attachment-cleanup";


interface ImportNotesButtonProps {
  onInsert: (text: string) => void;
  onMergeAt?: (text: string, position: MergePosition) => void;
  onReplace?: (text: string) => void;
  onCreateNew?: (text: string, fileName: string) => void;
  onRollbackInsertions?: (snippets: string[]) => void;
  hasExistingContent?: boolean;
  onSaveSelection?: () => void;
}

const TEXT_EXTS = [".txt", ".md", ".markdown", ".csv", ".json"];

function humanSize(bytes: number) {
  if (bytes > 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
  return `${Math.round(bytes / 1024 / 1024)} MB`;
}

type PendingItem = {
  content: string;
  fileName: string;
  resolve: (choice: ImportChoice | null) => void;
};

type FileKind = "text" | "image" | "video" | "audio" | "attach" | "pdf";

function classifyKind(file: File): FileKind {
  const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");
  if (isTextDocument(file) || TEXT_EXTS.includes(ext)) return "text";
  if (isPdfFile(file)) return "pdf";
  if (isImageFile(file)) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  return "attach";
}

export function ImportNotesButton({
  onInsert,
  onMergeAt,
  onReplace,
  onCreateNew,
  onRollbackInsertions,
  hasExistingContent = false,
  onSaveSelection,
}: ImportNotesButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number; name: string } | null>(null);
  const [pending, setPending] = useState<PendingItem | null>(null);

  // Batch orchestration state.
  const [routing, setRouting] = useState<{ files: File[]; resolve: (t: UploadTarget | null) => void } | null>(null);
  const [batch, setBatch] = useState<{
    files: { name: string; size: number; kind: "text" | "image" | "video" | "audio" | "attach" }[];
    resolve: (choice: BatchChoice | null) => void;
  } | null>(null);

  // Progress + retry state (shown as its own sticky card, not via the toast queue).
  const [progressCard, setProgressCard] = useState<{
    active: boolean;
    current: number;
    total: number;
    currentName?: string;
    failed: File[];
    finished: boolean;
  }>({ active: false, current: 0, total: 0, failed: [], finished: false });

  // Cancellation plumbing — a ref (not state) so the running loop can observe
  // the flip synchronously without waiting for a re-render.
  const cancelRef = useRef(false);
  const insertedSnippetsRef = useRef<string[]>([]);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const { user } = useAuth();
  const { activeNote, activeNotebookId, activeNotebook, updateNote, createNotebook, createNote, setActiveNotebookId, setActiveNoteId } = useNotebooks();

  const dialogEnabled = !!onReplace || !!onCreateNew;

  const askForChoice = useCallback((content: string, fileName: string) => {
    return new Promise<ImportChoice | null>((resolve) => {
      setPending({ content, fileName, resolve });
    });
  }, []);

  const askRouting = useCallback((files: File[]) => {
    return new Promise<UploadTarget | null>((resolve) => {
      setRouting({ files, resolve });
    });
  }, []);

  const askBatch = useCallback((files: { name: string; size: number; kind: "text" | "image" | "video" | "audio" | "attach" }[]) => {
    return new Promise<BatchChoice | null>((resolve) => {
      setBatch({ files, resolve });
    });
  }, []);

  const applyChoice = useCallback(
    (choice: ImportChoice, content: string, fileName: string) => {
      logImport({ kind: "import-choice", name: fileName, action: choice.action, position: choice.position });
      if (choice.action === "create") {
        onCreateNew?.(content, fileName);
        toast({ title: "New note created", description: `"${fileName}" imported into a new note.` });
      } else if (choice.action === "merge") {
        const pos = choice.position ?? "cursor";
        if (onMergeAt) onMergeAt(content, pos); else onInsert(`\n${content}`);
        const where = pos === "top" ? "at the top" : pos === "end" ? "at the end" : "at your cursor";
        toast({ title: "Merged", description: `"${fileName}" inserted ${where}.` });
      } else if (choice.action === "replace") {
        if (activeNote?.attachments?.length) {
          void removeAttachmentObjects(activeNote.attachments, "replace", activeNote.id);
        }
        onReplace?.(content);
        toast({ title: "Note replaced", description: `Content replaced with "${fileName}".` });
      }
    },
    [onCreateNew, onInsert, onMergeAt, onReplace, activeNote],
  );

  const extractText = useCallback(async (file: File): Promise<{ body: string; title: string } | null> => {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (file.size > MAX_PROCESSABLE_SIZE) {
      sonner.warning(`"${file.name}" is ${humanSize(file.size)} — attaching as a file link instead.`);
      return null;
    }
    if (ext === ".pdf") {
      const { text, isScanned } = await extractPdfText(file);
      if (isScanned || !text.trim()) return null;
      return formatImportedDocument(text, file.name);
    }
    const raw = await file.text();
    if (!raw.trim()) return null;
    return formatImportedDocument(raw, file.name);
  }, []);

  const uploadOne = useCallback(
    async (file: File, noteId?: string): Promise<{ name: string; url: string; path: string; type: string; size: number; hash?: string } | null> => {
      const targetNoteId = noteId ?? activeNote?.id;
      if (!user || !targetNoteId) {
        toast({ title: "Cannot attach", description: "Open a note first, then try again.", variant: "destructive" });
        return null;
      }
      try {
        const path = buildStoragePath(user.id, targetNoteId, file.name);
        const { error } = await supabase.storage.from("note-attachments").upload(path, file, { upsert: false });
        if (error) throw error;
        const { data: signed, error: signErr } = await supabase.storage
          .from("note-attachments")
          .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
        if (signErr || !signed?.signedUrl) throw signErr || new Error("Could not generate file URL");

        const fileUrl = signed.signedUrl;
        if (!noteId) {
          const snippet = isImageFile(file)
            ? `\n![${file.name}](${fileUrl})\n`
            : `\n[📎 ${file.name}](${fileUrl})\n`;
          onInsert(snippet);
          insertedSnippetsRef.current.push(snippet);
        }
        const hash = await hashFile(file).catch(() => undefined);
        logImport({ kind: "attach-uploaded", name: file.name, path, size: file.size });
        return { name: file.name, url: fileUrl, path, type: file.type, size: file.size, hash };
      } catch (err: any) {
        const message = err?.message || "unknown error";
        sonner.error(`Upload failed for "${file.name}": ${message}`);
        logImport({ kind: "attach-upload-failed", name: file.name, message });
        return null;
      }
    },
    [user, activeNote, onInsert],
  );

  const validateBatch = useCallback((files: File[]): { ok: File[]; bad: File[] } => {
    const ok: File[] = [];
    const bad: File[] = [];
    for (const f of files) {
      if (!validateFile(f)) { bad.push(f); continue; }
      ok.push(f);
    }
    return { ok, bad };
  }, []);

  const dedupe = useCallback(async (files: File[]): Promise<{ unique: File[]; dupes: File[] }> => {
    const existing = new Set<string>((activeNote?.attachments || []).map((a: any) => a.hash).filter(Boolean));
    if (existing.size === 0) return { unique: files, dupes: [] };
    const unique: File[] = [];
    const dupes: File[] = [];
    for (const f of files) {
      const h = await hashFile(f).catch(() => "");
      if (h && existing.has(h)) dupes.push(f); else unique.push(f);
    }
    return { unique, dupes };
  }, [activeNote]);

  const runBatch = useCallback(
    async (files: File[], target: UploadTarget, batchChoice: BatchChoice | null) => {
      // Resolve destination note.
      let destNoteId: string | undefined = activeNote?.id;
      let destNotebookId: string | null = activeNotebookId;
      let createdNewContainer = false;

      // For a single text/PDF file destined for a new note or notebook, pre-extract
      // its title so the note/notebook is named after the document heading rather
      // than the raw filename or "Imported files".
      let preExtractedTitle: string | null = null;
      if (files.length === 1 && (target === "new-note" || target === "new-notebook")) {
        const only = files[0];
        const ext = "." + only.name.split(".").pop()?.toLowerCase();
        if (ext === ".pdf" || (only.type || "").startsWith("text/") || [".md", ".markdown", ".txt", ".html", ".htm", ".csv", ".json"].includes(ext)) {
          // Show the progress card immediately — PDF extraction can take seconds
          // and previously happened silently before runBatch flipped it on.
          setProgressCard({ active: true, current: 0, total: 1, currentName: only.name, failed: [], finished: false });
          const extracted = await extractText(only).catch(() => null);
          if (extracted) preExtractedTitle = extracted.title;
        }
      }

      if (target === "new-notebook") {
        const nbName = files.length === 1
          ? (preExtractedTitle || files[0].name.replace(/\.[^.]+$/, "")).slice(0, 60) || "Imported"
          : `Imported (${new Date().toLocaleDateString()})`;
        const newNbId = await createNotebook(nbName);
        if (!newNbId) { sonner.error("Could not create notebook."); return; }
        destNotebookId = newNbId;
        createdNewContainer = true;
      }

      if (target === "new-note" || target === "new-notebook") {
        if (destNotebookId) {
          const noteTitle = files.length === 1
            ? (preExtractedTitle || files[0].name.replace(/\.[^.]+$/, ""))
            : `Imported (${new Date().toLocaleDateString()})`;
          const noteId = await createNote(destNotebookId, noteTitle);
          if (!noteId) { sonner.error("Could not create note."); return; }
          destNoteId = noteId;
          setActiveNotebookId(destNotebookId);
          setActiveNoteId(noteId);
          createdNewContainer = true;
        }
      }

      // Reorder + skip per batch dialog.
      let ordered = files;
      if (batchChoice) {
        const nameOrder = batchChoice.order.filter((n) => !batchChoice.skipped.includes(n));
        ordered = nameOrder.map((n) => files.find((f) => f.name === n)!).filter(Boolean);
      }

      setLoading(true);
      setProgressCard({ active: true, current: 0, total: ordered.length, failed: [], finished: false });
      logImport({ kind: "batch-start", count: ordered.length, hasExistingContent });

      // Reset cancellation bookkeeping for this batch. Anything appended to
      // insertedSnippetsRef during runBatch will be rolled back on cancel.
      cancelRef.current = false;
      insertedSnippetsRef.current = [];

      const newAttachments: Array<{ name: string; url: string; path: string; type: string; size: number; hash?: string }> = [];
      const failed: File[] = [];
      let hasContentNow = createdNewContainer ? false : hasExistingContent;
      let importedCount = 0;
      let cancelled = false;

      try {
        for (let i = 0; i < ordered.length; i++) {
          if (cancelRef.current) { cancelled = true; break; }
          const file = ordered[i];
          setProgress({ current: i, total: ordered.length, name: file.name });
          setProgressCard((s) => ({ ...s, current: i + 1, currentName: file.name }));

          const kind = classifyKind(file);
          logImport({ kind: "file-classified", name: file.name, type: file.type, size: file.size, route: kind });

          try {
            if (kind === "text" || kind === "pdf") {
              const extracted = await extractText(file).catch(() => null);
              if (extracted) {
                const content = extracted.body;
                // For batch imports with a merge choice, apply directly without dialog.
                if (batchChoice && dialogEnabled && hasContentNow) {
                  applyChoice({ action: "merge", position: batchChoice.position }, content, file.name);
                } else if (dialogEnabled && hasContentNow) {
                  const choice = await askForChoice(content, file.name);
                  if (choice) applyChoice(choice, content, file.name);
                } else {
                  const snippet = `\n${content}`;
                  onInsert(snippet);
                  insertedSnippetsRef.current.push(snippet);
                  sonner.success(`Imported "${file.name}"`);
                }
                hasContentNow = true;
                importedCount += 1;
                continue;
              }
              if (kind === "pdf") {
                // Fall through to attach as file.
                const rec = await uploadOne(file, createdNewContainer ? destNoteId : undefined);
                if (rec) newAttachments.push(rec); else failed.push(file);
                continue;
              }
              // Empty text file.
              failed.push(file);
              continue;
            }

            const rec = await uploadOne(file, createdNewContainer ? destNoteId : undefined);
            if (rec) newAttachments.push(rec); else failed.push(file);
          } catch (err) {
            failed.push(file);
            logImport({ kind: "file-skipped", name: file.name, reason: "exception" });
          }
        }

        if (cancelRef.current) cancelled = true;

        if (cancelled) {
          // Roll back everything we've done so far: delete uploaded storage
          // objects and strip any inline markdown insertions from the note.
          const uploadedCount = newAttachments.length;
          if (uploadedCount > 0) {
            await removeAttachmentObjects(newAttachments, "cancel", destNoteId ?? null);
          }
          const snippets = insertedSnippetsRef.current.slice();
          if (snippets.length > 0) onRollbackInsertions?.(snippets);
          insertedSnippetsRef.current = [];
          logImport({ kind: "batch-cancelled", uploaded: uploadedCount, rolledBack: snippets.length });
          sonner.info(
            uploadedCount > 0
              ? `Upload cancelled. Removed ${uploadedCount} uploaded file${uploadedCount === 1 ? "" : "s"}.`
              : "Upload cancelled.",
          );
        } else if (newAttachments.length && destNoteId) {
          // Read latest attachments from context for the destination note.
          const noteAttachments = destNoteId === activeNote?.id ? (activeNote?.attachments || []) : [];
          const merged = [...noteAttachments, ...newAttachments];
          await updateNote(destNotebookId, destNoteId, { attachments: merged });
          logImport({ kind: "attachments-persisted", noteId: destNoteId, added: newAttachments.length, total: merged.length });
        }
      } finally {
        setLoading(false);
        setProgress(null);
        if (inputRef.current) inputRef.current.value = "";
        setProgressCard((s) => cancelled
          ? { ...s, active: false, finished: true, failed: [] }
          : { ...s, finished: true, failed }
        );
        cancelRef.current = false;
        logImport({ kind: "batch-complete", imported: importedCount, attached: newAttachments.length, failed: failed.length });
      }
    },
    [activeNote, activeNotebookId, hasExistingContent, dialogEnabled, extractText, uploadOne, askForChoice, applyChoice, onInsert, onRollbackInsertions, createNotebook, createNote, setActiveNotebookId, setActiveNoteId, updateNote],
  );

  const handleFiles = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawFiles = e.target.files ? Array.from(e.target.files) : [];
      if (!rawFiles.length) return;

      // 1. Upfront validation — reject the whole batch cleanly if anything is off.
      const { ok, bad } = validateBatch(rawFiles);
      if (bad.length && ok.length === 0) {
        if (inputRef.current) inputRef.current.value = "";
        return; // errors already toasted by validateFile
      }
      if (bad.length) {
        sonner.warning(`Skipped ${bad.length} unsupported file${bad.length === 1 ? "" : "s"}.`);
      }

      // 2. Duplicate detection against existing attachments on the current note.
      const { unique, dupes } = await dedupe(ok);
      if (dupes.length) {
        sonner.info(`Skipped ${dupes.length} duplicate${dupes.length === 1 ? "" : "s"} already attached.`);
      }
      if (unique.length === 0) {
        if (inputRef.current) inputRef.current.value = "";
        return;
      }

      // 3. Routing dialog — always ask when multiple files OR when a notebook is open.
      //    IMPORTANT: Cancel / Escape resolves askRouting to null and MUST abort the
      //    import entirely. Do NOT fall back to "current" here — that silently
      //    dumps files into the note the user was trying to protect.
      const needsRouting = unique.length > 1 || !!activeNotebook;
      let target: UploadTarget;
      if (needsRouting) {
        const routed = await askRouting(unique);
        if (routed === null) {
          if (inputRef.current) inputRef.current.value = "";
          return;
        }
        target = routed;
      } else {
        target = "current";
      }

      // 4. Batch dialog — only when there are 2+ text-mergeable files landing in current note.
      let batchChoice: BatchChoice | null = null;
      const mergeableCount = unique.filter((f) => classifyKind(f) === "text" || classifyKind(f) === "pdf").length;
      if (target === "current" && mergeableCount >= 2 && hasExistingContent) {
        batchChoice = await askBatch(unique.map((f) => ({
          name: f.name,
          size: f.size,
          kind: (classifyKind(f) === "pdf" ? "text" : classifyKind(f)) as "text" | "image" | "video" | "audio" | "attach",
        })));
        if (!batchChoice) {
          if (inputRef.current) inputRef.current.value = "";
          return;
        }
      }

      await runBatch(unique, target, batchChoice);
    },
    [validateBatch, dedupe, activeNotebook, askRouting, hasExistingContent, askBatch, runBatch],
  );

  const retryFailed = useCallback(async () => {
    const files = progressCard.failed;
    if (!files.length) return;
    setProgressCard({ active: true, current: 0, total: files.length, failed: [], finished: false });
    await runBatch(files, "current", null);
  }, [progressCard.failed, runBatch]);

  const handleChoice = useCallback(
    (choice: ImportChoice | null) => {
      if (!pending) return;
      const { resolve } = pending;
      setPending(null);
      resolve(choice);
    },
    [pending],
  );

  const handleRouting = useCallback((t: UploadTarget | null) => {
    if (!routing) return;
    const { resolve } = routing;
    setRouting(null);
    resolve(t);
  }, [routing]);

  const handleBatch = useCallback((c: BatchChoice | null) => {
    if (!batch) return;
    const { resolve } = batch;
    setBatch(null);
    resolve(c);
  }, [batch]);

  const openPicker = () => {
    onSaveSelection?.();
    inputRef.current?.click();
  };

  // Auto-hide finished progress card after a short delay unless there are failures.
  useEffect(() => {
    if (progressCard.finished && progressCard.failed.length === 0) {
      const t = setTimeout(() => setProgressCard((s) => ({ ...s, active: false })), 2500);
      return () => clearTimeout(t);
    }
  }, [progressCard.finished, progressCard.failed.length]);

  const label = loading
    ? progress
      ? `${progress.current + 1}/${progress.total}`
      : "Working…"
    : "Import Notes";

  return (
    <>
      <button
        onMouseDown={() => onSaveSelection?.()}
        onTouchStart={() => onSaveSelection?.()}
        onClick={openPicker}
        disabled={loading}
        className={toolPill("import")}
        title="Import or attach files (images, PDFs, docs, videos)"
        aria-label="Import or attach files"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileUp className="h-3.5 w-3.5" />}
        <span className="hidden sm:inline">{label}</span>
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".png,.jpg,.jpeg,.gif,.webp,.pdf,.epub,.txt,.md,.markdown,.csv,.json,.doc,.docx,.xls,.xlsx,.mp4,.mov,.webm,image/*,video/mp4,video/quicktime,video/webm,application/pdf,application/epub+zip,text/plain,text/markdown,text/csv,application/json"
        className="hidden"
        onChange={handleFiles}
      />

      {routing && (
        <UploadRoutingDialog
          open
          fileCount={routing.files.length}
          contextLabel={activeNotebook?.name ?? "this note"}
          contextKind={activeNotebook ? "notebook" : "note"}
          onChoose={handleRouting}
        />
      )}

      {batch && (
        <BatchImportDialog
          open
          files={batch.files}
          hasExistingContent={hasExistingContent}
          onChoose={handleBatch}
        />
      )}

      {pending && (
        <ImportActionDialog
          open
          fileName={pending.fileName}
          hasExistingContent={hasExistingContent}
          onChoose={handleChoice}
        />
      )}

      <UploadProgressToast
        active={progressCard.active}
        current={progressCard.current}
        total={progressCard.total}
        currentName={progressCard.currentName}
        failedNames={progressCard.failed.map((f) => f.name)}
        finished={progressCard.finished}
        onRetry={progressCard.failed.length ? retryFailed : undefined}
        onDismiss={() => setProgressCard((s) => ({ ...s, active: false }))}
        onCancel={loading && !progressCard.finished ? () => setConfirmCancel(true) : undefined}
      />

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="Cancel upload?"
        description="This will stop the import and delete any files that have already been uploaded. Text or links already inserted into your note will be removed. This can't be undone."
        confirmLabel="Cancel upload"
        destructive
        onConfirm={() => {
          cancelRef.current = true;
          setConfirmCancel(false);
        }}
      />
    </>
  );
}
