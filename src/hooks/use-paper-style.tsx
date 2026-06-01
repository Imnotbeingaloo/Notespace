import { useEffect, useState } from "react";

const KEY = "notebook-paper-style";
const EVT = "notebook-paper-style-changed";
const EVT_TRANSITION = "notebook-paper-style-transition";

export function getPaperStyle(): boolean {
  try { return localStorage.getItem(KEY) === "true"; } catch { return false; }
}

export function setPaperStyle(enabled: boolean) {
  // Fire a transition event first so listeners can show a loading screen.
  window.dispatchEvent(new CustomEvent(EVT_TRANSITION, { detail: true }));
  // Defer the actual change a tick so the overlay paints before re-render.
  window.setTimeout(() => {
    localStorage.setItem(KEY, String(enabled));
    window.dispatchEvent(new CustomEvent(EVT, { detail: enabled }));
    // End transition shortly after the new style applies.
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent(EVT_TRANSITION, { detail: false }));
    }, 600);
  }, 50);
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

export function usePaperStyleTransition() {
  const [transitioning, setTransitioning] = useState(false);
  useEffect(() => {
    const h = (e: Event) => setTransitioning(Boolean((e as CustomEvent).detail));
    window.addEventListener(EVT_TRANSITION, h);
    return () => window.removeEventListener(EVT_TRANSITION, h);
  }, []);
  return transitioning;
}
