import { useRef, useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Clock, Plus, Upload, MoreHorizontal, Layers, Cloud, Check, Loader2, Eye } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useNotebooks } from "@/context/NotebookContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AskAIPanel } from "@/components/AskAIPanel";
import { AIEditPanel } from "@/components/AIEditPanel";
import { ExportButtons } from "@/components/ExportButtons";
import { ShareNoteDialog } from "@/components/ShareNoteDialog";
import { VoiceTranscription } from "@/components/VoiceTranscription";
import { NoteTags } from "@/components/NoteTags";
import { FileUpload } from "@/components/FileUpload";
import { MarkdownToolbar } from "@/components/MarkdownToolbar";
import { HybridEditor, HybridEditorHandle } from "@/components/HybridEditor";
import { SymbolsPicker } from "@/components/SymbolsPicker";
import { WordCount } from "@/components/WordCount";
import { WordCountGoal } from "@/components/WordCountGoal";
import { FindReplace } from "@/components/FindReplace";
import { ImportNotesButton } from "@/components/ImportNotesButton";
import { NewNotePrompt } from "@/components/NewNotePrompt";
import { validateFile, buildStoragePath } from "@/lib/file-validation";
import { toast } from "@/hooks/use-toast";

import { X as XIcon, ChevronLeft, ChevronRight, RotateCcw, Sparkles, Trophy } from "lucide-react";

