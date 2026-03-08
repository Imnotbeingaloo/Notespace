import { useRef, useState } from "react";
import { Paperclip, X, FileIcon, Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useNotebooks } from "@/context/NotebookContext";
import { motion, AnimatePresence } from "framer-motion";
import { validateFile, buildStoragePath } from "@/lib/file-validation";
import { toast } from "@/hooks/use-toast";

interface FileUploadProps {
  onInsertMarkdown?: (markdown: string) => void;
}

export function FileUpload({ onInsertMarkdown }: FileUploadProps) {
  const { user } = useAuth();
  const { activeNote, activeNotebookId, updateNote } = useNotebooks();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  if (!activeNote || !activeNotebookId) return null;

  const attachments = activeNote.attachments || [];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;
    setUploading(true);

    const newAttachments = [...attachments];
    let markdownInserts: string[] = [];

    for (const file of Array.from(files)) {
      if (!validateFile(file)) continue;
      const path = buildStoragePath(user.id, activeNote.id, file.name);
      const { error } = await supabase.storage.from("note-attachments").upload(path, file);
      if (error) {
        console.error("Upload error:", error);
        continue;
      }
      const { data: publicUrlData } = supabase.storage.from("note-attachments").getPublicUrl(path);
      const fileUrl = publicUrlData?.publicUrl || '';
      const att = {
        name: file.name,
        url: fileUrl,
        path: path,
        type: file.type,
        size: file.size,
      };
      newAttachments.push(att);

      // For images, insert markdown inline into the note content
      if (file.type.startsWith("image/")) {
        markdownInserts.push(`\n![${file.name}](${fileUrl})\n`);
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

  const isImage = (type: string) => type.startsWith("image/");

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="px-4 sm:px-8 py-3 border-t border-border">
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Paperclip className="h-3.5 w-3.5" />}
          {uploading ? "Uploading..." : "Add to note"}
        </button>
        <span className="text-[10px] text-muted-foreground">Images are embedded inline. Files are listed below.</span>
        <input ref={inputRef} type="file" multiple className="hidden" onChange={handleUpload} />
      </div>

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
