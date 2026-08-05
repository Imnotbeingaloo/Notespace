import { motion } from "framer-motion";

interface SpellSuggestProps {
  top: number;
  left: number;
  word: string;
  suggestions: string[];
  onPick: (word: string) => void;
}

export function SpellSuggest({ top, left, word, suggestions, onPick }: SpellSuggestProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.96 }}
      transition={{ duration: 0.14 }}
      data-testid="spell-suggest"
      role="listbox"
      aria-label={`Spelling suggestions for ${word}`}
      className="absolute z-50 min-w-[9rem] max-w-[14rem] p-1 rounded-xl border border-border bg-popover shadow-lg"
      style={{ top, left }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <p className="px-2 pt-1 pb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        Did you mean
      </p>
      {suggestions.map((s) => (
        <button
          key={s}
          type="button"
          role="option"
          aria-selected={false}
          onMouseDown={(e) => { e.preventDefault(); onPick(s); }}
          className="w-full text-left px-2 py-1.5 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
        >
          {s}
        </button>
      ))}
    </motion.div>
  );
}
