import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

/**
 * Global rename-on-duplicate prompt. Listens to `lovable:duplicate-title` window
 * events whose detail includes `{ attempted, taken: string[], resolve: (name|null) }`.
 * Used by NotebookContext when a note transfer would collide with an existing title
 * in the destination notebook.
 */
export function RenameDuplicateDialog() {
  const [open, setOpen] = useState(false);
  const [attempted, setAttempted] = useState("");
  const [taken, setTaken] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [resolver, setResolver] = useState<((v: string | null) => void) | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as
        | { attempted: string; taken: string[]; resolve: (v: string | null) => void }
        | undefined;
      if (!detail) return;
      setAttempted(detail.attempted);
      setTaken((detail.taken || []).map((t) => t.trim().toLowerCase()));
      // Suggest "title (2)" first available suffix
      const base = detail.attempted.trim();
      let i = 2;
      let candidate = `${base} (${i})`;
      while ((detail.taken || []).some((t) => t.trim().toLowerCase() === candidate.toLowerCase())) {
        i += 1;
        candidate = `${base} (${i})`;
      }
      setName(candidate);
      setResolver(() => detail.resolve);
      setOpen(true);
    };
    window.addEventListener("lovable:duplicate-title", handler as EventListener);
    return () => window.removeEventListener("lovable:duplicate-title", handler as EventListener);
  }, []);

  const trimmed = name.trim();
  const isEmpty = trimmed.length === 0;
  const isDuplicate = !isEmpty && taken.includes(trimmed.toLowerCase());
  const canSave = !isEmpty && !isDuplicate;

  const finish = (value: string | null) => {
    if (resolver) resolver(value);
    setResolver(null);
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) finish(null);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <DialogTitle className="font-serif">Name already used</DialogTitle>
          </div>
          <DialogDescription>
            A note titled <span className="font-medium text-foreground">"{attempted}"</span> already
            exists in that notebook. Pick a different name to continue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 mt-2">
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canSave) finish(trimmed);
              if (e.key === "Escape") finish(null);
            }}
            maxLength={120}
            placeholder="New title"
            className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {isDuplicate && (
            <p className="text-xs text-destructive">That name is also taken in this notebook.</p>
          )}
        </div>

        <DialogFooter className="mt-2">
          <button
            type="button"
            onClick={() => finish(null)}
            className="px-3 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => canSave && finish(trimmed)}
            disabled={!canSave}
            className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Save
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Helper used by callers (e.g. context) to request a rename via the global dialog. */
export function promptRenameForDuplicate(attempted: string, taken: string[]): Promise<string | null> {
  return new Promise((resolve) => {
    window.dispatchEvent(
      new CustomEvent("lovable:duplicate-title", { detail: { attempted, taken, resolve } })
    );
  });
}
