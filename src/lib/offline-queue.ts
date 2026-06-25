/**
 * Lightweight offline write-queue for note edits.
 *
 * Strategy:
 *  - Each pending update is merged per-noteId in localStorage (last-write-wins
 *    on each field). This matches our optimistic UI: the latest field value
 *    is what should land on the server.
 *  - When the browser comes back online (or on app start), flush all pending
 *    updates with `supabase.from('notes').update(...).eq('id', noteId)`.
 *  - Tries are isolated per-note; a failing note stays queued, the rest sync.
 */
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const KEY = "offlineNoteQueue.v1";

type PendingUpdates = Record<string, unknown>;
type Queue = Record<string, PendingUpdates>; // noteId -> merged updates

function read(): Queue {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Queue) : {};
  } catch {
    return {};
  }
}

function write(q: Queue) {
  try {
    localStorage.setItem(KEY, JSON.stringify(q));
  } catch {}
}

export function isOffline() {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

export function queueNoteUpdate(noteId: string, updates: PendingUpdates) {
  const q = read();
  q[noteId] = { ...(q[noteId] ?? {}), ...updates };
  write(q);
}

export function hasPending() {
  return Object.keys(read()).length > 0;
}

let flushing = false;
export async function flushQueue(): Promise<{ synced: number; failed: number }> {
  if (flushing) return { synced: 0, failed: 0 };
  flushing = true;
  let synced = 0;
  let failed = 0;
  try {
    const q = read();
    const entries = Object.entries(q);
    for (const [noteId, updates] of entries) {
      try {
        const { error } = await supabase.from("notes").update(updates as any).eq("id", noteId);
        if (error) {
          failed += 1;
        } else {
          const cur = read();
          delete cur[noteId];
          write(cur);
          synced += 1;
        }
      } catch {
        failed += 1;
      }
    }
  } finally {
    flushing = false;
  }
  return { synced, failed };
}

let installed = false;
export function installOfflineQueueListener() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  const tryFlush = async () => {
    if (!hasPending() || isOffline()) return;
    const { synced } = await flushQueue();
    if (synced > 0) {
      toast.success(`✅ Synced ${synced} offline change${synced > 1 ? "s" : ""}.`, { duration: 2500 });
    }
  };

  window.addEventListener("online", tryFlush);
  // Also attempt at startup in case we have leftover pending edits from a
  // previous session that ended offline.
  setTimeout(tryFlush, 1500);
}
