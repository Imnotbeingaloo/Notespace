import { motion } from "framer-motion";
import { BookOpen, FileText } from "lucide-react";
import { useMemo, useState } from "react";
import { useNotebooks } from "@/context/NotebookContext";

interface HomeViewProps {
  onOpenNotebook: (notebookId: string) => void;
}

export function HomeView({ onOpenNotebook }: HomeViewProps) {
  const { notebooks } = useNotebooks();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return notebooks;
    const q = query.toLowerCase();
    return notebooks.filter(
      (nb) =>
        nb.name.toLowerCase().includes(q) ||
        nb.notes.some((n) => n.title.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q))
    );
  }, [notebooks, query]);

  const totalNotes = useMemo(
    () => notebooks.reduce((acc, nb) => acc + (nb.notes?.length ?? 0), 0),
    [notebooks]
  );

  const formatDate = (d: string) =>
    new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(d));

  const lastUpdated = (nb: any) => {
    if (!nb.notes?.length) return nb.updated_at || nb.created_at;
    return nb.notes.reduce((latest: string, n: any) => (new Date(n.updated_at) > new Date(latest) ? n.updated_at : latest), nb.notes[0].updated_at);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      {/* Hero */}
      <div className="relative border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-primary/[0.04] pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
          <p className="text-[11px] uppercase tracking-[0.25em] text-primary/80 font-mono mb-3">
            ◆ Your Library
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-foreground tracking-tight">
            Welcome back.
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-3 max-w-xl">
            {notebooks.length} {notebooks.length === 1 ? "notebook" : "notebooks"} · {totalNotes}{" "}
            {totalNotes === 1 ? "note" : "notes"}. Pick one up where you left off.
          </p>

          <div className="relative mt-7 max-w-md">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notebooks…"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-card/80 backdrop-blur text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <BookOpen className="h-7 w-7 text-muted-foreground" />
            </div>
            <h2 className="font-sans text-lg font-bold text-foreground mb-1">
              {query ? "No matches" : "No notebooks yet"}
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              {query ? "Try a different search term." : "Create a notebook in the sidebar to get started."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((nb, idx) => {
              const noteCount = nb.notes?.length ?? 0;
              const preview = nb.notes?.slice(0, 3) ?? [];
              return (
                <motion.button
                  key={nb.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.4), ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -4 }}
                  onClick={() => onOpenNotebook(nb.id)}
                  className="group relative text-left rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                >
                  {/* Book spine accent */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/60 via-primary/40 to-primary/20 opacity-70 group-hover:opacity-100 transition-opacity" />

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="text-4xl leading-none transform group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 origin-bottom-left">
                        {nb.emoji}
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                        {noteCount} {noteCount === 1 ? "note" : "notes"}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-xl text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-1">
                      {nb.name}
                    </h3>

                    {preview.length > 0 ? (
                      <ul className="space-y-1.5 mb-4">
                        {preview.map((n) => (
                          <li
                            key={n.id}
                            className="flex items-center gap-2 text-xs text-muted-foreground truncate"
                          >
                            <FileText className="h-3 w-3 shrink-0 opacity-60" />
                            <span className="truncate">{n.title || "Untitled"}</span>
                          </li>
                        ))}
                        {noteCount > 3 && (
                          <li className="text-[11px] text-muted-foreground/70 pl-5">
                            +{noteCount - 3} more
                          </li>
                        )}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground italic mb-4">Empty notebook</p>
                    )}

                    <div className="text-[11px] text-muted-foreground/70 font-mono pt-3 border-t border-border/60">
                      Updated {formatDate(lastUpdated(nb))}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
