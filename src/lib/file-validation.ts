import { toast } from "sonner";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_TYPES = [
  "image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml",
  "application/pdf",
  "text/plain", "text/markdown", "text/csv",
  "text/html", "application/xhtml+xml",
  "application/json",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const TEXT_EXTENSIONS = [".md", ".markdown", ".html", ".htm", ".txt"];

export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function validateFile(file: File): boolean {
  if (file.size > MAX_FILE_SIZE) {
    toast.error(`File "${file.name}" exceeds 10 MB limit.`);
    return false;
  }
  // Allow by mime type or by file extension fallback
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  if (!ALLOWED_TYPES.includes(file.type) && !TEXT_EXTENSIONS.includes(ext)) {
    toast.error(`File type "${file.type || "unknown"}" is not allowed.`);
    return false;
  }
  return true;
}

export function isTextDocument(file: File): boolean {
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  return (
    file.type === "text/html" ||
    file.type === "application/xhtml+xml" ||
    file.type === "text/markdown" ||
    file.type === "text/plain" ||
    [".md", ".markdown", ".html", ".htm"].includes(ext)
  );
}

export function isHtmlFile(file: File): boolean {
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  return file.type === "text/html" || file.type === "application/xhtml+xml" || [".html", ".htm"].includes(ext);
}

export function stripHtmlTags(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

export function buildStoragePath(userId: string, noteId: string, fileName: string): string {
  return `${userId}/${noteId}/${Date.now()}-${sanitizeFileName(fileName)}`;
}
