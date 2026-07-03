/**
 * Stricter gibberish heuristic. Rejects text that is technically long enough
 * but is mostly noise: repeated tokens, low vocabulary variety, low ratio of
 * plausibly-real words (vowel + consonant, no 3+ same-char runs, repeated bigrams).
 */
export function looksLikeGibberish(text: string): boolean {
  const clean = text.toLowerCase().replace(/\s+/g, " ").trim();
  if (!clean) return true;
  const tokens = clean.split(/\s+/).filter((t) => /[a-z]/.test(t));
  if (tokens.length < 3) return true;

  // Repeated identical tokens: "the the the the"
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

  // Plausible-word ratio
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
}
