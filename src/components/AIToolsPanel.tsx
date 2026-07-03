import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Layers, X, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useNotebooks } from "@/context/NotebookContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { FlashcardDeck } from "@/components/FlashcardDeck";
import { getFlashcardSourceText, MIN_FLASHCARD_BODY_CHARS } from "@/lib/note-body";

const AI_TOOLS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tools`;

type ToolMode = "summarize" | "flashcards";

export function AIToolsPanel() {
  const { activeNote } = useNotebooks();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ToolMode>("summarize");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const flashcardSource = () => getFlashcardSourceText(activeNote?.content || "", activeNote?.title || "");

  // Gibberish heuristic lives in @/lib/gibberish so it can be unit tested.

  const openFlashcards = () => {
    if (!activeNote) return;
    const source = flashcardSource();
    if (!source) {
      toast.error("Please write something in the note first.");
      return;
    }
    if (source.length < MIN_FLASHCARD_BODY_CHARS) {
      toast.error("Write a bit more first - at least ~100 characters of actual notes (headings don't count).");
      return;
    }
    if (looksLikeGibberish(source)) {
      setMode("flashcards");
      setResult("");
      setError("__gibberish__");
      setOpen(true);
      return;
    }
    // Auto-detect: no picker. Edge function extracts every atomic concept and
    // emits exactly one card per concept (capped at 50).
    runTool("flashcards");
  };

  const runTool = async (toolMode: ToolMode, count?: number) => {
    if (!activeNote) return;
    const source = toolMode === "flashcards" ? flashcardSource() : (activeNote.content || "").replace(/<[^>]*>/g, "").trim();
    if (!source) {
      toast.error(
        toolMode === "flashcards"
          ? "Please write something in the note first."
          : "Notebook is empty - write something first."
      );
      return;
    }
    if (toolMode === "flashcards" && source.length < MIN_FLASHCARD_BODY_CHARS) {
      toast.error("Write at least ~100 characters of actual notes (headings don't count).");
      return;
    }
    setMode(toolMode);
    setOpen(true);
    setResult("");
    setError("");
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Please sign in to use AI tools");

      const resp = await fetch(AI_TOOLS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          action: toolMode,
          noteTitle: toolMode === "flashcards" ? "" : activeNote.title,
          noteContent: toolMode === "flashcards" ? source : activeNote.content,
          ...(toolMode === "flashcards" && count ? { count } : {}),
        }),
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
            if (content) {
              text += content;
              setResult(text);
            }
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

  const modeLabel = mode === "summarize" ? "Summary" : "Flashcards";
  const ModeIcon = mode === "summarize" ? BookOpen : Layers;

  return (
    <>
      <div className="flex items-center gap-1">
        <button
          onClick={() => runTool("summarize")}
          className="magnetic-btn inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
          title="AI Summary (Pro)"
        >
          <BookOpen className="h-3.5 w-3.5" />
          Summarize
        </button>
        <button
          onClick={openFlashcards}
          className="magnetic-btn inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-[hsl(280_60%_55%/0.35)] bg-[hsl(280_60%_55%/0.08)] text-[hsl(280_65%_55%)] hover:bg-[hsl(280_60%_55%/0.15)] hover:text-[hsl(280_70%_50%)] transition-all duration-200 dark:text-[hsl(280_75%_75%)] dark:hover:text-[hsl(280_80%_82%)]"
          title="Generate Flashcards (Pro)"
        >
          <Layers className="h-3.5 w-3.5" />
          Flashcards
        </button>
      </div>

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
                <ModeIcon className="h-4 w-4 text-primary" />
                <span className="font-sans font-bold text-foreground">AI {modeLabel}</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-muted transition-colors">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
              {loading && !result && mode === "flashcards" && (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <Loader2 className="h-5 w-5 mb-2 animate-spin" />
                  <p className="text-sm">Extracting concepts and building your deck…</p>
                </div>
              )}
              {loading && !result && mode !== "flashcards" && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating {modeLabel.toLowerCase()}…
                </div>
              )}
              {(error === "__gibberish__" ||
                (mode === "flashcards" && !loading && result.trim().toUpperCase().includes("NO_CONCEPTS"))) && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-foreground">
                  <p className="font-semibold mb-1">Make it make sense for me 🙃</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    I can only build flashcards from notes that actually explain something. Add real
                    sentences, definitions, or examples and try again.
                  </p>
                </div>
              )}
              {error && error !== "__gibberish__" && <p className="text-sm text-destructive">{error}</p>}
              {result && mode === "flashcards" && !result.trim().toUpperCase().includes("NO_CONCEPTS") && (
                <FlashcardDeck markdown={result} streaming={loading} />
              )}
              {result && mode === "summarize" && (
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
