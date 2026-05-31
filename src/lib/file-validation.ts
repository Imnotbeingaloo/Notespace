import { toast } from "@/components/ui/sonner";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB — attach-files inside a note (covers small videos / PDFs)
const MAX_SIDEBAR_FILE_SIZE = 1024 * 1024 * 1024; // 1 GB — sidebar upload

// Strict allow-list. HTML, SVG, and executables are intentionally excluded
// because they can carry active content (scripts) that could be rendered later.
const ALLOWED_MIME = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/epub+zip",
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "video/mp4",
  "video/quicktime",
  "video/webm",
];

const ALLOWED_EXT = [
  ".png", ".jpg", ".jpeg", ".gif", ".webp",
  ".pdf", ".epub",
  ".txt", ".md", ".markdown", ".csv", ".json",
  ".doc", ".docx", ".xls", ".xlsx",
  ".mp4", ".mov", ".webm",
];

const BLOCKED_EXT = [
  ".html", ".htm", ".xhtml", ".svg",
  ".js", ".mjs", ".ts", ".jsx", ".tsx",
  ".exe", ".bat", ".cmd", ".sh", ".ps1", ".msi", ".app", ".dmg",
  ".zip", ".rar", ".7z", ".tar", ".gz",
  ".php", ".py", ".rb", ".jar",
];

function getExt(name: string): string {
  const idx = name.lastIndexOf(".");
  return idx === -1 ? "" : name.slice(idx).toLowerCase();
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function checkTypeAllowed(file: File): boolean {
  const ext = getExt(file.name);
  if (BLOCKED_EXT.includes(ext)) {
    toast.error(`"${ext}" files are not allowed for security reasons.`);
    return false;
  }
  const mimeOk = file.type && ALLOWED_MIME.includes(file.type);
  const extOk = ALLOWED_EXT.includes(ext);
  if (!mimeOk && !extOk) {
    toast.error(`File type not supported: ${file.type || ext || "unknown"}.`);
    return false;
  }
  return true;
}

// Attach-files inside a note: 100 MB cap (covers small videos & PDFs).
export function validateFile(file: File): boolean {
  if (file.size > MAX_FILE_SIZE) {
    toast.error(`"${file.name}" exceeds the 100 MB limit for inline attachments.`);
    return false;
  }
  return checkTypeAllowed(file);
}

// Sidebar uploads (whole-file imports): 1 GB cap.
export function validateSidebarFile(file: File): boolean {
  if (file.size > MAX_SIDEBAR_FILE_SIZE) {
    toast.error(`"${file.name}" exceeds the 1 GB upload limit.`);
    return false;
  }
  return checkTypeAllowed(file);
}

export function isTextDocument(file: File): boolean {
  const ext = getExt(file.name);
  return (
    file.type === "text/markdown" ||
    file.type === "text/plain" ||
    file.type === "text/csv" ||
    file.type === "application/json" ||
    [".md", ".markdown", ".txt", ".csv", ".json"].includes(ext)
  );
}

export function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || getExt(file.name) === ".pdf";
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/") && !file.type.includes("svg");
}

// Kept for backwards compatibility (no longer used — HTML is blocked).
export function isHtmlFile(_file: File): boolean {
  return false;
}

export function stripHtmlTags(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

export function buildStoragePath(userId: string, noteId: string, fileName: string): string {
  return `${userId}/${noteId}/${Date.now()}-${sanitizeFileName(fileName)}`;
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const comma = result.indexOf(",");
      resolve(comma === -1 ? result : result.slice(comma + 1));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function friendlyUploadMessage(file: File): string {
  const tenMB = 10 * 1024 * 1024;
  return file.size > tenMB ? "Uploading… this may take a moment" : "Uploading… just a sec";
}
