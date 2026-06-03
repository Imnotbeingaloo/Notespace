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
      position="bottom-right"
      closeButton
      visibleToasts={3}
      gap={10}
      offset={{ top: 20, right: 20, bottom: 20, left: 20 }}
      mobileOffset={{ bottom: 16, left: 16, right: 16, top: 16 }}
      className="toaster group"
      aria-label="Notifications"
      hotkey={["altKey", "KeyT"]}
      pauseWhenPageIsHidden
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            "group pointer-events-auto !rounded-xl !border !border-border/70 !bg-card !text-card-foreground !shadow-xl !p-4 !gap-3 !font-sans !text-sm !w-[min(360px,calc(100vw-2rem))] data-[type=success]:!border-primary/40 data-[type=error]:!border-destructive/50 data-[type=warning]:!border-accent/50",
          title: "!font-semibold !text-[13.5px] tracking-tight !leading-snug",
          description: "!text-muted-foreground !text-xs !leading-relaxed !mt-0.5",
          actionButton: "!bg-primary !text-primary-foreground !rounded-md !px-3 !py-1.5 !text-xs !font-medium",
          cancelButton: "!bg-muted !text-muted-foreground !rounded-md",
          closeButton:
            "!bg-card !border !border-border/70 !text-muted-foreground hover:!text-foreground hover:!bg-muted !rounded-full !left-auto !right-2 !top-2 !translate-y-0 !h-6 !w-6 !flex !items-center !justify-center !transition-colors focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-ring [&>svg]:!h-3 [&>svg]:!w-3",
          icon: "!shrink-0 data-[type=success]:!text-emerald-500 data-[type=error]:!text-rose-500 data-[type=warning]:!text-amber-500 data-[type=info]:!text-sky-500",
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
