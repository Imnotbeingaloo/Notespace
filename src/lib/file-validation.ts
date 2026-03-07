import { toast } from "sonner";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_TYPES = [
  "image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml",
  "application/pdf",
  "text/plain", "text/markdown", "text/csv",
  "application/json",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function validateFile(file: File): boolean {
  if (file.size > MAX_FILE_SIZE) {
    toast.error(`File "${file.name}" exceeds 10 MB limit.`);
    return false;
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    toast.error(`File type "${file.type || "unknown"}" is not allowed.`);
    return false;
  }
  return true;
}

export function buildStoragePath(userId: string, noteId: string, fileName: string): string {
  return `${userId}/${noteId}/${Date.now()}-${sanitizeFileName(fileName)}`;
}
