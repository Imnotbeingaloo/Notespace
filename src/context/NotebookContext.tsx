import React, { createContext, useContext, useState, useCallback } from "react";

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notebook {
  id: string;
  name: string;
  emoji: string;
  notes: Note[];
  createdAt: Date;
}

interface NotebookContextType {
  notebooks: Notebook[];
  activeNotebookId: string | null;
  activeNoteId: string | null;
  setActiveNotebookId: (id: string | null) => void;
  setActiveNoteId: (id: string | null) => void;
  createNotebook: (name: string, emoji?: string) => void;
  deleteNotebook: (id: string) => void;
  createNote: (notebookId: string) => void;
  deleteNote: (notebookId: string, noteId: string) => void;
  updateNote: (notebookId: string, noteId: string, updates: Partial<Pick<Note, "title" | "content">>) => void;
  activeNotebook: Notebook | null;
  activeNote: Note | null;
}

const NotebookContext = createContext<NotebookContextType | null>(null);

const EMOJIS = ["📓", "📕", "📗", "📘", "📙", "📔", "📒", "🗂️", "💡", "🔬", "🎯", "✏️"];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

const defaultNotebooks: Notebook[] = [
  {
    id: "default-1",
    name: "Getting Started",
    emoji: "📓",
    createdAt: new Date(),
    notes: [
      {
        id: "note-1",
        title: "Welcome to Notebook",
        content: "Welcome to your new notebook app! Here you can create notebooks, organize your thoughts, and write notes.\n\nTry creating a new notebook from the sidebar, then add notes to it.\n\nFeatures:\n• Create multiple notebooks\n• Write and edit notes\n• Organize your thoughts\n• Simple, distraction-free interface",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  },
];

export function NotebookProvider({ children }: { children: React.ReactNode }) {
  const [notebooks, setNotebooks] = useState<Notebook[]>(defaultNotebooks);
  const [activeNotebookId, setActiveNotebookId] = useState<string | null>("default-1");
  const [activeNoteId, setActiveNoteId] = useState<string | null>("note-1");

  const activeNotebook = notebooks.find((n) => n.id === activeNotebookId) ?? null;
  const activeNote = activeNotebook?.notes.find((n) => n.id === activeNoteId) ?? null;

  const createNotebook = useCallback((name: string, emoji?: string) => {
    const nb: Notebook = {
      id: generateId(),
      name,
      emoji: emoji || EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      notes: [],
      createdAt: new Date(),
    };
    setNotebooks((prev) => [...prev, nb]);
    setActiveNotebookId(nb.id);
    setActiveNoteId(null);
  }, []);

  const deleteNotebook = useCallback((id: string) => {
    setNotebooks((prev) => prev.filter((n) => n.id !== id));
    setActiveNotebookId((prev) => (prev === id ? null : prev));
    setActiveNoteId(null);
  }, []);

  const createNote = useCallback((notebookId: string) => {
    const note: Note = {
      id: generateId(),
      title: "Untitled Note",
      content: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotebooks((prev) =>
      prev.map((nb) =>
        nb.id === notebookId ? { ...nb, notes: [...nb.notes, note] } : nb
      )
    );
    setActiveNoteId(note.id);
  }, []);

  const deleteNote = useCallback((notebookId: string, noteId: string) => {
    setNotebooks((prev) =>
      prev.map((nb) =>
        nb.id === notebookId
          ? { ...nb, notes: nb.notes.filter((n) => n.id !== noteId) }
          : nb
      )
    );
    setActiveNoteId((prev) => (prev === noteId ? null : prev));
  }, []);

  const updateNote = useCallback(
    (notebookId: string, noteId: string, updates: Partial<Pick<Note, "title" | "content">>) => {
      setNotebooks((prev) =>
        prev.map((nb) =>
          nb.id === notebookId
            ? {
                ...nb,
                notes: nb.notes.map((n) =>
                  n.id === noteId ? { ...n, ...updates, updatedAt: new Date() } : n
                ),
              }
            : nb
        )
      );
    },
    []
  );

  return (
    <NotebookContext.Provider
      value={{
        notebooks,
        activeNotebookId,
        activeNoteId,
        setActiveNotebookId,
        setActiveNoteId,
        createNotebook,
        deleteNotebook,
        createNote,
        deleteNote,
        updateNote,
        activeNotebook,
        activeNote,
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
