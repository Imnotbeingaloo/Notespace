import { useState, useEffect, useMemo, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2, ArrowLeft, RotateCw, Check, X, Eye, EyeOff, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useAuth, hasLikelySession } from "@/context/AuthContext";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { NoindexHead } from "@/components/NoindexHead";


const BTN_PRESS = "transition-all duration-150 active:scale-95 hover:-translate-y-0.5 hover:shadow-md";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.12A6.97 6.97 0 0 1 5.47 12c0-.74.13-1.46.36-2.12V7.04H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.96l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
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
  const [mode, setMode] = useState<"login" | "signup" | "forgot">(() => {
    try {
      return localStorage.getItem("hasVisitedAuth") ? "login" : "signup";
    } catch {
      return "signup";
    }
  });
  const [authMethod, setAuthMethod] = useState<null | "email">(null);
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
  const [appleLoading, setAppleLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const [tapes, setTapes] = useState<Array<{ id: number; top: number; left: number; rotate: number; width: number; color: string }>>([]);
  const [tapesFalling, setTapesFalling] = useState(false);
  const asideRef = useRef<HTMLElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const [asideRect, setAsideRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  useLayoutEffect(() => {
    const measure = () => {
      const el = asideRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setAsideRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, []);
  const [tapeHint, setTapeHint] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setTapeHint(true), 5000);
    return () => window.clearTimeout(id);
  }, []);
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Persist a "pending template" intent across the auth round-trip (including
  // OAuth redirects, which blow away in-memory state).
  useEffect(() => {
    const t = searchParams.get("template");
    if (t) {
      try { sessionStorage.setItem("pendingTemplate", t); } catch {}
    }
  }, [searchParams]);

  // The page the user was trying to reach before we bounced them to /auth.
  // Falls back to /home for fresh signups / direct visits.
  const fromPath = useMemo(() => {
    const raw = (location.state as { from?: string } | null)?.from;
    if (typeof raw !== "string") return null;
    if (!raw.startsWith("/") || raw.startsWith("//")) return null;
    if (raw.startsWith("/auth") || raw.startsWith("/verified") || raw.startsWith("/reset-password")) return null;
    return raw;
  }, [location.state]);

  const resolvePostAuthTarget = () => {
    try {
      const tmpl = sessionStorage.getItem("pendingTemplate");
      if (tmpl) {
        sessionStorage.removeItem("pendingTemplate");
        return `/app?template=${encodeURIComponent(tmpl)}`;
      }
    } catch {}
    return fromPath ?? "/home";
  };
  

  useEffect(() => {
    try { localStorage.setItem("hasVisitedAuth", "1"); } catch {}
  }, []);

  // Smoothly focus the email field when switching into email flow or between modes.
  useEffect(() => {
    if (authMethod !== "email") return;
    const t = window.setTimeout(() => {
      const el = emailInputRef.current;
      if (!el) return;
      el.focus({ preventScroll: true });
      // Place caret at end so the preserved value stays intact.
      const len = el.value.length;
      try { el.setSelectionRange(len, len); } catch { /* noop */ }
    }, 320); // wait for slide-in animation
    return () => window.clearTimeout(t);
  }, [authMethod, mode]);


  // Easter egg: reset extra tape stickers when the user switches modes or method.
  // Tapes persist across mode/authMethod changes; they only clear on full page reload.

  useEffect(() => {
    if (!authLoading && user) navigate(resolvePostAuthTarget(), { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, navigate]);

  // Cross-tab dedup: if the user verifies their email in another tab, that
  // tab broadcasts 'verified'. This tab takes over and acks so the
  // verification tab can close itself instead of leaving two tabs open.
  useEffect(() => {
    if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return;
    const ch = new BroadcastChannel("na-auth");
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type === "verified") {
        ch.postMessage({ type: "awaiting-ack" });
        navigate("/home?welcome=1", { replace: true });
      }
    };
    ch.addEventListener("message", onMsg);
    if (checkEmail) ch.postMessage({ type: "awaiting" });
    return () => {
      ch.removeEventListener("message", onMsg);
      ch.close();
    };
  }, [checkEmail, navigate]);

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

    // If the user closes the Google popup or never completes sign-in, the
    // promise can hang indefinitely. Detect when the tab regains focus and,
    // if no session has been established shortly after, surface a cancel
    // notice and reset the loading state.
    let cancelled = false;
    let watcherTimer: ReturnType<typeof setTimeout> | null = null;
    const onFocus = () => {
      if (watcherTimer) clearTimeout(watcherTimer);
      watcherTimer = setTimeout(async () => {
        const { data } = await supabase.auth.getSession();
        if (!data.session && !cancelled) {
          cancelled = true;
          setGoogleLoading(false);
          const { toast } = await import("sonner");
          toast.error("Google sign-in was cancelled. Try again when you're ready.");
          window.removeEventListener("focus", onFocus);
        }
      }, 1500);
    };
    window.addEventListener("focus", onFocus);

    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      if (watcherTimer) clearTimeout(watcherTimer);
      if (result.error) {
        const msg = result.error.message || "Google sign-in failed. Try again.";
        setError(msg);
        const { toast } = await import("sonner");
        toast.error(msg);
        setGoogleLoading(false);
        return;
      }
      if (result.redirected) return;
      try { localStorage.setItem("pendingNamePrompt", "1"); } catch {}
      navigate(resolvePostAuthTarget());
    } catch (e) {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      if (watcherTimer) clearTimeout(watcherTimer);
      const msg = e instanceof Error ? e.message : "Google sign-in failed.";
      setError(msg);
      const { toast } = await import("sonner");
      toast.error(msg);
      setGoogleLoading(false);
    }
  };

  const handleApple = async () => {
    setError("");
    setAppleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("apple", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        const msg = result.error.message || "Apple sign-in failed. Try again.";
        setError(msg);
        const { toast } = await import("sonner");
        toast.error(msg);
        setAppleLoading(false);
        return;
      }
      if (result.redirected) return;
      try { localStorage.setItem("pendingNamePrompt", "1"); } catch {}
      navigate(resolvePostAuthTarget());
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Apple sign-in failed.";
      setError(msg);
      const { toast } = await import("sonner");
      toast.error(msg);
      setAppleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!emailValid) {
      const msg = "Please enter a valid email address.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (mode === "signup") {
      if (password.length < 8) {
        const msg = "Password must be at least 8 characters.";
        setError(msg);
        toast.error(msg);
        return;
      }
      if (password !== confirmPassword) {
        const msg = "Passwords don't match.";
        setError(msg);
        toast.error(msg);
        return;
      }
    } else if (password.length < 6) {
      const msg = "Password must be at least 6 characters.";
      setError(msg);
      toast.error(msg);
      return;
    }


    setLoading(true);

    if (mode === "login") {
      // Pre-login rate limit: max 5 failed attempts per email per 15 min.
      try {
        const { data: rl } = await supabase.functions.invoke("auth-rate-limit", {
          body: { email: email.trim() },
        });
        if (rl?.blocked) {
          const mins = Math.max(1, Math.ceil((rl.retryAfter ?? 0) / 60));
          setError(`Too many failed attempts. Try again in ${mins} minute${mins === 1 ? "" : "s"}, or reset your password below.`);
          setLoading(false);
          return;
        }
      } catch { /* fail open */ }

      // Kick off the existence check in parallel with sign-in so the
      // post-error branch resolves instantly instead of waiting on a cold call.
      const existsPromise = supabase.functions
        .invoke("check-email-exists", { body: { email: email.trim(), logFailure: true } })
        .then(({ data }) => (data?.exists ?? null) as boolean | null)
        .catch(() => null);

      const { error } = await signIn(email, password);
      if (error) {
        const m = error.message.toLowerCase();
        if (m.includes("invalid login credentials") || m.includes("invalid_credentials")) {
          const exists = await existsPromise;
          if (exists === false) {
            setUnknownEmail(email.trim());
            setConfirmPassword(password);
            setNotice("");
            setError("Oops - we couldn't find an account with that email. Try creating one below.");
            toast.error("No account found for that email. Sign up instead.");
            setMode("signup");
            setHighlightEmail(true);
            setTimeout(() => setHighlightEmail(false), 1600);
          } else {
            setError("Incorrect password. Try again or reset it below.");
            toast.error("Incorrect password.");
          }
          setLoading(false);
          return;
        } else {
          const msg = friendlyError(error.message, "login").message;
          setError(msg);
          toast.error(msg);
        }


      } else {
        try { sessionStorage.setItem("welcomeVariant", "returning"); } catch {}
        navigate(resolvePostAuthTarget());
      }
    } else {
      // Rate limit signup attempts per email (5 / 15 min).
      try {
        const { data: rl } = await supabase.functions.invoke("auth-rate-limit", {
          body: { email: email.trim(), action: "signup" },
        });
        if (rl?.blocked) {
          const mins = Math.max(1, Math.ceil((rl.retryAfter ?? 0) / 60));
          setError(`Too many signup attempts. Try again in ${mins} minute${mins === 1 ? "" : "s"}.`);
          setLoading(false);
          return;
        }
      } catch { /* fail open */ }
      const { error } = await signUp(email, password);
      if (error) {
        const msg = friendlyError(error.message, "signup").message;
        setError(msg);
        toast.error(msg);

      } else {
        try {
          localStorage.setItem("pendingNamePrompt", "1");
          sessionStorage.setItem("welcomeVariant", "new");
        } catch {}
        // If a session was created immediately (email confirmation disabled), go straight to the target
        const { data: { session: newSession } } = await supabase.auth.getSession();
        if (newSession) {
          navigate(resolvePostAuthTarget());
        } else {
          setCheckEmail(true);
          setResendCountdown(45);
        }
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
    // Rate limit password reset requests per email (5 / 15 min).
    try {
      const { data: rl } = await supabase.functions.invoke("auth-rate-limit", {
        body: { email: email.trim(), action: "reset" },
      });
      if (rl?.blocked) {
        const mins = Math.max(1, Math.ceil((rl.retryAfter ?? 0) / 60));
        setError(`Too many password reset requests. Try again in ${mins} minute${mins === 1 ? "" : "s"}.`);
        setForgotLoading(false);
        return;
      }
    } catch { /* fail open */ }
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
    navigate("/home");
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

  // Avoid the brief flash of the auth form when a returning user is about to
  // be redirected (e.g. clicking "Sign up" from a blog while already signed in).
  // We hold the spinner while: auth context is still loading, OR a user object
  // exists (redirect is imminent), OR we have a session hint but no user yet
  // (the getSession() / onAuthStateChange race is still resolving).
  const [hintGrace, setHintGrace] = useState(() => hasLikelySession());
  useEffect(() => {
    if (!hintGrace) return;
    if (user) { setHintGrace(false); return; }
    const t = setTimeout(() => setHintGrace(false), 900);
    return () => clearTimeout(t);
  }, [hintGrace, user]);

  if (authLoading || user || (hintGrace && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <NoindexHead title="Sign in - Notebook Archive" />
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh grid lg:grid-cols-[45fr_55fr] bg-background relative overflow-hidden">
      <NoindexHead title="Sign in - Notebook Archive" />

      {/* Left column — form panel. Padding mirrors the notebook panel so the
          card sits within the same corner inset instead of stretching to fill. */}
      <div className="flex items-center justify-center px-4 py-8 lg:p-10 xl:p-14 relative overflow-hidden order-1 bg-[hsl(43_42%_94%)] dark:bg-background">
        {/* Notebook paper background + scattered tapes for mobile & tablet (below lg) */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-0 lg:hidden overflow-hidden">
          {/* Ruled paper lines */}
          <div
            className="absolute inset-0 opacity-70 dark:opacity-30"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, transparent 0, transparent 31px, hsl(210 60% 55% / 0.22) 31px, hsl(210 60% 55% / 0.22) 32px)",
            }}
          />
          {/* Red margin line */}
          <div
            className="absolute top-0 bottom-0 w-px"
            style={{
              left: "56px",
              background: "hsl(0 70% 55% / 0.45)",
            }}
          />
          {/* Punch holes down the left edge */}
          <div className="absolute top-0 bottom-0 left-3 flex flex-col justify-around py-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-3 w-3 rounded-full bg-background/80 border border-border/60 shadow-inner"
              />
            ))}
          </div>
          {/* Subtle warm wash */}
          <div className="absolute -top-32 -right-32 h-[380px] w-[380px] rounded-full bg-amber-300/[0.06] blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-[380px] w-[380px] rounded-full bg-primary/[0.05] blur-3xl" />

          {/* Scattered decorative tapes */}
          {(() => {
            const clip =
              "polygon(3% 0%, 97% 0%, 100% 35%, 96% 65%, 100% 100%, 3% 100%, 0% 65%, 4% 35%)";
            const tapes: Array<{
              top?: string; bottom?: string; left?: string; right?: string;
              rotate: number; width: number; height: number; cls: string;
              mobileHidden?: boolean;
            }> = [
              // Top band — safely above the form on every viewport
              { top: "3%",  left: "18%", rotate: -14, width: 74, height: 18, cls: "bg-amber-300/60 border-amber-400/40" },
              { top: "5%",  right: "10%", rotate: 22, width: 62, height: 16, cls: "bg-cyan-300/55 border-cyan-400/40" },
              { top: "2%",  left: "62%", rotate: 6,  width: 54, height: 16, cls: "bg-pink-300/55 border-pink-400/40" },
              // Mid scatter — hidden on mobile (form is edge-to-edge), shown from sm+
              { top: "26%", left: "4%",  rotate: 20,  width: 68, height: 18, cls: "bg-lime-300/55 border-lime-400/40", mobileHidden: true },
              { top: "30%", right: "5%", rotate: -24, width: 72, height: 20, cls: "bg-sky-300/60 border-sky-400/40", mobileHidden: true },
              { top: "52%", left: "3%",  rotate: -12, width: 60, height: 16, cls: "bg-orange-300/55 border-orange-400/40", mobileHidden: true },
              { top: "56%", right: "4%", rotate: 16,  width: 78, height: 20, cls: "bg-emerald-300/55 border-emerald-400/40", mobileHidden: true },
              // Lower band — kept far enough from the form's bottom on mobile
              { bottom: "18%", left: "6%",  rotate: 28,  width: 60, height: 18, cls: "bg-fuchsia-300/55 border-fuchsia-400/40", mobileHidden: true },
              { bottom: "14%", right: "6%", rotate: -8,  width: 78, height: 20, cls: "bg-violet-300/55 border-violet-400/40", mobileHidden: true },
              { bottom: "4%",  left: "34%", rotate: 10,  width: 70, height: 18, cls: "bg-rose-300/55 border-rose-400/40" },
              { bottom: "6%",  right: "22%", rotate: -18, width: 56, height: 16, cls: "bg-yellow-300/60 border-yellow-400/40" },
            ];
            return tapes.map((t, i) => (
              <div
                key={i}
                className={`absolute border-y shadow-sm ${t.cls} ${t.mobileHidden ? "hidden sm:block" : ""}`}
                style={{
                  top: t.top,
                  bottom: t.bottom,
                  left: t.left,
                  right: t.right,
                  width: `${t.width}px`,
                  height: `${t.height}px`,
                  transform: `rotate(${t.rotate}deg)`,
                  clipPath: clip,
                  transformOrigin: "center",
                }}
              />
            ));
          })()}
        </div>

        {/* Decorative brand mark — purely visual, no navigation. */}
        <div
          aria-hidden="true"
          className="hidden lg:inline-flex absolute left-6 top-6 z-10 items-center justify-center"
        >
          <img src="/logo.png" alt="" width={28} height={28} className="h-7 w-7 object-contain" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 w-full"
        >

        <h1 className="sr-only">{mode === "login" ? "Sign in to Notebook Archive" : "Create your Notebook Archive account"}</h1>

        <div className="mx-auto max-w-[440px] px-1 sm:px-2">

          {mode !== "forgot" && authMethod === null && (
            <div key={mode} className="mx-auto max-w-[400px] animate-in fade-in slide-in-from-bottom-2 duration-300">




              <div className="mb-5 text-center">
                <h2 className="font-serif text-[29px] leading-tight font-semibold text-foreground">
                  {mode === "login" ? "Welcome back" : "Create your account"}
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {mode === "login" ? "Sign in to pick up where you left off." : "Sign up to get started in seconds."}
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={googleLoading || appleLoading}
                  className={`w-full flex items-center justify-center gap-3 py-4 rounded-lg border border-border bg-muted/60 text-foreground font-medium text-sm hover:bg-muted disabled:opacity-50 ${BTN_PRESS}`}
                >
                  {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
                  {mode === "login" ? "Sign in with Google" : "Sign up with Google"}
                </button>
                <button
                  type="button"
                  onClick={handleApple}
                  disabled={googleLoading || appleLoading}
                  className={`w-full flex items-center justify-center gap-3 py-4 rounded-lg border border-border bg-muted/60 text-foreground font-medium text-sm hover:bg-muted disabled:opacity-50 ${BTN_PRESS}`}
                >
                  {appleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <AppleIcon />}
                  {mode === "login" ? "Sign in with Apple" : "Sign up with Apple"}
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMethod("email"); setError(""); }}
                  className={`w-full flex items-center justify-center gap-3 py-4 rounded-lg border border-border bg-muted/60 text-foreground font-medium text-sm hover:bg-muted ${BTN_PRESS}`}
                >
                  <Mail className="h-4 w-4" />
                  {mode === "login" ? "Sign in with Email" : "Sign up with Email"}
                </button>
              </div>
              <p className="mt-5 text-center text-xs text-muted-foreground">
                {mode === "login" ? (
                  <>Don't have an account?{" "}
                    <button type="button" onClick={() => { setMode("signup"); setError(""); setNotice(""); }} className="text-primary hover:underline font-medium">Sign up</button>
                  </>
                ) : (
                  <>Already have an account?{" "}
                    <button type="button" onClick={() => { setMode("login"); setError(""); setNotice(""); }} className="text-primary hover:underline font-medium">Sign in</button>
                  </>
                )}
              </p>
            </div>
          )}



          {mode !== "forgot" && authMethod === "email" && (
            <div key={`email-head-${mode}`} className="space-y-3 mb-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-4 text-center">
                <h2 className="font-serif text-[29px] leading-tight font-semibold text-foreground">
                  {mode === "login" ? "Welcome back" : "Create your account"}
                </h2>


              </div>

              <button
                type="button"
                onClick={handleGoogle}
                disabled={googleLoading || appleLoading}
                className={`w-full flex items-center justify-center gap-3 py-2.5 rounded-lg border border-border bg-background text-foreground font-medium text-sm hover:bg-muted disabled:opacity-50 ${BTN_PRESS}`}
              >
                {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
                Continue with Google
              </button>
              <div className="relative flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            </div>
          )}





          {(mode === "forgot" || authMethod === "email") && (mode === "forgot" ? (
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
          <form
            key={`email-form-${mode}`}
            onSubmit={handleSubmit}
            className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
          >

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  ref={emailInputRef}
                  type="email"
                  value={email}

                  onChange={(e) => { setEmail(e.target.value); if (notice) setNotice(""); }}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all ${
                    highlightEmail ? "border-primary ring-2 ring-primary/40" :
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
              <div className="flex flex-col gap-3">
                {/* Password */}
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
                </div>

                {/* Confirm password - inline beside password on signup */}
                <AnimatePresence>
                  {mode === "signup" && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18 }}
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
              </div>

              {/* Requirements: single horizontal row below both fields */}
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
                    <ul className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                      {pwChecks.map((c) => (
                        <li key={c.label} className="flex items-center gap-1.5 text-[11px] whitespace-nowrap">
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


            <AnimatePresence initial={false} mode="popLayout">
              {notice && (
                <motion.div
                  key="notice"
                  layout
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -6, height: 0 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5 text-sm text-foreground"
                  role="status"
                >
                  <p className="leading-snug">{notice}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {mode === "login" && unknownEmail && unknownEmail === email.trim() && (
              <button
                type="button"
                onClick={() => { setMode("signup"); setHighlightEmail(true); setTimeout(() => setHighlightEmail(false), 1600); }}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-primary/40 bg-primary/5 text-primary font-medium text-sm hover:bg-primary/10 ${BTN_PRESS}`}
              >
                Create account for {unknownEmail}
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            <AnimatePresence initial={false} mode="popLayout">
              {error && (
                <motion.div
                  key="error"
                  layout
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -6, height: 0 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
                  role="alert"
                >
                  <p className="leading-snug">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>


            <button
              type="submit"
              disabled={loading || googleLoading}
              aria-label={loading ? "Verifying your account" : undefined}
              className={`mx-auto max-w-[212px] w-full flex items-center justify-center gap-2 py-3.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 disabled:opacity-50 ${BTN_PRESS}`}

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
            <p className="text-center text-xs text-muted-foreground pt-1">
              {mode === "login" ? (
                <>Don't have an account?{" "}
                  <button type="button" onClick={() => { setMode("signup"); setError(""); setNotice(""); setConfirmPassword(""); }} className="text-primary hover:underline font-medium">Sign up</button>
                </>
              ) : (
                <>Already have an account?{" "}
                  <button type="button" onClick={() => { setMode("login"); setError(""); setNotice(""); setConfirmPassword(""); }} className="text-primary hover:underline font-medium">Sign in</button>
                </>
              )}
            </p>
          </form>
          ))}
        </div>
      </motion.div>
      </div>

      {/* Right column — editorial notebook panel. */}
      <aside
        ref={asideRef}
        aria-hidden="true"
        className="hidden lg:flex order-2 relative flex-col justify-center gap-10 overflow-hidden border-l border-border bg-[hsl(43_38%_96%)] dark:bg-muted/40 p-10 xl:p-12"
      >
        {/* Ruled paper */}
        <div
          className="absolute inset-0 opacity-90 dark:opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent 0, transparent 27px, hsl(200 45% 55% / 0.22) 27px, hsl(200 45% 55% / 0.22) 28px)",
          }}
        />
        {/* Red margin rule */}
        <div className="absolute inset-y-0 left-16 w-px bg-[hsl(0_60%_55%/0.45)]" />
        {/* Paper grain */}
        <div
          className="absolute inset-0 opacity-[0.06] mix-blend-multiply"
          style={{
            backgroundImage:
              "radial-gradient(hsl(30 20% 30%) 1px, transparent 1px)",
            backgroundSize: "3px 3px",
          }}
        />
        {/* Warm glows — dialed way back so the paper reads sharp and the tape sticker doesn't blend */}
        <div className="absolute -top-32 -right-24 h-[300px] w-[300px] rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-[320px] w-[320px] rounded-full bg-amber-400/[0.06] blur-3xl" />

        {/* Corner tape — clickable easter egg. Each click drops another tape
            strip at a random spot with a random color/rotation. Resets on
            mode change / reload. */}
        {(() => {
          // Simple rose semi-transparent rectangle — the version that read as tape best.
          const TAPE_COLORS = [
            "bg-rose-300/70 border-rose-400/50",
            "bg-sky-300/70 border-sky-400/50",
            "bg-amber-300/70 border-amber-400/50",
            "bg-emerald-300/70 border-emerald-400/50",
            "bg-violet-300/70 border-violet-400/50",
            "bg-pink-300/70 border-pink-400/50",
            "bg-lime-300/70 border-lime-400/50",
            "bg-orange-300/70 border-orange-400/50",
            "bg-cyan-300/70 border-cyan-400/50",
            "bg-fuchsia-300/70 border-fuchsia-400/50",
          ];
          // Slightly jagged/pointed tape ends — sharper corner silhouette.
          const tapeClip =
            "polygon(3% 0%, 97% 0%, 100% 35%, 96% 65%, 100% 100%, 3% 100%, 0% 65%, 4% 35%)";
          return (
            <>
              <button
                type="button"
                aria-label="Decorative tape"
                tabIndex={-1}
                onClick={() => {
                  setTapeHint(false);
                  if (tapesFalling) return;
                  // 21st click: trigger gravity fall, then clear.
                  if (tapes.length >= 20) {
                    setTapesFalling(true);
                    window.setTimeout(() => {
                      setTapes([]);
                      setTapesFalling(false);
                    }, 2800);
                    return;
                  }

                  setTapes((t) => {
                    const recent = t.slice(-5).map((x) => (JSON.parse(x.color) as { cls: string }).cls);
                    const pool = TAPE_COLORS.filter((c) => !recent.includes(c));
                    const source = pool.length ? pool : TAPE_COLORS;
                    const cls = source[Math.floor(Math.random() * source.length)];
                    // Enforce a minimum spread from every existing tape so they don't cluster
                    // in one spot. Shrink the min distance if the panel is getting crowded.
                    const minDist = Math.max(10, 22 - t.length);
                    let top = Math.random() * 100;
                    let left = Math.random() * 100;
                    for (let i = 0; i < 80; i++) {
                      const tryTop = Math.random() * 100;
                      const tryLeft = Math.random() * 100;
                      const far = t.every((p) => {
                        const dt = tryTop - p.top;
                        const dl = tryLeft - p.left;
                        return Math.sqrt(dt * dt + dl * dl) >= minDist;
                      });
                      if (far) { top = tryTop; left = tryLeft; break; }
                    }
                    // Rotation should also differ from the last few tapes (>= 25°).
                    let rotate = Math.floor(Math.random() * 360);
                    const recentRot = t.slice(-3).map((p) => p.rotate);
                    for (let i = 0; i < 20; i++) {
                      if (recentRot.every((r) => Math.abs(((rotate - r + 540) % 360) - 180) > 25)) break;
                      rotate = Math.floor(Math.random() * 360);
                    }
                    // Wider size range (max 110px) + avoid similar length to the last 2 tapes.
                    let width = 55 + Math.random() * 55; // ~55-110px
                    const recentW = t.slice(-2).map((p) => p.width);
                    for (let i = 0; i < 20; i++) {
                      if (recentW.every((w) => Math.abs(width - w) > 18)) break;
                      width = 55 + Math.random() * 55;
                    }
                    const height = 16 + Math.random() * 10;

                    return [
                      ...t,
                      { id: Date.now() + Math.random(), top, left, rotate, width, color: JSON.stringify({ cls, h: height }) },
                    ];
                  });
                }}
                className="absolute top-6 right-8 h-6 w-24 rotate-[20deg] z-20 cursor-pointer transition-transform hover:scale-105 active:scale-95 bg-rose-300/70 border-y border-rose-400/50 shadow-sm"
                style={{
                  clipPath: tapeClip,
                  animation: tapeHint ? "tapeHintPop 1.4s ease-in-out infinite" : undefined,
                  transformOrigin: "center",
                }}
              />
              {asideRect && createPortal(
                <>
                  {tapes.map((t, idx) => {
                    const parsed = JSON.parse(t.color) as { cls: string; h: number };
                    const spin = ((t.id * 137) % 540) - 270;
                    const px = asideRect.left + (t.left / 100) * asideRect.width;
                    const py = asideRect.top + (t.top / 100) * asideRect.height;
                    const fallDy = window.innerHeight - py + 400;
                    return (
                      <div
                        key={t.id}
                        aria-hidden="true"
                        className={`fixed pointer-events-none border-y shadow-sm ${parsed.cls}`}
                        style={{
                          top: `${py}px`,
                          left: `${px}px`,
                          width: `${t.width}px`,
                          height: `${parsed.h}px`,
                          transform: `translate(-50%, -50%) rotate(${t.rotate}deg)`,
                          clipPath: tapeClip,
                          transformOrigin: "center",
                          willChange: "transform",
                          zIndex: 2147483000,
                          animation: tapesFalling
                            ? `tapeFall 2200ms cubic-bezier(0.45, 0, 0.75, 0.6) ${idx * 20}ms both`
                            : `tapeAppear 380ms cubic-bezier(0.22, 1, 0.36, 1) both`,
                          ["--tape-rot" as string]: `${t.rotate}deg`,
                          ["--fall-dy" as string]: `${fallDy}px`,
                          ["--fall-spin" as string]: `${spin}deg`,
                        }}
                      />
                    );
                  })}
                  <style>{`
                    @keyframes tapeAppear {
                      0%   { transform: translate(-50%, -50%) rotate(var(--tape-rot)) scale(0.6); opacity: 0; }
                      100% { transform: translate(-50%, -50%) rotate(var(--tape-rot)) scale(1);   opacity: 1; }
                    }
                    @keyframes tapeFall {
                      0%   { transform: translate(-50%, -50%) rotate(var(--tape-rot)); }
                      100% { transform: translate(-50%, calc(-50% + var(--fall-dy))) rotate(calc(var(--tape-rot) + var(--fall-spin))); }
                    @keyframes tapeHintPop {
                      0%, 100% { transform: rotate(20deg) scale(1); }
                      50%      { transform: rotate(20deg) scale(1.18); }
                    }
                  `}</style>
                </>,
                document.body
              )}
            </>
          );
        })()}

        {/* Decorative scattered tapes — non-interactive, positioned away from the text block */}
        {(() => {
          const tapeClip =
            "polygon(3% 0%, 97% 0%, 100% 35%, 96% 65%, 100% 100%, 3% 100%, 0% 65%, 4% 35%)";
          const decor: Array<{ top?: string; bottom?: string; left?: string; right?: string; rotate: number; width: number; height: number; cls: string }> = [
            // Top band (across the top, including center-top above the text)
            { top: "4%",     left: "38%",  rotate: -14, width: 82, height: 20, cls: "bg-amber-300/60 border-amber-400/40" },
            { top: "7%",     left: "58%",  rotate: 22,  width: 66, height: 18, cls: "bg-cyan-300/60 border-cyan-400/40" },
            { top: "3%",     left: "18%",  rotate: 8,   width: 58, height: 16, cls: "bg-pink-300/55 border-pink-400/40" },
            // Right side scatter
            { top: "26%",    right: "5%",  rotate: -28, width: 74, height: 20, cls: "bg-sky-300/60 border-sky-400/40" },
            { top: "52%",    right: "8%",  rotate: 16,  width: 88, height: 22, cls: "bg-emerald-300/55 border-emerald-400/40" },
            { bottom: "18%", right: "6%",  rotate: -6,  width: 62, height: 18, cls: "bg-violet-300/55 border-violet-400/40" },
            { bottom: "4%",  right: "22%", rotate: 26,  width: 70, height: 18, cls: "bg-rose-300/55 border-rose-400/40" },
            // Left side scatter
            { top: "22%",    left: "4%",   rotate: 20,  width: 76, height: 20, cls: "bg-lime-300/55 border-lime-400/40" },
            { top: "48%",    left: "7%",   rotate: -18, width: 60, height: 18, cls: "bg-orange-300/60 border-orange-400/40" },
            { bottom: "24%", left: "3%",   rotate: 32,  width: 84, height: 20, cls: "bg-fuchsia-300/55 border-fuchsia-400/40" },
            { bottom: "6%",  left: "14%",  rotate: -10, width: 56, height: 16, cls: "bg-sky-300/55 border-sky-400/40" },
            // Between testimonial card and the "Students, writers…" line — centered under card
            { bottom: "14%", left: "calc(5rem + 12rem - 40px)", rotate: -4, width: 80, height: 18, cls: "bg-yellow-300/60 border-yellow-400/40" },
          ];
          return (
            <>
              {decor.map((t, i) => (
                <div
                  key={i}
                  aria-hidden="true"
                  className={`absolute pointer-events-none border-y shadow-sm z-10 ${t.cls}`}
                  style={{
                    top: t.top,
                    bottom: t.bottom,
                    left: t.left,
                    right: t.right,
                    width: `${t.width}px`,
                    height: `${t.height}px`,
                    transform: `rotate(${t.rotate}deg)`,
                    clipPath: tapeClip,
                    transformOrigin: "center",
                  }}
                />
              ))}
            </>
          );
        })()}

        <div className="relative z-10 max-w-md mx-auto text-left w-full">
          <p className="font-serif text-[1.75rem] xl:text-[2rem] leading-[1.2] text-foreground tracking-tight text-left">
            A calm place to think, write, and remember what mattered.
          </p>
          <p className="mt-4 text-[13px] xl:text-sm text-muted-foreground leading-relaxed text-left max-w-lg">
            Every note lives in a ruled-paper canvas — with AI that explains,
            summarises, and turns your reading into flashcards when you need it.
          </p>

          {/* Handwritten-style annotation card */}
          <div className="mt-6 relative max-w-sm rotate-[-1.2deg] group cursor-default">
            <div className="rounded-md border border-border/60 bg-card/80 backdrop-blur-sm px-4 py-3 shadow-md transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:rotate-0 group-hover:shadow-xl group-hover:bg-card">
              <p className="font-serif italic text-[13.5px] leading-relaxed text-foreground/90 text-left">
                "It replaced three apps for me — notes, flashcards, and my study
                planner. And it actually feels good to open."
              </p>
              <p className="mt-2 text-[10.5px] uppercase tracking-wider text-muted-foreground text-left">
                — Maya, medical student
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3 text-xs text-muted-foreground max-w-md mx-auto w-full text-left">
          <div className="flex -space-x-2">
            {[
              { i: "S", bg: "#0d9488" },
              { i: "W", bg: "#f59e0b" },
              { i: "R", bg: "#6366f1" },
            ].map(({ i, bg }) => (
              <span
                key={i}
                className="h-6 w-6 rounded-full border-2 border-background flex items-center justify-center text-[9px] font-semibold text-white font-sans shadow-sm"
                style={{ background: bg }}
                aria-hidden="true"
              >
                {i}
              </span>
            ))}
          </div>
          <span>Students, writers, and researchers keep their thinking here.</span>
        </div>
      </aside>
    </div>


  );
};

export default AuthPage;
