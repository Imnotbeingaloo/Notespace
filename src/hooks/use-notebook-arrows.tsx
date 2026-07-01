import { useEffect, useState, useCallback } from "react";

const KEY = "showNotebookArrows";
const EVT = "notebookArrowsChanged";

function read(): boolean {
  if (typeof window === "undefined") return false;
  try { return localStorage.getItem(KEY) === "true"; } catch { return false; }
}

/** Dev-only preference: whether to render dropdown chevrons on notebook rows. */
export function useNotebookArrows(): [boolean, (v: boolean) => void] {
  const [enabled, setEnabled] = useState<boolean>(read);
  useEffect(() => {
    const onChange = () => setEnabled(read());
    window.addEventListener(EVT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  const update = useCallback((v: boolean) => {
    try { localStorage.setItem(KEY, v ? "true" : "false"); } catch {}
    setEnabled(v);
    window.dispatchEvent(new Event(EVT));
  }, []);
  return [enabled, update];
}
