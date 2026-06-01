// Pure helper for the password change flow so it can be unit-tested without React.
// Returns a discriminated result with user-friendly messages.

export interface PasswordChangeDeps {
  email: string | null | undefined;
  currentPw: string;
  newPw: string;
  confirmPw: string;
  canChange: boolean;
  cooldownDays: number;
  signInWithPassword: (args: { email: string; password: string }) => Promise<{ error: { message?: string } | null }>;
  updateUser: (args: { password: string }) => Promise<{ error: { message?: string } | null }>;
  markPasswordChanged: () => Promise<void>;
}

export type PasswordChangeResult =
  | { ok: true; message: string }
  | { ok: false; field?: "current" | "new" | "confirm" | "cooldown" | "account"; message: string };

export async function changePassword(d: PasswordChangeDeps): Promise<PasswordChangeResult> {
  if (!d.canChange) {
    const n = d.cooldownDays;
    return { ok: false, field: "cooldown", message: `You can change your password again in ${n} day${n === 1 ? "" : "s"}.` };
  }
  if (!d.email) {
    return { ok: false, field: "account", message: "We couldn't find an email on your account. Please contact support." };
  }
  if (!d.currentPw) {
    return { ok: false, field: "current", message: "Enter your current password to confirm it's you." };
  }
  if (d.newPw.length < 6) {
    return { ok: false, field: "new", message: "New password must be at least 6 characters." };
  }
  if (d.newPw !== d.confirmPw) {
    return { ok: false, field: "confirm", message: "The two new passwords don't match. Please retype them." };
  }
  if (d.newPw === d.currentPw) {
    return { ok: false, field: "new", message: "Your new password must be different from the current one." };
  }

  const { error: signInErr } = await d.signInWithPassword({ email: d.email, password: d.currentPw });
  if (signInErr) {
    const raw = (signInErr.message || "").toLowerCase();
    if (raw.includes("rate") || raw.includes("too many")) {
      return { ok: false, field: "current", message: "Too many attempts. Please wait a minute and try again." };
    }
    return { ok: false, field: "current", message: "Current password is incorrect. Please try again." };
  }

  const { error: updErr } = await d.updateUser({ password: d.newPw });
  if (updErr) {
    const raw = (updErr.message || "").toLowerCase();
    if (raw.includes("pwned") || raw.includes("compromis") || raw.includes("breach")) {
      return { ok: false, field: "new", message: "This password has appeared in a known data breach. Please pick a different one." };
    }
    if (raw.includes("same")) {
      return { ok: false, field: "new", message: "New password must be different from the current one." };
    }
    return { ok: false, field: "new", message: updErr.message || "We couldn't update your password. Please try again." };
  }

  try { await d.markPasswordChanged(); } catch { /* non-fatal */ }
  return { ok: true, message: "Password updated. Next change available in 30 days." };
}
