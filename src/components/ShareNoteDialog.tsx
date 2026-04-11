import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Share2, Link2, Copy, Check, Trash2, Mail, Globe, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ShareNoteDialogProps {
  noteId: string;
  noteTitle: string;
}

interface SharedLink {
  id: string;
  share_token: string;
  shared_with_email: string | null;
  is_public: boolean;
  created_at: string;
}

export function ShareNoteDialog({ noteId, noteTitle }: ShareNoteDialogProps) {
  const [open, setOpen] = useState(false);
  const [shares, setShares] = useState<SharedLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const fetchShares = async () => {
    const { data } = await supabase
      .from("shared_notes" as any)
      .select("*")
      .eq("note_id", noteId)
      .order("created_at", { ascending: false });
    setShares((data as any as SharedLink[]) ?? []);
  };

  useEffect(() => {
    if (open) fetchShares();
  }, [open, noteId]);

  const createPublicLink = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("shared_notes" as any)
      .insert({
        note_id: noteId,
        user_id: user.id,
        is_public: true,
      } as any)
      .select()
      .single();

    if (data) {
      setShares((prev) => [data as any as SharedLink, ...prev]);
      toast.success("Public link created!");
    }
    setLoading(false);
  };

  const shareWithEmail = async () => {
    if (!email.trim() || !email.includes("@")) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("shared_notes" as any)
      .insert({
        note_id: noteId,
        user_id: user.id,
        is_public: false,
        shared_with_email: email.trim(),
      } as any)
      .select()
      .single();

    if (data) {
      setShares((prev) => [data as any as SharedLink, ...prev]);
      setEmail("");
      toast.success(`Shared with ${email.trim()}`);
    }
    setLoading(false);
  };

  const deleteShare = async (id: string) => {
    await supabase.from("shared_notes" as any).delete().eq("id", id);
    setShares((prev) => prev.filter((s) => s.id !== id));
    toast.success("Share removed");
  };

  const getShareUrl = (token: string) => `${window.location.origin}/shared/${token}`;

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(getShareUrl(token));
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5">
          <Share2 className="h-3 w-3" /> Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-primary" />
            Share "{noteTitle}"
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Button
              onClick={createPublicLink}
              disabled={loading}
              variant="outline"
              className="w-full gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
              Create Public Link
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && shareWithEmail()}
              className="h-9 text-sm"
            />
            <Button onClick={shareWithEmail} disabled={loading || !email.trim()} size="sm" className="gap-1.5 shrink-0">
              <Mail className="h-3 w-3" /> Share
            </Button>
          </div>

          {shares.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <p className="text-xs font-medium text-muted-foreground">Active shares</p>
              {shares.map((share) => (
                <motion.div
                  key={share.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-2 rounded-lg border border-border bg-muted/30"
                >
                  {share.is_public ? (
                    <Globe className="h-3.5 w-3.5 text-primary shrink-0" />
                  ) : (
                    <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  )}
                  <span className="text-xs text-foreground truncate flex-1">
                    {share.shared_with_email || "Public link"}
                  </span>
                  <button
                    onClick={() => copyLink(share.share_token)}
                    className="p-1 rounded hover:bg-muted transition-colors"
                    title="Copy link"
                  >
                    {copied === share.share_token ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3 text-muted-foreground" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteShare(share.id)}
                    className="p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-colors"
                    title="Remove share"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
