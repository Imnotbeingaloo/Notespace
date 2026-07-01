import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, RotateCw, Sparkles, Trophy } from "lucide-react";

export type Flashcard = { q: string; a: string };

/**
 * Parses the markdown emitted by the `flashcards` AI tool into a structured
 * deck. The model is instructed to emit blocks separated by `---`, each with:
 *
 *   **Q:** ...question...
 *   **A:** ...answer...
 *
 * This parser is intentionally forgiving so half-streamed text still renders
 * something usable while the rest arrives.
 */
export function parseFlashcards(markdown: string): Flashcard[] {
  if (!markdown) return [];
  const blocks = markdown.split(/\n-{3,}\n|\n\*{3,}\n/g);
  const cards: Flashcard[] = [];
  for (const block of blocks) {
    const qMatch = block.match(/\*\*\s*Q\s*:?\s*\*\*\s*([\s\S]*?)(?=\n\s*\*\*\s*A\s*:?\s*\*\*|$)/i);
    const aMatch = block.match(/\*\*\s*A\s*:?\s*\*\*\s*([\s\S]*?)$/i);
    const q = qMatch?.[1]?.trim();
    const a = aMatch?.[1]?.trim();
    if (q && a) cards.push({ q, a });
  }
  return cards;
}

interface FlashcardDeckProps {
  markdown: string;
  /** True while the upstream stream is still appending content. */
  streaming?: boolean;
}

/**
 * NotebookLM-inspired flashcard reviewer. Cards flip on click to reveal the
 * answer, then the learner self-grades with "Got it" / "Review again". Cards
 * marked for review cycle back through the deck so the goal is genuine
 * concept mastery, not just clicking through.
 */
