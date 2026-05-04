import { motion } from "framer-motion";
import { ArrowUpRight, FileText, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useNotebooks } from "@/context/NotebookContext";

interface HomeViewProps {
  onOpenNote: (notebookId: string, noteId: string) => void;
}

export function HomeView({ onOpenNote }: HomeViewProps) {
  const { notebooks } = useNotebooks();
  const [query, setQuery] = useState("");

  const allNotes = useMemo(() => {
    const items = notebooks.flatMap((nb) =>
      nb.notes.map((n) => ({
        notebookId: nb.id,
        notebookName: nb.name,
        notebookEmoji: nb.emoji,
        id: n.id,
        title: n.title,
        content: n.content,
        updated_at: n.updated_at,
      }))
    );
    items.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    return items;
  }, [notebooks]);

  const filtered = useMemo(() => {
    if (!query.trim()) return allNotes;
    const q = query.toLowerCase();
    return allNotes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.notebookName.toLowerCase().includes(q)
    );
  }, [allNotes, query]);

  const formatDate = (d: string) =>
    new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(d));

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row mb-6 sm:mb-8">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Home</p>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">All Documents</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {allNotes.length} {allNotes.length === 1 ? "note" : "notes"} across {notebooks.length}{" "}
              {notebooks.length === 1 ? "notebook" : "notebooks"}
            </p>
          </div>
          <Link
            to="/"
            className="magnetic-btn shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Visit Website
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your documents..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>

        {/* Notes Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <FileText className="h-7 w-7 text-muted-foreground" />
            </div>
            <h2 className="font-sans text-lg font-bold text-foreground mb-1">
              {query ? "No matches" : "No documents yet"}
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              {query ? "Try a different search term." : "Create a notebook in the sidebar to get started."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((note, idx) => (
              <motion.button
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(idx * 0.02, 0.3) }}
                onClick={() => onOpenNote(note.notebookId, note.id)}
                className="group text-left rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <span>{note.notebookEmoji}</span>
                  <span className="truncate">{note.notebookName}</span>
                </div>
                <h3 className="font-sans font-bold text-base text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                  {note.title || "Untitled"}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-3 mb-3 min-h-[3rem]">
                  {note.content?.replace(/[#*`>\-]/g, "").trim().slice(0, 160) || "Empty note"}
                </p>
                <div className="text-[11px] text-muted-foreground/80 font-mono">
                  {formatDate(note.updated_at)}
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
