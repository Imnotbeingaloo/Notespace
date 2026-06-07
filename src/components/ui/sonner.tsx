import { useTheme } from "next-themes";
import { Toaster as Sonner, toast as baseToast } from "sonner";
import type { ExternalToast } from "sonner";
import type { ReactNode } from "react";
import { queuedToast, MAX_VISIBLE_TOASTS } from "@/lib/toast-queue";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      duration={3500}
      theme={theme as ToasterProps["theme"]}
      position="bottom-left"
      visibleToasts={3}
      gap={10}
      offset={{ top: 20, right: 20, bottom: 20, left: 20 }}
      mobileOffset={{ bottom: 16, left: 16, right: 16, top: 16 }}
      className="toaster group"
      aria-label="Notifications"
      hotkey={["altKey", "KeyT"]}
      pauseWhenPageIsHidden
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "group pointer-events-auto flex items-start gap-3 w-[min(360px,calc(100vw-2rem))] rounded-lg border border-border bg-card text-card-foreground shadow-md px-4 py-3 font-sans text-sm",
          title: "font-medium text-[13.5px] leading-snug text-foreground",
          description: "text-muted-foreground text-xs leading-relaxed mt-1",
          actionButton:
            "ml-auto inline-flex items-center rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:opacity-90",
          cancelButton:
            "inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted/80",
          icon: "shrink-0 mt-0.5 [&_svg]:h-4 [&_svg]:w-4",
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
