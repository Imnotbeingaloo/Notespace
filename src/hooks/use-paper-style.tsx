import { useEffect, useState } from "react";

const KEY = "notebook-paper-style";
const EVT = "notebook-paper-style-changed";
const EVT_TRANSITION = "notebook-paper-style-transition";
const MIN_OVERLAY_MS = 2400; // 2.4s — long enough to feel intentional, not jarring

let transitionEndTimer: number | null = null;

export function getPaperStyle(): boolean {
  try { return localStorage.getItem(KEY) === "true"; } catch { return false; }
}

export function setPaperStyle(enabled: boolean) {
  // Apply instantly — no transition overlay.
  try { localStorage.setItem(KEY, String(enabled)); } catch {}
  window.dispatchEvent(new CustomEvent(EVT, { detail: enabled }));
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
