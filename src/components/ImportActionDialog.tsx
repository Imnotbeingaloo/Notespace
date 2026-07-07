import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FilePlus, GitMerge, Replace, X, ArrowUpToLine, MousePointer2, ArrowDownToLine } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export type ImportAction = "create" | "merge" | "replace";
export type MergePosition = "top" | "cursor" | "end";

export interface ImportChoice {
  action: ImportAction;
  position?: MergePosition;
}

interface ImportActionDialogProps {
  open: boolean;
  fileName: string;
  hasExistingContent: boolean;
  /** Called with the chosen action, or null if dismissed. */
  onChoose: (choice: ImportChoice | null) => void;
}

/**
 * Three-way import prompt. The confirm-replace and confirm-close prompts are
 * rendered as sibling AlertDialogs layered on top of this dialog so the
 * outer <Dialog> never unmounts — that was causing the confirm dialog to
 * flash and disappear on some devices.
 */
export function ImportActionDialog({ open, fileName, hasExistingContent, onChoose }: ImportActionDialogProps) {
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [pickingMergePosition, setPickingMergePosition] = useState(false);

  const reset = () => {
    setConfirmReplace(false);
    setConfirmClose(false);
    setPickingMergePosition(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (next) return;
    // Any open confirm dialog handles its own dismissal; don't propagate.
    if (confirmReplace || confirmClose) return;
    if (hasExistingContent) {
      setConfirmClose(true);
      return;
    }
    reset();
    onChoose(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          {pickingMergePosition ? (
            <>
              <DialogHeader>
                <DialogTitle>Where should it merge?</DialogTitle>
                <DialogDescription>Pick exactly where "{fileName}" should appear in this note.</DialogDescription>
              </DialogHeader>

              <div className="grid gap-2 py-2">
                <button
                  onClick={() => { reset(); onChoose({ action: "merge", position: "top" }); }}
                  className="magnetic-btn flex items-start gap-3 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 text-left transition-all"
                >
                  <ArrowUpToLine className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-foreground">Top of the note</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Insert before everything that's already there.</div>
                  </div>
                </button>

                <button
                  onClick={() => { reset(); onChoose({ action: "merge", position: "cursor" }); }}
                  className="magnetic-btn flex items-start gap-3 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 text-left transition-all"
                >
                  <MousePointer2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-foreground">At my cursor</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Drop the content right where the caret was last placed.</div>
                  </div>
                </button>

                <button
                  onClick={() => { reset(); onChoose({ action: "merge", position: "end" }); }}
                  className="magnetic-btn flex items-start gap-3 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 text-left transition-all"
                >
                  <ArrowDownToLine className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-foreground">End of the note</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Append after everything that's already there.</div>
                  </div>
                </button>
              </div>

              <DialogFooter>
                <Button variant="ghost" size="sm" onClick={() => setPickingMergePosition(false)} className="gap-1.5">
                  <X className="h-4 w-4" /> Back
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Import "{fileName}"</DialogTitle>
                <DialogDescription>Where should this content go?</DialogDescription>
              </DialogHeader>

              <div className="grid gap-2 py-2">
                <button
                  onClick={() => { reset(); onChoose({ action: "create" }); }}
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
                  onClick={() => setPickingMergePosition(true)}
                  className="magnetic-btn flex items-start gap-3 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <GitMerge className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-foreground">Merge into this note</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Pick a position - top, cursor, or end.</div>
                  </div>
                </button>

                <button
                  disabled={!hasExistingContent}
                  onClick={() => {
                    if (!hasExistingContent) { reset(); onChoose({ action: "replace" }); return; }
                    setConfirmReplace(true);
                  }}
                  className="magnetic-btn flex items-start gap-3 p-4 rounded-xl border border-border hover:border-destructive/40 hover:bg-destructive/5 text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Replace className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-foreground">Replace this note</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Wipe the current content and use the imported file instead.</div>
                  </div>
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmReplace}
        onOpenChange={(o) => { if (!o) setConfirmReplace(false); }}
        title="Replace everything in this note?"
        description={`This will remove the current content of this note and replace it with the contents of "${fileName}". You can undo with Ctrl+Z.`}
        confirmLabel="Replace content"
        destructive
        onConfirm={() => { setConfirmReplace(false); reset(); onChoose({ action: "replace" }); }}
      />

      <ConfirmDialog
        open={confirmClose}
        onOpenChange={(o) => { if (!o) setConfirmClose(false); }}
        title="Cancel import?"
        description={`Are you sure? "${fileName}" hasn't been added to your note yet.`}
        confirmLabel="Yes, cancel"
        destructive
        onConfirm={() => { setConfirmClose(false); reset(); onChoose(null); }}
      />
    </>
  );
}
