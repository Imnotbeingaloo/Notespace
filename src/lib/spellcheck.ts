/**
 * Lazily-loaded Hunspell (en-US) spellchecker.
 *
 * The browser's native squiggle has no scriptable API for suggestions, so we
 * load the same dictionary the browser uses (~550 KB, fetched only the first
 * time a word is double-clicked) and produce our own correction list.
 */

type Speller = { correct: (word: string) => boolean; suggest: (word: string) => string[] };

let spellerPromise: Promise<Speller | null> | null = null;

async function loadSpeller(): Promise<Speller | null> {
  try {
    const [nspellMod, aff, dic] = await Promise.all([
      import("nspell"),
      fetch("/dict/en.aff").then((r) => r.text()),
      fetch("/dict/en.dic").then((r) => r.text()),
    ]);
    const nspell = (nspellMod as any).default ?? nspellMod;
    return nspell({ aff, dic }) as Speller;
  } catch {
    return null;
  }
}

export function getSpeller(): Promise<Speller | null> {
  if (!spellerPromise) spellerPromise = loadSpeller();
  return spellerPromise;
}

/** Only alphabetic words of 2+ chars are worth checking. */
export function isCheckableWord(word: string): boolean {
  return /^[A-Za-z][A-Za-z'’]{1,}$/.test(word);
}

export async function getSuggestions(word: string): Promise<string[]> {
  if (!isCheckableWord(word)) return [];
  const speller = await getSpeller();
  if (!speller) return [];
  const normalized = word.replace(/’/g, "'");
  if (speller.correct(normalized)) return [];
  return speller.suggest(normalized).slice(0, 5);
}
