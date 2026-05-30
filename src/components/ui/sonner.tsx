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
      gap={14}
      expand={false}
      offset={20}
      className="toaster group"
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            "group pointer-events-auto relative !rounded-xl !border !border-border/70 !bg-card !text-card-foreground !shadow-lg !px-4 !py-3 !gap-3 !font-sans !text-sm !w-[340px] max-w-[calc(100vw-2rem)] data-[type=success]:!border-emerald-500/50 data-[type=error]:!border-rose-500/50 data-[type=warning]:!border-amber-500/50 data-[type=info]:!border-sky-500/50",
          title: "!font-semibold !text-[13.5px] tracking-tight !leading-snug",
          description: "!text-muted-foreground !text-xs !leading-relaxed !mt-0.5",
          actionButton: "!bg-primary !text-primary-foreground !rounded-md !px-3 !py-1.5 !text-xs !font-medium",
          cancelButton: "!bg-muted !text-muted-foreground !rounded-md",
          closeButton:
            "!bg-card !border !border-border/70 !text-muted-foreground hover:!text-foreground !rounded-full !left-auto !right-2 !top-2 !h-5 !w-5",
          icon: "!shrink-0 data-[type=success]:!text-emerald-500 data-[type=error]:!text-rose-500 data-[type=warning]:!text-amber-500 data-[type=info]:!text-sky-500",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
