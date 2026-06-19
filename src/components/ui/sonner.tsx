import { AnimatePresence, motion } from "framer-motion";
import type { ExternalToast } from "sonner";
import type { ReactElement, ReactNode } from "react";
import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, Bell, X, ChevronDown } from "lucide-react";
import {
  dismissToast,
  getCurrentToasts,
  getToastHistory,
  getToastSnapshot,
  queuedToast,
  removeToast,
  setToastExpanded,
  subscribeToasts,
  type QueuedToast,
} from "@/lib/toast-queue";

type ToasterProps = React.HTMLAttributes<HTMLDivElement>;

const variants = {
  success: {
    Icon: CheckCircle2,
    accent: "hsl(148 62% 45%)",
    tint: "hsl(148 62% 45% / 0.11)",
  },
  warning: {
    Icon: AlertTriangle,
    accent: "hsl(43 92% 50%)",
    tint: "hsl(43 92% 50% / 0.13)",
  },
  error: {
    Icon: AlertCircle,
    accent: "hsl(348 82% 52%)",
    tint: "hsl(348 82% 52% / 0.12)",
  },
  info: {
    Icon: Info,
    accent: "hsl(var(--primary))",
    tint: "hsl(var(--primary) / 0.11)",
  },
  loading: {
    Icon: Bell,
    accent: "hsl(var(--primary))",
    tint: "hsl(var(--primary) / 0.11)",
  },
};

function textOf(value: ReactNode) {
  return typeof value === "string" ? value : "";
}

function displayKind(toast: QueuedToast): keyof typeof variants {
  const text = `${textOf(toast.title)} ${textOf(toast.description)}`.toLowerCase();
  if (toast.kind === "error" || /failed|couldn|error|unsupported|expired/.test(text)) return "error";
  if (toast.kind === "warning" || /broken|temporary|scanned|limit|empty/.test(text)) return "warning";
  if (toast.kind === "success") return "success";
  if (toast.kind === "loading") return "loading";
  return "info";
}

function renderAction(action: QueuedToast["action"] | QueuedToast["cancel"], toastId: string | number) {
  if (!action) return null;
  if (typeof action === "object" && "label" in action) {
    return (
      <button
        type="button"
        onClick={() => {
          action.onClick?.();
          removeToast(toastId);
        }}
        className="rounded-md bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-primary/20 transition-colors"
      >
        {action.label}
      </button>
    );
  }
  return action;
}

function NotificationCard({ item, newest }: { item: QueuedToast; newest: boolean }) {
  const kind = displayKind(item);
  const visual = variants[kind];
  const Icon = visual.Icon;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 26, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 430, damping: 34, mass: 0.8 }}
      className="pointer-events-auto relative w-full overflow-hidden rounded-lg border-0 bg-card text-card-foreground shadow-lg"
      style={{
        boxShadow: newest
          ? `0 16px 34px -24px ${visual.accent}, 0 8px 22px hsl(var(--foreground) / 0.13)`
          : "0 8px 22px hsl(var(--foreground) / 0.10)",
      }}
    >
      <div className="flex min-h-[66px] items-start gap-3 px-3.5 py-3.5 pr-16">
        <span
          className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
          style={{ color: visual.accent, backgroundColor: visual.tint }}
          aria-hidden="true"
        >
          <Icon className={`h-3.5 w-3.5 ${kind === "loading" ? "animate-pulse" : ""}`} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold leading-5 text-foreground">{item.title}</div>
          <AnimatePresence initial={false}>
            {item.expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="pt-1 text-xs leading-relaxed text-muted-foreground">
                  {item.description || "Notification details"}
                  {(item.action || item.cancel) && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {renderAction(item.action, item.id)}
                      {renderAction(item.cancel, item.id)}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute right-2.5 top-2.5 flex items-center gap-1">
        <button
          type="button"
          onClick={() => setToastExpanded(item.id, !item.expanded)}
          aria-label={item.expanded ? "Hide notification details" : "Show notification details"}
          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${item.expanded ? "rotate-180" : ""}`} />
        </button>
        <button
          type="button"
          onClick={() => removeToast(item.id)}
          aria-label="Close notification"
          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <motion.div
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-1 rounded-br-full"
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: Number.isFinite(item.duration) ? item.duration / 1000 : 10, ease: "linear" }}
        style={{ backgroundColor: visual.accent }}
      />
    </motion.li>
  );
}

const Toaster = ({ className, ...props }: ToasterProps) => {
  const [items, setItems] = useState(() => getToastSnapshot());

  useEffect(() => {
    return subscribeToasts(setItems);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.code === "KeyT") {
        event.preventDefault();
        document.querySelector<HTMLButtonElement>('[aria-label="Close notification"]')?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div
      aria-label="Notifications"
      role="region"
      aria-live="polite"
      className={`fixed bottom-4 right-4 z-[2147483640] max-h-[calc(100vh-2rem)] w-[430px] max-w-[calc(100vw-2rem)] overflow-y-auto overflow-x-hidden pointer-events-none scrollbar-thin ${className ?? ""}`}
      {...props}
    >
      <motion.ol layout className="flex w-full flex-col gap-2.5">
        <AnimatePresence initial={false}>
          {items.map((item, index) => (
            <NotificationCard key={item.id} item={item} newest={index === 0} />
          ))}
        </AnimatePresence>
      </motion.ol>
    </div>
  );
};

const toast = Object.assign(
  (message: ReactNode, options?: ExternalToast) => queuedToast("message", message, options),
  {
    success: (message: ReactNode, options?: ExternalToast) => queuedToast("success", message, options),
    info: (message: ReactNode, options?: ExternalToast) => queuedToast("info", message, options),
    warning: (message: ReactNode, options?: ExternalToast) => queuedToast("warning", message, options),
    error: (message: ReactNode, options?: ExternalToast) => queuedToast("error", message, options),
    loading: (message: ReactNode, options?: ExternalToast) => queuedToast("loading", message, options),
    dismiss: dismissToast,
    promise: <T,>(promise: Promise<T>, options?: any) => {
      const id = queuedToast("loading", options?.loading ?? "Loading…", { duration: Infinity });
      promise
        .then((data) => {
          dismissToast(id);
          queuedToast("success", typeof options?.success === "function" ? options.success(data) : options?.success ?? "Done");
        })
        .catch((error) => {
          dismissToast(id);
          queuedToast("error", typeof options?.error === "function" ? options.error(error) : options?.error ?? "Something went wrong");
        });
      return id;
    },
    custom: (jsx: (id: number | string) => ReactElement, options?: ExternalToast) => {
      const id = options?.id ?? Date.now();
      return queuedToast("message", jsx(id), { ...options, id });
    },
    message: (message: ReactNode, options?: ExternalToast) => queuedToast("message", message, options),
    getHistory: getToastHistory,
    getToasts: getCurrentToasts,
  }
);

export { Toaster, toast };
export { X as ToastCloseIcon };
