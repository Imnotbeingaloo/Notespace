import { useCallback, useState } from "react";

const STORAGE_KEY = "last_highlight_color";
const DEFAULT_COLOR = "#fde68a"; // yellow

/**
 * Remembers the last highlight swatch the user picked so the primary Highlight
 * button in the toolbar can one-click apply it next time.
 */
export function useLastHighlightColor(): [string, (c: string) => void] {
  const [color, setColorState] = useState<string>(() => {
    if (typeof window === "undefined") return DEFAULT_COLOR;
    return window.localStorage.getItem(STORAGE_KEY) || DEFAULT_COLOR;
  });

  const setColor = useCallback((c: string) => {
    setColorState(c);
    try { window.localStorage.setItem(STORAGE_KEY, c); } catch { /* ignore */ }
  }, []);

  return [color, setColor];
}
