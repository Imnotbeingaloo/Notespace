import { motion } from "framer-motion";
import { AlertCircle, ArrowDownAZ, ArrowUpAZ, BookOpen, Clock, FileText, Loader2, Plus, RotateCcw } from "lucide-react";
import { ScratchIcon } from "@/components/ScratchIcon";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNotebooks } from "@/context/NotebookContext";

interface HomeViewProps {
  onOpenNotebook: (notebookId: string) => void;
  onCreateNotebook?: () => void;
  onCreateScratchNote?: () => void;
}

type SortKey = "newest" | "oldest" | "title";

const PAGE_SIZE = 9;

export function HomeView({ onOpenNotebook, onCreateNotebook, onCreateScratchNote }: HomeViewProps) {
  const { notebooks, loading, refreshData } = useNotebooks();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [focusedIdx, setFocusedIdx] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const lastUpdated = useCallback((nb: any) => {
    if (!nb.notes?.length) return nb.updated_at || nb.created_at;
    return nb.notes.reduce(
      (latest: string, n: any) => (new Date(n.updated_at) > new Date(latest) ? n.updated_at : latest),
      nb.notes[0].updated_at
    );
  }, []);

  const allFiltered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = !q
      ? [...notebooks]
      : notebooks.filter(
          (nb) =>
            nb.name.toLowerCase().includes(q) ||
            nb.notes.some(
              (n) => n.title.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q)
            )
        );

    filtered.sort((a, b) => {
      if (sort === "title") return a.name.localeCompare(b.name);
      const aT = new Date(lastUpdated(a)).getTime();
      const bT = new Date(lastUpdated(b)).getTime();
      return sort === "newest" ? bT - aT : aT - bT;
    });
    return filtered;
  }, [notebooks, query, sort, lastUpdated]);

  const paged = useMemo(() => allFiltered.slice(0, visible), [allFiltered, visible]);
  const hasMore = visible < allFiltered.length;

  // Reset paging on query/sort change
  useEffect(() => {
    setVisible(PAGE_SIZE);
    setFocusedIdx(0);
  }, [query, sort]);

  // Infinite scroll observer with brief loading indicator to avoid flicker
  useEffect(() => {
    if (!hasMore || !sentinelRef.current || pageError) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          setLoadingMore(true);
          window.setTimeout(() => {
            try {
              setVisible((v) => Math.min(v + PAGE_SIZE, allFiltered.length));
              setPageError(null);
            } catch (err: any) {
              setPageError(err?.message || "Couldn't load more notebooks.");
            } finally {
              setLoadingMore(false);
            }
          }, 250);
        }
      },
      { rootMargin: "200px" }
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [hasMore, allFiltered.length, loadingMore, pageError]);

  const handleRetryPage = useCallback(() => {
    setPageError(null);
    setVisible((v) => Math.min(v + PAGE_SIZE, allFiltered.length));
  }, [allFiltered.length]);

  const handleRetryFetch = useCallback(async () => {
    setRetrying(true);
    try {
      await refreshData();
    } finally {
      setRetrying(false);
    }
  }, [refreshData]);

  const totalNotes = useMemo(
    () => notebooks.reduce((acc, nb) => acc + (nb.notes?.length ?? 0), 0),
    [notebooks]
  );

  const formatDate = (d: string) =>
    new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(d));

  // Determine grid columns to compute up/down navigation step
  const getCols = () => {
    if (typeof window === "undefined") return 4;
    if (window.innerWidth >= 1280) return 4;
    if (window.innerWidth >= 640) return 3;
    return 1;
  };

  const onCardKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
      const cols = getCols();
      let next = idx;
      switch (e.key) {
        case "Enter":
        case " ":
          e.preventDefault();
          onOpenNotebook(paged[idx].id);
          return;
        case "ArrowRight":
          next = Math.min(idx + 1, paged.length - 1);
          break;
        case "ArrowLeft":
          next = Math.max(idx - 1, 0);
          break;
        case "ArrowDown":
          next = Math.min(idx + cols, paged.length - 1);
          break;
        case "ArrowUp":
          next = Math.max(idx - cols, 0);
          break;
        case "Home":
          next = 0;
          break;
        case "End":
          next = paged.length - 1;
          break;
        default:
          return;
      }
      e.preventDefault();
      setFocusedIdx(next);
      cardRefs.current[next]?.focus();
    },
    [paged, onOpenNotebook]
  );

  return (
    <div className="flex-1 overflow-y-auto bg-background" data-testid="home-view">
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

          <div className="flex flex-col sm:flex-row gap-3 mt-7 sm:items-center">
            <div className="relative flex-1 max-w-md">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search notebooks…"
                aria-label="Search notebooks"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-card/80 backdrop-blur text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
              />
            </div>

            {/* Sort tabs */}
            <div
              role="tablist"
              aria-label="Sort notebooks"
              className="inline-flex items-center gap-1 p-1 rounded-xl border border-border bg-card/80 backdrop-blur"
            >
              {(
                [
                  { key: "newest", label: "Newest", Icon: Clock },
                  { key: "oldest", label: "Oldest", Icon: ArrowUpAZ },
                  { key: "title", label: "Title", Icon: ArrowDownAZ },
                ] as { key: SortKey; label: string; Icon: typeof Clock }[]
              ).map(({ key, label, Icon }) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={sort === key}
                  onClick={() => setSort(key)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    sort === key
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {loading && notebooks.length === 0 ? (
          <div
            data-testid="home-skeleton"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            aria-busy="true"
            aria-label="Loading notebooks"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-card p-6 overflow-hidden relative"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-muted/60" />
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-muted/60 animate-pulse" />
                  <div className="h-5 w-14 rounded-full bg-muted/60 animate-pulse" />
                </div>
                <div className="h-6 w-2/3 rounded bg-muted/60 animate-pulse mb-4" />
                <div className="space-y-2 mb-4">
                  <div className="h-3 w-full rounded bg-muted/50 animate-pulse" />
                  <div className="h-3 w-5/6 rounded bg-muted/50 animate-pulse" />
                  <div className="h-3 w-3/4 rounded bg-muted/50 animate-pulse" />
                </div>
                <div className="h-3 w-1/3 rounded bg-muted/40 animate-pulse pt-3 border-t border-border/60" />
              </div>
            ))}
          </div>
        ) : paged.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <BookOpen className="h-7 w-7 text-muted-foreground" />
            </div>
            <h2 className="font-sans text-lg font-bold text-foreground mb-1">
              {query ? "No matches" : "No notebooks yet"}
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm mb-5">
              {query ? "Try a different search term." : "Create your first notebook to get started."}
            </p>
            {!query && onCreateNotebook && (
              <button
                onClick={onCreateNotebook}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Plus className="h-4 w-4" />
                Create a Notebook
              </button>
            )}
          </div>
        ) : (
          <>
            <div
              role="grid"
              aria-label="Notebooks"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {onCreateNotebook && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -4 }}
                  onClick={onCreateNotebook}
                  data-testid="home-create-notebook"
                  className="group relative text-left rounded-2xl border-2 border-dashed border-primary/30 bg-primary/[0.03] hover:border-primary/60 hover:bg-primary/[0.06] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background min-h-[180px] flex flex-col items-center justify-center gap-2 p-5"
                >
                  <div className="h-11 w-11 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                    <Plus className="h-5 w-5 text-primary" strokeWidth={2.2} />
                  </div>
                  <div className="text-center">
                    <h3 className="font-serif font-bold text-base text-foreground">Create a Notebook</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Start a new collection</p>
                  </div>
                </motion.button>
              )}
              {onCreateScratchNote && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -4 }}
                  onClick={onCreateScratchNote}
                  data-testid="home-create-scratch"
                  className="group relative text-left rounded-2xl border-2 border-dashed border-amber-500/40 bg-amber-500/[0.04] hover:border-amber-500/70 hover:bg-amber-500/[0.08] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background min-h-[180px] flex flex-col items-center justify-center gap-2 p-5"
                >
                  <div className="h-11 w-11 rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 flex items-center justify-center transition-colors text-amber-600 dark:text-amber-400">
                    <ScratchIcon className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-serif font-bold text-base text-foreground">Scratch Note</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Temporary · save before leaving</p>
                  </div>
                </motion.button>
              )}
              {paged.map((nb, idx) => {
                const noteCount = nb.notes?.length ?? 0;
                const preview = nb.notes?.slice(0, 3) ?? [];
                return (
                  <motion.button
                    key={nb.id}
                    ref={(el) => (cardRefs.current[idx] = el)}
                    role="gridcell"
                    tabIndex={focusedIdx === idx ? 0 : -1}
                    onFocus={() => setFocusedIdx(idx)}
                    onKeyDown={(e) => onCardKeyDown(e, idx)}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(idx * 0.03, 0.3), ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ y: -4 }}
                    onClick={() => onOpenNotebook(nb.id)}
                    className="group relative text-left rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/60 via-primary/40 to-primary/20 opacity-70 group-hover:opacity-100 transition-opacity" />
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="text-3xl leading-none transform group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 origin-bottom-left">
                          {nb.emoji}
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                          {noteCount} {noteCount === 1 ? "note" : "notes"}
                        </span>
                      </div>

                      <h3 className="font-serif font-bold text-base text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
                        {nb.name}
                      </h3>

                      {preview.length > 0 ? (
                        <ul className="space-y-1 mb-3">
                          {preview.map((n) => (
                            <li
                              key={n.id}
                              className="flex items-center gap-2 text-[11px] text-muted-foreground truncate"
                            >
                              <FileText className="h-3 w-3 shrink-0 opacity-60" />
                              <span className="truncate">{n.title || "Untitled"}</span>
                            </li>
                          ))}
                          {noteCount > 3 && (
                            <li className="text-[10px] text-muted-foreground/70 pl-5">
                              +{noteCount - 3} more
                            </li>
                          )}
                        </ul>
                      ) : (
                        <p className="text-[11px] text-muted-foreground italic mb-3">Empty notebook</p>
                      )}

                      <div className="text-[10px] text-muted-foreground/70 font-mono pt-2 border-t border-border/60">
                        Updated {formatDate(lastUpdated(nb))}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Infinite scroll sentinel + manual load more */}
            {hasMore && (
              <div ref={sentinelRef} className="flex justify-center mt-8" data-testid="home-pagination">
                {pageError ? (
                  <div role="alert" className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl border border-destructive/30 bg-destructive/5 text-xs text-destructive">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{pageError}</span>
                    <button
                      onClick={handleRetryPage}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity font-medium"
                    >
                      <RotateCcw className="h-3 w-3" /> Retry
                    </button>
                  </div>
                ) : loadingMore ? (
                  <div className="inline-flex items-center gap-2 text-xs text-muted-foreground" aria-live="polite">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Loading more…
                  </div>
                ) : (
                  <button
                    onClick={() => setVisible((v) => Math.min(v + PAGE_SIZE, allFiltered.length))}
                    className="px-4 py-2 rounded-xl border border-border bg-card text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  >
                    Load more ({allFiltered.length - visible} remaining)
                  </button>
                )}
              </div>
            )}

            <p className="text-center text-[11px] text-muted-foreground/60 mt-6 font-mono">
              Showing {paged.length} of {allFiltered.length}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
