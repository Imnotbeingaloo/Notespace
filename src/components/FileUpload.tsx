import { useRef, useState } from "react";
import { Paperclip, X, FileIcon, Download, Loader2, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useNotebooks } from "@/context/NotebookContext";
import { motion, AnimatePresence } from "framer-motion";
import { validateFile, buildStoragePath, isTextDocument, isHtmlFile, stripHtmlTags } from "@/lib/file-validation";
import { toast } from "@/hooks/use-toast";

interface FileUploadProps {
  onInsertMarkdown?: (markdown: string) => void;
}

export function FileUpload({ onInsertMarkdown }: FileUploadProps) {
  const { user } = useAuth();
  const { activeNote, activeNotebookId, updateNote } = useNotebooks();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number; name: string } | null>(null);

  if (!activeNote || !activeNotebookId) return null;

  const attachments = activeNote.attachments || [];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;
    setUploading(true);
    const fileList = Array.from(files);
    setProgress({ current: 0, total: fileList.length, name: fileList[0]?.name || "" });

    const newAttachments = [...attachments];
    let markdownInserts: string[] = [];

    for (let idx = 0; idx < fileList.length; idx++) {
      const file = fileList[idx];
      setProgress({ current: idx, total: fileList.length, name: file.name });
      if (!validateFile(file)) continue;

      // If it's an HTML or MD file, read content and insert into note
      if (isTextDocument(file)) {
        const text = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsText(file);
        });

        const content = isHtmlFile(file) ? stripHtmlTags(text) : text;
        const separator = activeNote.content ? "\n\n---\n\n" : "";
        const newContent = (activeNote.content || "") + separator + `## Imported: ${file.name}\n\n${content}`;

        await updateNote(activeNotebookId, activeNote.id, { content: newContent });

        if (onInsertMarkdown) {
          onInsertMarkdown(""); // trigger re-render
        }
        toast({
          title: "Document imported",
          description: `"${file.name}" content has been added to your note.`,
        });
        continue;
      }

      const path = buildStoragePath(user.id, activeNote.id, file.name);
      const { error } = await supabase.storage.from("note-attachments").upload(path, file);
      if (error) {
        console.error("Upload error:", error);
        continue;
      }
      const { data: signedUrlData } = await supabase.storage.from("note-attachments").createSignedUrl(path, 60 * 60 * 24 * 7);
      const fileUrl = signedUrlData?.signedUrl || '';
      const att = {
        name: file.name,
        url: fileUrl,
        path: path,
        type: file.type,
        size: file.size,
      };
      newAttachments.push(att);

      // For images, insert at cursor position via onInsertMarkdown
      if (file.type.startsWith("image/")) {
        markdownInserts.push(`![${file.name}](${fileUrl})`);
      }
    }

    // Save attachments metadata
    await updateNote(activeNotebookId, activeNote.id, { attachments: newAttachments });

    // Insert image markdown into content
    if (markdownInserts.length > 0 && onInsertMarkdown) {
      onInsertMarkdown(markdownInserts.join("\n"));
      toast({
        title: "Image added",
        description: "Switch to Preview mode to see it rendered.",
      });
    }

    setUploading(false);
    setProgress(null);
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
      if (!win) toast({ title: "Popup blocked", description: "Allow popups to preview attachments." });
    } catch (err: any) {
      toast({ title: "Preview failed", description: err.message || "Could not open this file." });
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
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 hover:scale-105 flex-shrink-0"
        title={uploading ? "Uploading..." : "Attach files"}
      >
        {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5" />}
      </button>
      <div className="flex flex-col gap-1 min-w-0 flex-1 max-w-[260px]">
        <span className="text-sm text-muted-foreground select-none truncate">
          {uploading && progress
            ? `Uploading ${progress.current + 1}/${progress.total} — ${progress.name}`
            : uploading
              ? "Uploading…"
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
      <input ref={inputRef} type="file" multiple className="hidden" onChange={handleUpload} />

      <AnimatePresence>
        {attachments.filter(a => !isImage(a.type)).length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {attachments.filter(a => !isImage(a.type)).map((att, i) => {
              const originalIdx = attachments.indexOf(att);
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
                    <span className="truncate max-w-[120px]">{att.name}</span>
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
