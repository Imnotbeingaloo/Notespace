import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/sonner";
import { promptRenameForDuplicate } from "@/components/RenameDuplicateDialog";
import { isOffline, queueNoteUpdate } from "@/lib/offline-queue";


export interface Attachment {
  name: string;
  url: string;
  path?: string;
  type: string;
  size: number;
}

export interface Note {
  id: string;
  notebook_id: string | null;
  title: string;
  content: string;
  emoji?: string;
  attachments: Attachment[];
  tags: string[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

type NoteUpdates = Partial<Pick<Note, "title" | "content" | "attachments" | "tags" | "emoji">>;

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
  standaloneNotes: Note[];
  trashedNotebooks: Notebook[];
  trashedNotes: { note: Note; notebookId: string | null; notebookName: string }[];
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
  createStandaloneNote: (title?: string, emoji?: string) => Promise<{ notebookId: null; noteId: string } | null>;
  moveNoteToNotebook: (fromNotebookId: string | null, noteId: string, toNotebookId: string | null) => Promise<boolean>;
  createNote: (notebookId: string, title?: string, content?: string, emoji?: string) => Promise<string | null>;
  deleteNote: (notebookId: string | null, noteId: string) => Promise<void>;
  updateNote: (notebookId: string | null, noteId: string, updates: NoteUpdates) => Promise<void>;
  reorderNotes: (notebookId: string, fromIndex: number, toIndex: number) => void;
  restoreNotebook: (id: string) => Promise<void>;
  restoreNote: (notebookId: string | null, noteId: string) => Promise<void>;
  permanentlyDeleteNotebook: (id: string) => Promise<void>;
  permanentlyDeleteNote: (notebookId: string | null, noteId: string) => Promise<void>;
  activeNotebook: Notebook | null;
  activeNote: Note | null;
  loading: boolean;
  refreshData: () => Promise<void>;
  setOverride: (override: { note: Note; onUpdate: (updates: NoteUpdates) => void } | null) => void;
  isOverrideActive: boolean;
}

const NotebookContext = createContext<NotebookContextType | null>(null);

const EMOJIS = ["📓", "📕", "📗", "📘", "📙", "📔", "📒", "🗂️", "💡", "🔬", "🎯", "✏️"];
const NOTE_EMOJIS = ["📝", "📄", "🗒️", "✏️", "💭", "💡", "⭐", "🔖", "📌", "🎯", "🧠", "✨"];
const STANDALONE_NOTES_LABEL = "Notes";
const SYSTEM_NOTE_CONTAINER_NAMES = new Set([STANDALONE_NOTES_LABEL, "Legacy Notes"]);

export function NotebookProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [allNotebooks, setAllNotebooks] = useState<Notebook[]>([]);
  const [allStandaloneNotes, setAllStandaloneNotes] = useState<Note[]>([]);
  const [activeNotebookId, setActiveNotebookIdRaw] = useState<string | null>(
    () => (typeof window !== "undefined" ? localStorage.getItem("activeNotebookId") : null)
  );
  const [activeNoteId, setActiveNoteIdRaw] = useState<string | null>(
    () => (typeof window !== "undefined" ? localStorage.getItem("activeNoteId") : null)
  );
  const [loading, setLoading] = useState(true);
  const [override, setOverrideState] = useState<{ note: Note; onUpdate: (updates: NoteUpdates) => void } | null>(null);

  const OVERRIDE_NB_ID = "__override__";

  // Active (non-trashed) notebooks with non-trashed notes
  const notebooks = allNotebooks
    .filter((nb) => !nb.deleted_at)
    .map((nb) => ({ ...nb, notes: nb.notes.filter((n) => !n.deleted_at) }));
  const standaloneNotes = allStandaloneNotes.filter((n) => !n.deleted_at);

  // Trashed notebooks
  const trashedNotebooks = allNotebooks.filter((nb) => nb.deleted_at);

  // Trashed notes (from non-trashed notebooks)
  const trashedNotes = allNotebooks
    .filter((nb) => !nb.deleted_at)
    .flatMap((nb) =>
      nb.notes
        .filter((n) => n.deleted_at)
        .map((note) => ({ note, notebookId: nb.id, notebookName: nb.name }))
    )
    .concat(
      allStandaloneNotes
        .filter((note) => note.deleted_at)
        .map((note) => ({ note, notebookId: null, notebookName: STANDALONE_NOTES_LABEL }))
    );

  const realActiveNotebook = notebooks.find((n) => n.id === activeNotebookId) ?? null;
  const standaloneActiveNote = !activeNotebookId
    ? standaloneNotes.find((n) => n.id === activeNoteId) ?? null
    : null;
  const realActiveNote = realActiveNotebook?.notes.find((n) => n.id === activeNoteId) ?? standaloneActiveNote;

