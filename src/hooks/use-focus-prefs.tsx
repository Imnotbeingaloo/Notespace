import { useEffect, useState, useCallback } from "react";

const KEY = "focusAutoOpenPomodoro";
const EVT = "focusPrefsChanged";

function read(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const v = localStorage.getItem(KEY);
    // default: true (keep prior behavior)
    return v === null ? true : v === "true";
  } catch { return true; }
}

/** Whether entering Deep Focus should also open the Pomodoro timer. */
export function useFocusAutoOpenPomodoro(): [boolean, (v: boolean) => void] {
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
