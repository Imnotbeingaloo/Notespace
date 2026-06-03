import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "temp-notes-enabled";
const EVT = "temp-notes-enabled-changed";

function read(): boolean {
  if (typeof window === "undefined") return true;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === null) return true;
  return raw === "true";
}

export function useTempNotesEnabled(): [boolean, (v: boolean) => void] {
  const [enabled, setEnabled] = useState<boolean>(() => read());

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
    window.localStorage.setItem(STORAGE_KEY, String(v));
    window.dispatchEvent(new Event(EVT));
    setEnabled(v);
  }, []);

  return [enabled, update];
}
