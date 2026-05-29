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
      visibleToasts={4}
      gap={12}
      expand={false}
      className="toaster group"
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            "group toast pointer-events-auto relative overflow-hidden !rounded-2xl !border !border-border/60 !bg-background/95 backdrop-blur-xl !text-foreground !shadow-[0_18px_50px_-18px_rgba(0,0,0,0.45)] !px-4 !py-3 !gap-3 !font-sans !text-sm !min-h-[60px] !w-[360px] max-w-[calc(100vw-2rem)] data-[type=success]:!border-emerald-500/40 data-[type=error]:!border-rose-500/40 data-[type=info]:!border-sky-500/40 data-[type=warning]:!border-amber-500/40 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary/70 data-[type=success]:before:bg-emerald-500 data-[type=error]:before:bg-rose-500 data-[type=info]:before:bg-sky-500 data-[type=warning]:before:bg-amber-500",
          title: "!font-semibold !text-[13.5px] tracking-tight",
          description: "!text-muted-foreground !text-xs leading-relaxed",
          actionButton: "!bg-primary !text-primary-foreground !rounded-lg !px-3 !py-1.5 !text-xs !font-medium",
          cancelButton: "!bg-muted !text-muted-foreground !rounded-lg",
          closeButton:
            "!bg-background !border !border-border !text-muted-foreground hover:!text-foreground !rounded-full !left-auto !right-2 !top-2",
          icon: "!text-primary shrink-0",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
