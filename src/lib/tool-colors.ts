/**
 * Centralized tool-pill color tokens.
 *
 * Baseline (never changes, always colored):
 *   - Flashcards = purple (styled in AIToolsPanel)
 *   - Ask AI     = brass  (styled in AskAIPanel via `accent` token)
 *   - Share      = green/primary (styled in ShareNoteDialog)
 *
 * Restored pills (routed through this file):
 *   - Voice, Import, Download, Preview, AI Edit
 *
 * REVERT SWITCH
 * -------------
 * Flip `BASELINE_ONLY` to `true` to snap Voice / Import / Download / Preview /
 * AI Edit back to the neutral pill style. Flashcards, Ask AI, and Share keep
 * their baseline colors. This is a code-level switch on purpose - no UI knob
 * inside the app.
 */

export const BASELINE_ONLY = false;

const PILL_BASE =
  "magnetic-btn inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl transition-all duration-200";

const NEUTRAL =
  "border border-border bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted";

/**
 * Dark-mode tuning notes:
 * - Light: 500/30 border, 500/10 bg, 600 text  -> readable on cream bg without shouting
 * - Dark : 400/30 border, 500/15 bg, 300 text  -> stays legible on 220/10 bg, not too bright
 */
const PALETTE = {
  voice:
    "border border-rose-500/30 bg-rose-500/10 text-rose-600 hover:bg-rose-500/15 " +
    "dark:border-rose-400/30 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25",
  import:
    "border border-sky-500/30 bg-sky-500/10 text-sky-600 hover:bg-sky-500/15 " +
    "dark:border-sky-400/30 dark:bg-sky-500/15 dark:text-sky-300 dark:hover:bg-sky-500/25",
  download:
    "border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 " +
    "dark:border-emerald-400/30 dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-emerald-500/25",
  preview:
    "border border-indigo-500/30 bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/15 " +
    "dark:border-indigo-400/30 dark:bg-indigo-500/15 dark:text-indigo-300 dark:hover:bg-indigo-500/25",
  aiEdit:
    "border border-amber-500/40 bg-amber-500/10 text-amber-700 hover:bg-amber-500/15 " +
    "dark:border-amber-400/30 dark:bg-amber-500/15 dark:text-amber-300 dark:hover:bg-amber-500/25",
} as const;

export type ToolKey = keyof typeof PALETTE;

/** Build the full className for a tool pill. Extra classes are appended verbatim. */
export function toolPill(key: ToolKey, extra = ""): string {
  const color = BASELINE_ONLY ? NEUTRAL : PALETTE[key];
  return `${PILL_BASE} ${color}${extra ? ` ${extra}` : ""}`;
}
