import * as React from "react";
import type { ExternalToast, ToastT } from "sonner";

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

const DEFAULT_DURATION: Record<ToastKind, number> = {
  message: 4200,
  success: 4200,
  info: 4200,
  warning: 5200,
  error: 6000,
  loading: Infinity,
};

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

function clearTimer(id: string | number) {
  const timer = timers.get(id);
  if (timer) clearTimeout(timer);
  timers.delete(id);
}

function startTimer(toast: QueuedToast) {
  clearTimer(toast.id);
  if (!Number.isFinite(toast.duration) || toast.duration <= 0) return;
  timers.set(
    toast.id,
    setTimeout(() => removeToast(toast.id, "auto"), toast.duration),
  );
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

  if (activeToasts.length < MAX_VISIBLE_TOASTS) {
    activeToasts.unshift(toast);
    startTimer(toast);
    emit();
  } else {
    queuedToasts.push(toast);
  }

  return toast.id;
}

export function setToastExpanded(id: string | number, expanded: boolean) {
  const toast = activeToasts.find((item) => item.id === id);
  if (!toast) return;
  toast.expanded = expanded;
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

export { MAX_VISIBLE_TOASTS };