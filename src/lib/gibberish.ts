/**
 * Stricter gibberish heuristic. Rejects text that is technically long enough
 * but is mostly noise: repeated tokens, low vocabulary variety, low ratio of
 * plausibly-real words (vowel + consonant, no 3+ same-char runs, repeated bigrams).
 */
export function looksLikeGibberish(text: string): boolean {
  return describeGibberish(text).gibberish;
}

/**
 * Same heuristic as `looksLikeGibberish`, but also returns a human-readable
 * reason so the UI can explain why we refused to generate flashcards and what
 * the user could change.
 */
export function describeGibberish(text: string): { gibberish: boolean; reason?: string } {
  const clean = text.toLowerCase().replace(/\s+/g, " ").trim();
  if (!clean) return { gibberish: true, reason: "The note is empty." };
  const tokens = clean.split(/\s+/).filter((t) => /[a-z]/.test(t));
  if (tokens.length < 3) {
    return { gibberish: true, reason: "Only a few words - add at least a sentence or two of real notes." };
  }

  let maxRun = 1, run = 1;
  for (let i = 1; i < tokens.length; i++) {
    if (tokens[i] === tokens[i - 1]) { run++; maxRun = Math.max(maxRun, run); } else run = 1;
  }
  if (maxRun >= 4) {
    return { gibberish: true, reason: "The same word repeats over and over - write varied sentences instead." };
  }

  const bigrams = new Map<string, number>();
  for (let i = 0; i < tokens.length - 1; i++) {
    const bg = tokens[i] + " " + tokens[i + 1];
    bigrams.set(bg, (bigrams.get(bg) || 0) + 1);
  }
  for (const c of bigrams.values()) {
    if (c >= 3) {
      return { gibberish: true, reason: "The same short phrase repeats several times - try explaining the idea in your own words." };
    }
  }

  const uniqueWords = new Set(tokens);
  if (tokens.length >= 8 && uniqueWords.size / tokens.length < 0.35) {
    return { gibberish: true, reason: "Vocabulary is very repetitive - add definitions, examples, or cause & effect." };
  }

  const looksLikeWord = (w: string) => {
    const letters = w.replace(/[^a-z]/g, "");
    if (letters.length < 2) return false;
    if (!/[aeiouy]/.test(letters)) return false;
    if (!/[bcdfghjklmnpqrstvwxz]/.test(letters)) return false;
    if (/(.)\1{2,}/.test(letters)) return false;
    return true;
  };
  const validRatio = tokens.filter(looksLikeWord).length / tokens.length;
  if (validRatio < 0.55) {
    return { gibberish: true, reason: "Most tokens don't look like real words - write full sentences in English." };
  }

  return { gibberish: false };
}

