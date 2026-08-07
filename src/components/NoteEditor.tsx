import { useRef, useEffect, useCallback, useState, useMemo } from "react";
import { createPortal } from "react-dom";

import { motion, AnimatePresence } from "framer-motion";
import { FileText, Clock, Upload, MoreHorizontal, Layers, Cloud, Check, Eye, Paperclip } from "lucide-react";
import { marked } from "marked";
import { usePaperStyle } from "@/hooks/use-paper-style";

import { useNotebooks } from "@/context/NotebookContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AskAIPanel } from "@/components/AskAIPanel";
import { AIEditPanel } from "@/components/AIEditPanel";
import { ExportButtons } from "@/components/ExportButtons";
import { ShareNoteDialog } from "@/components/ShareNoteDialog";
import { VoiceTranscription } from "@/components/VoiceTranscription";
import { NoteTags } from "@/components/NoteTags";
import { FlashcardDeck } from "@/components/FlashcardDeck";

import { MarkdownToolbar } from "@/components/MarkdownToolbar";
import { HybridEditor, HybridEditorHandle, noteBodyToHtml, looksLikeHtml } from "@/components/HybridEditor";
import { SymbolsPicker } from "@/components/SymbolsPicker";
import { WordCount } from "@/components/WordCount";
import { WordCountGoal } from "@/components/WordCountGoal";
import { FindReplace } from "@/components/FindReplace";
import { ImportNotesButton } from "@/components/ImportNotesButton";
import { ImportActionDialog } from "@/components/ImportActionDialog";
import { NewNotePrompt } from "@/components/NewNotePrompt";
import { AttachmentsDialog } from "@/components/AttachmentsDialog";

import { validateFile, buildStoragePath } from "@/lib/file-validation";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWordCountGoalEnabled } from "@/hooks/use-word-count-goal-enabled";
import { useNavigate } from "react-router-dom";

import { X as XIcon, Sparkles } from "lucide-react";
import { toolPill } from "@/lib/tool-colors";
import { getFlashcardSourceText, MIN_FLASHCARD_BODY_CHARS } from "@/lib/note-body";
import { looksLikeGibberish, describeGibberish } from "@/lib/gibberish";

