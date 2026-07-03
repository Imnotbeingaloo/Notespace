import { useRef, useState, useCallback } from "react";
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

export function ImportNotesButton({
  onInsert,
  onMergeAt,
  onReplace,
  onCreateNew,
  hasExistingContent = false,
  onSaveSelection,
}: ImportNotesButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number; name: string } | null>(null);
  const [pending, setPending] = useState<PendingItem | null>(null);

  const { user } = useAuth();
  const { activeNote, activeNotebookId, updateNote } = useNotebooks();

  const dialogEnabled = !!onReplace || !!onCreateNew;

  /**
   * Prompt the user with the import dialog and wait for their choice.
   * Serializes prompts so multi-file imports don't overwrite each other.
   */
  const askForChoice = useCallback((content: string, fileName: string) => {
    return new Promise<ImportChoice | null>((resolve) => {
      setPending({ content, fileName, resolve });
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
        if (onMergeAt) {
          onMergeAt(content, pos);
        } else {
          onInsert(`\n${content}`);
        }
        const where = pos === "top" ? "at the top" : pos === "end" ? "at the end" : "at your cursor";
        toast({ title: "Merged", description: `"${fileName}" inserted ${where}.` });
      } else if (choice.action === "replace") {
        // Replacing wipes the previous body, which typically also orphans
        // every attachment link that used to reference storage objects.
        // Purge those objects so the bucket doesn't grow unbounded.
        if (activeNote?.attachments?.length) {
          void removeAttachmentObjects(activeNote.attachments, "replace", activeNote.id);
        }
        onReplace?.(content);
        toast({ title: "Note replaced", description: `Content replaced with "${fileName}".` });
      }
    },
    [onCreateNew, onInsert, onMergeAt, onReplace, activeNote],
  );


  const importText = useCallback(
    async (file: File, hasContentNow: boolean): Promise<boolean> => {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (file.size > MAX_PROCESSABLE_SIZE) {
        toast({
          title: "File too large to import as text",
          description: `"${file.name}" is ${humanSize(file.size)}. Text import supports files under 100 MB. Try a smaller file.`,
          variant: "destructive",
        });
        return true;
      }
      let content = "";
      if (ext === ".pdf") {
        const { text, isScanned, pageCount } = await extractPdfText(file);
        if (isScanned || !text.trim()) {
          sonner.warning(`"${file.name}" looks scanned. Attaching as a file link instead.`);
          return false;
        }
        content = text;
        if (!content.trim()) {
          toast({ title: "Empty file", description: "The file appears to be empty.", variant: "destructive" });
          return true;
        }
        const formatted = formatImportedDocument(content, file.name);
        if (dialogEnabled && hasContentNow) {
          const choice = await askForChoice(formatted, file.name);
          if (choice) applyChoice(choice, formatted, file.name);
        } else {
          onInsert(`\n${formatted}`);
          sonner.success(`Imported "${file.name}" (${pageCount} page${pageCount === 1 ? "" : "s"})`);
        }
        return true;
      }
      content = await file.text();
      if (!content.trim()) {
        toast({ title: "Empty file", description: "The file appears to be empty.", variant: "destructive" });
        return true;
      }
      const formatted = formatImportedDocument(content, file.name);
      if (dialogEnabled && hasContentNow) {
        const choice = await askForChoice(formatted, file.name);
        if (choice) applyChoice(choice, formatted, file.name);
      } else {
        onInsert(`\n${formatted}`);
        sonner.success(`Imported "${file.name}"`);
      }
      return true;
    },
    [dialogEnabled, onInsert, askForChoice, applyChoice],
  );

  /**
   * Upload one file and return the attachment record. The caller is
   * responsible for accumulating records and persisting them in a single
   * updateNote call so concurrent uploads don't clobber each other.
   */
  const uploadOne = useCallback(
    async (file: File): Promise<{ name: string; url: string; path: string; type: string; size: number } | null> => {
      if (!user || !activeNote) {
        toast({ title: "Cannot attach", description: "Open a note first, then try again.", variant: "destructive" });
        return null;
      }
      try {
        const path = buildStoragePath(user.id, activeNote.id, file.name);
        const { error } = await supabase.storage.from("note-attachments").upload(path, file, { upsert: false });
        if (error) throw error;
        const { data: signed, error: signErr } = await supabase.storage
          .from("note-attachments")
          .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
        if (signErr || !signed?.signedUrl) throw signErr || new Error("Could not generate file URL");

        const fileUrl = signed.signedUrl;
        if (isImageFile(file)) {
          onInsert(`\n![${file.name}](${fileUrl})\n`);
        } else {
          onInsert(`\n[📎 ${file.name}](${fileUrl})\n`);
        }
        sonner.success(`Attached "${file.name}"`);
        return { name: file.name, url: fileUrl, path, type: file.type, size: file.size };
      } catch (err: any) {
        sonner.error(`Upload failed for "${file.name}": ${err?.message || "unknown error"}`);
        return null;
      }
    },
    [user, activeNote, onInsert],
  );

  const handleFiles = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      if (!files.length) return;
      setLoading(true);
      // Track existing-content-ness locally so mid-loop insertions flip the
      // dialog branch on for later files.
      let hasContentNow = hasExistingContent;
      // Accumulate new attachments so we only issue one updateNote per batch,
      // avoiding the stale-activeNote overwrite bug on rapid multi-uploads.
      const newAttachments: Array<{ name: string; url: string; path: string; type: string; size: number }> = [];
      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          setProgress({ current: i, total: files.length, name: file.name });
          if (!validateFile(file)) continue;

          const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");

          if (isTextDocument(file) || TEXT_EXTS.includes(ext)) {
            await importText(file, hasContentNow);
            hasContentNow = true;
            continue;
          }

          if (isPdfFile(file)) {
            const handled = await importText(file, hasContentNow).catch(() => false);
            if (handled) { hasContentNow = true; continue; }
            const rec = await uploadOne(file);
            if (rec) newAttachments.push(rec);
            continue;
          }

          const rec = await uploadOne(file);
          if (rec) newAttachments.push(rec);
        }

        if (newAttachments.length && activeNote) {
          const merged = [...(activeNote.attachments || []), ...newAttachments];
          await updateNote(activeNotebookId, activeNote.id, { attachments: merged });
        }
      } finally {
        setLoading(false);
        setProgress(null);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [importText, uploadOne, hasExistingContent, activeNote, activeNotebookId, updateNote],
  );

  const handleChoice = useCallback(
    (choice: ImportChoice | null) => {
      if (!pending) return;
      const { resolve } = pending;
      setPending(null);
      resolve(choice);
    },
    [pending],
  );

  const openPicker = () => {
    onSaveSelection?.();
    inputRef.current?.click();
  };

  const label = loading
    ? progress
      ? `${progress.current + 1}/${progress.total}`
      : "Working…"
    : "Import Notes";

  return (
    <>
      <button
        // Save caret on both mouse and touch — iOS/Android don't fire
        // onMouseDown reliably before onClick, so touchstart guarantees the
        // selection is captured before the file picker steals focus.
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
      {pending && (
        <ImportActionDialog
          open
          fileName={pending.fileName}
          hasExistingContent={hasExistingContent}
          onChoose={handleChoice}
        />
      )}
    </>
  );
}
