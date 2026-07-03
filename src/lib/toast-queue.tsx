import * as React from "react";
import type { ExternalToast, ToastT } from "sonner";
import { TOAST_DURATIONS } from "./notification-config";

const MAX_VISIBLE_TOASTS = 3;

export type ToastKind = "message" | "success" | "info" | "warning" | "error" | "loading";

export interface QueuedToast {
  id: string | number;
  kind: ToastKind;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode | { label: React.ReactNode; onClick?: () => void };
  cancel?: React.ReactNode | { label: React.ReactNode; onClick?: () => void };
  duration: number;
  expanded: boolean;
  createdAt: number;
  options?: ExternalToast;
}

const DEFAULT_DURATION: Record<ToastKind, number> = { ...TOAST_DURATIONS };

const activeToasts: QueuedToast[] = [];
const queuedToasts: QueuedToast[] = [];
const listeners = new Set<(toasts: QueuedToast[]) => void>();
const timers = new Map<string | number, ReturnType<typeof setTimeout>>();
const history: QueuedToast[] = [];

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function snapshot() {
  return [...activeToasts];
}

function emit() {
  const next = snapshot();
  listeners.forEach((listener) => listener(next));
}

function asToastT(toast: QueuedToast): ToastT {
  return {
    id: toast.id,
    title: toast.title,
    type: toast.kind === "message" ? "default" : toast.kind,
    description: toast.description,
    duration: toast.duration,
  } as ToastT;
}

const timerMeta = new Map<string | number, { startedAt: number; remaining: number }>();

function clearTimer(id: string | number) {
  const timer = timers.get(id);
  if (timer) clearTimeout(timer);
  timers.delete(id);
}

function startTimer(toast: QueuedToast, durationOverride?: number) {
  clearTimer(toast.id);
  const duration = durationOverride ?? toast.duration;
  if (!Number.isFinite(duration) || duration <= 0) {
    timerMeta.delete(toast.id);
    return;
  }
  timerMeta.set(toast.id, { startedAt: Date.now(), remaining: duration });
  timers.set(
    toast.id,
    setTimeout(() => removeToast(toast.id, "auto"), duration),
  );
}

export function pauseToast(id: string | number) {
  const meta = timerMeta.get(id);
  if (!meta) return;
  const elapsed = Date.now() - meta.startedAt;
  const remaining = Math.max(0, meta.remaining - elapsed);
  clearTimer(id);
  timerMeta.set(id, { startedAt: Date.now(), remaining });
}

export function resumeToast(id: string | number) {
  const meta = timerMeta.get(id);
  const toast = activeToasts.find((t) => t.id === id);
  if (!meta || !toast) return;
  startTimer(toast, meta.remaining);
}

function drainQueue() {
  while (activeToasts.length < MAX_VISIBLE_TOASTS && queuedToasts.length > 0) {
    const next = queuedToasts.shift();
    if (!next) break;
    activeToasts.unshift(next);
    startTimer(next);
  }
}

export function subscribeToasts(listener: (toasts: QueuedToast[]) => void) {
  listeners.add(listener);
  listener(snapshot());
  return () => {
    listeners.delete(listener);
  };
}

export function getToastSnapshot() {
  return snapshot();
}

export function queuedToast(kind: ToastKind, title: React.ReactNode, options?: ExternalToast) {
  if (typeof window === "undefined") return "";
  const toast: QueuedToast = {
    id: options?.id ?? makeId(),
    kind,
    title,
    description: options?.description as React.ReactNode,
    action: options?.action as QueuedToast["action"],
    cancel: options?.cancel as QueuedToast["cancel"],
    duration: options?.duration ?? DEFAULT_DURATION[kind],
    expanded: false,
    createdAt: Date.now(),
    options,
  };

  history.unshift(toast);
  if (history.length > 30) history.length = 30;

  if (activeToasts.length >= MAX_VISIBLE_TOASTS) {
    const oldest = activeToasts.pop();
    if (oldest) {
      clearTimer(oldest.id);
      oldest.options?.onDismiss?.(asToastT(oldest));
    }
  }

  activeToasts.unshift(toast);
  startTimer(toast);
  emit();

  return toast.id;
}

export function setToastExpanded(id: string | number, expanded: boolean) {
  const toast = activeToasts.find((item) => item.id === id);
  if (!toast) return;
  toast.expanded = expanded;
  // Expanding reveals description/action buttons (Undo, etc.). Extend the
  // remaining time to a minimum reading window so the toast doesn't vanish
  // 1-2s later, but never HARD-reset — resetting would rewind the visible
  // progress bar and confuse users who just clicked the chevron.
  if (expanded) {
    const meta = timerMeta.get(id);
    const MIN_READ_MS = 4000;
    if (meta) {
      const elapsed = Date.now() - meta.startedAt;
      const remaining = Math.max(0, meta.remaining - elapsed);
      if (Number.isFinite(remaining) && remaining < MIN_READ_MS) {
        startTimer(toast, MIN_READ_MS);
      }
      // else: leave the running timer alone, the bar keeps its position.
    }
  }
  emit();
}

/**
 * Pause every active toast's dismiss timer. Called when the tab becomes
 * hidden so the countdown doesn't silently run down (or worse, fire while
 * the user is away) — the toasts remain visible and resume on return.
 */
export function pauseAllToasts() {
  for (const toast of activeToasts) pauseToast(toast.id);
}

export function resumeAllToasts() {
  for (const toast of activeToasts) resumeToast(toast.id);
}


export function updateToast(
  id: string | number,
  patch: Partial<Pick<QueuedToast, "title" | "description" | "kind">>,
) {
  const toast = activeToasts.find((item) => item.id === id);
  if (!toast) return;
  if (patch.title !== undefined) toast.title = patch.title;
  if (patch.description !== undefined) toast.description = patch.description;
  if (patch.kind !== undefined) toast.kind = patch.kind;
  emit();
}


export function removeToast(id: string | number, reason: "dismiss" | "auto" = "dismiss") {
  const activeIndex = activeToasts.findIndex((toast) => toast.id === id);
  if (activeIndex !== -1) {
    const [toast] = activeToasts.splice(activeIndex, 1);
    clearTimer(id);
    const callbackToast = asToastT(toast);
    if (reason === "auto") toast.options?.onAutoClose?.(callbackToast);
    else toast.options?.onDismiss?.(callbackToast);
    drainQueue();
    emit();
    return;
  }

  const queuedIndex = queuedToasts.findIndex((toast) => toast.id === id);
  if (queuedIndex !== -1) queuedToasts.splice(queuedIndex, 1);
  emit();
}

export function dismissToast(id?: string | number) {
  if (id !== undefined) {
    removeToast(id, "dismiss");
    return;
  }

  [...activeToasts].forEach((toast) => removeToast(toast.id, "dismiss"));
  queuedToasts.length = 0;
  emit();
}

export function resetToastQueue() {
  [...timers.values()].forEach((timer) => clearTimeout(timer));
  timers.clear();
  activeToasts.length = 0;
  queuedToasts.length = 0;
  history.length = 0;
  emit();
}

export function getToastHistory() {
  return [...history].map(asToastT);
}

export function getCurrentToasts() {
  return [...activeToasts].map(asToastT);
}

export { MAX_VISIBLE_TOASTS };