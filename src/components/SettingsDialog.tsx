import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { User as UserIcon, SlidersHorizontal, Palette, Database, Loader2, Sun, Moon, Monitor, Download, Trash2, Check, Lock, BookOpen, Clock, Target } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/use-profile";
import { useTheme } from "next-themes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Switch } from "@/components/ui/switch";
import { usePaperStyle } from "@/hooks/use-paper-style";
import { useTempNotesEnabled } from "@/hooks/use-temp-notes-enabled";
import { useWordCountGoalEnabled } from "@/hooks/use-word-count-goal-enabled";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Tab = "personal" | "preferences" | "appearance" | "data";

const TABS: { id: Tab; label: string; Icon: typeof UserIcon }[] = [
  { id: "personal", label: "Personal", Icon: UserIcon },
  { id: "preferences", label: "Preferences", Icon: SlidersHorizontal },
  { id: "appearance", label: "Appearance", Icon: Palette },
  { id: "data", label: "Data & Export", Icon: Database },
];

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [tab, setTab] = useState<Tab>("personal");
  const { user } = useAuth();
  const { profile, updateDisplayName, markPasswordChanged, daysSincePasswordChange, refresh } = useProfile();
  const { theme, setTheme } = useTheme();
  const [paperStyle, setPaperStyle] = usePaperStyle();
  const [tempNotesEnabled, setTempNotesEnabled] = useTempNotesEnabled();
  const [wordCountGoalEnabled, setWordCountGoalEnabled] = useWordCountGoalEnabled();

  // Personal
  const [name, setName] = useState(profile?.display_name ?? "");
  const [savingName, setSavingName] = useState(false);
  useEffect(() => { setName(profile?.display_name ?? ""); }, [profile?.display_name]);

  // Password (inside Personal now)
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  // Data
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  const handleSaveName = async () => {
    const trimmed = name.trim();
    if (!trimmed) { toast.error("Name can't be empty"); return; }
    setSavingName(true);
    const { error } = await updateDisplayName(trimmed);
    setSavingName(false);
    if (error) { toast.error(error); return; }
    toast.success("Name updated");
  };

  const passwordCooldownDays = profile?.password_last_changed_at
    ? Math.max(0, 30 - daysSincePasswordChange)
    : 0;
  const canChangePassword = passwordCooldownDays === 0;

  const handleChangePassword = async () => {
    setPwSaving(true);
    const { changePassword } = await import("@/lib/password-change");
    const result = await changePassword({
      email: user?.email,
      currentPw,
      newPw,
      confirmPw,
      canChange: canChangePassword,
      cooldownDays: passwordCooldownDays,
      signInWithPassword: (args) => supabase.auth.signInWithPassword(args),
      updateUser: (args) => supabase.auth.updateUser(args),
      markPasswordChanged,
    });
    setPwSaving(false);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    toast.success(result.message);
  };

  const handleExportAll = async () => {
    if (!user) return;
    setExporting(true);
    try {
      const { data: notebooks } = await supabase.from("notebooks").select("*");
      const { data: notes } = await supabase.from("notes").select("*");
      const payload = {
        exported_at: new Date().toISOString(),
        user: { id: user.id, email: user.email, display_name: profile?.display_name },
        notebooks: notebooks ?? [],
        notes: notes ?? [],
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `notebook-archive-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Export downloaded");
    } catch (e: any) {
      toast.error(e.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden gap-0">
        <div className="flex flex-col sm:flex-row min-h-[480px]">
          {/* Sidebar tabs */}
          <aside className="sm:w-52 shrink-0 bg-muted/30 border-r border-border p-3">
            <h2 className="px-2 py-2 text-xs uppercase tracking-wider font-mono text-muted-foreground">Settings</h2>
            <nav className="flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible">
              {TABS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors whitespace-nowrap text-left ${
                    tab === id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <section className="flex-1 p-6 sm:p-8 overflow-y-auto">
            {tab === "personal" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground">Personal</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">How we refer to you across the app.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Display name</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={60}
                      placeholder="Your name"
                      className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={savingName || name.trim() === (profile?.display_name ?? "")}
                      className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                    >
                      {savingName ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                      Save
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                  <input
                    type="email"
                    value={user?.email ?? ""}
                    disabled
                    className="w-full px-3 py-2 rounded-lg border border-input bg-muted text-muted-foreground text-sm cursor-not-allowed"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">Email is permanent for now. Contact support to change it.</p>
                </div>

                {/* Password section moved into Personal */}
                <div className="pt-4 border-t border-border space-y-4">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-serif text-base font-bold text-foreground">Password</h4>
                  </div>
                  <p className="text-xs text-muted-foreground -mt-2">You can change your password once every 30 days.</p>
                  {!canChangePassword && (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
                      Next password change available in <strong>{passwordCooldownDays} day{passwordCooldownDays === 1 ? "" : "s"}</strong>.
                    </div>
                  )}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-medium text-foreground">Current password</label>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!user?.email) { toast.error("No email on file"); return; }
                          const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
                            redirectTo: `${window.location.origin}/auth?reset=1`,
                          });
                          if (error) toast.error(error.message);
                          else toast.success("Reset link sent", { description: "Check your inbox or spam folder." });
                        }}
                        className="text-[11px] text-primary/80 hover:text-primary hover:underline underline-offset-2 transition-colors"
                      >
                        Forgot your password?
                      </button>
                    </div>
                    <input
                      type="password"
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      disabled={!canChangePassword}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">New password</label>
                    <input
                      type="password"
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      minLength={6}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      disabled={!canChangePassword}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Confirm new password</label>
                    <input
                      type="password"
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      minLength={6}
                      placeholder="••••••••"
                      disabled={!canChangePassword}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                    />
                  </div>
                  <button
                    onClick={handleChangePassword}
                    disabled={!canChangePassword || pwSaving || !currentPw || !newPw || !confirmPw}
                    className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                  >
                    {pwSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Update password
                  </button>
                </div>
              </div>
            )}

            {tab === "preferences" && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground">Preferences</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Tweak how your writing surface feels.</p>
                </div>

                <div className="rounded-xl border border-border p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-sm font-semibold text-foreground">Classic notebook paper</h4>
                      <Switch
                        checked={paperStyle}
                        onCheckedChange={(v) => {
                          setPaperStyle(v);
                          (v ? toast.success : toast.warning)(v ? "Notebook paper enabled" : "Notebook paper disabled");
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Show classic ruled lines and a red margin on the writing surface - like an actual notebook page.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-border p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-sm font-semibold text-foreground">Temporary Notes</h4>
                      <Switch
                        checked={tempNotesEnabled}
                        onCheckedChange={(v) => {
                          setTempNotesEnabled(v);
                          (v ? toast.success : toast.warning)(v ? "Temporary Notes enabled" : "Temporary Notes disabled");
                        }}
                        aria-label="Toggle Temporary Notes"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Show the Temporary Note entry in the sidebar and Home. Temporary notes auto-delete after 24 hours.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-border p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-sm font-semibold text-foreground">Word Count Goal</h4>
                      <Switch
                        checked={wordCountGoalEnabled}
                        onCheckedChange={(v) => {
                          setWordCountGoalEnabled(v);
                          (v ? toast.success : toast.warning)(v ? "Word Count Goal enabled" : "Word Count Goal disabled");
                        }}
                        aria-label="Toggle Word Count Goal"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Show the daily word goal tracker and weekly writing chart in the editor footer.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {tab === "appearance" && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground">Appearance</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Choose how Notespace looks to you.</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { id: "light", label: "Light", Icon: Sun },
                    { id: "dark", label: "Dark", Icon: Moon },
                    { id: "system", label: "System", Icon: Monitor },
                  ] as const).map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      onClick={() => { setTheme(id); try { localStorage.setItem("app-theme", id); } catch {} }}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                        theme === id
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs font-medium">{label}</span>
                    </button>
                  ))}
                </div>

              </div>
            )}

            {tab === "data" && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground">Data & Export</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Your notes belong to you.</p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Download className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-foreground">Export everything</h4>
                      <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                        Download a JSON file with all your notebooks and notes.
                      </p>
                      <button
                        onClick={handleExportAll}
                        disabled={exporting}
                        className="px-3 py-1.5 text-xs rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {exporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                        Download export
                      </button>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-destructive/30 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-foreground">Sign out everywhere</h4>
                      <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                        Ends all active sessions on every device.
                      </p>
                      <button
                        onClick={async () => {
                          await supabase.auth.signOut({ scope: "global" });
                          toast.success("Signed out from all devices");
                        }}
                        className="px-3 py-1.5 text-xs rounded-lg border border-destructive/40 text-destructive font-medium hover:bg-destructive/10 transition-colors"
                      >
                        Sign out everywhere
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
