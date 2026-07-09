import { useMemo } from "react";
import { Paperclip, Download, BookOpen, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useNotebooks, type Attachment } from "@/context/NotebookContext";

function formatBytes(n: number) {
  if (!n) return "";
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

interface GlobalAttachmentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Row {
  att: Attachment;
  noteId: string;
  noteTitle: string;
  notebookTitle: string;
}

export function GlobalAttachmentsDialog({ open, onOpenChange }: GlobalAttachmentsDialogProps) {
  const { notebooks } = useNotebooks();

  const rows: Row[] = useMemo(() => {
    const out: Row[] = [];
    for (const nb of notebooks) {
      for (const n of nb.notes || []) {
        for (const att of n.attachments || []) {
          out.push({
            att,
            noteId: n.id,
            noteTitle: n.title || "Untitled",
            notebookTitle: nb.title || "Notebook",
          });
        }
      }
    }
    return out;
  }, [notebooks]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Paperclip className="h-4 w-4" />
            All Attachments
            <span className="text-xs font-normal text-muted-foreground">({rows.length})</span>
          </DialogTitle>
          <DialogDescription>
            Every file you've uploaded, grouped by the notebook and note it lives in.
          </DialogDescription>
        </DialogHeader>

        {rows.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            No attachments uploaded yet.
          </div>
        ) : (
          <ul className="flex flex-col gap-1.5 max-h-[60vh] overflow-y-auto">
            {rows.map(({ att, noteId, noteTitle, notebookTitle }, idx) => (
              <li
                key={`${att.path || att.url}-${noteId}-${idx}`}
                className="flex items-center gap-3 rounded-lg border border-border bg-background/60 px-3 py-2 text-sm"
              >
                <Paperclip className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate text-foreground hover:text-primary font-medium"
                    title={att.name}
                  >
                    {att.name}
                  </a>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5 truncate">
                    <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{notebookTitle}</span>
                    <span className="opacity-50">·</span>
                    <span className="flex items-center gap-1 truncate"><FileText className="h-3 w-3" />{noteTitle}</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{formatBytes(att.size)}</span>
                <a
                  href={att.url}
                  download={att.name}
                  className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                  aria-label={`Download ${att.name}`}
                  title="Download"
                >
                  <Download className="h-3.5 w-3.5" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
