import { useEffect, useState } from "react";

const KEY = "notebook-paper-style";
const EVT = "notebook-paper-style-changed";
const EVT_TRANSITION = "notebook-paper-style-transition";
const MIN_OVERLAY_MS = 450; // ensures the overlay never just "flashes"

let transitionEndTimer: number | null = null;

export function getPaperStyle(): boolean {
  try { return localStorage.getItem(KEY) === "true"; } catch { return false; }
}

export function setPaperStyle(enabled: boolean) {
  // Cancel any pending "end transition" so rapid toggles don't flicker.
  if (transitionEndTimer !== null) {
    window.clearTimeout(transitionEndTimer);
    transitionEndTimer = null;
  }
  window.dispatchEvent(new CustomEvent(EVT_TRANSITION, { detail: true }));
  window.setTimeout(() => {
    localStorage.setItem(KEY, String(enabled));
    window.dispatchEvent(new CustomEvent(EVT, { detail: enabled }));
    transitionEndTimer = window.setTimeout(() => {
      transitionEndTimer = null;
      window.dispatchEvent(new CustomEvent(EVT_TRANSITION, { detail: false }));
    }, MIN_OVERLAY_MS);
  }, 30);
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
