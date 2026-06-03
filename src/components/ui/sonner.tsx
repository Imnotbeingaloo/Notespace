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
      visibleToasts={MAX_VISIBLE_TOASTS}
      gap={14}
      expand
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
            "group pointer-events-auto relative !rounded-xl !border !border-border/80 !bg-card !text-card-foreground !shadow-2xl !pl-4 !pr-10 !py-3 !gap-3 !font-sans !text-sm !w-[min(360px,calc(100vw-2rem))] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-full before:bg-primary data-[type=success]:!border-primary/50 data-[type=error]:!border-destructive/55 data-[type=warning]:!border-accent/60 data-[type=info]:!border-primary/50 data-[type=success]:before:bg-primary data-[type=error]:before:bg-destructive data-[type=warning]:before:bg-accent data-[type=info]:before:bg-primary",
          title: "!font-semibold !text-[13.5px] tracking-tight !leading-snug",
          description: "!text-muted-foreground !text-xs !leading-relaxed !mt-0.5",
          actionButton: "!bg-primary !text-primary-foreground !rounded-md !px-3 !py-1.5 !text-xs !font-medium",
          cancelButton: "!bg-muted !text-muted-foreground !rounded-md",
          closeButton:
            "!bg-card !border !border-border/80 !text-muted-foreground hover:!text-foreground hover:!bg-muted !rounded-full !left-auto !right-3 !top-1/2 !-translate-y-1/2 !h-7 !w-7 !flex !items-center !justify-center !transition-colors focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-ring [&>svg]:!h-3.5 [&>svg]:!w-3.5",
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
