import { useRef, useState } from "react";
import { Paperclip, Download, Repeat2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useNotebooks, type Attachment } from "@/context/NotebookContext";
import { validateFile, buildStoragePath } from "@/lib/file-validation";
import { removeAttachmentObjects } from "@/lib/attachment-cleanup";
import { toast } from "@/hooks/use-toast";

function formatBytes(n: number) {
  if (!n) return "";
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

/** Escape a string for safe use inside a RegExp. */
function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Remove any markdown references to a given attachment URL from the note body.
 * Strips both `![alt](url)` image embeds and `[📎 name](url)` file links, on
 * their own line where possible so we don't leave stray whitespace behind.
 */
function stripAttachmentFromMarkdown(content: string, url: string) {
  if (!content || !url) return content;
  const escaped = escapeRegex(url);
  // Remove full-line matches first (own paragraph), then any inline leftovers.
  const lineRe = new RegExp(`^[ \\t]*!?\\[[^\\]]*\\]\\(${escaped}[^)]*\\)[ \\t]*\\r?\\n?`, "gm");
  const inlineRe = new RegExp(`!?\\[[^\\]]*\\]\\(${escaped}[^)]*\\)`, "g");
  return content.replace(lineRe, "").replace(inlineRe, "");
}

interface AttachmentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AttachmentsDialog({ open, onOpenChange }: AttachmentsDialogProps) {
  const { activeNote, activeNotebookId, updateNote } = useNotebooks();
  const { user } = useAuth();
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);

  const attachments: Attachment[] = activeNote?.attachments || [];

  const persist = (nextAttachments: Attachment[], nextContent?: string) => {
    if (!activeNote) return;
    const patch: { attachments: Attachment[]; content?: string } = { attachments: nextAttachments };
    if (typeof nextContent === "string") patch.content = nextContent;
    updateNote(activeNotebookId, activeNote.id, patch);
  };

  const removeOne = async (idx: number) => {
    if (!activeNote) return;
    const att = attachments[idx];
    await removeAttachmentObjects([att], "replace", activeNote.id);
    const nextAttachments = attachments.filter((_, i) => i !== idx);
    const nextContent = stripAttachmentFromMarkdown(activeNote.content || "", att.url);
    persist(nextAttachments, nextContent);
    toast({ title: "Attachment removed", description: att.name });
  };

  const openReplace = (idx: number) => {
    setReplaceIndex(idx);
    replaceInputRef.current?.click();
  };

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    const idx = replaceIndex;
    setReplaceIndex(null);
    if (!file || idx === null || !user || !activeNote) return;
    if (!validateFile(file)) return;
    try {
      const old = attachments[idx];
      const path = buildStoragePath(user.id, activeNote.id, file.name);
      const { error } = await supabase.storage.from("note-attachments").upload(path, file);
      if (error) throw error;
      const { data: signed } = await supabase.storage
        .from("note-attachments")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      const url = signed?.signedUrl || "";
      // Preserve original filename as picked up from the user's device.
      const nextAttachments = attachments.map((a, i) =>
        i === idx ? { name: file.name, url, path, type: file.type, size: file.size } : a
      );
      persist(nextAttachments);
      if (old) await removeAttachmentObjects([old], "replace", activeNote.id);
      toast({ title: "Replaced", description: file.name });
    } catch (err) {
      console.error("Replace failed", err);
      toast({ title: "Replace failed", description: "Could not upload the new file.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Paperclip className="h-4 w-4" />
            Attachments
            <span className="text-xs font-normal text-muted-foreground">
              ({attachments.length})
            </span>
          </DialogTitle>
          <DialogDescription>
            Files stay exactly as you uploaded them. Replace or remove any attachment below.
          </DialogDescription>
        </DialogHeader>

        {attachments.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No attachments on this note yet.
          </div>
        ) : (
          <ul className="flex flex-col gap-1.5 max-h-[60vh] overflow-y-auto">
            {attachments.map((att, idx) => (
              <li
                key={`${att.path || att.url}-${idx}`}
                className="flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2 text-sm"
              >
                <Paperclip className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <a
                  href={att.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 truncate text-foreground hover:text-primary"
                  title={att.name}
                >
                  {att.name}
                </a>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatBytes(att.size)}
                </span>
                <div className="flex items-center gap-0.5 shrink-0">
                  <a
                    href={att.url}
                    download={att.name}
                    className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                    aria-label={`Download ${att.name}`}
                    title="Download"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </a>
                  <button
                    onClick={() => openReplace(idx)}
                    className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                    aria-label={`Replace ${att.name}`}
                    title="Replace"
                  >
                    <Repeat2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => removeOne(idx)}
                    className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    aria-label={`Remove ${att.name}`}
                    title="Remove"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <input ref={replaceInputRef} type="file" hidden onChange={handleReplaceFile} />
      </DialogContent>
    </Dialog>
  );
}
