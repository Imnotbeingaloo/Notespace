import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowUpToLine, ArrowDownToLine, MousePointer2, GripVertical, X, FileText, Image as ImageIcon, FileVideo, Music, File as FileIcon } from "lucide-react";
import type { MergePosition } from "@/components/ImportActionDialog";

export interface BatchChoice {
  position: MergePosition;
  order: string[]; // filenames in the order they should be applied
  skipped: string[]; // filenames the user opted out of
}

interface BatchImportDialogProps {
  open: boolean;
  files: { name: string; size: number; kind: "text" | "image" | "video" | "audio" | "attach" }[];
  hasExistingContent: boolean;
  onChoose: (choice: BatchChoice | null) => void;
}

function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

function KindIcon({ kind }: { kind: string }) {
  const cls = "h-4 w-4 text-muted-foreground flex-shrink-0";
  if (kind === "text") return <FileText className={cls} />;
  if (kind === "image") return <ImageIcon className={cls} />;
  if (kind === "video") return <FileVideo className={cls} />;
  if (kind === "audio") return <Music className={cls} />;
  return <FileIcon className={cls} />;
}

/**
 * Single dialog shown for batch imports — one merge choice for the whole batch,
 * plus per-file skip/reorder. Replaces the old per-file prompt so users don't
 * have to click through N times when dropping a folder.
 */
export function BatchImportDialog({ open, files, hasExistingContent, onChoose }: BatchImportDialogProps) {
  const [order, setOrder] = useState<string[]>(files.map((f) => f.name));
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [position, setPosition] = useState<MergePosition>("cursor");
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const toggle = (name: string) => {
    const next = new Set(skipped);
    if (next.has(name)) next.delete(name); else next.add(name);
    setSkipped(next);
  };

  const move = (from: number, to: number) => {
    if (from === to) return;
    const next = [...order];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setOrder(next);
  };

  const positions: { key: MergePosition; label: string; Icon: typeof ArrowUpToLine }[] = [
    { key: "top", label: "Top", Icon: ArrowUpToLine },
    { key: "cursor", label: "At cursor", Icon: MousePointer2 },
    { key: "end", label: "End", Icon: ArrowDownToLine },
  ];

  const keptCount = files.length - skipped.size;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onChoose(null); }}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Import {files.length} file{files.length === 1 ? "" : "s"}</DialogTitle>
          <DialogDescription>
            Reorder or skip files, then choose one merge position for the whole batch.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[280px] overflow-y-auto rounded-xl border border-border divide-y divide-border">
          {order.map((name, idx) => {
            const file = files.find((f) => f.name === name)!;
            const isSkipped = skipped.has(name);
            return (
              <div
                key={name}
                draggable
                onDragStart={() => setDragIdx(idx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => { if (dragIdx !== null) move(dragIdx, idx); setDragIdx(null); }}
                className={`flex items-center gap-2 px-3 py-2 text-sm ${isSkipped ? "opacity-40" : ""} ${dragIdx === idx ? "bg-primary/5" : "hover:bg-muted/50"}`}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab flex-shrink-0" />
                <KindIcon kind={file.kind} />
                <span className={`flex-1 truncate ${isSkipped ? "line-through" : "text-foreground"}`}>{name}</span>
                <span className="text-xs text-muted-foreground flex-shrink-0">{humanSize(file.size)}</span>
                <button
                  type="button"
                  onClick={() => toggle(name)}
                  className="text-xs px-2 py-0.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isSkipped ? "Include" : "Skip"}
                </button>
              </div>
            );
          })}
        </div>

        {hasExistingContent && (
          <div className="mt-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Merge text files at:</p>
            <div className="grid grid-cols-3 gap-2">
              {positions.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => setPosition(key)}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${position === key ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:border-primary/40"}`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onChoose(null)} className="gap-1.5">
            <X className="h-4 w-4" /> Cancel
          </Button>
          <Button
            disabled={keptCount === 0}
            onClick={() => onChoose({ position, order, skipped: Array.from(skipped) })}
          >
            Import {keptCount} file{keptCount === 1 ? "" : "s"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