  // Override-aware getters
  const activeNotebook: Notebook | null = override
    ? { id: OVERRIDE_NB_ID, name: "Temporary", emoji: "⏳", notes: [override.note], created_at: override.note.created_at, deleted_at: null }
    : realActiveNotebook ?? (standaloneActiveNote
      ? { id: STANDALONE_NOTES_LABEL, name: STANDALONE_NOTES_LABEL, emoji: standaloneActiveNote.emoji || "📝", notes: [standaloneActiveNote], created_at: standaloneActiveNote.created_at, deleted_at: null }
      : null);
  const activeNote: Note | null = override ? override.note : realActiveNote;
  const effectiveActiveNotebookId = override ? OVERRIDE_NB_ID : activeNotebookId;
  const effectiveActiveNoteId = override ? override.note.id : activeNoteId;

  const setActiveNotebookId = useCallback((id: string | null) => {
    setActiveNotebookIdRaw(id);
    if (typeof window !== "undefined") {
      if (id) localStorage.setItem("activeNotebookId", id);
      else localStorage.removeItem("activeNotebookId");
    }
  }, []);
  const setActiveNoteId = useCallback((id: string | null) => {
    setActiveNoteIdRaw(id);
    if (typeof window !== "undefined") {
      if (id) localStorage.setItem("activeNoteId", id);
      else localStorage.removeItem("activeNoteId");
    }
  }, []);

  const setOverride = useCallback((next: { note: Note; onUpdate: (updates: NoteUpdates) => void } | null) => {
    setOverrideState(next);
  }, []);

  const fetchData = useCallback(async () => {
    if (!user) { setAllNotebooks([]); setAllStandaloneNotes([]); setLoading(false); return; }
    setLoading(true);

    const { data: nbs } = await supabase
      .from("notebooks")
      .select("*")
      .order("created_at", { ascending: true });

    const { data: nts } = await supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: true });

    const systemNoteContainerIds = new Set(
      (nbs ?? [])
        .filter((nb: any) => SYSTEM_NOTE_CONTAINER_NAMES.has(nb.name) && nb.emoji === "📝")
        .map((nb: any) => nb.id)
    );
    const merged: Notebook[] = (nbs ?? [])
      .filter((nb: any) => !systemNoteContainerIds.has(nb.id))
      .map((nb: any) => ({
      ...nb,
      notes: (nts ?? []).filter((n: any) => n.notebook_id === nb.id).map((n: any) => ({
        ...n,
        notebook_id: n.notebook_id ?? null,
        emoji: n.emoji || "📝",
        attachments: (n.attachments as Attachment[]) || [],
        tags: (n.tags as string[]) || [],
      })),
    }));
    const looseNotes: Note[] = (nts ?? [])
      .filter((n: any) => !n.notebook_id || systemNoteContainerIds.has(n.notebook_id))
      .map((n: any) => ({
        ...n,
        notebook_id: systemNoteContainerIds.has(n.notebook_id) ? null : n.notebook_id ?? null,
        emoji: n.emoji || "📝",
        attachments: (n.attachments as Attachment[]) || [],
        tags: (n.tags as string[]) || [],
      }));

    setAllNotebooks(merged);
    setAllStandaloneNotes(looseNotes);
    const active = merged.filter((nb) => !nb.deleted_at);
    // Validate persisted IDs still exist; otherwise fall back to first available
    const persistedStandalone = (!activeNotebookId || systemNoteContainerIds.has(activeNotebookId)) && looseNotes.some((n) => n.id === activeNoteId && !n.deleted_at);
    const persistedNb = active.find((nb) => nb.id === activeNotebookId);
    if (persistedStandalone) {
      setActiveNotebookId(null);
      return setLoading(false);
    }
    if (!persistedNb && active.length > 0) {
      setActiveNotebookId(active[0].id);
      const firstNotes = active[0].notes.filter((n) => !n.deleted_at);
      setActiveNoteId(firstNotes[0]?.id ?? null);
    } else if (persistedNb) {
      const validNote = persistedNb.notes.find((n) => n.id === activeNoteId && !n.deleted_at);
      if (!validNote) {
        const firstNotes = persistedNb.notes.filter((n) => !n.deleted_at);
        setActiveNoteId(firstNotes[0]?.id ?? null);
      }
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const createNotebook = useCallback(async (name: string, emoji?: string, parentId?: string | null): Promise<string | null> => {
    if (!user) return null;
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Notebook name can't be empty.");
      return null;
    }
    const lower = trimmed.toLowerCase();
    const dupe = allNotebooks.some((nb) => !nb.deleted_at && nb.name.trim().toLowerCase() === lower);
    if (dupe) {
      toast.error(`A notebook named "${trimmed}" already exists. Pick a different name.`);
      return null;
    }
    const e = emoji || EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    const { data, error } = await supabase
      .from("notebooks")
      .insert({ name: trimmed, emoji: e, user_id: user.id, parent_id: parentId ?? null } as any)
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
  }, [user, allNotebooks]);

