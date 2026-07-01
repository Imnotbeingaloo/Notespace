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
import { toast } from "@/components/ui/sonner";

interface ShareNoteDialogProps {
  noteId: string;
  noteTitle: string;
  notebookName?: string;
}

interface SharedLink {
  id: string;
  share_token: string;
  shared_with_email: string | null;
  is_public: boolean;
  is_discoverable?: boolean;
  created_at: string;
}

export function ShareNoteDialog({ noteId, noteTitle, notebookName }: ShareNoteDialogProps) {
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
    // Fetch on mount so the trigger badge reflects existing shares, and refresh when opened.
    fetchShares();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId, open]);

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

  const toggleDiscoverable = async (share: SharedLink) => {
    const next = !share.is_discoverable;
    const { error } = await supabase
      .from("shared_notes" as any)
      .update({ is_discoverable: next } as any)
      .eq("id", share.id);
    if (error) {
      toast.error("Couldn't update visibility");
      return;
    }
    setShares((prev) => prev.map((s) => (s.id === share.id ? { ...s, is_discoverable: next } : s)));
    toast.success(next ? "Search engines can now find this note" : "Hidden from search engines");
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
        <button
          type="button"
          title="Share this note - public link or by email"
          className="magnetic-btn group inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-teal-500/25 bg-teal-500/10 text-teal-600 dark:text-teal-400 hover:bg-teal-500/20 hover:border-teal-500/40 hover:shadow-sm transition-all duration-200"
        >
          <Share2 className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-rotate-6" />
          <span>Share</span>
          {shares.length > 0 && (
            <span className="ml-0.5 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-teal-500 text-white text-[10px] font-semibold leading-none">
              {shares.length}
            </span>
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-primary" />
            {notebookName ? `Share "${notebookName}" Notebook` : `Share "${noteTitle}"`}
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Create a public link anyone can open, or share directly with an email. Public links are hidden from search engines by default.
          </p>
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
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-foreground truncate">
                      {share.shared_with_email || "Public link"}
                    </div>
                    {share.is_public && (
                      <button
                        type="button"
                        onClick={() => toggleDiscoverable(share)}
                        className="mt-1 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition"
                        title="Toggle whether search engines can index this note"
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${share.is_discoverable ? "bg-primary" : "bg-muted-foreground/40"}`}
                        />
                        {share.is_discoverable ? "Discoverable on search engines" : "Hidden from search engines"}
                      </button>
                    )}
                  </div>
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