export function FlashcardDeck({ markdown, streaming }: FlashcardDeckProps) {
  const parsed = useMemo(() => parseFlashcards(markdown), [markdown]);
  // Working queue of indices into `parsed`. Wrong cards get re-queued.
  const [queue, setQueue] = useState<number[] | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  // -1 = wrong, 1 = right, 0 = neutral. Drives swipe-out animation direction.
  const [verdict, setVerdict] = useState<-1 | 0 | 1>(0);

  // Initialize/reset queue when the parsed deck changes (e.g. new generation).
  const deckKey = parsed.length;
  const activeQueue = queue ?? parsed.map((_, i) => i);
  if (queue == null && parsed.length > 0) {
    // First render with a non-empty deck: seed lazily without a useEffect to
    // avoid an extra render flicker during streaming.
    setQueue(parsed.map((_, i) => i));
  }

  if (parsed.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
        <Sparkles className="h-5 w-5 mb-2 animate-pulse" />
        <p className="text-sm">{streaming ? "Building your flashcards…" : "No flashcards yet."}</p>
      </div>
    );
  }

  const finished = activeQueue.length === 0;

  if (finished) {
    const total = correct + wrong;
    const pct = total ? Math.round((correct / total) * 100) : 0;
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center text-center py-8"
      >
        <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
          <Trophy className="h-6 w-6" />
        </div>
        <h3 className="font-sans font-bold text-foreground text-lg">Deck complete</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {correct} got it · {wrong} need review · {pct}% on first pass
        </p>
        <button
          onClick={() => {
            setQueue(parsed.map((_, i) => i));
            setCorrect(0);
            setWrong(0);
            setFlipped(false);
            setVerdict(0);
          }}
          className="magnetic-btn mt-5 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
        >
          <RotateCw className="h-4 w-4" /> Run deck again
        </button>
      </motion.div>
    );
  }

  const currentIdx = activeQueue[0];
  const card = parsed[currentIdx];
  const total = parsed.length;
  const reviewedCount = correct + wrong;

  const grade = (isCorrect: boolean) => {
    setVerdict(isCorrect ? 1 : -1);
    // Animate out, then advance state on the next tick so AnimatePresence sees it.
    setTimeout(() => {
      setQueue((prev) => {
        const q = prev ?? parsed.map((_, i) => i);
        const [head, ...rest] = q;
        return isCorrect ? rest : [...rest, head];
      });
      if (isCorrect) setCorrect((c) => c + 1);
      else setWrong((w) => w + 1);
      setFlipped(false);
      setVerdict(0);
    }, 260);
  };

  return (
    <div className="flex flex-col items-center w-full" key={deckKey}>
      {/* Progress strip */}
      <div className="w-full max-w-md mb-3">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
          <span className="font-medium">Card {Math.min(reviewedCount + 1, total)} of {total}</span>
          <span className="inline-flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <Check className="h-3 w-3" /> {correct}
            </span>
            <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400">
              <X className="h-3 w-3" /> {wrong}
            </span>
          </span>
        </div>
        <div className="h-1 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={false}
            animate={{ width: `${(reviewedCount / total) * 100}%` }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      {/* Card stack */}
      <div className="relative w-full max-w-md h-64 [perspective:1400px]">
        {/* Peek of next card */}
        {activeQueue[1] != null && (
          <div
            aria-hidden
            className="absolute inset-0 rounded-2xl bg-card border border-border/60 shadow-sm"
            style={{ transform: "translateY(10px) scale(0.97)", opacity: 0.65 }}
          />
        )}

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={
              verdict === 0
                ? { opacity: 1, y: 0, scale: 1, x: 0, rotate: 0 }
                : {
                    opacity: 0,
                    x: verdict === 1 ? 260 : -260,
                    rotate: verdict === 1 ? 14 : -14,
                    transition: { duration: 0.32, ease: [0.4, 0, 0.2, 1] },
                  }
            }
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            {(() => {
              // Rotate a small palette so consecutive cards feel distinct
              // instead of a single purple wall.
              const PALETTES = [
                { h: "265 70% 60%" },
                { h: "200 85% 52%" },
                { h: "160 65% 45%" },
                { h: "35 90% 55%" },
                { h: "340 80% 60%" },
                { h: "185 70% 45%" },
              ];
              const pal = PALETTES[currentIdx % PALETTES.length];
              return (
                <button
                  type="button"
                  onClick={() => setFlipped((f) => !f)}
                  className="group relative w-full h-full rounded-2xl text-left [transform-style:preserve-3d] transition-transform duration-500"
                  style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
                  aria-label={flipped ? "Show question" : "Show answer"}
                >
                  <div
                    className="absolute inset-0 rounded-2xl shadow-md p-6 flex flex-col [backface-visibility:hidden]"
                    style={{
                      background: `linear-gradient(135deg, hsl(${pal.h} / 0.10), hsl(${pal.h} / 0.02))`,
                      border: `1px solid hsl(${pal.h} / 0.35)`,
                    }}
                  >
                    <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: `hsl(${pal.h})` }}>Question</span>
                    <p className="mt-3 flex-1 text-foreground text-[15px] leading-relaxed overflow-y-auto pr-1">{card.q}</p>
                    <span className="mt-3 text-[11px] text-muted-foreground/80">Tap to reveal answer</span>
                  </div>
                  <div
                    className="absolute inset-0 rounded-2xl shadow-md p-6 flex flex-col [backface-visibility:hidden]"
                    style={{
                      background: `linear-gradient(135deg, hsl(${pal.h} / 0.18), hsl(${pal.h} / 0.06))`,
                      border: `1px solid hsl(${pal.h} / 0.5)`,
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: `hsl(${pal.h})` }}>Answer</span>
                    <p className="mt-3 flex-1 text-foreground text-[15px] leading-relaxed overflow-y-auto pr-1">{card.a}</p>
                    <span className="mt-3 text-[11px] text-muted-foreground/80">Tap to flip back</span>
                  </div>
                </button>
              );
            })()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Grade buttons only appear after reveal (NotebookLM-style). */}
      <div className="mt-5 h-[46px] flex items-center justify-center">
        {flipped ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3"
          >
            <button
              onClick={() => grade(false)}
              disabled={verdict !== 0}
              className="magnetic-btn group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <X className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span className="text-sm font-medium">Review again</span>
            </button>
            <button
              onClick={() => grade(true)}
              disabled={verdict !== 0}
              className="magnetic-btn group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span className="text-sm font-medium">Got it</span>
            </button>
          </motion.div>
        ) : (
          <p className="text-[11px] text-muted-foreground">Flip the card to grade your recall.</p>
        )}
      </div>
    </div>
  );
}

