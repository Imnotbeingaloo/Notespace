import { useTheme } from "next-themes";
import { Toaster as Sonner, toast as baseToast } from "sonner";
import type { ExternalToast } from "sonner";
import type { ReactNode } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, Bell, X } from "lucide-react";
import { queuedToast, MAX_VISIBLE_TOASTS } from "@/lib/toast-queue";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      duration={3000}
      theme={theme as ToasterProps["theme"]}
      position="top-right"
      visibleToasts={MAX_VISIBLE_TOASTS}
      gap={14}
      expand
      offset={{ top: 20, right: 20, bottom: 20, left: 20 }}
      mobileOffset={{ bottom: 16, left: 16, right: 16, top: 16 }}
      className="toaster group"
      aria-label="Notifications"
      hotkey={["altKey", "KeyT"]}
      pauseWhenPageIsHidden
      icons={{
        success: <CheckCircle2 className="size-4" />,
        error: <AlertCircle className="size-4" />,
        warning: <AlertTriangle className="size-4" />,
        info: <Info className="size-4" />,
        loading: <Bell className="size-4 animate-pulse" />,
      }}
      toastOptions={{
        unstyled: true,
        closeButton: true,
        classNames: {
          toast: [
            "group relative pointer-events-auto",
            "flex min-h-[56px] items-start gap-3 w-[440px] max-w-[calc(100vw-2rem)]",
            "rounded-xl bg-primary/10 backdrop-blur-md px-5 py-4 pr-11 font-sans text-sm text-foreground",
            "shadow-lg shadow-black/10 border-0",
          ].join(" "),
          title: "font-medium text-[13.5px] leading-snug",
          description: "text-current/80 text-xs leading-relaxed mt-1",
          actionButton:
            "ml-auto inline-flex items-center rounded-md bg-primary/20 hover:bg-primary/30 px-2.5 py-1 text-xs font-medium text-current transition-colors",
          cancelButton:
            "inline-flex items-center rounded-md bg-primary/20 hover:bg-primary/30 px-2.5 py-1 text-xs font-medium text-current transition-colors",
          icon: "shrink-0 mt-0.5 text-current [&_svg]:h-4 [&_svg]:w-4",
          closeButton: [
            "!absolute !top-2.5 !right-2.5 !left-auto !translate-x-0 !translate-y-0",
            "!h-6 !w-6 !rounded-md !border-none !bg-transparent",
            "!text-current/70 hover:!text-current hover:!bg-current/10",
            "transition-colors flex items-center justify-center opacity-100",
          ].join(" "),
        },
      }}
      {...props}
    />
  );
};

const toast = Object.assign(
  (message: ReactNode, options?: ExternalToast) => queuedToast("message", message, options),
  {
    success: (message: ReactNode, options?: ExternalToast) => queuedToast("success", message, options),
    info: (message: ReactNode, options?: ExternalToast) => queuedToast("info", message, options),
    warning: (message: ReactNode, options?: ExternalToast) => queuedToast("warning", message, options),
    error: (message: ReactNode, options?: ExternalToast) => queuedToast("error", message, options),
    loading: (message: ReactNode, options?: ExternalToast) => baseToast.loading(message, options),
    dismiss: baseToast.dismiss,
    promise: baseToast.promise,
    custom: baseToast.custom,
    message: (message: ReactNode, options?: ExternalToast) => queuedToast("message", message, options),
    getHistory: baseToast.getHistory,
    getToasts: baseToast.getToasts,
  }
);

export { Toaster, toast };
export { X as ToastCloseIcon };
