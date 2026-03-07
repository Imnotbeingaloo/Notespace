import { useRef, useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Clock, Plus, Eye, Edit3, Upload } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useNotebooks } from "@/context/NotebookContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AIExplainPanel } from "@/components/AIExplainPanel";
import { FileUpload } from "@/components/FileUpload";
import { validateFile, buildStoragePath } from "@/lib/file-validation";

export function NoteEditor() {
  const { activeNotebook, activeNote, activeNotebookId, updateNote, createNote } = useNotebooks();
  const { user } = useAuth();
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const [preview, setPreview] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (activeNote && titleRef.current) titleRef.current.value = activeNote.title;
    if (activeNote && contentRef.current) contentRef.current.value = activeNote.content;
    setPreview(false);
  }, [activeNote?.id]);

  const debouncedUpdate = useCallback(
    (field: "title" | "content", value: string) => {
      if (!activeNotebookId || !activeNote) return;
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        updateNote(activeNotebookId, activeNote.id, { [field]: value });
      }, 500);
    },
    [activeNotebookId, activeNote?.id, updateNote]
  );

  const handleInsertMarkdown = useCallback(
    (markdown: string) => {
      if (!contentRef.current || !activeNotebookId || !activeNote) return;
      const textarea = contentRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const current = textarea.value;
      const newContent = current.substring(0, start) + markdown + current.substring(end);
      textarea.value = newContent;
      const newPos = start + markdown.length;
      textarea.setSelectionRange(newPos, newPos);
      textarea.focus();
      updateNote(activeNotebookId, activeNote.id, { content: newContent });
    },
    [activeNotebookId, activeNote?.id, updateNote]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (!user || !activeNote || !activeNotebookId) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;

      const currentAttachments = activeNote.attachments || [];
      const newAttachments = [...currentAttachments];
      let markdownInserts: string[] = [];

      for (const file of files) {
        if (!validateFile(file)) continue;
        const path = buildStoragePath(user.id, activeNote.id, file.name);
        if (error) { console.error("Drop upload error:", error); continue; }
        const { data: signedUrlData } = await supabase.storage.from("note-attachments").createSignedUrl(path, 60 * 60 * 24 * 7);
        const fileUrl = signedUrlData?.signedUrl || '';
        newAttachments.push({ name: file.name, url: fileUrl, path: path, type: file.type, size: file.size });
        if (file.type.startsWith("image/")) {
          markdownInserts.push(`\n![${file.name}](${fileUrl})\n`);
        }
      }

      const contentAppend = markdownInserts.length > 0 ? markdownInserts.join("\n") : "";
      const newContent = contentAppend ? (activeNote.content || "") + contentAppend : undefined;

      await updateNote(activeNotebookId, activeNote.id, {
        attachments: newAttachments,
        ...(newContent ? { content: newContent } : {}),
      });

      // Sync textarea
      if (newContent && contentRef.current) {
        contentRef.current.value = newContent;
      }
    },
    [user, activeNote?.id, activeNotebookId, activeNote?.content, activeNote?.attachments, updateNote]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  if (!activeNotebook) {
    return (
      <div className="flex-1 flex items-center justify-center editor-surface">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md px-6">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="font-serif text-xl text-foreground mb-2">No notebook selected</h2>
          <p className="text-sm text-muted-foreground">Select a notebook from the sidebar or create a new one to get started.</p>
        </motion.div>
      </div>
    );
  }

  if (!activeNote) {
    return (
      <div className="flex-1 flex items-center justify-center editor-surface">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md px-6">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">{activeNotebook.emoji}</span>
          </div>
          <h2 className="font-serif text-xl text-foreground mb-2">{activeNotebook.name}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {activeNotebook.notes.length === 0
              ? "This notebook is empty. Create your first note!"
              : `${activeNotebook.notes.length} note${activeNotebook.notes.length > 1 ? "s" : ""} — select one to edit.`}
          </p>
          <button
            onClick={() => activeNotebookId && createNote(activeNotebookId)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            New Note
          </button>
        </motion.div>
      </div>
    );
  }

  const formatDate = (d: string) =>
    new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(d));

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeNote.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
        className={`flex-1 flex flex-col editor-surface overflow-hidden relative ${dragOver ? "ring-2 ring-primary ring-inset" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Drag overlay */}
        <AnimatePresence>
          {dragOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-primary/5 backdrop-blur-[1px] flex items-center justify-center pointer-events-none"
            >
              <div className="flex flex-col items-center gap-2 text-primary">
                <Upload className="h-10 w-10" />
                <span className="text-sm font-medium">Drop files to add to note</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="px-4 sm:px-8 pt-4 sm:pt-8 pb-4 border-b border-border">
          <input
            ref={titleRef}
            defaultValue={activeNote.title}
            onChange={(e) => debouncedUpdate("title", e.target.value)}
            className="w-full text-2xl font-serif font-bold bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
            placeholder="Note title..."
          />
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Updated {formatDate(activeNote.updated_at)}
            </span>
            <div className="ml-auto flex items-center gap-2">
              <AIExplainPanel />
              <button
                onClick={() => setPreview((p) => !p)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  preview
                    ? "bg-primary/10 text-primary"
                    : "border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {preview ? <Edit3 className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {preview ? "Edit" : "Preview"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {preview ? (
            <div className="px-4 sm:px-8 py-6 prose prose-sm max-w-none text-foreground prose-headings:font-serif prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-a:text-primary prose-img:rounded-lg prose-img:max-w-full prose-img:h-auto prose-img:border prose-img:border-border prose-img:shadow-sm">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  img: ({ src, alt }) => (
                    <img src={src} alt={alt || ""} className="rounded-lg border border-border shadow-sm max-w-full h-auto" loading="lazy" />
                  ),
                }}
              >
                {activeNote.content || "*No content yet…*"}
              </ReactMarkdown>
            </div>
          ) : (
            <textarea
              ref={contentRef}
              defaultValue={activeNote.content}
              onChange={(e) => debouncedUpdate("content", e.target.value)}
              className="w-full h-full px-4 sm:px-8 py-6 bg-transparent border-none outline-none resize-none text-foreground leading-relaxed placeholder:text-muted-foreground text-[15px]"
              placeholder="Start writing in markdown... (drag & drop files here)"
            />
          )}
        </div>

        <FileUpload onInsertMarkdown={handleInsertMarkdown} />
      </motion.div>
    </AnimatePresence>
  );
}
