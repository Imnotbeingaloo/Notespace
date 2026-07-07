/**
 * Structured client-side logging for the file-import / attachment pipeline.
 *
 * Two sinks, both cheap:
 *   1. `console.debug` under a stable prefix so QA can filter DevTools with
 *      `[import]` and see the full decision trail per file.
 *   2. `window.dispatchEvent(new CustomEvent("lovable:import-event"))` so
 *      analytics wiring, Playwright, or a dev-only overlay can subscribe
 *      without importing this module.
 *
 * Keep events additive and small — never log file contents, only metadata.
 */

export type ImportEvent =
  | { kind: "batch-start"; count: number; hasExistingContent: boolean }
  | { kind: "file-skipped"; name: string; reason: string }
  | { kind: "file-classified"; name: string; type: string; size: number; route: "text" | "pdf-text" | "pdf-attach" | "attach" | "pdf" | "image" | "video" | "audio" }
  | { kind: "import-choice"; name: string; action: "merge" | "replace" | "create"; position?: "top" | "cursor" | "end" }
  | { kind: "attach-uploaded"; name: string; path: string; size: number }
  | { kind: "attach-upload-failed"; name: string; message: string }
  | { kind: "attachments-persisted"; noteId: string; added: number; total: number }
  | { kind: "attachments-cleanup"; noteId: string | null; removed: number; reason: "note-delete" | "notebook-delete" | "replace" | "cancel" }
  | { kind: "batch-cancelled"; uploaded: number; rolledBack: number }
  | { kind: "attachments-cleanup-failed"; message: string }
  | { kind: "batch-complete"; imported: number; attached: number; failed: number };

export function logImport(event: ImportEvent) {
  try {
    // eslint-disable-next-line no-console
    console.debug("[import]", event.kind, event);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("lovable:import-event", { detail: event }));
    }
  } catch {
    /* never let logging break the import */
  }
}
