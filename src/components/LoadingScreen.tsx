import { Loader2 } from "lucide-react";

export function LoadingScreen({ label }: { label?: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background min-h-[60vh]">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      {label && (
        <span className="text-sm text-muted-foreground mt-3 font-medium">{label}</span>
      )}
    </div>
  );
}
