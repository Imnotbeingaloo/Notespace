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

  /**
   * Stricter gibberish heuristic. Rejects text that is technically long enough
   * but is mostly noise: repeated tokens, low vocabulary variety, low ratio of
   * plausibly-real words (vowel + consonant, no 3+ char runs, no repeated bigrams).
   */
  const looksLikeGibberish = (text: string) => {
    const clean = text.toLowerCase().replace(/\s+/g, " ").trim();
    if (!clean) return true;
    const tokens = clean.split(/\s+/).filter((t) => /[a-z]/.test(t));
    if (tokens.length < 3) return true;

    // Repeated identical tokens run: "the the the the"
    let maxRun = 1, run = 1;
    for (let i = 1; i < tokens.length; i++) {
      if (tokens[i] === tokens[i - 1]) { run++; maxRun = Math.max(maxRun, run); } else run = 1;
    }
    if (maxRun >= 4) return true;

    // Repeated bigrams: "maka dora maka dora maka dora"
    const bigrams = new Map<string, number>();
    for (let i = 0; i < tokens.length - 1; i++) {
      const bg = tokens[i] + " " + tokens[i + 1];
      bigrams.set(bg, (bigrams.get(bg) || 0) + 1);
    }
    for (const c of bigrams.values()) if (c >= 3) return true;

    // Vocabulary diversity
    const uniqueWords = new Set(tokens);
    if (tokens.length >= 8 && uniqueWords.size / tokens.length < 0.35) return true;

    // Plausible-word ratio: has vowel + consonant, no 3+ same-char run
    const looksLikeWord = (w: string) => {
      const letters = w.replace(/[^a-z]/g, "");
      if (letters.length < 2) return false;
      if (!/[aeiouy]/.test(letters)) return false;
      if (!/[bcdfghjklmnpqrstvwxz]/.test(letters)) return false;
      if (/(.)\1{2,}/.test(letters)) return false;
      return true;
    };
    const validRatio = tokens.filter(looksLikeWord).length / tokens.length;
    if (validRatio < 0.55) return true;

    return false;
  };

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
              {error === "__gibberish__" && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-foreground">
                  <p className="font-semibold mb-1">Make it make sense for me 🙃</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    I can only build flashcards from notes that actually explain something. Add real
                    sentences, definitions, or examples and try again.
                  </p>
                </div>
              )}
              {error && error !== "__gibberish__" && <p className="text-sm text-destructive">{error}</p>}
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
