import { useEffect, useState } from "react";

const STORAGE_KEY = "paragraph_spacing_tier";
export type SpacingTier = "tight" | "normal" | "relaxed";

/**
 * Persistent paragraph-gap tier. Applied as a class on <html> so both the
 * notebook-paper editor and plain editor can key off it via CSS.
 * The tier only affects the gap *between* paragraphs — line-height stays
 * locked so the ruled-line grid remains aligned.
 */
export function useParagraphSpacing(): [SpacingTier, (t: SpacingTier) => void] {
  const [tier, setTierState] = useState<SpacingTier>(() => {
    if (typeof window === "undefined") return "normal";
    const v = window.localStorage.getItem(STORAGE_KEY) as SpacingTier | null;
    return v === "tight" || v === "relaxed" ? v : "normal";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("spacing-tight", "spacing-normal", "spacing-relaxed");
    root.classList.add(`spacing-${tier}`);
  }, [tier]);

  const setTier = (t: SpacingTier) => {
    setTierState(t);
    try { window.localStorage.setItem(STORAGE_KEY, t); } catch { /* ignore */ }
  };

  return [tier, setTier];
}
