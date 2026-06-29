// Safe URL sanitization for user-provided URLs inserted into the DOM.
// Blocks javascript:, vbscript:, data: (except data:image/*), and escapes
// HTML attribute characters.

const SAFE_SCHEMES = ["http:", "https:", "mailto:"];

export function sanitizeUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = String(raw).trim();
  if (!trimmed) return null;

  // Reject obvious dangerous schemes (case/whitespace tolerant)
  const lowered = trimmed.toLowerCase().replace(/[\s\u0000-\u001f]/g, "");
  if (
    lowered.startsWith("javascript:") ||
    lowered.startsWith("vbscript:") ||
    (lowered.startsWith("data:") && !lowered.startsWith("data:image/"))
  ) {
    return null;
  }

  // Allow relative/protocol-relative URLs
  if (trimmed.startsWith("/") || trimmed.startsWith("#") || trimmed.startsWith("./") || trimmed.startsWith("../")) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed, window.location.origin);
    if (!SAFE_SCHEMES.includes(url.protocol) && !(url.protocol === "data:" && /^data:image\//i.test(trimmed))) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

export function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
