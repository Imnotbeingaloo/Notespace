import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

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
  created_at: string;
  updated_at: string;
}

export interface Notebook {
  id: string;
  name: string;
  emoji: string;
  notes: Note[];
  created_at: string;
}

interface NotebookContextType {
  notebooks: Notebook[];
  activeNotebookId: string | null;
  activeNoteId: string | null;
  setActiveNotebookId: (id: string | null) => void;
  setActiveNoteId: (id: string | null) => void;
  createNotebook: (name: string, emoji?: string) => Promise<void>;
  deleteNotebook: (id: string) => Promise<void>;
  updateNotebook: (id: string, updates: { name?: string; emoji?: string }) => Promise<void>;
  createNote: (notebookId: string) => Promise<void>;
  deleteNote: (notebookId: string, noteId: string) => Promise<void>;
  updateNote: (notebookId: string, noteId: string, updates: Partial<Pick<Note, "title" | "content" | "attachments">>) => Promise<void>;
  activeNotebook: Notebook | null;
  activeNote: Note | null;
  loading: boolean;
}

const NotebookContext = createContext<NotebookContextType | null>(null);

const EMOJIS = ["📓", "📕", "📗", "📘", "📙", "📔", "📒", "🗂️", "💡", "🔬", "🎯", "✏️"];

export function NotebookProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [activeNotebookId, setActiveNotebookId] = useState<string | null>(null);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const activeNotebook = notebooks.find((n) => n.id === activeNotebookId) ?? null;
  const activeNote = activeNotebook?.notes.find((n) => n.id === activeNoteId) ?? null;

  // Fetch notebooks and notes
  const fetchData = useCallback(async () => {
    if (!user) { setNotebooks([]); setLoading(false); return; }
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
      })),
    }));

    setNotebooks(merged);
    if (!activeNotebookId && merged.length > 0) {
      setActiveNotebookId(merged[0].id);
      if (merged[0].notes.length > 0) setActiveNoteId(merged[0].notes[0].id);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const createNotebook = useCallback(async (name: string, emoji?: string) => {
    if (!user) return;
    const e = emoji || EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    const { data } = await supabase
      .from("notebooks")
      .insert({ name, emoji: e, user_id: user.id })
      .select()
      .single();
    if (data) {
      const nb: Notebook = { ...data, notes: [] };
      setNotebooks((prev) => [...prev, nb]);
      setActiveNotebookId(data.id);
      setActiveNoteId(null);
    }
  }, [user]);

  const deleteNotebook = useCallback(async (id: string) => {
    await supabase.from("notebooks").delete().eq("id", id);
    setNotebooks((prev) => prev.filter((n) => n.id !== id));
    if (activeNotebookId === id) { setActiveNotebookId(null); setActiveNoteId(null); }
  }, [activeNotebookId]);

  const createNote = useCallback(async (notebookId: string) => {
    if (!user) return;
    const { data } = await supabase
      .from("notes")
      .insert({ notebook_id: notebookId, user_id: user.id, title: "Untitled Note", content: "" })
      .select()
      .single();
    if (data) {
      const note: Note = { ...data, attachments: (data.attachments as unknown as Attachment[]) || [] };
      setNotebooks((prev) =>
        prev.map((nb) => nb.id === notebookId ? { ...nb, notes: [...nb.notes, note] } : nb)
      );
      setActiveNoteId(data.id);
    }
  }, [user]);

  const deleteNote = useCallback(async (notebookId: string, noteId: string) => {
    await supabase.from("notes").delete().eq("id", noteId);
    setNotebooks((prev) =>
      prev.map((nb) =>
        nb.id === notebookId ? { ...nb, notes: nb.notes.filter((n) => n.id !== noteId) } : nb
      )
    );
    if (activeNoteId === noteId) setActiveNoteId(null);
  }, [activeNoteId]);

  const updateNote = useCallback(
    async (notebookId: string, noteId: string, updates: Partial<Pick<Note, "title" | "content" | "attachments">>) => {
      await supabase.from("notes").update(updates as any).eq("id", noteId);
      setNotebooks((prev) =>
        prev.map((nb) =>
          nb.id === notebookId
            ? { ...nb, notes: nb.notes.map((n) => n.id === noteId ? { ...n, ...updates, updated_at: new Date().toISOString() } : n) }
            : nb
        )
      );
    },
    []
  );

  return (
    <NotebookContext.Provider
      value={{
        notebooks, activeNotebookId, activeNoteId,
        setActiveNotebookId, setActiveNoteId,
        createNotebook, deleteNotebook, createNote, deleteNote, updateNote,
        activeNotebook, activeNote, loading,
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
