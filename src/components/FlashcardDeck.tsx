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
 * NotebookLM-inspired flashcard reviewer.
 *  - One giant card at a time; tap or press Space to flip (with a real 3D tilt).
 *  - ← / → arrows to navigate through the deck.
 *  - Below the card: red "X n" and green "n ✓" pill counters, plus prev/next.
 *  - Wrong graders get "you'll get it next time"; right graders get "you got it".
 */
export function FlashcardDeck({ markdown, streaming }: FlashcardDeckProps) {
  const parsed = useMemo(() => parseFlashcards(markdown), [markdown]);
  const total = parsed.length;

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  // -1 = wrong swipe, 1 = correct swipe, 0 = idle
  const [verdict, setVerdict] = useState<-1 | 0 | 1>(0);
  // Ephemeral encouragement message shown briefly after grading.
  const [nudge, setNudge] = useState<null | "correct" | "wrong">(null);
  const [finished, setFinished] = useState(false);

  const cardKey = parsed.map((c) => `${c.q}\u0000${c.a}`).join("\u0001");

  useEffect(() => {
    setIndex(0);
    setFlipped(false);
    setCorrect(0);
    setWrong(0);
    setVerdict(0);
    setNudge(null);
    setFinished(false);
  }, [cardKey]);

  // Assign a stable hue per card position from the curated palette.
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
    setFlipped(false);
  };

  const advance = () => {
    if (index + 1 >= total) {
      setFinished(true);
    } else {
      goto(index + 1);
    }
  };

  const grade = (isCorrect: boolean) => {
    if (verdict !== 0) return;
    setVerdict(isCorrect ? 1 : -1);
    setNudge(isCorrect ? "correct" : "wrong");
    setTimeout(() => {
      if (isCorrect) setCorrect((c) => c + 1);
      else setWrong((w) => w + 1);
      setVerdict(0);
      advance();
    }, 320);
    setTimeout(() => setNudge(null), 1500);
  };

  // Keyboard: Space flips, arrows navigate. Live only when a card is shown.
  const rootRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (finished || total === 0) return;
    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in an input elsewhere on the page.
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); setFlipped((f) => !f); }
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
            setFlipped(false);
            setVerdict(0);
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
      {/* Keyboard hint */}
      <p className="text-[11px] text-muted-foreground/80 mb-3 tracking-wide">
        Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">Space</kbd> to flip,{" "}
        <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">←</kbd>/
        <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">→</kbd> to navigate
      </p>

      {/* Big card */}
      <div className="relative w-full max-w-md h-72 [perspective:1600px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={
              verdict === 0
                ? { opacity: 1, y: 0, scale: 1, x: 0, rotate: 0 }
                : {
                    opacity: 0,
                    x: verdict === 1 ? 300 : -300,
                    rotate: verdict === 1 ? 12 : -12,
                    transition: { duration: 0.32, ease: [0.4, 0, 0.2, 1] },
                  }
            }
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              className="group relative w-full h-full rounded-3xl text-left [transform-style:preserve-3d] transition-transform duration-500"
              style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
              aria-label={flipped ? "Show question" : "Show answer"}
            >
              {/* Front — question */}
              <div
                className="absolute inset-0 rounded-3xl p-6 flex flex-col [backface-visibility:hidden] shadow-lg"
                style={{
                  background: `linear-gradient(160deg, hsl(${hue} / 0.10), hsl(${hue} / 0.02))`,
                  border: `1px solid hsl(${hue} / 0.28)`,
                }}
              >
                <div className="flex items-center justify-between text-[11px] text-muted-foreground/80">
                  <span className="font-medium tabular-nums">{index + 1} / {total}</span>
                  <span
                    className="uppercase tracking-wider font-semibold text-[10px]"
                    style={{ color: `hsl(${hue})` }}
                  >
                    Question
                  </span>
                </div>
                <div className="flex-1 flex items-center justify-center px-1">
                  <p className="text-foreground text-lg leading-relaxed text-center font-medium">
                    {currentCard.q}
                  </p>
                </div>
                <span className="text-center text-[12px] text-muted-foreground">See answer</span>
              </div>

              {/* Back — answer */}
              <div
                className="absolute inset-0 rounded-3xl p-6 flex flex-col [backface-visibility:hidden] shadow-lg"
                style={{
                  background: `linear-gradient(160deg, hsl(${hue} / 0.18), hsl(${hue} / 0.05))`,
                  border: `1px solid hsl(${hue} / 0.42)`,
                  transform: "rotateY(180deg)",
                }}
              >
                <div className="flex items-center justify-between text-[11px] text-muted-foreground/80">
                  <span className="font-medium tabular-nums">{index + 1} / {total}</span>
                  <span
                    className="uppercase tracking-wider font-semibold text-[10px]"
                    style={{ color: `hsl(${hue})` }}
                  >
                    Answer
                  </span>
                </div>
                <div className="flex-1 flex items-center justify-center px-1 overflow-y-auto">
                  <p className="text-foreground text-[15px] leading-relaxed text-center">
                    {currentCard.a}
                  </p>
                </div>
                <span className="text-center text-[12px] text-muted-foreground">Grade yourself below</span>
              </div>
            </button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Encouragement toast */}
      <div className="h-6 mt-3 flex items-center justify-center">
        <AnimatePresence>
          {nudge && (
            <motion.p
              key={nudge}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
              className={`text-xs font-medium ${
                nudge === "correct"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {nudge === "correct" ? "You got it ✨" : "You'll get it next time 💪"}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Controls: prev · X wrong · correct ✓ · next */}
      <div className="mt-3 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => goto(index - 1)}
          disabled={index === 0 || verdict !== 0}
          className="h-11 w-11 rounded-full bg-muted/60 hover:bg-muted text-primary flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Previous card"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => grade(false)}
          disabled={!flipped || verdict !== 0}
          className="h-11 min-w-[68px] px-4 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 inline-flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Mark wrong"
        >
          <X className="h-4 w-4" />
          <span className="text-sm font-semibold tabular-nums">{wrong}</span>
        </button>

        <button
          type="button"
          onClick={() => grade(true)}
          disabled={!flipped || verdict !== 0}
          className="h-11 min-w-[68px] px-4 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 inline-flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Mark correct"
        >
          <span className="text-sm font-semibold tabular-nums">{correct}</span>
          <Check className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => (index + 1 >= total ? setFinished(true) : goto(index + 1))}
          disabled={verdict !== 0}
          className="h-11 w-11 rounded-full bg-muted/60 hover:bg-muted text-primary flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Next card"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Slim progress rail */}
      <div className="w-full max-w-md mt-4 h-1 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full bg-primary"
          initial={false}
          animate={{ width: `${((index + (flipped ? 1 : 0)) / total) * 100}%` }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}
