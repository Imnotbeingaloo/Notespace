import { useRef, useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Clock, Plus, Upload, MoreHorizontal, Layers, Cloud, Check, Loader2, Eye } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useNotebooks } from "@/context/NotebookContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AIExplainPanel } from "@/components/AIExplainPanel";
import { AIEditPanel } from "@/components/AIEditPanel";
import { ExportButtons } from "@/components/ExportButtons";
import { VoiceTranscription } from "@/components/VoiceTranscription";
import { NoteTags } from "@/components/NoteTags";
import { FileUpload } from "@/components/FileUpload";
import { MarkdownToolbar } from "@/components/MarkdownToolbar";
import { HybridEditor, HybridEditorHandle } from "@/components/HybridEditor";
import { SymbolsPicker } from "@/components/SymbolsPicker";
import { validateFile, buildStoragePath } from "@/lib/file-validation";
import { toast } from "@/hooks/use-toast";

// Flashcards panel (inline, replaces AIToolsPanel)
import { useState as useStateFC } from "react";
import { X as XIcon } from "lucide-react";

const AI_TOOLS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tools`;

function FlashcardsButton() {
  const { activeNote } = useNotebooks();
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = async () => {
    if (!activeNote) return;
    setOpen(true);
    setResult("");
    setError("");
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Please sign in");
      const resp = await fetch(AI_TOOLS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ action: "flashcards", noteTitle: activeNote.title, noteContent: activeNote.content }),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error || `Error ${resp.status}`);
      }
      const reader = resp.body?.getReader();
      if (!reader) throw new Error("No stream");
      const decoder = new TextDecoder();
      let buffer = "";
      let text = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) { text += content; setResult(text); }
          } catch {}
        }
      }
    } catch (e: any) {
      setError(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  if (!activeNote) return null;

  return (
    <>
      <button
        onClick={run}
        className="magnetic-btn inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
        title="Generate Flashcards"
      >
        <Layers className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Flashcards</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 h-full w-96 max-w-[90vw] bg-card border-l border-border shadow-xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                <span className="font-sans font-bold text-foreground">AI Flashcards</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-muted transition-colors">
                <XIcon className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
              {loading && !result && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating flashcards…
                </div>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
              {result && (
                <div className="prose prose-sm max-w-none text-foreground prose-headings:font-sans prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:rounded">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function PreviewButton() {
  const { activeNote } = useNotebooks();
  const [open, setOpen] = useState(false);

  if (!activeNote) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="magnetic-btn inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
        title="Preview Note"
      >
        <Eye className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Preview</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 h-full w-96 max-w-[90vw] bg-card border-l border-border shadow-xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                <span className="font-sans font-bold text-foreground">Preview</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-muted transition-colors">
                <XIcon className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
              <div className="prose prose-sm max-w-none text-foreground prose-headings:font-sans prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-a:text-primary prose-blockquote:border-l-primary/30 prose-blockquote:text-muted-foreground">
                <h1>{activeNote.title}</h1>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeNote.content || "*No content yet*"}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


export function NoteEditor() {
  const { activeNotebook, activeNote, activeNotebookId, updateNote, createNote } = useNotebooks();
  const { user } = useAuth();
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const hybridEditorRef = useRef<HybridEditorHandle>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const [dragOver, setDragOver] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (activeNote && titleRef.current) titleRef.current.value = activeNote.title;
    if (activeNote && contentRef.current) contentRef.current.value = activeNote.content;
    setSaveStatus("idle");
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
      setSaveStatus("saving");
      debounceRef.current = setTimeout(async () => {
        await updateNote(activeNotebookId, activeNote.id, { [field]: value });
        setSaveStatus("saved");
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => setSaveStatus("idle"), 2000);
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
      updateNote(activeNotebookId, activeNote.id, { content });
    },
    [activeNotebookId, activeNote?.id, updateNote]
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

  const handleAIEdit = useCallback(
    (newContent: string) => {
      if (!activeNotebookId || !activeNote) return;
      if (contentRef.current) contentRef.current.value = newContent;
      updateNote(activeNotebookId, activeNote.id, { content: newContent });
    },
    [activeNotebookId, activeNote?.id, updateNote]
  );

  const handleSymbolInsert = useCallback(
    (symbol: string) => {
      hybridEditorRef.current?.insertAtCursor(symbol);
    },
    []
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
        toast({ title: "Image added", description: "Image inserted into note." });
      }
    },
    [user, activeNote?.id, activeNotebookId, activeNote?.content, activeNote?.attachments, updateNote]
  );

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); };

  if (!activeNotebook) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center w-full bg-background">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-5 text-center">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
            <FileText className="h-9 w-9 text-muted-foreground" />
          </div>
          <h2 className="font-sans text-2xl font-bold text-foreground">No notebook selected</h2>
          <p className="text-base text-muted-foreground leading-relaxed max-w-sm">Select a notebook from the sidebar or create a new one to get started.</p>
        </motion.div>
      </div>
    );
  }

  if (!activeNote) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center w-full h-full bg-background">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-5 text-center -mt-16">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
            <span className="text-4xl">{activeNotebook.emoji}</span>
          </div>
          <h2 className="font-sans text-2xl font-bold text-foreground">{activeNotebook.name}</h2>
          <p className="text-base text-muted-foreground leading-relaxed max-w-sm">
            {activeNotebook.notes.length === 0
              ? "This notebook is empty. Create your first note!"
              : `${activeNotebook.notes.length} note${activeNotebook.notes.length > 1 ? "s" : ""} — select one to edit.`}
          </p>
          <button
            onClick={() => activeNotebookId && createNote(activeNotebookId)}
            className="magnetic-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/20"
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
        className={`flex-1 flex flex-col bg-background overflow-hidden relative ${dragOver ? "ring-2 ring-primary/50 ring-inset" : ""}`}
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
        <div className="shrink-0 px-3 sm:px-8 pt-3 sm:pt-4 pb-1 sm:pb-2">
          <input
            ref={titleRef}
            defaultValue={activeNote.title}
            onChange={(e) => debouncedUpdate("title", e.target.value)}
            className="w-full text-xl sm:text-3xl font-sans font-bold bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/50"
            placeholder="Note title..."
          />

          {/* Tags row */}
          <div className="mt-2">
            <NoteTags tags={tags} noteId={activeNote.id} notebookId={activeNotebookId!} onTagsUpdated={setTags} />
          </div>

          {/* Meta & actions row */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2 sm:mt-3 text-xs sm:text-sm text-muted-foreground">
              <span className="flex items-center gap-1 sm:gap-1.5 bg-muted/50 px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs">
              <Clock className="h-3 w-3" />
              <span className="hidden sm:inline">{formatDate(activeNote.updated_at)}</span>
              <span className="sm:hidden">{new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(activeNote.updated_at))}</span>
            </span>

            {/* Auto-save indicator */}
            <AnimatePresence mode="wait">
              {saveStatus !== "idle" && (
                <motion.span
                  key={saveStatus}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -4 }}
                  className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground"
                >
                  {saveStatus === "saving" ? (
                    <>
                      <Cloud className="h-3 w-3 animate-pulse" />
                      <span>Saving…</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3 w-3 text-green-500" />
                      <span className="text-green-500">Saved</span>
                    </>
                  )}
                </motion.span>
              )}
            </AnimatePresence>

            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              {/* Desktop: Ask AI | AI Edit | Flashcards | Symbols | Preview */}
              <div className="hidden md:flex items-center gap-1">
                <AIExplainPanel />
                <AIEditPanel onApplyEdit={handleAIEdit} />
                <FlashcardsButton />
                
                <VoiceTranscription onTranscript={handleVoiceTranscript} />
                <PreviewButton />
                <ExportButtons />
              </div>

              {/* Mobile: "More" dropdown */}
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
                      <AIExplainPanel />
                      <AIEditPanel onApplyEdit={handleAIEdit} />
                      <FlashcardsButton />
                      <VoiceTranscription onTranscript={handleVoiceTranscript} />
                      <PreviewButton />
                      <ExportButtons />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="shrink-0 flex items-center border-b border-border bg-muted/30">
          <MarkdownToolbar
            editorRef={{
              get current() {
                return hybridEditorRef.current?.getEditorElement() ?? null;
              },
            } as React.RefObject<HTMLDivElement>}
          />
          <SymbolsPicker onInsert={handleSymbolInsert} />
        </div>

        {/* Content area */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <HybridEditor
            ref={hybridEditorRef}
            content={activeNote.content || ""}
            onChange={(content) => debouncedUpdate("content", content)}
            placeholder="Start writing... (drag & drop files here)"
          />
        </div>

        {/* File upload */}
        <div className="shrink-0 border-t border-border">
          <FileUpload onInsertMarkdown={handleInsertMarkdown} />
        </div>

      </motion.div>
    </AnimatePresence>
  );
}
