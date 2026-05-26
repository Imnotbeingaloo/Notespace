import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sparkles, Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import { toast } from "sonner";

interface NamePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NamePromptDialog({ open, onOpenChange }: NamePromptDialogProps) {
  const { updateDisplayName } = useProfile();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Please enter a name");
      return;
    }
    if (trimmed.length > 60) {
      toast.error("Keep it under 60 characters");
      return;
    }
    setSaving(true);
    const { error } = await updateDisplayName(trimmed);
    setSaving(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success(`Nice to meet you, ${trimmed}!`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!saving) onOpenChange(o); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <DialogTitle className="font-serif">What should we call you?</DialogTitle>
          </div>
          <DialogDescription>
            We'll use this around the app — you can change it anytime in Settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
            maxLength={60}
            placeholder="Your name or nickname"
            className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
