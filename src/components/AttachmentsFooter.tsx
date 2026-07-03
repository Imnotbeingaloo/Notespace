import { useState, useRef, useCallback } from "react";
import { Paperclip, GripVertical, Pencil, Repeat2, X, Check, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useNotebooks, type Attachment } from "@/context/NotebookContext";
import { validateFile, buildStoragePath } from "@/lib/file-validation";
import { removeAttachmentObjects } from "@/lib/attachment-cleanup";
import { toast } from "@/hooks/use-toast";

function formatBytes(n: number) {
  if (!n) return "";
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function AttachmentsFooter() {
  const { activeNote, activeNotebookId, updateNote } = useNotebooks();
  const { user } = useAuth();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [renamingIndex, setRenamingIndex] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);

  const attachments = activeNote?.attachments || [];

  const persist = useCallback(
    (next: Attachment[]) => {
      if (!activeNote) return;
      updateNote(activeNotebookId, activeNote.id, { attachments: next });
    },
    [activeNote, activeNotebookId, updateNote]
  );

  if (!activeNote || attachments.length === 0) return null;

  const handleDrop = (targetIdx: number) => {
    if (dragIndex === null || dragIndex === targetIdx) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    const next = [...attachments];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIdx, 0, moved);
    setDragIndex(null);
    setOverIndex(null);
    persist(next);
  };

  const commitRename = (idx: number) => {
    const value = renameValue.trim();
    setRenamingIndex(null);
    if (!value || value === attachments[idx].name) return;
    const next = attachments.map((a, i) => (i === idx ? { ...a, name: value } : a));
    persist(next);
  };

  const removeOne = async (idx: number) => {
    const att = attachments[idx];
    await removeAttachmentObjects([att], "replace", activeNote.id);
    persist(attachments.filter((_, i) => i !== idx));
    toast({ title: "Attachment removed", description: att.name });
  };

  const openReplace = (idx: number) => {
    setReplaceIndex(idx);
    replaceInputRef.current?.click();
  };

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    const idx = replaceIndex;
    setReplaceIndex(null);
    if (!file || idx === null || !user) return;
    if (!validateFile(file)) return;
    try {
      const old = attachments[idx];
      const path = buildStoragePath(user.id, activeNote.id, file.name);
      const { error } = await supabase.storage.from("note-attachments").upload(path, file);
      if (error) throw error;
      const { data: signed } = await supabase.storage
        .from("note-attachments")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      const url = signed?.signedUrl || "";
      const next = attachments.map((a, i) =>
        i === idx ? { name: file.name, url, path, type: file.type, size: file.size } : a
      );
      persist(next);
      if (old) await removeAttachmentObjects([old], "replace", activeNote.id);
      toast({ title: "Replaced", description: file.name });
    } catch (err) {
      console.error("Replace failed", err);
      toast({ title: "Replace failed", description: "Could not upload the new file.", variant: "destructive" });
    }
  };

  return (
    <div className="shrink-0 border-t border-border bg-muted/20 px-3 sm:px-8 py-2">
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1.5">
        <Paperclip className="h-3 w-3" />
        <span>Attachments · {attachments.length}</span>
      </div>
      <ul className="flex flex-wrap gap-1.5">
        <AnimatePresence initial={false}>
          {attachments.map((att, idx) => {
            const isDragOver = overIndex === idx && dragIndex !== null && dragIndex !== idx;
            const isRenaming = renamingIndex === idx;
            return (
              <motion.li
                key={`${att.path || att.url}-${idx}`}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                draggable={!isRenaming}
                onDragStart={() => setDragIndex(idx)}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (overIndex !== idx) setOverIndex(idx);
                }}
                onDragLeave={() => { if (overIndex === idx) setOverIndex(null); }}
                onDrop={(e) => { e.preventDefault(); handleDrop(idx); }}
                onDragEnd={() => { setDragIndex(null); setOverIndex(null); }}
                className={`group flex items-center gap-1 rounded-lg border px-2 py-1 text-xs bg-background/60 transition-all ${
                  isDragOver ? "border-primary/60 bg-primary/5" : "border-border"
                } ${dragIndex === idx ? "opacity-50" : ""}`}
                title={`${att.name} · ${formatBytes(att.size)}`}
              >
                <GripVertical className="h-3 w-3 text-muted-foreground/50 cursor-grab active:cursor-grabbing" />
                {isRenaming ? (
                  <>
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRename(idx);
                        if (e.key === "Escape") setRenamingIndex(null);
                      }}
                      onBlur={() => commitRename(idx)}
                      className="bg-transparent outline-none border-b border-primary/40 max-w-[160px]"
                    />
                    <button onClick={() => commitRename(idx)} className="text-primary" aria-label="Save name">
                      <Check className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <>
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noreferrer"
                      className="max-w-[180px] truncate text-foreground hover:text-primary"
                    >
                      {att.name}
                    </a>
                    <span className="text-muted-foreground/70 hidden sm:inline">{formatBytes(att.size)}</span>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={att.url}
                        download={att.name}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                        aria-label={`Download ${att.name}`}
                        title="Download"
                      >
                        <Download className="h-3 w-3" />
                      </a>
                      <button
                        onClick={() => { setRenamingIndex(idx); setRenameValue(att.name); }}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                        aria-label={`Rename ${att.name}`}
                        title="Rename"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => openReplace(idx)}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                        aria-label={`Replace ${att.name}`}
                        title="Replace"
                      >
                        <Repeat2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => removeOne(idx)}
                        className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                        aria-label={`Remove ${att.name}`}
                        title="Remove"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </>
                )}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
      <input ref={replaceInputRef} type="file" hidden onChange={handleReplaceFile} />
    </div>
  );
}