const AI_TOOLS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tools`;

function FlashcardsButton() {
  const { activeNote } = useNotebooks();
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [gibberishReason, setGibberishReason] = useState<string>("");
  

  const openSetup = () => {
    if (!activeNote) return;
    setOpen(true);
    setResult("");
    setError("");
    setNotice("");
    setGibberishReason("");
    const source = getFlashcardSourceText(activeNote.content || "", activeNote.title || "");
    if (!source) {
      setNotice("Please write something in the notes first.");
      return;
    }
    if (source.length < MIN_FLASHCARD_BODY_CHARS) {
      setNotice("Write a little more first - flashcards need about 100 characters of actual notes. Headings do not count.");
      return;
    }
    const g = describeGibberish(source);
    if (g.gibberish) {
      setGibberishReason(g.reason || "");
      setError("__gibberish__");
      return;
    }
    // Auto-detect: skip picker, edge function extracts every concept.
    void run();
  };

  const run = async () => {
    if (!activeNote) return;
    const source = getFlashcardSourceText(activeNote.content || "", activeNote.title || "");
    if (!source) {
      setNotice("Please write something in the notes first.");
      return;
    }
    if (source.length < MIN_FLASHCARD_BODY_CHARS) {
      setNotice("Write a little more first - flashcards need about 100 characters of actual notes. Headings do not count.");
      return;
    }
    setNotice("");
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
        body: JSON.stringify({ action: "flashcards", noteTitle: "", noteContent: source }),
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
            const parsed: unknown = JSON.parse(json);
            // Runtime shape validation — protect against malformed edge-function payloads.
            if (
              parsed &&
              typeof parsed === "object" &&
              "choices" in parsed &&
              Array.isArray((parsed as any).choices) &&
              (parsed as any).choices[0] &&
              typeof (parsed as any).choices[0] === "object"
            ) {
              const delta = (parsed as any).choices[0].delta;
              const content = delta && typeof delta === "object" ? delta.content : undefined;
              if (typeof content === "string" && content.length > 0) {
                text += content;
                setResult(text);
              }
            }
          } catch {
            // Non-JSON / partial chunk — ignore silently, next iteration will retry.
          }
        }
      }
      // Final sanity check: if the stream produced nothing usable, surface a clear error.
      if (!text.trim()) {
        throw new Error("The flashcard service returned an empty response. Please try again.");
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
        onClick={openSetup}
        className="magnetic-btn inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-[hsl(280_60%_55%/0.35)] bg-[hsl(280_60%_55%/0.08)] text-[hsl(280_65%_55%)] hover:bg-[hsl(280_60%_55%/0.15)] hover:text-[hsl(280_70%_50%)] transition-all duration-200 dark:text-[hsl(280_75%_75%)] dark:hover:text-[hsl(280_80%_82%)]"
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
            className="fixed right-0 top-0 h-full w-[520px] max-w-[95vw] bg-card border-l border-border shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Layers className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <span className="font-sans font-bold text-foreground text-sm">Flashcards</span>
                  {result && <p className="text-[10px] text-muted-foreground">Ready to review</p>}
                </div>
              </div>
              <button
                type="button"
                aria-label="Close Flashcards"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-xl hover:bg-muted transition-colors"
              >
                <XIcon className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>



            {notice && (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="max-w-xs text-center">
                  <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[hsl(280_60%_55%/0.10)] text-[hsl(280_65%_55%)] dark:text-[hsl(280_75%_78%)]">
                    <Layers className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{notice}</p>
                </div>
              </div>
            )}

            {/* Loading state */}
            {loading && !result && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-8 w-8 text-primary" />
                </motion.div>
                <div className="text-center">
                  <p className="font-medium text-foreground text-sm">Generating flashcards…</p>
                  <p className="text-xs text-muted-foreground mt-1">Reading your notes and creating study cards</p>
                </div>
              </div>
            )}

            {/* Gibberish / NO_CONCEPTS state */}
            {!loading && (error === "__gibberish__" ||
              (result && result.trim().toUpperCase().includes("NO_CONCEPTS"))) && (
              <div data-testid="flashcards-empty-state" className="flex-1 flex items-center justify-center p-8">
                <div className="max-w-sm text-center">
                  <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[hsl(280_60%_55%/0.10)] text-[hsl(280_65%_55%)] dark:text-[hsl(280_75%_78%)]">
                    <Layers className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-1">Make it make sense for me 🙃</p>
                  <p className="text-xs text-muted-foreground">
                    I can only build flashcards from notes that actually explain something. Add real
                    sentences (definitions, examples, cause &amp; effect) and try again.
                  </p>
                  {error === "__gibberish__" && gibberishReason && (
                    <p
                      data-testid="gibberish-reason"
                      className="mt-3 text-xs text-foreground/80 bg-[hsl(280_60%_55%/0.08)] border border-[hsl(280_60%_55%/0.20)] rounded-lg px-3 py-2"
                    >
                      <span className="font-medium">Why:</span> {gibberishReason}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Other errors */}
            {error && error !== "__gibberish__" && !loading && (
              <div className="flex-1 flex items-center justify-center p-8">
                <p className="text-sm text-destructive text-center">{error}</p>
              </div>
            )}

            {result && !result.trim().toUpperCase().includes("NO_CONCEPTS") && (
              <div data-testid="flashcards-deck" className="flex-1 overflow-y-auto p-5">
                <FlashcardDeck markdown={result} streaming={loading} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function PreviewButton() {
  const { activeNote } = useNotebooks();
  const [paperStyle] = usePaperStyle();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const html = useMemo(() => {
    const body = activeNote?.content ?? "";
    if (!body.trim()) return "<p><em>No content yet</em></p>";
    try {
      // Notes are stored as rich HTML now; older notes are still markdown.
      return noteBodyToHtml(body);
    } catch {
      return "";
    }
  }, [activeNote?.content]);


  if (!activeNote) return null;

  // Mirror the focus-mode editor 1:1: same wrapper padding, same title bar,
  // same content class list (incl. notebook-paper). The only differences are
  // no toolbar / no meta row and the content div is not contentEditable.
  const contentClass = `wysiwyg-editor w-full flex-1 h-auto bg-transparent border-none outline-none text-foreground leading-relaxed text-base sm:text-[17px] prose prose-base max-w-none prose-headings:font-sans prose-headings:text-foreground prose-p:text-foreground prose-p:my-3 prose-li:text-foreground prose-strong:text-foreground prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-lg prose-a:text-primary prose-blockquote:border-l-primary/30 prose-blockquote:text-muted-foreground prose-hr:border-border${paperStyle ? " notebook-paper" : ""}`;
  const wrapperClass = paperStyle
    ? "w-full min-h-full relative flex flex-col box-border"
    : "w-full min-h-full px-3 sm:px-8 py-4 sm:py-6 relative flex flex-col box-border";

  const overlay = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9998] bg-background flex flex-col"
          style={{ height: "100dvh", width: "100vw" }}
          role="dialog"
          aria-label="Note preview"
        >
          <button
            onClick={() => setOpen(false)}
            className="fixed top-3 right-3 z-[9999] inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Exit preview (Esc)"
            aria-label="Exit preview"
          >
            <XIcon className="h-3.5 w-3.5" />
            Exit
            <span className="hidden sm:inline ml-1 text-[10px] font-mono uppercase text-muted-foreground/70 border border-border rounded px-1 py-0.5">Esc</span>
          </button>

          {/* Title bar — matches focus mode exactly */}
          <div className="shrink-0 px-3 sm:px-8 pt-3 sm:pt-4 pb-1 sm:pb-2">
            <div className="w-full text-xl sm:text-3xl font-sans font-bold text-foreground select-text">
              {activeNote.title}
            </div>
          </div>

          {/* Content area — same scroll container as the editor */}
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none">
            <div className={wrapperClass}>
              <div
                className={contentClass}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={toolPill("preview")}
        title="Preview Note"
      >
        <Eye className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Preview</span>
      </button>
      {typeof document !== "undefined" && createPortal(overlay, document.body)}
    </>
  );

}



export function NoteEditor({ focusMode = false, findReplaceOpen = false, onFindReplaceChange }: { focusMode?: boolean; findReplaceOpen?: boolean; onFindReplaceChange?: (open: boolean) => void }) {
  const { activeNotebook, activeNote, activeNotebookId, updateNote, createNote, isOverrideActive } = useNotebooks();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [wordCountGoalEnabled] = useWordCountGoalEnabled();
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const hybridEditorRef = useRef<HybridEditorHandle>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const [dragOver, setDragOver] = useState(false);
  const [dropProgress, setDropProgress] = useState<{ name: string; stage: string; pct: number } | null>(null);
  // Live editor content mirror - updated synchronously on every keystroke so
  // the word/char counter reflects typing/deletion in real time, without
  // waiting for the debounced save to activeNote.content.
  const [liveContent, setLiveContent] = useState(activeNote?.content || "");
  useEffect(() => { setLiveContent(activeNote?.content || ""); }, [activeNote?.id]);
  const [tags, setTags] = useState<string[]>([]);
  const [moreOpen, setMoreOpen] = useState(false);
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  
  const moreRef = useRef<HTMLDivElement>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  // Shared Ask-AI modal state - opened by both the Ask AI trigger and the AI Edit button.
  const [askAIOpen, setAskAIOpen] = useState(false);
  const [askAIMode, setAskAIMode] = useState<"chat" | "edit">("chat");
  const openAskAI = useCallback((mode: "chat" | "edit") => { setAskAIMode(mode); setAskAIOpen(true); }, []);

  // The selection toolbar's "Ask AI" button opens the same panel.
  useEffect(() => {
    const onAsk = () => openAskAI("chat");
    window.addEventListener("notespace:ask-ai", onAsk as EventListener);
    return () => window.removeEventListener("notespace:ask-ai", onAsk as EventListener);
  }, [openAskAI]);



  // Ctrl+F for find and replace
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        onFindReplaceChange?.(!findReplaceOpen);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [findReplaceOpen, onFindReplaceChange]);

  // Sync the (uncontrolled) title input whenever the saved title diverges -
  // e.g. NotebookContext rewrote it after a duplicate-name prompt, or the user
  // cancelled the prompt and we need to revert the input to the saved title.
  useEffect(() => {
    if (activeNote && titleRef.current && titleRef.current.value !== activeNote.title) {
      titleRef.current.value = activeNote.title;
    }
  }, [activeNote?.title]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { noteId?: string } | undefined;
      if (!detail || !activeNote || detail.noteId !== activeNote.id) return;
      if (titleRef.current) titleRef.current.value = activeNote.title;
    };
    window.addEventListener("lovable:note-title-revert", handler as EventListener);
    return () => window.removeEventListener("lovable:note-title-revert", handler as EventListener);
  }, [activeNote?.id, activeNote?.title]);

  useEffect(() => {
    if (activeNote && titleRef.current) titleRef.current.value = activeNote.title;
    if (activeNote && contentRef.current) contentRef.current.value = activeNote.content;
    setSaveStatus("idle");
    if (activeNote && !isOverrideActive) {
      supabase
        .from("notes")
        .select("tags")
        .eq("id", activeNote.id)
        .single()
        .then(({ data }) => {
          setTags((data as any)?.tags || []);
        });
    } else {
      setTags([]);
    }
    // Flush any pending debounced save when switching notes / unmounting so
    // freshly-inserted attachments aren't lost.
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        const latest = hybridEditorRef.current?.getValue();
        if (activeNote && typeof latest === "string" && latest !== activeNote.content) {
          updateNote(activeNotebookId, activeNote.id, { content: latest });
        }
      }
    };
  }, [activeNote?.id, isOverrideActive]);

  // Refresh stale signed URLs (older notes used a 7-day expiry). Files in storage
  // are permanent - we just regenerate a fresh long-lived signed URL on load.
  useEffect(() => {
    if (!activeNote || isOverrideActive) return;
    const attachments = activeNote.attachments || [];
    if (!attachments.length) return;
    let cancelled = false;
    (async () => {
      let content = activeNote.content || "";
      let changed = false;
      const refreshedAtts: any[] = [];
      for (const att of attachments) {
        if (!att?.path) { refreshedAtts.push(att); continue; }
        const { data, error } = await supabase.storage
          .from("note-attachments")
          .createSignedUrl(att.path, 60 * 60 * 24 * 365 * 10);
        if (error || !data?.signedUrl) { refreshedAtts.push(att); continue; }
        const fresh = data.signedUrl;
        if (att.url && att.url !== fresh) {
          // Replace any occurrence of the old URL in the markdown.
          if (content.includes(att.url)) {
            content = content.split(att.url).join(fresh);
            changed = true;
          }
        }
        refreshedAtts.push({ ...att, url: fresh });
      }
      if (cancelled) return;
      if (changed) {
        await updateNote(activeNotebookId, activeNote.id, { content, attachments: refreshedAtts });
        hybridEditorRef.current?.setContent(content);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      if (!activeNote) return;
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
      if (!markdown) return;
      hybridEditorRef.current?.insertAtCursor(markdown);
      // Persist IMMEDIATELY so attachments survive navigation/refresh
      // (the editor's onChange would otherwise wait 500ms for the debounce).
      if (activeNote) {
        const latest = hybridEditorRef.current?.getValue() ?? "";
        clearTimeout(debounceRef.current);
        updateNote(activeNotebookId, activeNote.id, { content: latest });
      }
    },
    [activeNotebookId, activeNote?.id, updateNote]
  );

  const handleRollbackInsertions = useCallback(
    (snippets: string[]) => {
      if (!activeNote || snippets.length === 0) return;
      let content = hybridEditorRef.current?.getValue() ?? "";
      let changed = false;
      // Strip snippets in reverse insertion order so we peel off the most
      // recent additions first, matching what the user sees on screen.
      for (let i = snippets.length - 1; i >= 0; i--) {
        const idx = content.lastIndexOf(snippets[i]);
        if (idx !== -1) {
          content = content.slice(0, idx) + content.slice(idx + snippets[i].length);
          changed = true;
        }
      }
      if (!changed) return;
      hybridEditorRef.current?.replaceAllUndoable(content);
      clearTimeout(debounceRef.current);
      updateNote(activeNotebookId, activeNote.id, { content });
    },
    [activeNotebookId, activeNote?.id, updateNote]
  );


  const handleToolbarChange = useCallback(
    (content: string) => {
      if (!activeNote) return;
      updateNote(activeNotebookId, activeNote.id, { content });
    },
    [activeNotebookId, activeNote?.id, updateNote]
  );

  const handleVoiceTranscript = useCallback(
    (text: string) => {
      if (!activeNote) return;
      // Drop at the exact caret position the user left; add a leading space only when we're mid-word.
      hybridEditorRef.current?.insertAtCursor(text);
    },
    [activeNote?.id]
  );

  const handleVoiceBeforeOpen = useCallback(() => {
    // Snapshot caret before focus moves to the mic button so we can restore it on insert.
    hybridEditorRef.current?.saveSelection();
  }, []);

  const handleAIEdit = useCallback(
    (newContent: string) => {
      if (!activeNote) return;
      const original = (activeNote.content ?? "").trim();
      const incoming = (newContent ?? "").trim();
      if (!incoming) return;
      // Merge: preserve the user's original content and append the AI edit below it.
      // Notes are stored as rich HTML, so the separator/heading must be HTML too —
      // markdown markers would render as literal "---" / "## AI Edit" text.
      const asHtml = looksLikeHtml(original) || looksLikeHtml(incoming);
      const merged = original
        ? asHtml
          ? `${noteBodyToHtml(original)}<hr><h2>AI Edit</h2>${noteBodyToHtml(incoming)}`
          : `${original}\n\n---\n\n## AI Edit\n\n${incoming}`
        : incoming;
      if (contentRef.current) contentRef.current.value = merged;
      hybridEditorRef.current?.setContent(merged);
      updateNote(activeNotebookId, activeNote.id, { content: merged });
    },
    [activeNotebookId, activeNote?.id, activeNote?.content, updateNote]
  );

  const handleSymbolInsert = useCallback(
    (symbol: string) => {
      hybridEditorRef.current?.insertAtCursor(symbol);
    },
    []
  );

  const handleImportNotes = useCallback(
    (text: string) => {
      hybridEditorRef.current?.insertAtCursor(text);
    },
    []
  );

  const handleMergeAt = useCallback(
    (text: string, position: "top" | "cursor" | "end") => {
      hybridEditorRef.current?.mergeAt(text, position);
    },
    []
  );

  const handleReplaceFromImport = useCallback(
    (text: string) => {
      // Undoable replacement so Ctrl+Z restores the previous note body.
      hybridEditorRef.current?.replaceAllUndoable(text);
    },
    []
  );

  const handleCreateNoteFromImport = useCallback(
    async (text: string, fileName: string) => {
      if (!activeNotebookId) return;
      const { extractDocumentTitle } = await import("@/lib/document-import");
      const title = extractDocumentTitle(text, fileName);
      await createNote(activeNotebookId, title, text);
    },
    [activeNotebookId, createNote]
  );

  // Pending document drop awaiting the user's Create / Merge / Replace choice.
  const [pendingDocDrop, setPendingDocDrop] = useState<{ content: string; fileName: string } | null>(null);

  const handleDocDropChoice = useCallback(
    (choice: import("@/components/ImportActionDialog").ImportChoice | null) => {
      if (!pendingDocDrop) { setPendingDocDrop(null); return; }
      const { content, fileName } = pendingDocDrop;
      setPendingDocDrop(null);
      if (!choice) return;
      if (choice.action === "create") {
        handleCreateNoteFromImport(content, fileName);
      } else if (choice.action === "merge") {
        handleMergeAt(content, choice.position ?? "cursor");
      } else if (choice.action === "replace") {
        handleReplaceFromImport(content);
      }
    },
    [pendingDocDrop, handleCreateNoteFromImport, handleMergeAt, handleReplaceFromImport]
  );

  /**
   * Upload image files (pasted or dropped) and insert them into the body.
   * Shared by the paste handler in the editor and the drop zone below so both
   * paths behave identically.
   */
  const uploadAndInsertImages = useCallback(
    async (files: File[]) => {
      if (!user || !activeNote || !activeNotebookId) return;
      const images = files.filter((f) => f.type.startsWith("image/") && validateFile(f));
      if (images.length === 0) return;
      const newAttachments = [...(activeNote.attachments || [])];
      let inserted = 0;
      for (const file of images) {
        try {
          const path = buildStoragePath(user.id, activeNote.id, file.name);
          const { error } = await supabase.storage.from("note-attachments").upload(path, file);
          if (error) throw error;
          const { data: signed } = await supabase.storage
            .from("note-attachments")
            .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
          const fileUrl = signed?.signedUrl || "";
          newAttachments.push({ name: file.name, url: fileUrl, path, type: file.type, size: file.size });
          hybridEditorRef.current?.insertAtCursor(`![${file.name}](${fileUrl})`);
          inserted++;
        } catch (err: any) {
          toast({ title: "Image upload failed", description: err?.message || "Try again.", variant: "destructive" });
        }
      }
      if (inserted > 0) {
        await updateNote(activeNotebookId, activeNote.id, { attachments: newAttachments });
        toast({ title: inserted > 1 ? "Images added" : "Image added", description: "Inserted into this note." });
      }
    },
    [user, activeNote, activeNotebookId, updateNote]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (!user || !activeNote) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;

      const DOC_EXTS = [".md", ".markdown", ".txt", ".html", ".htm", ".csv", ".json", ".pdf"];
      const docFile = files.find((f) => {
        const dot = f.name.lastIndexOf(".");
        const ext = dot === -1 ? "" : f.name.slice(dot).toLowerCase();
        return DOC_EXTS.includes(ext);
      });
      if (docFile) {
        try {
          setDropProgress({ name: docFile.name, stage: "Reading file…", pct: 15 });
          const { formatImportedDocument } = await import("@/lib/document-import");
          const { extractPdfText } = await import("@/lib/pdf-extract");
          const ext = docFile.name.slice(docFile.name.lastIndexOf(".")).toLowerCase();
          let raw = "";
          if (ext === ".pdf") {
            setDropProgress({ name: docFile.name, stage: "Extracting PDF text…", pct: 40 });
            const { text, isScanned } = await extractPdfText(docFile);
            if (isScanned || !text.trim()) {
              setDropProgress(null);
              toast({ title: "Scanned PDF", description: "This PDF does not contain readable text.", variant: "destructive" });
              return;
            }
            raw = text;
          } else if (ext === ".html" || ext === ".htm") {
            const html = await docFile.text();
            raw = new DOMParser().parseFromString(html, "text/html").body.textContent || "";
          } else {
            raw = await docFile.text();
          }
          if (!raw.trim()) {
            setDropProgress(null);
            toast({ title: "Empty file", description: "The document appears to be empty.", variant: "destructive" });
            return;
          }
          setDropProgress({ name: docFile.name, stage: "Formatting…", pct: 80 });
          const { body: formatted, title: importedTitle } = formatImportedDocument(raw, docFile.name);
          const hasContent = !!activeNote.content?.trim();
          if (!hasContent) {
            hybridEditorRef.current?.replaceAllUndoable(formatted);
            const current = (activeNote.title || "").trim();
            const looksPlaceholder =
              !current ||
              /^untitled/i.test(current) ||
              /^new note/i.test(current) ||
              /^[a-z]{2,4}\d{5,}$/i.test(current);
            if (looksPlaceholder && importedTitle) {
              if (titleRef.current) titleRef.current.value = importedTitle;
              await updateNote(activeNotebookId, activeNote.id, { title: importedTitle });
            }
            setDropProgress({ name: docFile.name, stage: "Done", pct: 100 });
            setTimeout(() => setDropProgress(null), 900);
            toast({ title: "Imported", description: `"${docFile.name}" added to this note.` });
          } else {
            setDropProgress(null);
            setPendingDocDrop({ content: formatted, fileName: docFile.name });
          }
        } catch (err) {
          console.error("Doc drop failed", err);
          setDropProgress(null);
          toast({ title: "Import failed", description: "Could not read the document.", variant: "destructive" });
        }
        return;
      }

      const currentAttachments = activeNote.attachments || [];
      const newAttachments = [...currentAttachments];
      const markdownInserts: string[] = [];
      let hasImages = false;

      for (const file of files) {
        if (!validateFile(file)) continue;
        const path = buildStoragePath(user.id, activeNote.id, file.name);
        const { error } = await supabase.storage.from("note-attachments").upload(path, file);
        if (error) { console.error("Drop upload error:", error); continue; }
        const { data: signedUrlData } = await supabase.storage.from("note-attachments").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
        const fileUrl = signedUrlData?.signedUrl || '';
        newAttachments.push({ name: file.name, url: fileUrl, path: path, type: file.type, size: file.size });
        if (file.type.startsWith("image/")) {
          markdownInserts.push(`![${file.name}](${fileUrl})`);
          hasImages = true;
        }
      }

      await updateNote(activeNotebookId, activeNote.id, { attachments: newAttachments });

      if (markdownInserts.length > 0) {
        for (const md of markdownInserts) hybridEditorRef.current?.insertAtCursor(md);
      }
      if (hasImages) toast({ title: "Image added", description: "Image inserted into note." });
    },
    [user, activeNote?.id, activeNotebookId, activeNote?.content, activeNote?.attachments, updateNote]
  );

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); };


  if (!activeNotebook) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center w-full h-full bg-background">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-5 text-center -mt-16">
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
    // Defensive guard: if the notebook has notes but the active note hasn't
    // been resolved yet (e.g. user clicked a collapsed-sidebar notebook icon
    // and the first-note selection is one render behind), render a quiet
    // placeholder so the NewNotePrompt doesn't flash for 0.5s.
    if (activeNotebook.notes.some((n) => !n.deleted_at)) {
      return <div className="flex-1 bg-background" aria-hidden />;
    }
    return (
      <NewNotePrompt
        notebookName={activeNotebook.name}
        notebookEmoji={activeNotebook.emoji}
        noteCount={activeNotebook.notes.length}
        onBack={() => navigate("/home")}
        onCreateNew={(title?: string, content?: string) => activeNotebookId && createNote(activeNotebookId, title, content)}
        onImportAndCreate={async (content: string, fileName: string) => {
          if (!activeNotebookId) return;
          await createNote(activeNotebookId, fileName.replace(/\.[^.]+$/, "") || "Imported Note", content);
        }}
      />
    );
  }

  const formatDate = (d: string) =>
    new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(d));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      className={`flex-1 flex flex-col bg-background overflow-hidden relative ${dragOver ? "ring-2 ring-primary/50 ring-inset" : ""}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
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

        <AnimatePresence>
          {dropProgress && (
            <motion.div
              key="drop-progress"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              role="status"
              aria-live="polite"
              className="fixed bottom-4 right-4 z-[70] w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl bg-card border border-border p-4 shadow-lg"
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span className="font-medium text-foreground truncate pr-2" title={dropProgress.name}>{dropProgress.name}</span>
                <span>{dropProgress.pct}%</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{dropProgress.stage}</p>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${dropProgress.pct}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
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
            className="w-full text-xl sm:text-3xl font-sans font-bold bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
            placeholder="Note title..."
          />

          {/* Tags row */}
          {!focusMode && !isOverrideActive && (
            <div className="mt-2">
              <NoteTags tags={tags} noteId={activeNote.id} notebookId={activeNotebookId} onTagsUpdated={setTags} />
            </div>
          )}

          {/* Meta & actions row */}
          {!focusMode && (
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
              {/* Core actions always visible on desktop */}
              <div className="hidden lg:flex items-center gap-1">
                <FlashcardsButton />
                <button
                  onClick={() => openAskAI("chat")}
                  className="magnetic-btn inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-xl bg-accent/10 text-accent hover:bg-accent/20 transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-accent/10"
                  title="Ask AI"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Ask AI
                </button>
                <VoiceTranscription onTranscript={handleVoiceTranscript} onBeforeOpen={handleVoiceBeforeOpen} />
                <ExportButtons />
                {activeNote && !isOverrideActive && <ShareNoteDialog noteId={activeNote.id} noteTitle={activeNote.title} notebookName={activeNotebook?.name} />}
              </div>

              {/* Three-dots menu for secondary actions (all sizes) */}
              <div className="relative" ref={moreRef}>
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
                      className="absolute right-0 top-full mt-1 z-50 min-w-[200px] rounded-xl border border-border bg-popover p-2 shadow-lg flex flex-col gap-1 mobile-dropdown"
                    >
                      {/* Mobile / tablet ordering: Import → Voice → Ask AI → Flashcards → AI Edit → Download → Preview */}
                      <div className="lg:hidden flex flex-col gap-1">
                        <ImportNotesButton
                          onInsert={handleInsertMarkdown}
                          onMergeAt={handleMergeAt}
                          onReplace={handleReplaceFromImport}
                          onCreateNew={handleCreateNoteFromImport}
                          onRollbackInsertions={handleRollbackInsertions}
                          hasExistingContent={!!activeNote?.content?.trim()}
                          onSaveSelection={() => hybridEditorRef.current?.saveSelection()}
                        />

                        <VoiceTranscription onTranscript={handleVoiceTranscript} onBeforeOpen={handleVoiceBeforeOpen} />
                        <button
                          onClick={() => { setMoreOpen(false); openAskAI("chat"); }}
                          className="magnetic-btn inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-xl bg-accent/10 text-accent hover:bg-accent/20 transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-accent/10"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          Ask AI
                        </button>
                        <FlashcardsButton />
                        <AIEditPanel onOpen={() => { setMoreOpen(false); openAskAI("edit"); }} />
                        <ExportButtons />
                        <PreviewButton />
                        <button
                          onClick={() => { setMoreOpen(false); setAttachmentsOpen(true); }}
                          className="magnetic-btn inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
                        >
                          <Paperclip className="h-3.5 w-3.5" />
                          Attachments{activeNote?.attachments?.length ? ` (${activeNote.attachments.length})` : ""}
                        </button>
                      </div>
                      {/* Desktop: secondary actions only (primary actions are inline above) */}
                      <div className="hidden lg:flex flex-col gap-1">
                        <ImportNotesButton
                          onInsert={handleInsertMarkdown}
                          onMergeAt={handleMergeAt}
                          onReplace={handleReplaceFromImport}
                          onCreateNew={handleCreateNoteFromImport}
                          onRollbackInsertions={handleRollbackInsertions}
                          hasExistingContent={!!activeNote?.content?.trim()}
                          onSaveSelection={() => hybridEditorRef.current?.saveSelection()}
                        />

                        <AIEditPanel onOpen={() => { setMoreOpen(false); openAskAI("edit"); }} />
                        <PreviewButton />
                        <button
                          onClick={() => { setMoreOpen(false); setAttachmentsOpen(true); }}
                          className="magnetic-btn inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
                        >
                          <Paperclip className="h-3.5 w-3.5" />
                          Attachments{activeNote?.attachments?.length ? ` (${activeNote.attachments.length})` : ""}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="shrink-0 border-b border-border bg-muted/30 overflow-x-auto scrollbar-none">
          <MarkdownToolbar
            editorRef={{
              get current() {
                return hybridEditorRef.current?.getEditorElement() ?? null;
              },
            } as React.RefObject<HTMLDivElement>}
            onFindReplace={() => onFindReplaceChange?.(!findReplaceOpen)}
          >
            <SymbolsPicker onInsert={handleSymbolInsert} editorRef={{
              get current() {
                return hybridEditorRef.current?.getEditorElement() ?? null;
              },
            } as React.RefObject<HTMLDivElement>} />
          </MarkdownToolbar>
        </div>

        {/* Find and Replace */}
        <FindReplace
          editorRef={{
            get current() {
              return hybridEditorRef.current?.getEditorElement() ?? null;
            },
          } as React.RefObject<HTMLDivElement>}
          open={findReplaceOpen}
          onClose={() => onFindReplaceChange?.(false)}
        />

        {/* Content area - scrolls internally only when content exceeds available height. Scrollbar visually hidden. */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none">
          <HybridEditor
            ref={hybridEditorRef}
            content={activeNote.content || ""}
            onChange={(content) => { setLiveContent(content); debouncedUpdate("content", content); }}
            placeholder={focusMode ? "Just write..." : "Start writing..."}
            onImageFiles={uploadAndInsertImages}
          />
        </div>

        {/* Per-note attachments manager (remove / replace / download) */}
        <AttachmentsDialog open={attachmentsOpen} onOpenChange={setAttachmentsOpen} />

        {/* Realtime word / character / read-time counter (+ optional goal ring) */}
        <div className="shrink-0 border-t border-border flex items-center justify-between">
          <WordCount content={liveContent} />
          {wordCountGoalEnabled && (
            <WordCountGoal content={liveContent} />
          )}
        </div>



        {/* Shared Ask-AI panel (controlled). Triggered by Ask AI button and by AI Edit button. */}
        <AskAIPanel
          hideTrigger
          open={askAIOpen}
          onOpenChange={setAskAIOpen}
          defaultMode={askAIMode}
          onApplyEdit={handleAIEdit}
        />
        {pendingDocDrop && (
          <ImportActionDialog
            open
            fileName={pendingDocDrop.fileName}
            hasExistingContent={!!activeNote?.content?.trim()}
            onChoose={handleDocDropChoice}
          />
        )}
      </motion.div>

  );
}
