import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FilePlus, GitMerge, Replace, AlertTriangle, X } from "lucide-react";

export type ImportAction = "create" | "merge" | "replace";

interface ImportActionDialogProps {
  open: boolean;
  fileName: string;
  hasExistingContent: boolean;
  /** Called with the chosen action, or null if dismissed. */
  onChoose: (action: ImportAction | null) => void;
}

/**
 * Three-way prompt shown when the user imports a document into an existing
 * note. "Replace" confirms before wiping content; the close button on "Merge"
 * (and the X) asks for confirmation so the user can back out safely.
 */
export function ImportActionDialog({ open, fileName, hasExistingContent, onChoose }: ImportActionDialogProps) {
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);

  const reset = () => {
    setConfirmReplace(false);
    setConfirmClose(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      // Intercept dismiss → ask only if there's existing content to lose context.
      if (hasExistingContent) {
        setConfirmClose(true);
        return;
      }
      reset();
      onChoose(null);
    }
  };

  if (confirmReplace) {
    return (
      <Dialog open={open} onOpenChange={() => { /* lock during confirm */ }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle>Replace everything in this note?</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              This will permanently remove the current content of this note and replace it with the contents of <span className="font-medium text-foreground">"{fileName}"</span>. This can't be undone with one click.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setConfirmReplace(false)}>Go back</Button>
            <Button variant="destructive" onClick={() => { reset(); onChoose("replace"); }}>Replace content</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (confirmClose) {
    return (
      <Dialog open={open} onOpenChange={() => { /* lock during confirm */ }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel import?</DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure? "{fileName}" hasn't been added to your note yet.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setConfirmClose(false)}>Keep importing</Button>
            <Button variant="destructive" onClick={() => { reset(); onChoose(null); }}>Yes, cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import "{fileName}"</DialogTitle>
          <DialogDescription>Where should this content go?</DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 py-2">
          <button
            onClick={() => { reset(); onChoose("create"); }}
            className="magnetic-btn flex items-start gap-3 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 text-left transition-all"
          >
            <FilePlus className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-foreground">Create a new note</div>
              <div className="text-xs text-muted-foreground mt-0.5">Keep this note untouched and put the imported text in its own note.</div>
            </div>
          </button>

          <button
            disabled={!hasExistingContent}
            onClick={() => { reset(); onChoose("merge"); }}
            className="magnetic-btn flex items-start gap-3 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <GitMerge className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-foreground">Merge into this note</div>
              <div className="text-xs text-muted-foreground mt-0.5">Insert the imported text at your cursor position.</div>
            </div>
          </button>

          <button
            disabled={!hasExistingContent}
            onClick={() => setConfirmReplace(true)}
            className="magnetic-btn flex items-start gap-3 p-4 rounded-xl border border-border hover:border-destructive/40 hover:bg-destructive/5 text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Replace className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-foreground">Replace this note</div>
              <div className="text-xs text-muted-foreground mt-0.5">Wipe the current content and use the imported file instead.</div>
            </div>
          </button>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenChange(false)}
            className="gap-1.5"
          >
            <X className="h-4 w-4" /> Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
