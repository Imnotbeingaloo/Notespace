import { useEffect, useState } from "react";

const STORAGE_KEY = "reduce-motion-pref";

/**
 * Persisted user-controlled "reduce motion" toggle.
 * Independent from the OS-level `prefers-reduced-motion` so users can opt in
 * regardless of system settings. Reads/writes localStorage.
 */
export function useReduceMotionPref(): boolean {
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) setEnabled(e.newValue === "1");
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return enabled;
}

export function setReduceMotionPref(value: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
    // Notify same-tab listeners (storage event only fires cross-tab).
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: STORAGE_KEY,
        newValue: value ? "1" : "0",
      }),
    );
  } catch {
    /* ignore */
  }
}