  // Returns a title that's unique within the given notebook by appending " (n)" as needed.
  const uniqueTitleIn = useCallback(
    (notebookId: string, desired: string, excludeNoteId?: string): string => {
      const nb = allNotebooks.find((n) => n.id === notebookId);
      const base = (desired || "Untitled Note").trim() || "Untitled Note";
      if (!nb) return base;
      const taken = new Set(
        nb.notes
          .filter((n) => !n.deleted_at && n.id !== excludeNoteId)
          .map((n) => n.title.trim().toLowerCase())
      );
      if (!taken.has(base.toLowerCase())) return base;
      let i = 2;
      while (taken.has(`${base} (${i})`.toLowerCase())) i += 1;
      return `${base} (${i})`;
    },
    [allNotebooks]
  );


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
    const title = uniqueTitleIn(nbId, "Scratch note");
    const { data, error } = await supabase
      .from("notes")
      .insert({ notebook_id: nbId, user_id: user.id, title, content: "" })
      .select()
      .single();
    if (error || !data) return null;
    const note: Note = { ...(data as any), attachments: [], tags: [], deleted_at: null };
    setAllNotebooks((prev) => prev.map((n) => n.id === nbId ? { ...n, notes: [...n.notes, note] } : n));
    setActiveNotebookId(nbId);
    setActiveNoteId(data.id);
    return { notebookId: nbId, noteId: data.id };
  }, [user, ensureScratchNotebook, uniqueTitleIn]);

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
    if (updates.name !== undefined) {
      const trimmed = updates.name.trim();
      if (!trimmed) {
        toast.error("Notebook name can't be empty.");
        return;
      }
      const lower = trimmed.toLowerCase();
      const dupe = allNotebooks.some(
        (nb) => nb.id !== id && !nb.deleted_at && nb.name.trim().toLowerCase() === lower
      );
      if (dupe) {
        toast.error(`A notebook named "${trimmed}" already exists. Pick a different name.`);
        return;
      }
      updates = { ...updates, name: trimmed };
    }
    await supabase.from("notebooks").update(updates).eq("id", id);
    setAllNotebooks((prev) =>
      prev.map((nb) => nb.id === id ? { ...nb, ...updates } : nb)
    );
  }, [allNotebooks]);




  const createNote = useCallback(async (notebookId: string, title?: string, content?: string, emoji?: string): Promise<string | null> => {
    if (!user) return null;
    const requested = (title || "Untitled Note").trim() || "Untitled Note";
    const finalTitle = uniqueTitleIn(notebookId, requested);
    const finalEmoji = emoji || NOTE_EMOJIS[Math.floor(Math.random() * NOTE_EMOJIS.length)];
    const { data } = await supabase
      .from("notes")
      .insert({ notebook_id: notebookId, user_id: user.id, title: finalTitle, content: content || "", emoji: finalEmoji } as any)
      .select()
      .single();
    if (data) {
      const note: Note = { ...(data as any), emoji: (data as any).emoji || finalEmoji, attachments: (data.attachments as unknown as Attachment[]) || [], tags: ((data as any).tags as string[]) || [], deleted_at: null };
      setAllNotebooks((prev) =>
        prev.map((nb) => nb.id === notebookId ? { ...nb, notes: [...nb.notes, note] } : nb)
      );
      setActiveNoteId(data.id);
      if (finalTitle !== requested) {
        toast(`Renamed to "${finalTitle}"`, { description: `A note named "${requested}" already exists in this notebook, so we appended a number.` });
      }
      return data.id;
    }
    return null;
  }, [user, uniqueTitleIn]);

  const isScratchNotebook = useCallback((notebookId: string | null) => {
    if (!notebookId) return false;
    const nb = allNotebooks.find((n) => n.id === notebookId);
    return !!nb && nb.name === "Scratch" && nb.emoji === "✏️";
  }, [allNotebooks]);

  const uniqueStandaloneTitle = useCallback(
    (desired: string, excludeNoteId?: string): string => {
      const base = (desired || "Untitled Note").trim() || "Untitled Note";
      const taken = new Set(
        allStandaloneNotes
          .filter((n) => !n.deleted_at && n.id !== excludeNoteId)
          .map((n) => n.title.trim().toLowerCase())
      );
      if (!taken.has(base.toLowerCase())) return base;
      let i = 2;
      while (taken.has(`${base} (${i})`.toLowerCase())) i += 1;
      return `${base} (${i})`;
    },
    [allStandaloneNotes]
  );

  const createStandaloneNote = useCallback(async (title?: string, emoji?: string): Promise<{ notebookId: null; noteId: string } | null> => {
    if (!user) return null;
    const requested = (title || "Untitled Note").trim() || "Untitled Note";
    const finalTitle = uniqueStandaloneTitle(requested);
    const finalEmoji = emoji || NOTE_EMOJIS[Math.floor(Math.random() * NOTE_EMOJIS.length)];
    const { data, error } = await supabase
      .from("notes")
      .insert({ notebook_id: null, user_id: user.id, title: finalTitle, content: "", emoji: finalEmoji } as any)
      .select()
      .single();
    if (error || !data) return null;
    const note: Note = { ...(data as any), notebook_id: null, emoji: (data as any).emoji || finalEmoji, attachments: [], tags: [], deleted_at: null };
    setAllStandaloneNotes((prev) => [...prev, note]);
    setActiveNotebookId(null);
    setActiveNoteId(data.id);
    if (finalTitle !== requested) {
      toast(`Renamed to "${finalTitle}"`, { description: `A note named "${requested}" already exists in Notes, so we appended a number.` });
    }
    return { notebookId: null, noteId: data.id };
  }, [user, uniqueStandaloneTitle]);

  const moveNoteToNotebook = useCallback(async (fromNotebookId: string | null, noteId: string, toNotebookId: string | null): Promise<boolean> => {
    if (fromNotebookId === toNotebookId) return true;

    // Duplicate-title guard: if the destination already has a note with this title,
    // prompt the user to pick a new name before completing the move.
    const sourceNb = fromNotebookId ? allNotebooks.find((n) => n.id === fromNotebookId) : null;
    const note = fromNotebookId
      ? sourceNb?.notes.find((n) => n.id === noteId)
      : allStandaloneNotes.find((n) => n.id === noteId);
    const destNb = toNotebookId ? allNotebooks.find((n) => n.id === toNotebookId) : null;
    let finalTitle = note?.title ?? "";
    if (note) {
      const takenList = toNotebookId
        ? (destNb?.notes ?? []).filter((n) => !n.deleted_at && n.id !== noteId).map((n) => n.title)
        : allStandaloneNotes.filter((n) => !n.deleted_at && n.id !== noteId).map((n) => n.title);
      const takenLower = new Set(takenList.map((t) => t.trim().toLowerCase()));
      if (takenLower.has(note.title.trim().toLowerCase())) {
        const newName = await promptRenameForDuplicate(note.title, takenList);
        if (!newName) {
          toast("Move cancelled - a note with that name already exists in the destination.");
          return false;
        }
        finalTitle = newName;
      }
    }

    const updates: Record<string, unknown> = { notebook_id: toNotebookId };
    if (finalTitle && note && finalTitle !== note.title) updates.title = finalTitle;
    const { error } = await supabase.from("notes").update(updates as any).eq("id", noteId);
    if (error) {
      toast.error("Could not move note.");
      return false;
    }
    const moved = note ? { ...note, notebook_id: toNotebookId, title: finalTitle || note.title } : null;
    if (!moved) return false;
    setAllStandaloneNotes((prev) =>
      toNotebookId === null
        ? [...prev.filter((n) => n.id !== noteId), moved]
        : prev.filter((n) => n.id !== noteId)
    );
    setAllNotebooks((prev) =>
      prev.map((n) => {
        if (n.id === fromNotebookId) return { ...n, notes: n.notes.filter((x) => x.id !== noteId) };
        if (n.id === toNotebookId) return { ...n, notes: [...n.notes.filter((x) => x.id !== noteId), moved] };
        return n;
      })
    );
    return true;
  }, [allNotebooks, allStandaloneNotes]);

  const deleteNote = useCallback(async (notebookId: string | null, noteId: string) => {
    const now = new Date().toISOString();
    const nb = notebookId ? allNotebooks.find((n) => n.id === notebookId) : null;
    const note = notebookId ? nb?.notes.find((n) => n.id === noteId) : allStandaloneNotes.find((n) => n.id === noteId);
    // Optimistically soft-delete
    setAllNotebooks((prev) =>
      prev.map((n) =>
        n.id === notebookId
          ? { ...n, notes: n.notes.map((nt) => nt.id === noteId ? { ...nt, deleted_at: now } : nt) }
          : n
      )
    );
    if (!notebookId) {
      setAllStandaloneNotes((prev) => prev.map((nt) => nt.id === noteId ? { ...nt, deleted_at: now } : nt));
    }
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
          if (!notebookId) {
            setAllStandaloneNotes((prev) => prev.map((nt) => nt.id === noteId ? { ...nt, deleted_at: null } : nt));
          }
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
  }, [activeNoteId, allNotebooks, allStandaloneNotes]);

  const updateNote = useCallback(
    async (notebookId: string | null, noteId: string, updates: NoteUpdates) => {
      // Override path: temp notes don't live in `notes` table
      if (override && noteId === override.note.id) {
        override.onUpdate(updates);
        setOverrideState((cur) => cur ? { ...cur, note: { ...cur.note, ...updates, updated_at: new Date().toISOString() } } : cur);
        return;
      }

      // Duplicate-title guard: a notebook cannot contain two notes with the same title.
      if (typeof updates.title === "string") {
        const desired = updates.title.trim();
        if (desired) {
          const notePool = notebookId
            ? allNotebooks.find((n) => n.id === notebookId)?.notes ?? []
            : allStandaloneNotes;
          const clash = notePool.some(
            (n) => !n.deleted_at && n.id !== noteId && n.title.trim().toLowerCase() === desired.toLowerCase()
          );
          if (clash) {
            const takenList = notePool
              .filter((n) => !n.deleted_at && n.id !== noteId)
              .map((n) => n.title);
            const newName = await promptRenameForDuplicate(desired, takenList);
            if (!newName) {
              // User cancelled - drop the title change so the saved title stays put.
              const { title: _drop, ...rest } = updates;
              updates = rest;
              window.dispatchEvent(new CustomEvent("lovable:note-title-revert", { detail: { noteId } }));
            } else {
              updates = { ...updates, title: newName };
            }
          } else {
            updates = { ...updates, title: desired };
          }
        }
      }

      if (Object.keys(updates).length === 0) return;

      // Offline-write queue: if the network is down, persist the change locally
      // and skip the network call. Optimistic state below still updates the UI,
      // and the queue flushes automatically when the browser comes back online.
      if (isOffline()) {
        queueNoteUpdate(noteId, updates as Record<string, unknown>);
      } else {
        const { error } = await supabase.from("notes").update(updates as any).eq("id", noteId);
        if (error) {
          // Network failure mid-flight - queue it so we don't lose the edit.
          queueNoteUpdate(noteId, updates as Record<string, unknown>);
        }
      }
      if (!notebookId) {

        setAllStandaloneNotes((prev) => prev.map((n) => n.id === noteId ? { ...n, ...updates, updated_at: new Date().toISOString() } : n));
        return;
      }
      setAllNotebooks((prev) =>
        prev.map((nb) =>
          nb.id === notebookId
            ? { ...nb, notes: nb.notes.map((n) => n.id === noteId ? { ...n, ...updates, updated_at: new Date().toISOString() } : n) }
            : nb
        )
      );
    },
    [override, allNotebooks, allStandaloneNotes]
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
  const restoreNote = useCallback(async (notebookId: string | null, noteId: string) => {
    await supabase.from("notes").update({ deleted_at: null } as any).eq("id", noteId);
    if (!notebookId) {
      setAllStandaloneNotes((prev) => prev.map((n) => n.id === noteId ? { ...n, deleted_at: null } : n));
      return;
    }
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
  const permanentlyDeleteNote = useCallback(async (notebookId: string | null, noteId: string) => {
    await supabase.from("notes").delete().eq("id", noteId);
    if (!notebookId) {
      setAllStandaloneNotes((prev) => prev.filter((n) => n.id !== noteId));
      return;
    }
    setAllNotebooks((prev) =>
      prev.map((nb) =>
        nb.id === notebookId ? { ...nb, notes: nb.notes.filter((n) => n.id !== noteId) } : nb
      )
    );
  }, []);

  return (
    <NotebookContext.Provider
      value={{
        notebooks, standaloneNotes, trashedNotebooks, trashedNotes,
        activeNotebookId: effectiveActiveNotebookId,
        activeNoteId: effectiveActiveNoteId,
        setActiveNotebookId, setActiveNoteId,
        createNotebook, deleteNotebook, updateNotebook, nestNotebook, promoteNoteToNotebook,
        ensureScratchNotebook, createScratchNote, isScratchNotebook,
        createStandaloneNote,
        moveNoteToNotebook,
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