const AI_TOOLS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tools`;

const CARD_COLORS = [
  { bg: "from-violet-500/20 to-purple-600/20", border: "border-violet-400/30", accent: "text-violet-400", ring: "ring-violet-400/30", emoji: "🟣" },
  { bg: "from-emerald-500/20 to-teal-600/20", border: "border-emerald-400/30", accent: "text-emerald-400", ring: "ring-emerald-400/30", emoji: "🟢" },
  { bg: "from-amber-500/20 to-orange-600/20", border: "border-amber-400/30", accent: "text-amber-400", ring: "ring-amber-400/30", emoji: "🟡" },
  { bg: "from-rose-500/20 to-pink-600/20", border: "border-rose-400/30", accent: "text-rose-400", ring: "ring-rose-400/30", emoji: "🔴" },
  { bg: "from-sky-500/20 to-blue-600/20", border: "border-sky-400/30", accent: "text-sky-400", ring: "ring-sky-400/30", emoji: "🔵" },
  { bg: "from-lime-500/20 to-green-600/20", border: "border-lime-400/30", accent: "text-lime-400", ring: "ring-lime-400/30", emoji: "🍏" },
  { bg: "from-fuchsia-500/20 to-pink-600/20", border: "border-fuchsia-400/30", accent: "text-fuchsia-400", ring: "ring-fuchsia-400/30", emoji: "💜" },
  { bg: "from-cyan-500/20 to-teal-600/20", border: "border-cyan-400/30", accent: "text-cyan-400", ring: "ring-cyan-400/30", emoji: "🩵" },
];

interface FlashCard {
  question: string;
  answer: string;
}

function parseFlashcards(text: string): FlashCard[] {
  const cards: FlashCard[] = [];
  // Match **Q:** ... **A:** ... patterns
  const regex = /\*\*Q:\*\*\s*(.*?)(?:\n|\r\n?)\s*\*\*A:\*\*\s*(.*?)(?=\n\s*---|\n\s*\*\*Q:\*\*|$)/gs;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const q = match[1].trim();
    const a = match[2].trim();
    if (q && a) cards.push({ question: q, answer: a });
  }
  return cards;
}

function FlashcardGame({ cards, onClose }: { cards: FlashCard[]; onClose: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [completed, setCompleted] = useState(false);

  const card = cards[currentIndex];
  const color = CARD_COLORS[currentIndex % CARD_COLORS.length];
  const isRevealed = revealed.has(currentIndex);
  const revealedCount = revealed.size;

  const revealCard = () => {
    setRevealed((prev) => new Set(prev).add(currentIndex));
  };

  const goNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (revealedCount === cards.length) {
      setCompleted(true);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const restart = () => {
    setCurrentIndex(0);
    setRevealed(new Set());
    setCompleted(false);
  };

  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center flex-1 p-8 text-center"
      >
        <motion.div
          initial={{ rotate: -10, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <Trophy className="h-16 w-16 text-amber-400 mb-4" />
        </motion.div>
        <h3 className="text-2xl font-bold text-foreground mb-2">🎉 All Done!</h3>
        <p className="text-muted-foreground text-sm mb-6">
          You reviewed all {cards.length} flashcards!
        </p>
        <div className="flex gap-3">
          <button
            onClick={restart}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <RotateCcw className="h-4 w-4" />
            Play Again
          </button>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col flex-1 p-4 overflow-hidden">
      {/* Progress */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
            initial={{ width: 0 }}
            animate={{ width: `${((revealedCount) / cards.length) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        <span className="text-xs font-medium text-muted-foreground tabular-nums">
          {revealedCount}/{cards.length}
        </span>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 40, rotateY: -5 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            exit={{ opacity: 0, x: -40, rotateY: 5 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            <div
              onClick={!isRevealed ? revealCard : undefined}
              className={`relative w-full rounded-3xl border-2 ${color.border} bg-gradient-to-br ${color.bg} p-6 ${
                !isRevealed ? "cursor-pointer hover:ring-2 " + color.ring : ""
              } transition-all duration-300`}
              style={{ minHeight: 220 }}
            >
              {/* Card number badge */}
              <div className="absolute top-4 left-4">
                <span className={`text-xs font-bold ${color.accent} opacity-70`}>
                  {color.emoji} Card {currentIndex + 1}
                </span>
              </div>

              {/* Question */}
              <div className="mt-8 mb-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">Question</p>
                <p className="text-base font-semibold text-foreground leading-relaxed">{card.question}</p>
              </div>

              {/* Answer area */}
              {isRevealed ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="pt-4 border-t border-foreground/10"
                >
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">Answer</p>
                  <p className="text-sm text-foreground/90 leading-relaxed">{card.answer}</p>
                </motion.div>
              ) : (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="pt-4 border-t border-foreground/10"
                >
                  <div className="flex items-center justify-center gap-2 py-4">
                    <Sparkles className={`h-4 w-4 ${color.accent}`} />
                    <span className="text-sm font-medium text-muted-foreground">
                      Tap to reveal answer
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-4 pt-2">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </button>

        <div className="flex gap-1.5">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                i === currentIndex
                  ? "bg-primary scale-125"
                  : revealed.has(i)
                  ? "bg-primary/40"
                  : "bg-muted-foreground/20"
              }`}
            />
          ))}
        </div>

        <button
          onClick={goNext}
          disabled={currentIndex === cards.length - 1 && revealedCount < cards.length}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          {currentIndex === cards.length - 1 && revealedCount === cards.length ? "Finish" : "Next"}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function FlashcardsButton() {
  const { activeNote } = useNotebooks();
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cards, setCards] = useState<FlashCard[]>([]);

  // Parse cards whenever result updates
  useEffect(() => {
    if (result) {
      const parsed = parseFlashcards(result);
      if (parsed.length > 0) setCards(parsed);
    }
  }, [result]);

  const run = async () => {
    if (!activeNote) return;
    setOpen(true);
    setResult("");
    setError("");
    setCards([]);
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
            className="fixed right-0 top-0 h-full w-[520px] max-w-[95vw] bg-card border-l border-border shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Layers className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <span className="font-sans font-bold text-foreground text-sm">Flashcards</span>
                  {cards.length > 0 && (
                    <p className="text-[10px] text-muted-foreground">{cards.length} cards generated</p>
                  )}
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-xl hover:bg-muted transition-colors">
                <XIcon className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Loading state */}
            {loading && cards.length === 0 && (
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

            {/* Error state */}
            {error && (
              <div className="flex-1 flex items-center justify-center p-8">
                <p className="text-sm text-destructive text-center">{error}</p>
              </div>
            )}

            {/* Game view */}
            {cards.length > 0 && !loading && (
              <FlashcardGame cards={cards} onClose={() => setOpen(false)} />
            )}

            {/* Streaming preview while still loading */}
            {loading && cards.length > 0 && (
              <FlashcardGame cards={cards} onClose={() => setOpen(false)} />
            )}
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


export function NoteEditor({ focusMode = false, findReplaceOpen = false, onFindReplaceChange }: { focusMode?: boolean; findReplaceOpen?: boolean; onFindReplaceChange?: (open: boolean) => void }) {
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
      if (!markdown) return;
      // Insert at cursor position in the hybrid editor
      hybridEditorRef.current?.insertAtCursor(markdown);
    },
    []
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

  const handleImportNotes = useCallback(
    (text: string) => {
      hybridEditorRef.current?.insertAtCursor(text);
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
        const { data: signedUrlData } = await supabase.storage.from("note-attachments").createSignedUrl(path, 60 * 60 * 24 * 7);
        const fileUrl = signedUrlData?.signedUrl || '';
        newAttachments.push({ name: file.name, url: fileUrl, path: path, type: file.type, size: file.size });
        if (file.type.startsWith("image/")) {
          markdownInserts.push(`![${file.name}](${fileUrl})`);
          hasImages = true;
        }
      }

      await updateNote(activeNotebookId, activeNote.id, {
        attachments: newAttachments,
      });

      // Insert images at cursor position
      if (markdownInserts.length > 0) {
        for (const md of markdownInserts) {
          hybridEditorRef.current?.insertAtCursor(md);
        }
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
    return (
      <NewNotePrompt
        notebookName={activeNotebook.name}
        notebookEmoji={activeNotebook.emoji}
        noteCount={activeNotebook.notes.length}
        onCreateNew={(title?: string, content?: string) => activeNotebookId && createNote(activeNotebookId, title, content)}
        onImportAndCreate={async (content: string, fileName: string) => {
          if (!activeNotebookId) return;
          await createNote(activeNotebookId);
          // We'll insert content after creation via a slight delay
          setTimeout(() => {
            hybridEditorRef.current?.insertAtCursor(`## Imported: ${fileName}\n\n${content}`);
          }, 500);
        }}
      />
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
          {!focusMode && (
            <div className="mt-2">
              <NoteTags tags={tags} noteId={activeNote.id} notebookId={activeNotebookId!} onTagsUpdated={setTags} />
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
                <AskAIPanel onApplyEdit={handleAIEdit} />
                <VoiceTranscription onTranscript={handleVoiceTranscript} />
                <ExportButtons />
                {activeNote && <ShareNoteDialog noteId={activeNote.id} noteTitle={activeNote.title} />}
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
                      className="absolute right-0 top-full mt-1 z-50 min-w-[180px] rounded-xl border border-border bg-popover p-2 shadow-lg flex flex-col gap-1 mobile-dropdown"
                      onClick={() => setMoreOpen(false)}
                    >
                      {/* Show these only in mobile dropdown (hidden on desktop) */}
                      <div className="lg:hidden flex flex-col gap-1">
                        <FlashcardsButton />
                        <AskAIPanel onApplyEdit={handleAIEdit} />
                        <VoiceTranscription onTranscript={handleVoiceTranscript} />
                        <ExportButtons />
                      </div>
                      {/* Secondary actions always in dropdown */}
                      <AIEditPanel onApplyEdit={handleAIEdit} />
                      <PreviewButton />
                      <ImportNotesButton onInsert={handleImportNotes} />
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

        {/* Content area */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <HybridEditor
            ref={hybridEditorRef}
            content={activeNote.content || ""}
            onChange={(content) => debouncedUpdate("content", content)}
            placeholder={focusMode ? "Just write..." : "Start writing... (drag & drop files here)"}
          />
        </div>

        {/* Word count, goal & reading time */}
        <div className="shrink-0 border-t border-border flex items-center justify-between">
          <WordCount content={activeNote?.content || ""} />
          <WordCountGoal content={activeNote?.content || ""} />
        </div>

        {/* File upload */}
        {!focusMode && (
          <div className="shrink-0 border-t border-border">
            <FileUpload onInsertMarkdown={handleInsertMarkdown} />
          </div>
        )}

      </motion.div>
    </AnimatePresence>
  );
}
