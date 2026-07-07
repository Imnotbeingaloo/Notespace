import { supabase } from "@/integrations/supabase/client";
import { logImport } from "@/lib/import-analytics";

type AttachmentLike = { path?: string | null } | null | undefined;

/**
 * Delete binary uploads from the `note-attachments` bucket. Used when a note
 * is permanently deleted, an entire notebook is purged, or an editor
 * "Replace" import wipes all previous attachments in one shot.
 *
 * Fail-soft: storage errors are logged but never thrown, so a transient
 * network hiccup can't block the DB delete the caller already committed to.
 */
export async function removeAttachmentObjects(
  attachments: AttachmentLike[] | null | undefined,
  reason: "note-delete" | "notebook-delete" | "replace" | "cancel",
  noteId: string | null = null,
): Promise<number> {
  const paths = (attachments ?? [])
    .map((a) => (a && typeof a.path === "string" ? a.path : null))
    .filter((p): p is string => !!p && p.length > 0);
  if (paths.length === 0) return 0;
  try {
    const { error } = await supabase.storage.from("note-attachments").remove(paths);
    if (error) {
      logImport({ kind: "attachments-cleanup-failed", message: error.message });
      return 0;
    }
    logImport({ kind: "attachments-cleanup", noteId, removed: paths.length, reason });
    return paths.length;
  } catch (err: any) {
    logImport({ kind: "attachments-cleanup-failed", message: err?.message || "unknown" });
    return 0;
  }
}
