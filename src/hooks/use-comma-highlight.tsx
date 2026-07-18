import { useEffect, useState } from "react";

const STORAGE_KEY = "comma_highlight_on";

/**
 * Persistent toggle for the reading-aid comma highlight overlay.
 * Applies a `.comma-highlight-on` class to <html> so any editor can react.
 */
export function useCommaHighlight(): [boolean, (v: boolean) => void] {
  useEffect(() => {
    document.documentElement.classList.add("comma-highlight-on");
  }, []);
  // Always on — the settings toggle was removed; the overlay remains a
  // default reading aid so HybridEditor keeps wrapping commas at idle.
  return [true, () => {}];
}
