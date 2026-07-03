import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, RotateCw, Sparkles, Trophy, X } from "lucide-react";

export type Flashcard = { q: string; a: string };

/**
 * Parses the markdown emitted by the `flashcards` AI tool into a structured
 * deck. Blocks are separated by `---`, each with:
 *
 *   **Q:** question
 *   **A:** answer
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
  streaming?: boolean;
}

/**
 * Flashcard reviewer.
 *  - Tap the card or press Space to reveal the answer. When revealed, the
 *    question stays on top and the answer slides in below (no flip).
 *  - Prev arrow anchored far left, next arrow anchored far right.
 *  - Wrong / Right graders centered with generous spacing.
 *  - After grading, a small ephemeral encouragement card appears briefly
 *    ("You got it" / "You'll get it next time") and disappears after ~1s.
 */
export function FlashcardDeck({ markdown, streaming }: FlashcardDeckProps) {
  const parsed = useMemo(() => parseFlashcards(markdown), [markdown]);
  const total = parsed.length;

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [nudge, setNudge] = useState<null | "correct" | "wrong">(null);
  const [finished, setFinished] = useState(false);

  const cardKey = parsed.map((c) => `${c.q}\u0000${c.a}`).join("\u0001");

  useEffect(() => {
    setIndex(0);
    setRevealed(false);
    setCorrect(0);
    setWrong(0);
    setNudge(null);
    setFinished(false);
  }, [cardKey]);

  const palettes = useMemo(
    () => [
      "268 62% 58%", "204 76% 48%", "162 58% 40%", "38 78% 50%", "344 62% 52%",
      "186 62% 42%", "225 64% 56%", "20 68% 52%", "142 52% 42%", "312 52% 54%",
    ],
    []
  );

  const currentCard = parsed[index];

  const goto = (nextIdx: number) => {
    if (total === 0) return;
    const clamped = Math.max(0, Math.min(total - 1, nextIdx));
    setIndex(clamped);
    setRevealed(false);
  };

  const grade = (isCorrect: boolean) => {
    if (!revealed) return;
    if (isCorrect) setCorrect((c) => c + 1);
    else setWrong((w) => w + 1);
    setNudge(isCorrect ? "correct" : "wrong");
    window.setTimeout(() => setNudge(null), 1000);
    window.setTimeout(() => {
      if (index + 1 >= total) setFinished(true);
      else goto(index + 1);
    }, 260);
  };

  const rootRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (finished || total === 0) return;
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); setRevealed((r) => !r); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); goto(index - 1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); goto(index + 1); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [index, total, finished]);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
        <Sparkles className="h-5 w-5 mb-2 animate-pulse" />
        <p className="text-sm">{streaming ? "Building your flashcards…" : "No flashcards yet."}</p>
      </div>
    );
  }

  if (finished) {
    const answered = correct + wrong;
    const pct = answered ? Math.round((correct / answered) * 100) : 0;
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center text-center py-10"
      >
        <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
          <Trophy className="h-6 w-6" />
        </div>
        <h3 className="font-sans font-bold text-foreground text-lg">Deck complete</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {correct} got it · {wrong} need review · {pct}% right
        </p>
        <button
          onClick={() => {
            setIndex(0);
            setCorrect(0);
            setWrong(0);
            setRevealed(false);
            setFinished(false);
          }}
          className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
        >
          <RotateCw className="h-4 w-4" /> Run deck again
        </button>
      </motion.div>
    );
  }

  const hue = palettes[index % palettes.length];

  return (
    <div ref={rootRef} className="flex flex-col items-center w-full select-none">
      <p className="text-[11px] text-muted-foreground/80 mb-3 tracking-wide">
        Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">Space</kbd> to reveal,{" "}
        <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">←</kbd>/
        <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">→</kbd> to navigate
      </p>

      {/* Card */}
      <div className="relative w-full max-w-md">
        <AnimatePresence mode="wait" initial={false}>
          <motion.button
            key={index}
            type="button"
            onClick={() => setRevealed((r) => !r)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full text-left rounded-3xl p-6 shadow-lg block"
            style={{
              background: `linear-gradient(160deg, hsl(${hue} / 0.12), hsl(${hue} / 0.03))`,
              border: `1px solid hsl(${hue} / 0.32)`,
              minHeight: "18rem",
            }}
            aria-label={revealed ? "Hide answer" : "Reveal answer"}
          >
            {/* Header */}
            <div className="flex items-center justify-between text-[11px] text-muted-foreground/80 mb-4">
              <span className="font-medium tabular-nums">{index + 1} / {total}</span>
              <span
                className="uppercase tracking-wider font-semibold text-[10px]"
                style={{ color: `hsl(${hue})` }}
              >
                {revealed ? "Question & Answer" : "Question"}
              </span>
            </div>

            {/* Question — stays on top */}
            <p className="text-foreground text-lg leading-relaxed font-medium">
              {currentCard.q}
            </p>

            {/* Answer reveal */}
            <AnimatePresence initial={false}>
              {revealed && (
                <motion.div
                  key="answer"
                  initial={{ opacity: 0, height: 0, y: -4 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -4 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div
                    className="mt-4 pt-4 border-t"
                    style={{ borderColor: `hsl(${hue} / 0.28)` }}
                  >
                    <p
                      className="uppercase tracking-wider font-semibold text-[10px] mb-2"
                      style={{ color: `hsl(${hue})` }}
                    >
                      Answer
                    </p>
                    <p className="text-foreground text-[15px] leading-relaxed">
                      {currentCard.a}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!revealed && (
              <p className="mt-6 text-[12px] text-muted-foreground">Tap to reveal answer</p>
            )}
          </motion.button>
        </AnimatePresence>

        {/* Encouragement mini-card, appears right after grading */}
        <div className="pointer-events-none absolute inset-x-0 -top-3 flex justify-center">
          <AnimatePresence>
            {nudge && (
              <motion.div
                key={nudge + index}
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-md ${
                  nudge === "correct"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40"
                    : "bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/40"
                }`}
              >
                {nudge === "correct" ? "You got it ✨" : "You'll get it next time 💪"}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Controls — arrows anchored to edges, graders centered with spacing */}
      <div className="mt-5 flex items-center w-full max-w-md">
        <button
          type="button"
          onClick={() => goto(index - 1)}
          disabled={index === 0}
          className="h-11 w-11 rounded-full bg-muted/60 hover:bg-muted text-primary flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Previous card"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="flex-1 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => grade(false)}
            disabled={!revealed}
            className="h-11 min-w-[76px] px-5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 inline-flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Mark wrong"
          >
            <X className="h-4 w-4" />
            <span className="text-sm font-semibold tabular-nums">{wrong}</span>
          </button>

          <button
            type="button"
            onClick={() => grade(true)}
            disabled={!revealed}
            className="h-11 min-w-[76px] px-5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 inline-flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Mark correct"
          >
            <span className="text-sm font-semibold tabular-nums">{correct}</span>
            <Check className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => (index + 1 >= total ? setFinished(true) : goto(index + 1))}
          className="h-11 w-11 rounded-full bg-muted/60 hover:bg-muted text-primary flex items-center justify-center transition-colors"
          aria-label="Next card"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="w-full max-w-md mt-4 h-1 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full bg-primary"
          initial={false}
          animate={{ width: `${((index + (revealed ? 1 : 0)) / total) * 100}%` }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}
