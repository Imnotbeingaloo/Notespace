import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Loader2, Eye, EyeOff, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { NoindexHead } from "@/components/NoindexHead";

const BTN_PRESS = "transition-all duration-100 active:scale-95";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // Supabase puts the recovery session in the URL hash; the client picks it up
  // automatically. We just confirm a session exists before letting the user reset.
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!data.session) {
        setError("This reset link is invalid or has expired. Request a new one from the sign-in page.");
      }
      setReady(true);
    };
    check();
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setDone(true);
    setTimeout(() => navigate("/app", { replace: true }), 1400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <NoindexHead />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <img src="/logo.png" alt="" aria-hidden="true" className="h-[1.224rem] w-[1.224rem] object-contain" />
          <span className="font-serif text-2xl font-bold text-foreground">Notespace</span>
        </div>

        <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
          <h1 className="font-serif text-xl text-foreground mb-1">Set a new password</h1>
          <p className="text-sm text-muted-foreground mb-6">Choose something you'll remember. You'll be signed in right after.</p>

          {done ? (
            <div className="flex flex-col items-center text-center py-6">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                <Check className="h-6 w-6 text-emerald-500" />
              </div>
              <p className="text-sm text-foreground">Password updated. Taking you to your notebooks...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">New password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    disabled={!ready}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Confirm password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    disabled={!ready}
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive" role="alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !ready}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 disabled:opacity-50 ${BTN_PRESS}`}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (<>Update password <ArrowRight className="h-4 w-4" /></>)}
              </button>

              <button
                type="button"
                onClick={() => navigate("/auth")}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
              >
                Back to sign in
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
