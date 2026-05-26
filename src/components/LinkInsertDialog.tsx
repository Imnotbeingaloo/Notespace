import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";

interface LinkInsertDialogProps {
  open: boolean;
  initialText: string;
  initialUrl?: string;
  onCancel: () => void;
  onConfirm: (title: string, url: string) => void;
}

function looksLikeUrl(s: string): boolean {
  return /^(https?:\/\/|mailto:|\/)/i.test(s.trim());
}

export function LinkInsertDialog({ open, initialText, initialUrl = "", onCancel, onConfirm }: LinkInsertDialogProps) {
  const [title, setTitle] = useState(initialText);
  const [url, setUrl] = useState(initialUrl);
  const urlRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    // If the user highlighted a URL, treat it as the link target and clear the title.
    if (initialText && looksLikeUrl(initialText)) {
      setUrl(initialText.trim());
      setTitle("");
      // Focus the title since URL is filled in for them
      setTimeout(() => titleRef.current?.focus(), 60);
    } else {
      setTitle(initialText);
      setUrl(initialUrl || "https://");
      // Focus the URL since title is filled in
      setTimeout(() => urlRef.current?.focus(), 60);
    }
  }, [open, initialText, initialUrl]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmedUrl = url.trim();
    if (!trimmedUrl || trimmedUrl === "https://") return;
    const finalTitle = title.trim() || trimmedUrl;
    onConfirm(finalTitle, trimmedUrl);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Link2 className="h-4 w-4 text-primary" />
            </div>
            <DialogTitle>Insert link</DialogTitle>
          </div>
          <DialogDescription>
            Give your link a label and a destination. The label defaults to your highlighted text.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Link title</label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Download link"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">URL</label>
            <input
              ref={urlRef}
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
            <Button type="submit">Insert link</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
