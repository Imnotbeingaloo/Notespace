import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      duration={3500}
      theme={theme as ToasterProps["theme"]}
      position="bottom-right"
      closeButton
      className="toaster group"
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            "group toast pointer-events-auto !rounded-2xl !border !border-border/70 !bg-background/95 backdrop-blur-md !text-foreground !shadow-[0_12px_40px_-12px_rgba(0,0,0,0.35)] !px-4 !py-3 !gap-3 !font-sans !text-sm !min-h-[58px] !w-[360px] max-w-[calc(100vw-2rem)] data-[type=success]:!border-emerald-500/40 data-[type=error]:!border-rose-500/40 data-[type=info]:!border-sky-500/40 data-[type=warning]:!border-amber-500/40 before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-full before:bg-primary/70 data-[type=success]:before:bg-emerald-500 data-[type=error]:before:bg-rose-500 data-[type=info]:before:bg-sky-500 data-[type=warning]:before:bg-amber-500 relative overflow-hidden",
          title: "!font-semibold !text-[13.5px] tracking-tight",
          description: "!text-muted-foreground !text-xs leading-relaxed",
          actionButton: "!bg-primary !text-primary-foreground !rounded-lg !px-3 !py-1.5 !text-xs !font-medium",
          cancelButton: "!bg-muted !text-muted-foreground !rounded-lg",
          closeButton:
            "!bg-background !border !border-border !text-muted-foreground hover:!text-foreground !rounded-full",
          icon: "!text-primary",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
