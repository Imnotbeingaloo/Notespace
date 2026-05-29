import { useEffect, useState } from "react";

const KEY = "notebook-paper-style";
const EVT = "notebook-paper-style-changed";

export function getPaperStyle(): boolean {
  try { return localStorage.getItem(KEY) === "true"; } catch { return false; }
}

export function setPaperStyle(enabled: boolean, options?: { reload?: boolean }) {
  localStorage.setItem(KEY, String(enabled));
  window.dispatchEvent(new CustomEvent(EVT, { detail: enabled }));
  // Reload so the editor mounts cleanly with (or without) the ruled-paper styles applied.
  if (options?.reload !== false) {
    // Small delay so the toggle UI can complete its visual change before the reload.
    setTimeout(() => window.location.reload(), 150);
  }
}

export function usePaperStyle() {
  const [enabled, setEnabled] = useState<boolean>(getPaperStyle);
  useEffect(() => {
    const handler = () => setEnabled(getPaperStyle());
    window.addEventListener(EVT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return [enabled, (v: boolean) => setPaperStyle(v)] as const;
}
