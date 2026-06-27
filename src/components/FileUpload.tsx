import { useRef, useState } from "react";
import { Paperclip, X, FileIcon, Download, Loader2, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useNotebooks } from "@/context/NotebookContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  validateFile,
  buildStoragePath,
  isTextDocument,
  isPdfFile,
  isHtmlFile,
  stripHtmlTags,
} from "@/lib/file-validation";
import { extractPdfText } from "@/lib/pdf-extract";
import { formatImportedDocument } from "@/lib/document-import";
import { toast } from "@/components/ui/sonner";

interface FileUploadProps {
  onInsertMarkdown?: (markdown: string) => void;
  onSaveSelection?: () => void;
}

export function FileUpload({ onInsertMarkdown, onSaveSelection }: FileUploadProps) {
  const { user } = useAuth();
  const { notebooks, activeNote, activeNotebookId, updateNote, createNotebook, createNote, setActiveNotebookId, setActiveNoteId } = useNotebooks();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number; name: string } | null>(null);
  const [uploadStep, setUploadStep] = useState("Ready");

  if (!activeNote) return null;

  const attachments = activeNote.attachments || [];

  const uniqueNotebookName = (base: string) => {
    const existing = new Set(notebooks.map((n) => n.name.trim().toLowerCase()));
    let candidate = base;
    let i = 2;
    while (existing.has(candidate.trim().toLowerCase())) {
      candidate = `${base} ${i}`;
      i += 1;
    }
    return candidate;
  };

  const openPicker = () => {
    // Save the editor caret position BEFORE focus leaves the editor, so the
    // inserted attachment lands exactly where the user was last typing.
    onSaveSelection?.();
    inputRef.current?.click();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;
    setUploading(true);
    setUploadStep("Checking files…");
    const fileList = Array.from(files);
    setProgress({ current: 0, total: fileList.length, name: fileList[0]?.name || "" });

    const newAttachments = [...attachments];

    for (let idx = 0; idx < fileList.length; idx++) {
      const file = fileList[idx];
      setProgress({ current: idx, total: fileList.length, name: file.name });
      if (!validateFile(file)) continue;

      // Plain text-ish docs: read and insert content at the cursor.
      if (isTextDocument(file)) {
        try {
          setUploadStep("Reading file…");
          const text = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
          });
          setUploadStep("Formatting document…");
          const content = isHtmlFile(file) ? stripHtmlTags(text) : text;
          onInsertMarkdown?.(`\n\n${formatImportedDocument(content, file.name)}`);
          toast.success(`Imported "${file.name}"`);
        } catch (err: any) {
          toast.error(`Could not read "${file.name}": ${err?.message || "unknown error"}`);
        }
        continue;
      }

      // PDFs: extract text. If > 5 pages, spin up a brand-new notebook with the contents.
      if (isPdfFile(file)) {
        try {
          setUploadStep("Reading PDF…");
          toast.info(`Reading "${file.name}"…`);
          const { text, pageCount, isScanned } = await extractPdfText(file);
          console.info("[upload-diagnostics] Inline PDF extraction finished", { fileName: file.name, pageCount, isScanned, textLength: text.length });
          if (isScanned || !text.trim()) {
            // No useful text - fall through to binary upload.
            toast.warning(`"${file.name}" looks scanned. Attaching as a file link instead.`);
          } else if (pageCount > 5) {
            setUploadStep("Creating notebook…");
            toast.info(`"${file.name}" has ${pageCount} pages - creating a new notebook note for it.`, { duration: 6000 });
            const baseName = uniqueNotebookName(file.name.replace(/\.[^.]+$/, "").slice(0, 80) || "Imported PDF");
            const nbId = await createNotebook(baseName);
            if (nbId) {
              const noteId = await createNote(nbId, file.name);
              if (noteId) {
                setUploadStep("Adding to notebook…");
                await updateNote(nbId, noteId, { content: formatImportedDocument(text, file.name) });
                setActiveNotebookId(nbId);
                setActiveNoteId(noteId);
                toast.success(`"${file.name}" had ${pageCount} pages - created a new notebook for it.`);
                continue;
              }
            }
            toast.error(`Could not create a notebook for "${file.name}".`);
            continue;
          } else {
            setUploadStep("Formatting PDF text…");
            onInsertMarkdown?.(`\n\n${formatImportedDocument(text, file.name)}`);
            toast.success(`Imported "${file.name}" (${pageCount} page${pageCount === 1 ? "" : "s"})`);
            continue;
          }
        } catch (err: any) {
          console.error("PDF parse error:", err);
          toast.error(`Couldn't read "${file.name}". Attaching as a link instead.`);
          // Fall through to binary upload
        }
      }


      // Binary file: upload to storage, verify success, insert link at caret.
      try {
        setUploadStep("Uploading file…");
        const path = buildStoragePath(user.id, activeNote.id, file.name);
        const { error } = await supabase.storage
          .from("note-attachments")
          .upload(path, file, { upsert: false });
        if (error) throw error;

        setUploadStep("Creating secure link…");
        const { data: signedUrlData, error: signErr } = await supabase.storage
          .from("note-attachments")
          .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
        if (signErr || !signedUrlData?.signedUrl) {
          throw signErr || new Error("Could not generate file URL");
        }

        const fileUrl = signedUrlData.signedUrl;
        const att = {
          name: file.name,
          url: fileUrl,
          path,
          type: file.type,
          size: file.size,
        };
        newAttachments.push(att);

        if (file.type.startsWith("image/")) {
          onInsertMarkdown?.(`![${file.name}](${fileUrl})`);
        } else {
          onInsertMarkdown?.(`[📎 ${file.name}](${fileUrl})`);
        }
        toast.success(`Attached "${file.name}"`);
      } catch (err: any) {
        console.error("Upload error:", err);
        toast.error(`Upload failed for "${file.name}": ${err?.message || "unknown error"}`);
      }
    }

    // Save attachments metadata once.
    if (newAttachments.length !== attachments.length) {
      await updateNote(activeNotebookId, activeNote.id, { attachments: newAttachments });
    }

    setUploading(false);
    setProgress(null);
    setUploadStep("Ready");
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleRemove = async (idx: number) => {
    const updated = attachments.filter((_, i) => i !== idx);
    await updateNote(activeNotebookId, activeNote.id, { attachments: updated });
  };

  const handleDownload = (url: string, name: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.click();
  };

  const handlePreview = async (att: { path?: string; url: string; name: string }) => {
    try {
      let url = att.url;
      if (att.path) {
        const { data, error } = await supabase.storage
          .from("note-attachments")
          .createSignedUrl(att.path, 60 * 60);
        if (error) throw error;
        if (data?.signedUrl) url = data.signedUrl;
      }
      const win = window.open(url, "_blank", "noopener,noreferrer");
      if (!win) toast.error("Popup blocked - allow popups to preview attachments.");
    } catch (err: any) {
      toast.error(err.message || "Could not open this file.");
    }
  };

  const isImage = (type: string) => type.startsWith("image/");

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <button
        type="button"
        onMouseDown={() => onSaveSelection?.()}
        onClick={openPicker}
        disabled={uploading}
        className="p-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 hover:scale-105 flex-shrink-0"
        title={uploading ? "Uploading..." : "Attach files"}
      >
        {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Paperclip className="h-6 w-6" />}
      </button>
      <div className="flex flex-col gap-1 min-w-0 flex-1 max-w-[260px]">
        <span className="text-sm text-muted-foreground select-none truncate">
          {uploading && progress
            ? `${uploadStep} ${progress.current + 1}/${progress.total} - ${progress.name}`
            : uploading
              ? uploadStep
              : "Attach files or drag & drop"}
        </span>
        {uploading && progress && (
          <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${((progress.current + 0.5) / progress.total) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" multiple accept=".png,.jpg,.jpeg,.gif,.webp,.pdf,.epub,.txt,.md,.markdown,.csv,.json,.doc,.docx,.xls,.xlsx,.mp4,.mov,.webm,image/*,video/mp4,video/quicktime,video/webm,application/pdf,application/epub+zip,text/plain,text/markdown,text/csv,application/json" className="hidden" onChange={handleUpload} />

      <AnimatePresence>
        {attachments.filter(a => !isImage(a.type)).length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap justify-center gap-2"
          >
            {attachments.filter(a => !isImage(a.type)).map((att, i) => {
              const originalIdx = attachments.indexOf(att);
              const shortName = att.name.length > 7 ? `${att.name.slice(0, 6)}...` : att.name;
              return (
                <motion.div
                  key={att.url}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative group flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted text-xs text-foreground"
                >
                  <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="truncate max-w-[80px]" title={att.name}>{shortName}</span>
                    <span className="text-[10px] text-muted-foreground">{formatSize(att.size)}</span>
                  </div>
                  <button
                    onClick={() => handlePreview(att)}
                    className="p-1 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                    title="Preview"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDownload(att.url, att.name)}
                    className="p-1 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                    title="Download"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleRemove(originalIdx)}
                    className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
