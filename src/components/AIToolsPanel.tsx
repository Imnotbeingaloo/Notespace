import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Layers, X, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useNotebooks } from "@/context/NotebookContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { FlashcardDeck } from "@/components/FlashcardDeck";

const AI_TOOLS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tools`;

type ToolMode = "summarize" | "flashcards";

export function AIToolsPanel() {
  const { activeNote } = useNotebooks();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ToolMode>("summarize");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Flashcards setup step: ask the user how many cards before generating.
  const [setupMode, setSetupMode] = useState<null | "flashcards">(null);
  const [cardCount, setCardCount] = useState<number>(10);

  const isNoteEmpty = () => {
    if (!activeNote) return true;
    const plain = (activeNote.content || "").replace(/<[^>]*>/g, "").trim();
    return plain.length === 0;
  };

  /** Body-only length: strips HTML, strips markdown headings (# / ## / ###),
   *  and drops empty lines. We never let the model quiz the learner on the
   *  note's title or a bare heading - only on actual written content. */
  const bodyLength = () => {
    if (!activeNote) return 0;
    const noHtml = (activeNote.content || "").replace(/<[^>]*>/g, "\n");
    const lines = noHtml
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !/^#{1,6}\s/.test(l));
    return lines.join(" ").length;
  };
  const MIN_BODY = 100;

  const openFlashcardsSetup = () => {
    if (!activeNote) return;
    if (isNoteEmpty()) {
      toast.error("Please write something in the note first.");
      return;
    }
    if (bodyLength() < MIN_BODY) {
      toast.error("Write a bit more first - at least ~100 characters of actual notes (headings don't count).");
      return;
    }
    setMode("flashcards");
    setSetupMode("flashcards");
    setResult("");
    setError("");
    setOpen(true);
  };

  const runTool = async (toolMode: ToolMode, count?: number) => {
    if (!activeNote) return;
    if (isNoteEmpty()) {
      toast.error(
        toolMode === "flashcards"
          ? "Please write something in the note first."
          : "Notebook is empty - write something first."
      );
      return;
    }
    if (toolMode === "flashcards" && bodyLength() < MIN_BODY) {
      toast.error("Write at least ~100 characters of actual notes (headings don't count).");
      return;
    }
    setMode(toolMode);
    setSetupMode(null);
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
          noteTitle: activeNote.title,
          noteContent: activeNote.content,
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
          onClick={openFlashcardsSetup}
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
              {setupMode === "flashcards" && !loading && !result && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">How many flashcards?</p>
                    <p className="text-xs text-muted-foreground">
                      Pick a deck size. We'll generate concept-focused Q&amp;A from your note.
                    </p>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[3, 5, 7, 10].map((n) => (
                      <button
                        key={n}
                        onClick={() => setCardCount(n)}
                        className={`px-2 py-2 rounded-lg text-sm font-medium border transition-colors ${
                          cardCount === n
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => runTool("flashcards", cardCount)}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Layers className="h-4 w-4" />
                    Generate {cardCount} cards
                  </button>
                </div>
              )}
              {loading && !result && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating {modeLabel.toLowerCase()}…
                </div>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
              {result && mode === "flashcards" && (
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
