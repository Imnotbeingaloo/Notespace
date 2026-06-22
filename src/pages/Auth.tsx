import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2, ArrowLeft, RotateCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const BTN_PRESS = "transition-all duration-100 active:scale-95";

const AuthPage = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // If already logged in, bounce back to the landing site.
  useEffect(() => {
    if (!authLoading && user) navigate("/", { replace: true });
  }, [user, authLoading, navigate]);

  const friendlyError = (
    raw: string,
    mode: "login" | "signup"
  ): { message: string } => {
    const m = raw.toLowerCase();
    if (m.includes("network") || m.includes("failed to fetch") || m.includes("timeout") || m.includes("fetch")) {
      return { message: "We're experiencing a database sync issue right now. Please try again in a few moments." };
    }
    if (mode === "login" && (m.includes("invalid login credentials") || m.includes("invalid_credentials"))) {
      return {
        message:
          "We couldn't find your account, or the password is incorrect. Create a new account to get started, or double-check your password and try again.",
      };
    }
    if (m.includes("email not confirmed") || m.includes("not confirmed")) {
      return { message: "Please confirm your email first — check your inbox for the verification link." };
    }
    if (m.includes("user already registered") || m.includes("already registered") || m.includes("already exists")) {
      return { message: "An account with this email already exists. Try signing in instead." };
    }
    if (m.includes("rate limit") || m.includes("too many")) {
      return { message: "Too many attempts. Please wait a moment and try again." };
    }
    if (m.includes("password") && m.includes("weak")) {
      return { message: "That password is too weak. Pick something longer or harder to guess." };
    }
    if (m.includes("password") && (m.includes("pwned") || m.includes("compromised") || m.includes("hibp"))) {
      return { message: "This password has appeared in a known data breach. Please choose a different one." };
    }
    return { message: raw };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) {
        const m = error.message.toLowerCase();
        if (m.includes("invalid login credentials") || m.includes("invalid_credentials")) {
          // Disambiguate "no account" vs "wrong password" via admin lookup
          try {
            const { data } = await supabase.functions.invoke("check-email-exists", { body: { email } });
            if (data && data.exists === false) {
              setError("We couldn't find an account with this email. Create a new account to get started.");
            } else {
              setError("Password incorrect. Please double-check your password and try again.");
            }
          } catch {
            setError(friendlyError(error.message, "login").message);
          }
        } else {
          setError(friendlyError(error.message, "login").message);
        }
      } else {
        try { sessionStorage.setItem("welcomeVariant", "returning"); } catch {}
        navigate("/app");
      }
    } else {
      const { error } = await signUp(email, password);
      if (error) {
        const f = friendlyError(error.message, "signup");
        setError(f.message);
      } else {
        try {
          localStorage.setItem("pendingNamePrompt", "1");
          sessionStorage.setItem("welcomeVariant", "new");
        } catch {}
        setCheckEmail(true);
        setResendCountdown(45);
      }
    }
    setLoading(false);
  };

  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resending, setResending] = useState(false);
  const [resendNotice, setResendNotice] = useState("");

  // Countdown ticker for resend throttle
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const t = setTimeout(() => setResendCountdown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCountdown]);

  const handleResend = async () => {
    if (resendCountdown > 0 || resending) return;
    setResending(true);
    setResendNotice("");
    setVerifyError("");
    try {
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) {
        setVerifyError(friendlyError(error.message, "signup").message);
      } else {
        setResendNotice("Verification email sent again. Check your inbox or spam folder.");
        setResendCountdown(45);
      }
    } finally {
      setResending(false);
    }
  };

  const handleVerified = async () => {
    setVerifyError("");
    setVerifying(true);
    const { error } = await signIn(email, password);
    setVerifying(false);
    if (error) {
      if (/confirm/i.test(error.message) || /verif/i.test(error.message)) {
        setVerifyError("We can't see your verification yet. Click the link in your email, then try again.");
      } else {
        setVerifyError(error.message);
      }
      return;
    }
    try { localStorage.setItem("pendingNamePrompt", "1"); } catch {}
    navigate("/app");
  };

  if (checkEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 relative">
        <button
          onClick={() => navigate("/")}
          className={`absolute left-4 top-4 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted ${BTN_PRESS}`}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to website
        </button>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Check your email</h2>
          <p className="text-muted-foreground mb-6">
            We sent a verification link to <strong>{email}</strong>. Check your inbox or spam folder, click it, then come back and tap the button below.
          </p>
          <button
            onClick={handleVerified}
            disabled={verifying}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 disabled:opacity-50 ${BTN_PRESS}`}
          >
            {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <>I've verified — sign me in <ArrowRight className="h-4 w-4" /></>}
          </button>

          {verifyError && (
            <p className="mt-3 text-sm text-destructive">{verifyError}</p>
          )}
          {resendNotice && (
            <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">{resendNotice}</p>
          )}

          <div className="mt-5 flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleResend}
              disabled={resendCountdown > 0 || resending}
              className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed ${BTN_PRESS}`}
            >
              {resending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <RotateCw className="h-3.5 w-3.5" />
                  {resendCountdown > 0
                    ? `Resend in ${resendCountdown}s`
                    : "Didn't get an email? Send again"}
                </>
              )}
            </button>
            <button
              onClick={() => {
                setCheckEmail(false);
                setVerifyError("");
                setResendNotice("");
                setResendCountdown(0);
              }}
              className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted text-sm font-medium ${BTN_PRESS}`}
            >
              Use a different email
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative">
      <button
        onClick={() => navigate("/")}
        className={`absolute left-4 top-4 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted ${BTN_PRESS}`}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to website
      </button>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <img src="/logo.png" alt="Notebook Archive" className="h-[1.6rem] w-[1.6rem] object-contain" />
          <span className="font-serif text-2xl font-bold text-foreground">Notebook Archive</span>
        </div>

        {/* Card */}
        <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
          {/* Tabs */}
          <div className="flex gap-1 bg-muted rounded-lg p-1 mb-6">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 active:scale-95 ${
                  mode === m
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
                role="alert"
              >
                <p className="leading-snug">{error}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 disabled:opacity-50 ${BTN_PRESS}`}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
