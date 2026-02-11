import { useRef, useState } from "react";
import { Paperclip, X, FileIcon, ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useNotebooks } from "@/context/NotebookContext";
import { motion, AnimatePresence } from "framer-motion";

interface Attachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

export function FileUpload() {
  const { user } = useAuth();
  const { activeNote, activeNotebookId, updateNote } = useNotebooks();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  if (!activeNote || !activeNotebookId) return null;

  const attachments: Attachment[] = (activeNote as any).attachments || [];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;
    setUploading(true);

    const newAttachments = [...attachments];
    for (const file of Array.from(files)) {
      const path = `${user.id}/${activeNote.id}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("note-attachments").upload(path, file);
      if (error) {
        console.error("Upload error:", error);
        continue;
      }
      const { data: urlData } = supabase.storage.from("note-attachments").getPublicUrl(path);
      newAttachments.push({
        name: file.name,
        url: urlData.publicUrl,
        type: file.type,
        size: file.size,
      });
    }

    await updateNote(activeNotebookId, activeNote.id, { attachments: newAttachments } as any);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleRemove = async (idx: number) => {
    const updated = attachments.filter((_, i) => i !== idx);
    await updateNote(activeNotebookId, activeNote.id, { attachments: updated } as any);
  };

  const isImage = (type: string) => type.startsWith("image/");

  return (
    <div className="px-8 py-3 border-t editor-line">
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Paperclip className="h-3.5 w-3.5" />}
          Attach files
        </button>
        <input ref={inputRef} type="file" multiple className="hidden" onChange={handleUpload} />
      </div>

      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {attachments.map((att, i) => (
              <motion.div
                key={att.url}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative group"
              >
                {isImage(att.type) ? (
                  <a href={att.url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={att.url}
                      alt={att.name}
                      className="h-16 w-16 object-cover rounded-lg border border-border"
                    />
                  </a>
                ) : (
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted text-xs text-foreground hover:bg-muted/80 transition-colors"
                  >
                    <FileIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate max-w-[120px]">{att.name}</span>
                  </a>
                )}
                <button
                  onClick={() => handleRemove(i)}
                  className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
