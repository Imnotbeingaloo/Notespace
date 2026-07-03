import { useEffect, useState } from "react";

const STORAGE_KEY = "comma_highlight_on";

/**
 * Persistent toggle for the reading-aid comma highlight overlay.
 * Applies a `.comma-highlight-on` class to <html> so any editor can react.
 */
export function useCommaHighlight(): [boolean, (v: boolean) => void] {
  const [enabled, setEnabledState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("comma-highlight-on", enabled);
  }, [enabled]);

  const setEnabled = (v: boolean) => {
    setEnabledState(v);
    try {
      window.localStorage.setItem(STORAGE_KEY, v ? "1" : "0");
    } catch { /* ignore quota */ }
  };

  return [enabled, setEnabled];
}
