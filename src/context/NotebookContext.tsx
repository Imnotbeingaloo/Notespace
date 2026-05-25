import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export interface Attachment {
  name: string;
  url: string;
  path?: string;
  type: string;
  size: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  attachments: Attachment[];
  tags: string[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Notebook {
  id: string;
  name: string;
  emoji: string;
  notes: Note[];
  created_at: string;
  deleted_at: string | null;
  parent_id?: string | null;
}

interface NotebookContextType {
  notebooks: Notebook[];
  trashedNotebooks: Notebook[];
  trashedNotes: { note: Note; notebookId: string; notebookName: string }[];
  activeNotebookId: string | null;
  activeNoteId: string | null;
  setActiveNotebookId: (id: string | null) => void;
  setActiveNoteId: (id: string | null) => void;
  createNotebook: (name: string, emoji?: string, parentId?: string | null) => Promise<string | null>;
  deleteNotebook: (id: string) => Promise<void>;
  updateNotebook: (id: string, updates: { name?: string; emoji?: string }) => Promise<void>;
  nestNotebook: (childId: string, parentId: string) => Promise<boolean>;
  promoteNoteToNotebook: (notebookId: string, noteId: string, newName?: string) => Promise<string | null>;
  ensureScratchNotebook: () => Promise<string | null>;
  createScratchNote: () => Promise<{ notebookId: string; noteId: string } | null>;
  isScratchNotebook: (notebookId: string | null) => boolean;
  moveNoteToNotebook: (fromNotebookId: string, noteId: string, toNotebookId: string) => Promise<boolean>;
  createNote: (notebookId: string, title?: string, content?: string) => Promise<string | null>;
  deleteNote: (notebookId: string, noteId: string) => Promise<void>;
  updateNote: (notebookId: string, noteId: string, updates: Partial<Pick<Note, "title" | "content" | "attachments" | "tags">>) => Promise<void>;
  reorderNotes: (notebookId: string, fromIndex: number, toIndex: number) => void;
  restoreNotebook: (id: string) => Promise<void>;
  restoreNote: (notebookId: string, noteId: string) => Promise<void>;
  permanentlyDeleteNotebook: (id: string) => Promise<void>;
  permanentlyDeleteNote: (notebookId: string, noteId: string) => Promise<void>;
  activeNotebook: Notebook | null;
  activeNote: Note | null;
  loading: boolean;
  refreshData: () => Promise<void>;
  setOverride: (override: { note: Note; onUpdate: (updates: Partial<Pick<Note, "title" | "content" | "attachments" | "tags">>) => void } | null) => void;
  isOverrideActive: boolean;
}

const NotebookContext = createContext<NotebookContextType | null>(null);

const EMOJIS = ["📓", "📕", "📗", "📘", "📙", "📔", "📒", "🗂️", "💡", "🔬", "🎯", "✏️"];

export function NotebookProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [allNotebooks, setAllNotebooks] = useState<Notebook[]>([]);
  const [activeNotebookId, setActiveNotebookIdRaw] = useState<string | null>(
    () => (typeof window !== "undefined" ? localStorage.getItem("activeNotebookId") : null)
  );
  const [activeNoteId, setActiveNoteIdRaw] = useState<string | null>(
    () => (typeof window !== "undefined" ? localStorage.getItem("activeNoteId") : null)
  );
  const [loading, setLoading] = useState(true);
  const [override, setOverrideState] = useState<{ note: Note; onUpdate: (updates: Partial<Pick<Note, "title" | "content" | "attachments" | "tags">>) => void } | null>(null);

  const OVERRIDE_NB_ID = "__override__";

  // Active (non-trashed) notebooks with non-trashed notes
  const notebooks = allNotebooks
    .filter((nb) => !nb.deleted_at)
    .map((nb) => ({ ...nb, notes: nb.notes.filter((n) => !n.deleted_at) }));

  // Trashed notebooks
  const trashedNotebooks = allNotebooks.filter((nb) => nb.deleted_at);

  // Trashed notes (from non-trashed notebooks)
  const trashedNotes = allNotebooks
    .filter((nb) => !nb.deleted_at)
    .flatMap((nb) =>
      nb.notes
        .filter((n) => n.deleted_at)
        .map((note) => ({ note, notebookId: nb.id, notebookName: nb.name }))
    );

  const realActiveNotebook = notebooks.find((n) => n.id === activeNotebookId) ?? null;
  const realActiveNote = realActiveNotebook?.notes.find((n) => n.id === activeNoteId) ?? null;

  // Override-aware getters
  const activeNotebook: Notebook | null = override
    ? { id: OVERRIDE_NB_ID, name: "Temporary", emoji: "⏳", notes: [override.note], created_at: override.note.created_at, deleted_at: null }
    : realActiveNotebook;
  const activeNote: Note | null = override ? override.note : realActiveNote;
  const effectiveActiveNotebookId = override ? OVERRIDE_NB_ID : activeNotebookId;
  const effectiveActiveNoteId = override ? override.note.id : activeNoteId;

  const setActiveNotebookId = setActiveNotebookIdRaw;
  const setActiveNoteId = setActiveNoteIdRaw;

  const setOverride = useCallback((next: { note: Note; onUpdate: (updates: Partial<Pick<Note, "title" | "content" | "attachments" | "tags">>) => void } | null) => {
    setOverrideState(next);
  }, []);

  const fetchData = useCallback(async () => {
    if (!user) { setAllNotebooks([]); setLoading(false); return; }
    setLoading(true);

    const { data: nbs } = await supabase
      .from("notebooks")
      .select("*")
      .order("created_at", { ascending: true });

    const { data: nts } = await supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: true });

    const merged: Notebook[] = (nbs ?? []).map((nb: any) => ({
      ...nb,
      notes: (nts ?? []).filter((n: any) => n.notebook_id === nb.id).map((n: any) => ({
        ...n,
        attachments: (n.attachments as Attachment[]) || [],
        tags: (n.tags as string[]) || [],
      })),
    }));

    setAllNotebooks(merged);
    const active = merged.filter((nb) => !nb.deleted_at);
    if (!activeNotebookId && active.length > 0) {
      setActiveNotebookId(active[0].id);
      const activeNotes = active[0].notes.filter((n) => !n.deleted_at);
      if (activeNotes.length > 0) setActiveNoteId(activeNotes[0].id);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const createNotebook = useCallback(async (name: string, emoji?: string, parentId?: string | null): Promise<string | null> => {
    if (!user) return null;
    const e = emoji || EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    const { data, error } = await supabase
      .from("notebooks")
      .insert({ name, emoji: e, user_id: user.id, parent_id: parentId ?? null } as any)
      .select()
      .single();
    if (error || !data) {
      toast.error(error?.message || "Could not create notebook.");
      return null;
    }
    const nb: Notebook = { ...(data as any), notes: [], deleted_at: null };
    setAllNotebooks((prev) => [...prev, nb]);
    if (!parentId) {
      setActiveNotebookId(data.id);
      setActiveNoteId(null);
    }
    return data.id;
  }, [user]);

  const nestNotebook = useCallback(async (childId: string, parentId: string): Promise<boolean> => {
    if (childId === parentId) return false;
    const { error } = await supabase
      .from("notebooks")
      .update({ parent_id: parentId } as any)
      .eq("id", childId);
    if (error) {
      toast.error(error.message || "Could not nest notebook.");
      return false;
    }
    setAllNotebooks((prev) => prev.map((n) => n.id === childId ? { ...n, parent_id: parentId } : n));
    return true;
  }, []);

  const promoteNoteToNotebook = useCallback(async (notebookId: string, noteId: string, newName?: string): Promise<string | null> => {
    if (!user) return null;
    const nb = allNotebooks.find((n) => n.id === notebookId);
    const note = nb?.notes.find((n) => n.id === noteId);
    if (!note) return null;
    const name = (newName || note.title || "Untitled Notebook").slice(0, 80);
    const newNotebookId = await createNotebook(name);
    if (!newNotebookId) return null;
    const { error } = await supabase.from("notes").update({ notebook_id: newNotebookId } as any).eq("id", noteId);
    if (error) {
      toast.error("Could not move note to new notebook.");
      return null;
    }
    setAllNotebooks((prev) => prev.map((n) => {
      if (n.id === notebookId) return { ...n, notes: n.notes.filter((x) => x.id !== noteId) };
      if (n.id === newNotebookId) return { ...n, notes: [...n.notes, note] };
      return n;
    }));
    setActiveNotebookId(newNotebookId);
    setActiveNoteId(noteId);
    return newNotebookId;
  }, [user, allNotebooks, createNotebook]);

  const ensureScratchNotebook = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    const existing = allNotebooks.find((n) => !n.deleted_at && n.name === "Scratch" && n.emoji === "✏️");
    if (existing) return existing.id;
    const id = await createNotebook("Scratch", "✏️");
    return id;
  }, [user, allNotebooks, createNotebook]);

  const createScratchNote = useCallback(async (): Promise<{ notebookId: string; noteId: string } | null> => {
    if (!user) return null;
    const nbId = await ensureScratchNotebook();
    if (!nbId) return null;
    const { data, error } = await supabase
      .from("notes")
      .insert({ notebook_id: nbId, user_id: user.id, title: "Scratch note", content: "" })
      .select()
      .single();
    if (error || !data) return null;
    const note: Note = { ...(data as any), attachments: [], tags: [], deleted_at: null };
    setAllNotebooks((prev) => prev.map((n) => n.id === nbId ? { ...n, notes: [...n.notes, note] } : n));
    setActiveNotebookId(nbId);
    setActiveNoteId(data.id);
    return { notebookId: nbId, noteId: data.id };
  }, [user, ensureScratchNotebook]);

  // Soft delete notebook
  const deleteNotebook = useCallback(async (id: string) => {
    const now = new Date().toISOString();
    const nb = allNotebooks.find((n) => n.id === id);
    // Optimistically soft-delete
    setAllNotebooks((prev) =>
      prev.map((n) => n.id === id ? { ...n, deleted_at: now } : n)
    );
    if (activeNotebookId === id) { setActiveNotebookId(null); setActiveNoteId(null); }

    let undone = false;
    toast(`"${nb?.name || "Notebook"}" moved to trash`, {
      duration: 5000,
      action: {
        label: "Undo",
        onClick: () => {
          undone = true;
          setAllNotebooks((prev) =>
            prev.map((n) => n.id === id ? { ...n, deleted_at: null } : n)
          );
          supabase.from("notebooks").update({ deleted_at: null } as any).eq("id", id).then(() => {});
        },
      },
      onAutoClose: () => {
        if (!undone) {
          supabase.from("notebooks").update({ deleted_at: now } as any).eq("id", id).then(() => {});
        }
      },
      onDismiss: () => {
        if (!undone) {
          supabase.from("notebooks").update({ deleted_at: now } as any).eq("id", id).then(() => {});
        }
      },
    });
  }, [activeNotebookId, allNotebooks]);

  const updateNotebook = useCallback(async (id: string, updates: { name?: string; emoji?: string }) => {
    await supabase.from("notebooks").update(updates).eq("id", id);
    setAllNotebooks((prev) =>
      prev.map((nb) => nb.id === id ? { ...nb, ...updates } : nb)
    );
  }, []);

  const createNote = useCallback(async (notebookId: string, title?: string, content?: string): Promise<string | null> => {
    if (!user) return null;
    const { data } = await supabase
      .from("notes")
      .insert({ notebook_id: notebookId, user_id: user.id, title: title || "Untitled Note", content: content || "" })
      .select()
      .single();
    if (data) {
      const note: Note = { ...data, attachments: (data.attachments as unknown as Attachment[]) || [], deleted_at: null };
      setAllNotebooks((prev) =>
        prev.map((nb) => nb.id === notebookId ? { ...nb, notes: [...nb.notes, note] } : nb)
      );
      setActiveNoteId(data.id);
      return data.id;
    }
    return null;
  }, [user]);

  const isScratchNotebook = useCallback((notebookId: string | null) => {
    if (!notebookId) return false;
    const nb = allNotebooks.find((n) => n.id === notebookId);
    return !!nb && nb.name === "Scratch" && nb.emoji === "✏️";
  }, [allNotebooks]);

  const moveNoteToNotebook = useCallback(async (fromNotebookId: string, noteId: string, toNotebookId: string): Promise<boolean> => {
    if (fromNotebookId === toNotebookId) return true;
    const { error } = await supabase.from("notes").update({ notebook_id: toNotebookId } as any).eq("id", noteId);
    if (error) {
      toast.error("Could not move note.");
      return false;
    }
    setAllNotebooks((prev) => {
      const sourceNb = prev.find((n) => n.id === fromNotebookId);
      const note = sourceNb?.notes.find((n) => n.id === noteId);
      if (!note) return prev;
      return prev.map((n) => {
        if (n.id === fromNotebookId) return { ...n, notes: n.notes.filter((x) => x.id !== noteId) };
        if (n.id === toNotebookId) return { ...n, notes: [...n.notes, note] };
        return n;
      });
    });
    return true;
  }, []);

  const deleteNote = useCallback(async (notebookId: string, noteId: string) => {
    const now = new Date().toISOString();
    const nb = allNotebooks.find((n) => n.id === notebookId);
    const note = nb?.notes.find((n) => n.id === noteId);
    // Optimistically soft-delete
    setAllNotebooks((prev) =>
      prev.map((n) =>
        n.id === notebookId
          ? { ...n, notes: n.notes.map((nt) => nt.id === noteId ? { ...nt, deleted_at: now } : nt) }
          : n
      )
    );
    if (activeNoteId === noteId) setActiveNoteId(null);

    let undone = false;
    toast(`"${note?.title || "Note"}" moved to trash`, {
      duration: 5000,
      action: {
        label: "Undo",
        onClick: () => {
          undone = true;
          setAllNotebooks((prev) =>
            prev.map((n) =>
              n.id === notebookId
                ? { ...n, notes: n.notes.map((nt) => nt.id === noteId ? { ...nt, deleted_at: null } : nt) }
                : n
            )
          );
          supabase.from("notes").update({ deleted_at: null } as any).eq("id", noteId).then(() => {});
        },
      },
      onAutoClose: () => {
        if (!undone) {
          supabase.from("notes").update({ deleted_at: now } as any).eq("id", noteId).then(() => {});
        }
      },
      onDismiss: () => {
        if (!undone) {
          supabase.from("notes").update({ deleted_at: now } as any).eq("id", noteId).then(() => {});
        }
      },
    });
  }, [activeNoteId, allNotebooks]);

  const updateNote = useCallback(
    async (notebookId: string, noteId: string, updates: Partial<Pick<Note, "title" | "content" | "attachments" | "tags">>) => {
      // Override path: temp notes don't live in `notes` table
      if (override && noteId === override.note.id) {
        override.onUpdate(updates);
        setOverrideState((cur) => cur ? { ...cur, note: { ...cur.note, ...updates, updated_at: new Date().toISOString() } } : cur);
        return;
      }
      await supabase.from("notes").update(updates as any).eq("id", noteId);
      setAllNotebooks((prev) =>
        prev.map((nb) =>
          nb.id === notebookId
            ? { ...nb, notes: nb.notes.map((n) => n.id === noteId ? { ...n, ...updates, updated_at: new Date().toISOString() } : n) }
            : nb
        )
      );
    },
    [override]
  );

  const reorderNotes = useCallback(
    (notebookId: string, fromIndex: number, toIndex: number) => {
      setAllNotebooks((prev) =>
        prev.map((nb) => {
          if (nb.id !== notebookId) return nb;
          const notes = [...nb.notes];
          const [moved] = notes.splice(fromIndex, 1);
          notes.splice(toIndex, 0, moved);
          return { ...nb, notes };
        })
      );
    },
    []
  );

  // Restore notebook from trash
  const restoreNotebook = useCallback(async (id: string) => {
    await supabase.from("notebooks").update({ deleted_at: null } as any).eq("id", id);
    setAllNotebooks((prev) =>
      prev.map((nb) => nb.id === id ? { ...nb, deleted_at: null } : nb)
    );
  }, []);

  // Restore note from trash
  const restoreNote = useCallback(async (notebookId: string, noteId: string) => {
    await supabase.from("notes").update({ deleted_at: null } as any).eq("id", noteId);
    setAllNotebooks((prev) =>
      prev.map((nb) =>
        nb.id === notebookId
          ? { ...nb, notes: nb.notes.map((n) => n.id === noteId ? { ...n, deleted_at: null } : n) }
          : nb
      )
    );
  }, []);

  // Permanently delete notebook
  const permanentlyDeleteNotebook = useCallback(async (id: string) => {
    await supabase.from("notebooks").delete().eq("id", id);
    setAllNotebooks((prev) => prev.filter((nb) => nb.id !== id));
  }, []);

  // Permanently delete note
  const permanentlyDeleteNote = useCallback(async (notebookId: string, noteId: string) => {
    await supabase.from("notes").delete().eq("id", noteId);
    setAllNotebooks((prev) =>
      prev.map((nb) =>
        nb.id === notebookId ? { ...nb, notes: nb.notes.filter((n) => n.id !== noteId) } : nb
      )
    );
  }, []);

  return (
    <NotebookContext.Provider
      value={{
        notebooks, trashedNotebooks, trashedNotes,
        activeNotebookId: effectiveActiveNotebookId,
        activeNoteId: effectiveActiveNoteId,
        setActiveNotebookId, setActiveNoteId,
        createNotebook, deleteNotebook, updateNotebook, nestNotebook, promoteNoteToNotebook,
        ensureScratchNotebook, createScratchNote, isScratchNotebook, moveNoteToNotebook,
        createNote, deleteNote, updateNote,
        reorderNotes, restoreNotebook, restoreNote, permanentlyDeleteNotebook, permanentlyDeleteNote,
        activeNotebook, activeNote, loading, refreshData: fetchData,
        setOverride, isOverrideActive: !!override,
      }}
    >
      {children}
    </NotebookContext.Provider>
  );
}

export function useNotebooks() {
  const ctx = useContext(NotebookContext);
  if (!ctx) throw new Error("useNotebooks must be used within NotebookProvider");
  return ctx;
}
