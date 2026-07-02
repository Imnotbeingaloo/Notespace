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

interface ImportNotesButtonProps {
  /** Insert at cursor / merge into the current note (fallback if onMergeAt missing). */
  onInsert: (text: string) => void;
  /** Optional: merge at a specific position (top / cursor / end). */
  onMergeAt?: (text: string, position: MergePosition) => void;
  /** Optional: replace the entire current note's body. Enables the dialog flow. */
  onReplace?: (text: string) => void;
  /** Optional: spin up a brand-new note with the imported content. */
  onCreateNew?: (text: string, fileName: string) => void;
  /** Whether the current note already has content (drives merge/replace availability). */
  hasExistingContent?: boolean;
  /** Save caret position before the file picker steals focus. */
  onSaveSelection?: () => void;
}

const TEXT_EXTS = [".txt", ".md", ".markdown", ".csv", ".json"];

function humanSize(bytes: number) {
  if (bytes > 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
  return `${Math.round(bytes / 1024 / 1024)} MB`;
}

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
  const [pending, setPending] = useState<{ content: string; fileName: string } | null>(null);

  const { user } = useAuth();
  const { activeNote, activeNotebookId, updateNote } = useNotebooks();

  const dialogEnabled = !!onReplace || !!onCreateNew;

  const importText = useCallback(
    async (file: File): Promise<boolean> => {
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
          return false; // fall through to binary attach
        }
        content = text;
        if (!content.trim()) {
          toast({ title: "Empty file", description: "The file appears to be empty.", variant: "destructive" });
          return true;
        }
        const formatted = formatImportedDocument(content, file.name);
        if (dialogEnabled && hasExistingContent) {
          setPending({ content: formatted, fileName: file.name });
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
      if (dialogEnabled && hasExistingContent) {
        setPending({ content: formatted, fileName: file.name });
      } else {
        onInsert(`\n${formatted}`);
        sonner.success(`Imported "${file.name}"`);
      }
      return true;
    },
    [dialogEnabled, hasExistingContent, onInsert],
  );

  const attachBinary = useCallback(
    async (file: File): Promise<void> => {
      if (!user || !activeNote) {
        toast({ title: "Cannot attach", description: "Open a note first, then try again.", variant: "destructive" });
        return;
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
        const nextAttachments = [
          ...(activeNote.attachments || []),
          { name: file.name, url: fileUrl, path, type: file.type, size: file.size },
        ];
        if (isImageFile(file)) {
          onInsert(`\n![${file.name}](${fileUrl})\n`);
        } else {
          onInsert(`\n[📎 ${file.name}](${fileUrl})\n`);
        }
        await updateNote(activeNotebookId, activeNote.id, { attachments: nextAttachments });
        sonner.success(`Attached "${file.name}"`);
      } catch (err: any) {
        sonner.error(`Upload failed for "${file.name}": ${err?.message || "unknown error"}`);
      }
    },
    [user, activeNote, activeNotebookId, onInsert, updateNote],
  );

  const handleFiles = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      if (!files.length) return;
      setLoading(true);
      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          setProgress({ current: i, total: files.length, name: file.name });
          if (!validateFile(file)) continue;

          const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");

          // 1) Plain text-ish docs → import as content.
          if (isTextDocument(file) || TEXT_EXTS.includes(ext)) {
            await importText(file);
            continue;
          }

          // 2) PDFs → try text import; if scanned or fails, fall through to attach.
          if (isPdfFile(file)) {
            const handled = await importText(file).catch(() => false);
            if (handled) continue;
            await attachBinary(file);
            continue;
          }

          // 3) Everything else (images, docx, videos, etc.) → attach binary.
          await attachBinary(file);
        }
      } finally {
        setLoading(false);
        setProgress(null);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [importText, attachBinary],
  );

  const handleChoice = useCallback(
    (choice: ImportChoice | null) => {
      if (!pending) {
        setPending(null);
        return;
      }
      const { content, fileName } = pending;
      setPending(null);
      if (!choice) return;
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
        onReplace?.(content);
        toast({ title: "Note replaced", description: `Content replaced with "${fileName}".` });
      }
    },
    [pending, onCreateNew, onInsert, onMergeAt, onReplace],
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
        onMouseDown={() => onSaveSelection?.()}
        onClick={openPicker}
        disabled={loading}
        className={toolPill("import")}
        title="Import or attach files (images, PDFs, docs, videos)"
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
