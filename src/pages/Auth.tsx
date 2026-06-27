import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2, ArrowLeft, RotateCw, Check, X, Eye, EyeOff, ExternalLink } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { NoindexHead } from "@/components/NoindexHead";

const BTN_PRESS = "transition-all duration-100 active:scale-95";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.12A6.97 6.97 0 0 1 5.47 12c0-.74.13-1.46.36-2.12V7.04H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.96l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
  </svg>
);

interface PasswordCheck { label: string; ok: boolean; }

const getPasswordChecks = (pw: string): PasswordCheck[] => [
  { label: "At least 8 characters", ok: pw.length >= 8 },
  { label: "One uppercase letter", ok: /[A-Z]/.test(pw) },
  { label: "One number", ok: /\d/.test(pw) },
  { label: "One symbol", ok: /[^A-Za-z0-9]/.test(pw) },
];

const passwordStrength = (pw: string): { score: number; label: string; color: string } => {
  const checks = getPasswordChecks(pw);
  const score = checks.filter((c) => c.ok).length;
  if (!pw) return { score: 0, label: "", color: "bg-muted" };
  if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500" };
  if (score === 2) return { score: 2, label: "Fair", color: "bg-orange-500" };
  if (score === 3) return { score: 3, label: "Good", color: "bg-yellow-500" };
  return { score: 4, label: "Strong", color: "bg-emerald-500" };
};

const emailDomainProvider = (email: string): { name: string; url: string } | null => {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return null;
  if (/^(gmail|googlemail)\./.test(domain) || domain === "gmail.com") return { name: "Gmail", url: "https://mail.google.com" };
  if (/^(outlook|hotmail|live|msn)\./.test(domain) || ["outlook.com","hotmail.com","live.com","msn.com"].includes(domain))
    return { name: "Outlook", url: "https://outlook.live.com/mail" };
  if (domain.endsWith("yahoo.com") || domain.startsWith("yahoo.")) return { name: "Yahoo Mail", url: "https://mail.yahoo.com" };
  if (domain.endsWith("icloud.com") || domain.endsWith("me.com")) return { name: "iCloud Mail", url: "https://www.icloud.com/mail" };
  if (domain.endsWith("proton.me") || domain.endsWith("protonmail.com")) return { name: "Proton Mail", url: "https://mail.proton.me" };
  return null;
};

