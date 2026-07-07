import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, BookOpen, FilePlus, X } from "lucide-react";

export type UploadTarget = "current" | "new-note" | "new-notebook";

interface UploadRoutingDialogProps {
  open: boolean;
  fileCount: number;
  contextLabel: string;              // e.g. "History Notebook" or "this note"
  contextKind: "notebook" | "note";  // determines available choices
  onChoose: (target: UploadTarget | null) => void;
}

/**
 * Pre-upload routing prompt. Shown BEFORE any parsing/upload work when either
 * multiple files were selected OR the user is currently inside a notebook,
 * so they can decide up-front where the batch should land.
 */
export function UploadRoutingDialog({ open, fileCount, contextLabel, contextKind, onChoose }: UploadRoutingDialogProps) {
  const many = fileCount > 1;
  const title = many ? `Where should these ${fileCount} files go?` : `Where should this file go?`;
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onChoose(null); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Pick a destination before we start processing. You'll still choose merge position for text files afterwards.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 py-2">
          <button
            onClick={() => onChoose("current")}
            className="magnetic-btn flex items-start gap-3 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 text-left transition-all"
          >
            {contextKind === "notebook" ? (
              <BookOpen className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            ) : (
              <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            )}
            <div>
              <div className="font-medium text-foreground">
                {contextKind === "notebook" ? `Add to ${contextLabel}` : `Add to this note`}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {contextKind === "notebook"
                  ? "Attach files and append text to the currently open note in this notebook."
                  : "Everything lands in the note you're editing right now."}
              </div>
            </div>
          </button>

          <button
            onClick={() => onChoose("new-note")}
            className="magnetic-btn flex items-start gap-3 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 text-left transition-all"
          >
            <FilePlus className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-foreground">Create a new note</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {contextKind === "notebook"
                  ? `Put everything into one fresh note inside ${contextLabel}.`
                  : "Keep the current note untouched; open a new one for this content."}
              </div>
            </div>
          </button>

          <button
            onClick={() => onChoose("new-notebook")}
            className="magnetic-btn flex items-start gap-3 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 text-left transition-all"
          >
            <BookOpen className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-foreground">Create a new notebook</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {many
                  ? "Spin up a fresh notebook and turn each file into its own note inside it."
                  : "Wrap this file in its own notebook so it stays organized separately."}
              </div>
            </div>
          </button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
