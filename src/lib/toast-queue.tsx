import * as React from "react";
import { toast as sonnerToast, type ExternalToast } from "sonner";

const MAX_VISIBLE_TOASTS = 4;
const TOAST_SPACING_MS = 120;

type ToastKind = "message" | "success" | "info" | "warning" | "error" | "loading";

interface QueuedToast {
  kind: ToastKind;
  title: React.ReactNode;
  options?: ExternalToast;
}

const queue: QueuedToast[] = [];
let visibleCount = 0;
let draining = false;

function scheduleDrain() {
  if (draining) return;
  draining = true;
  window.setTimeout(() => {
    draining = false;
    drainQueue();
  }, TOAST_SPACING_MS);
}

function drainQueue() {
  if (typeof window === "undefined") return;
  if (visibleCount >= MAX_VISIBLE_TOASTS) return;
  const next = queue.shift();
  if (!next) return;

  visibleCount += 1;
  const options: ExternalToast = {
    ...next.options,
    onAutoClose: (toast) => {
      visibleCount = Math.max(0, visibleCount - 1);
      next.options?.onAutoClose?.(toast);
      drainQueue();
    },
    onDismiss: (toast) => {
      visibleCount = Math.max(0, visibleCount - 1);
      next.options?.onDismiss?.(toast);
      drainQueue();
    },
  };

  if (next.kind === "message") sonnerToast(next.title, options);
  else sonnerToast[next.kind](next.title, options);

  if (queue.length > 0 && visibleCount < MAX_VISIBLE_TOASTS) scheduleDrain();
}

export function queuedToast(kind: ToastKind, title: React.ReactNode, options?: ExternalToast) {
  if (typeof window === "undefined") return "";
  queue.push({ kind, title, options });
  drainQueue();
  return "queued";
}

export function resetToastQueue() {
  queue.length = 0;
  visibleCount = 0;
}

export { MAX_VISIBLE_TOASTS };