const AuthPage = () => {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [unknownEmail, setUnknownEmail] = useState("");
  const [highlightEmail, setHighlightEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) navigate("/", { replace: true });
  }, [user, authLoading, navigate]);

  const emailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);
  const pwChecks = useMemo(() => getPasswordChecks(password), [password]);
  const pwStrength = useMemo(() => passwordStrength(password), [password]);
  const passwordsMatch = mode === "signup" ? password.length > 0 && password === confirmPassword : true;

  const friendlyError = (raw: string, mode: "login" | "signup"): { message: string } => {
    const m = raw.toLowerCase();
    if (m.includes("network") || m.includes("failed to fetch") || m.includes("timeout") || m.includes("fetch")) {
      return { message: "We're experiencing a database sync issue right now. Please try again in a few moments." };
    }
    if (mode === "login" && (m.includes("invalid login credentials") || m.includes("invalid_credentials"))) {
      return { message: "We couldn't find your account, or the password is incorrect. Create a new account to get started, or double-check your password and try again." };
    }
    if (m.includes("email not confirmed") || m.includes("not confirmed")) {
      return { message: "Please confirm your email first - check your inbox or spam folder for the verification link." };
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

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        setError(result.error.message || "Google sign-in failed. Try again.");
        setGoogleLoading(false);
        return;
      }
      if (result.redirected) return;
      try { localStorage.setItem("pendingNamePrompt", "1"); } catch {}
      navigate("/app");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Google sign-in failed.");
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!emailValid) {
      setError("Please enter a valid email address.");
      return;
    }

    if (mode === "signup") {
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords don't match.");
        return;
      }
    } else if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) {
        const m = error.message.toLowerCase();
        if (m.includes("invalid login credentials") || m.includes("invalid_credentials")) {
          try {
            const { data } = await supabase.functions.invoke("check-email-exists", {
              body: { email: email.trim(), logFailure: true },
            });
            if (data && data.exists === false) {
              setUnknownEmail(email.trim());
              setMode("signup");
              setConfirmPassword(password);
              setHighlightEmail(true);
              setNotice(`Oops, no account for ${email.trim()}. We've switched you to sign up - finish creating it below.`);
              setTimeout(() => setHighlightEmail(false), 2200);
            } else {
              setError("Incorrect password. Try again or reset it below.");
            }
          } catch {
            setError("Incorrect email or password.");
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
        setError(friendlyError(error.message, "signup").message);
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
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!emailValid) {
      setError("Please enter a valid email address.");
      return;
    }
    setForgotLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setForgotLoading(false);
    if (err) {
      setError(friendlyError(err.message, "login").message);
      return;
    }
    setForgotSent(true);
  };

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
    const provider = emailDomainProvider(email);
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
          <p className="text-muted-foreground mb-2">
            We sent a verification link to <strong>{email}</strong>.
          </p>
          <p className="text-xs text-muted-foreground mb-6">
            Can't find it? Check your spam or promotions folder.
          </p>

          {provider && (
            <a
              href={provider.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full mb-3 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-muted ${BTN_PRESS}`}
            >
              <ExternalLink className="h-4 w-4" />
              Open {provider.name}
            </a>
          )}

          <button
            onClick={handleVerified}
            disabled={verifying}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 disabled:opacity-50 ${BTN_PRESS}`}
          >
            {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <>I've verified - sign me in <ArrowRight className="h-4 w-4" /></>}
          </button>

          {verifyError && <p className="mt-3 text-sm text-destructive">{verifyError}</p>}
          {resendNotice && <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">{resendNotice}</p>}

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
                  {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend email"}
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
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 relative">
      <NoindexHead title="Sign in - Notebook Archive" />
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
        <div className="flex items-center justify-center gap-2 mb-8">
          <img src="/logo.png" alt="" aria-hidden="true" className="h-[1.2rem] w-[1.2rem] object-contain" />
          <span className="font-serif text-2xl font-bold text-foreground">Notebook Archive</span>
        </div>
        <h1 className="sr-only">{mode === "login" ? "Sign in to Notebook Archive" : "Create your Notebook Archive account"}</h1>

        <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
          <div role="tablist" aria-label="Authentication mode" className="flex gap-1 bg-muted rounded-lg p-1 mb-6">
            {(["login", "signup"] as const).map((m) => {
              const active = (mode === m) || (mode === "forgot" && m === "login");
              return (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => { setMode(m); setError(""); setNotice(""); setConfirmPassword(""); setForgotSent(false); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md border-0 outline-none transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-muted ${
                    active ? "bg-background text-foreground shadow-sm" : "bg-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m === "login" ? "Sign In" : "Sign Up"}
                </button>
              );
            })}
          </div>

          {mode !== "forgot" && (
            <>
              <button
                type="button"
                onClick={handleGoogle}
                disabled={googleLoading || loading}
                className={`w-full mb-4 flex items-center justify-center gap-3 py-2.5 rounded-lg border border-border bg-background text-foreground font-medium text-sm hover:bg-muted disabled:opacity-50 ${BTN_PRESS}`}
              >
                {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            </>
          )}


          {mode === "forgot" ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              {forgotSent ? (
                <div className="text-center py-2">
                  <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                    <Check className="h-6 w-6 text-emerald-500" />
                  </div>
                  <p className="text-sm text-foreground font-medium mb-1">Reset link sent</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    We sent a password reset link to <span className="text-foreground">{email}</span>.<br />
                    Check your inbox or spam folder.
                  </p>
                  <button
                    type="button"
                    onClick={() => { setMode("login"); setForgotSent(false); setError(""); }}
                    className="mt-5 text-xs text-primary hover:underline"
                  >
                    Back to sign in
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground -mt-1">
                    Enter your email and we'll send you a link to reset your password.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring ${
                          email && !emailValid ? "border-destructive/60" : "border-input"
                        }`}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
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
                    disabled={forgotLoading}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 disabled:opacity-50 ${BTN_PRESS}`}
                  >
                    {forgotLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (<>Send reset link <ArrowRight className="h-4 w-4" /></>)}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode("login"); setError(""); }}
                    className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
                  >
                    Back to sign in
                  </button>
                </>
              )}
            </form>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring ${
                    email && !emailValid ? "border-destructive/60" : "border-input"
                  }`}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
              {email && !emailValid && (
                <p className="mt-1 text-xs text-destructive">Please enter a valid email.</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-foreground">Password</label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => { setMode("forgot"); setError(""); setForgotSent(false); }}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="••••••••"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  required
                  minLength={mode === "signup" ? 8 : 6}
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

              <AnimatePresence>
                {mode === "signup" && password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full ${pwStrength.color} transition-all duration-300`}
                          style={{ width: `${(pwStrength.score / 4) * 100}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-medium text-muted-foreground w-12 text-right">{pwStrength.label}</span>
                    </div>
                    <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
                      {pwChecks.map((c) => (
                        <li key={c.label} className="flex items-center gap-1.5 text-[11px]">
                          {c.ok ? (
                            <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                          ) : (
                            <X className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                          )}
                          <span className={c.ok ? "text-foreground" : "text-muted-foreground"}>{c.label}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden"
                >
                  <label className="block text-sm font-medium text-foreground mb-1.5">Confirm password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-10 pr-10 py-2.5 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring ${
                        confirmPassword && !passwordsMatch ? "border-destructive/60" : "border-input"
                      }`}
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                    {confirmPassword && passwordsMatch && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                    )}
                  </div>
                  {confirmPassword && !passwordsMatch && (
                    <p className="mt-1 text-xs text-destructive">Passwords don't match.</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

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
              disabled={loading || googleLoading}
              aria-label={loading ? "Verifying your account" : undefined}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 disabled:opacity-50 ${BTN_PRESS}`}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <>
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
