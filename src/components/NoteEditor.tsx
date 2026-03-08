import { useRef, useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Clock, Plus, Eye, Edit3, Upload, MoreHorizontal } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useNotebooks } from "@/context/NotebookContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AIExplainPanel } from "@/components/AIExplainPanel";
import { AIToolsPanel } from "@/components/AIToolsPanel";
import { ExportButtons } from "@/components/ExportButtons";
import { VoiceTranscription } from "@/components/VoiceTranscription";
import { NoteTags } from "@/components/NoteTags";
import { FileUpload } from "@/components/FileUpload";
import { MarkdownToolbar } from "@/components/MarkdownToolbar";
import { validateFile, buildStoragePath } from "@/lib/file-validation";
import { toast } from "@/hooks/use-toast";

export function NoteEditor() {
  const { activeNotebook, activeNote, activeNotebookId, updateNote, createNote } = useNotebooks();
  const { user } = useAuth();
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const [preview, setPreview] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeNote && titleRef.current) titleRef.current.value = activeNote.title;
    if (activeNote && contentRef.current) contentRef.current.value = activeNote.content;
    setPreview(false);
    if (activeNote) {
      supabase
        .from("notes")
        .select("tags")
        .eq("id", activeNote.id)
        .single()
        .then(({ data }) => {
          setTags((data as any)?.tags || []);
        });
    }
  }, [activeNote?.id]);

  // Close "more" menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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

  const handleToolbarChange = useCallback(
    (content: string) => {
      if (!activeNotebookId || !activeNote) return;
      debouncedUpdate("content", content);
    },
    [activeNotebookId, activeNote?.id, debouncedUpdate]
  );

  const handleVoiceTranscript = useCallback(
    (text: string) => {
      if (!contentRef.current || !activeNotebookId || !activeNote) return;
      const textarea = contentRef.current;
      const pos = textarea.selectionStart;
      const current = textarea.value;
      const insert = (pos > 0 && current[pos - 1] !== " " ? " " : "") + text;
      const newContent = current.substring(0, pos) + insert + current.substring(pos);
      textarea.value = newContent;
      const newPos = pos + insert.length;
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
      let hasImages = false;

      for (const file of files) {
        if (!validateFile(file)) continue;
        const path = buildStoragePath(user.id, activeNote.id, file.name);
        const { error } = await supabase.storage.from("note-attachments").upload(path, file);
        if (error) { console.error("Drop upload error:", error); continue; }
        const { data: publicUrlData } = supabase.storage.from("note-attachments").getPublicUrl(path);
        const fileUrl = publicUrlData?.publicUrl || '';
        newAttachments.push({ name: file.name, url: fileUrl, path: path, type: file.type, size: file.size });
        if (file.type.startsWith("image/")) {
          markdownInserts.push(`\n![${file.name}](${fileUrl})\n`);
          hasImages = true;
        }
      }

      const contentAppend = markdownInserts.length > 0 ? markdownInserts.join("\n") : "";
      const newContent = contentAppend ? (activeNote.content || "") + contentAppend : undefined;

      await updateNote(activeNotebookId, activeNote.id, {
        attachments: newAttachments,
        ...(newContent ? { content: newContent } : {}),
      });

      if (newContent && contentRef.current) {
        contentRef.current.value = newContent;
      }

      if (hasImages) {
        toast({
          title: "Image added",
          description: "Switch to Preview mode to see it rendered.",
        });
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
          <div className="w-20 h-20 rounded-[2rem] bg-muted flex items-center justify-center mx-auto mb-6">
            <FileText className="h-9 w-9 text-muted-foreground" />
          </div>
          <h2 className="font-sans text-2xl font-bold text-foreground mb-3">No notebook selected</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">Select a notebook from the sidebar or create a new one to get started.</p>
        </motion.div>
      </div>
    );
  }

  if (!activeNote) {
    return (
      <div className="flex-1 flex items-center justify-center editor-surface">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md px-6">
          <div className="w-20 h-20 rounded-[2rem] bg-muted flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">{activeNotebook.emoji}</span>
          </div>
          <h2 className="font-sans text-2xl font-bold text-foreground mb-3">{activeNotebook.name}</h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            {activeNotebook.notes.length === 0
              ? "This notebook is empty. Create your first note!"
              : `${activeNotebook.notes.length} note${activeNotebook.notes.length > 1 ? "s" : ""} — select one to edit.`}
          </p>
          <button
            onClick={() => activeNotebookId && createNote(activeNotebookId)}
            className="magnetic-btn inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/20"
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
        className={`flex-1 flex flex-col editor-surface overflow-hidden relative ${dragOver ? "ring-2 ring-primary/50 ring-inset" : ""}`}
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
              className="absolute inset-0 z-50 bg-primary/5 backdrop-blur-sm flex items-center justify-center pointer-events-none"
            >
              <div className="flex flex-col items-center gap-3 text-primary">
                <div className="w-16 h-16 rounded-[2rem] bg-primary/10 flex items-center justify-center">
                  <Upload className="h-8 w-8" />
                </div>
                <span className="text-sm font-medium">Drop files to add to note</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Title bar */}
        <div className="px-3 sm:px-8 pt-3 sm:pt-6 pb-2 sm:pb-3">
          <input
            ref={titleRef}
            defaultValue={activeNote.title}
            onChange={(e) => debouncedUpdate("title", e.target.value)}
            className="w-full text-xl sm:text-3xl font-sans font-bold bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/50"
            placeholder="Note title..."
          />

          {/* Tags row */}
          <div className="mt-2">
            <NoteTags
              tags={tags}
              noteId={activeNote.id}
              notebookId={activeNotebookId!}
              onTagsUpdated={setTags}
            />
          </div>

          {/* Meta & actions row */}
          <div className="flex items-center gap-1.5 sm:gap-2 mt-2 sm:mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 sm:gap-1.5 bg-muted/50 px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs">
              <Clock className="h-3 w-3" />
              <span className="hidden sm:inline">{formatDate(activeNote.updated_at)}</span>
              <span className="sm:hidden">{new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(activeNote.updated_at))}</span>
            </span>

            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              {/* Always visible: Download + Preview */}
              <ExportButtons />
              <button
                onClick={() => setPreview((p) => !p)}
                className={`magnetic-btn inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all duration-200 ${
                  preview
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {preview ? <Edit3 className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {preview ? "Edit" : "Preview"}
              </button>

              {/* Desktop: show all tools inline */}
              <div className="hidden md:flex items-center gap-1">
                <VoiceTranscription onTranscript={handleVoiceTranscript} />
                <AIToolsPanel />
                <AIExplainPanel />
              </div>

              {/* Mobile: "More" dropdown for tools */}
              <div className="md:hidden relative" ref={moreRef}>
                <button
                  onClick={() => setMoreOpen((p) => !p)}
                  className="magnetic-btn inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
                <AnimatePresence>
                  {moreOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1 z-50 min-w-[180px] rounded-xl border border-border bg-popover p-2 shadow-lg flex flex-col gap-1"
                      onClick={() => setMoreOpen(false)}
                    >
                      <VoiceTranscription onTranscript={handleVoiceTranscript} />
                      <AIToolsPanel />
                      <AIExplainPanel />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar - only in edit mode */}
        {!preview && <MarkdownToolbar textareaRef={contentRef} onContentChange={handleToolbarChange} />}

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          {preview ? (
            <div className="px-3 sm:px-8 py-4 sm:py-6 prose prose-sm max-w-none text-foreground prose-headings:font-sans prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-lg prose-a:text-primary prose-a:no-underline prose-a:border-b prose-a:border-primary/30 hover:prose-a:border-primary prose-blockquote:border-l-primary/30 prose-blockquote:text-muted-foreground prose-hr:border-border">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  img: ({ src, alt }) => (
                    <img
                      src={src}
                      alt={alt || ""}
                      className="rounded-2xl border border-border shadow-md max-w-full h-auto my-4"
                      loading="lazy"
                    />
                  ),
                  input: ({ checked, ...props }) => (
                    <input
                      type="checkbox"
                      checked={checked}
                      readOnly
                      className="mr-2 accent-primary rounded"
                      {...props}
                    />
                  ),
                }}
              >
                {activeNote.content || "*No content yet…*"}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <textarea
                ref={contentRef}
                defaultValue={activeNote.content}
                onChange={(e) => debouncedUpdate("content", e.target.value)}
                className="w-full flex-1 px-3 sm:px-8 py-4 sm:py-6 bg-transparent border-none outline-none resize-none text-foreground leading-relaxed placeholder:text-muted-foreground/40 text-sm sm:text-[15px] font-mono"
                placeholder="Start writing in markdown... (drag & drop files here)"
              />
              {/* Inline image previews in edit mode */}
              <InlineImagePreviews content={activeNote.content} />
            </div>
          )}
        </div>

        <FileUpload onInsertMarkdown={handleInsertMarkdown} />
      </motion.div>
    </AnimatePresence>
  );
}
