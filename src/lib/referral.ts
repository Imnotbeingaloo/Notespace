// Captures referral / UTM params from any page load and stores them in
// localStorage so they survive the journey from blog → /auth → signup.
// On signup we attach this object to Supabase user_metadata so you can
// query who came from where with:
//   select email, raw_user_meta_data->'referral' from auth.users;

const KEY = "na_referral";

export interface ReferralPayload {
  ref?: string;          // ?ref=blog
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  landing_path?: string; // the first page they hit
  referrer?: string;     // document.referrer
  captured_at?: string;
}

const FIELDS = ["ref", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

export function captureReferralFromUrl() {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const hits: Partial<ReferralPayload> = {};
    let found = false;
    for (const f of FIELDS) {
      const v = params.get(f);
      if (v) {
        hits[f] = v;
        found = true;
      }
    }
    if (!found) return;
    // First-touch attribution: don't overwrite an existing capture.
    if (localStorage.getItem(KEY)) return;
    const payload: ReferralPayload = {
      ...hits,
      landing_path: window.location.pathname,
      referrer: document.referrer || undefined,
      captured_at: new Date().toISOString(),
    };
    localStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

export function getReferral(): ReferralPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ReferralPayload) : null;
  } catch {
    return null;
  }
}

export function clearReferral() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
