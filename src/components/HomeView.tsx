import { motion } from "framer-motion";
import { AlertCircle, ArrowDownAZ, ArrowUpAZ, BookOpen, ChevronDown, Clock, FileText, Loader2, Plus, RotateCcw, StickyNote, Trash2, Upload } from "lucide-react";
import { ScratchIcon } from "@/components/ScratchIcon";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNotebooks } from "@/context/NotebookContext";
import { HomeHeaderMenu } from "@/components/HomeHeaderMenu";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProfile } from "@/hooks/use-profile";
import { NamePromptDialog } from "@/components/NamePromptDialog";
import { WelcomeBackDialog } from "@/components/WelcomeBackDialog";
import { useTempNotesEnabled } from "@/hooks/use-temp-notes-enabled";

interface HomeViewProps {
  onOpenNotebook: (notebookId: string) => void;
  onOpenNote?: (notebookId: string | null, noteId: string) => void;
  onCreateNotebook?: () => void;
  onCreateNotebookDirect?: () => void;
  onCreateNoteDirect?: () => void;
  onCreateScratchNote?: () => void;
  onCreateSimpleNote?: () => void;
  onExitToWebsite?: () => void;
  onOpenSidebar?: () => void;
}

type SortKey = "newest" | "oldest" | "title";
type LibraryItem =
  | { kind: "notebook"; id: string; notebook: any }
  | { kind: "note"; id: string; notebookId: string | null; note: any; deleteNotebookId?: string };

const looksLikeStandaloneNoteWrapper = (nb: any) => {
  const onlyNote = nb.notes?.length === 1 ? nb.notes[0] : null;
  return !nb.parent_id && !!onlyNote && onlyNote.title?.trim().toLowerCase() === nb.name?.trim().toLowerCase();
};

const PAGE_SIZE = 9;

export function HomeView({ onOpenNotebook, onOpenNote, onCreateNotebook, onCreateNotebookDirect, onCreateNoteDirect, onCreateScratchNote, onCreateSimpleNote, onExitToWebsite, onOpenSidebar }: HomeViewProps) {
  const { notebooks, standaloneNotes, trashedNotebooks, trashedNotes, deleteNotebook, deleteNote, loading, refreshData } = useNotebooks();
  const [tempEnabled] = useTempNotesEnabled();
  const { profile, loading: profileLoading } = useProfile();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [focusedIdx, setFocusedIdx] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<null | { kind: "notebook"; id: string; name: string } | { kind: "note"; notebookId: string | null; noteId: string; name: string; deleteNotebookId?: string }>(null);
  const [namePromptOpen, setNamePromptOpen] = useState(false);
  const [welcomeBackOpen, setWelcomeBackOpen] = useState(false);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const homeUploadInputRef = useRef<HTMLInputElement>(null);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const trashCount = trashedNotebooks.length + trashedNotes.length;

  // Fire "welcome back" immediately on home arrival when the login flag is set,
  // without waiting for the profile to finish loading (avoids the visible delay).
  useEffect(() => {
    try {
      const variant = sessionStorage.getItem("welcomeVariant");
      const shown = sessionStorage.getItem("welcomeShown");
      if (variant === "returning" && !shown) {
        sessionStorage.setItem("welcomeShown", "1");
        setWelcomeBackOpen(true);
      }
    } catch {}
  }, []);

  const location = useLocation();
  const onHomeRoute = location.pathname === "/home";

  // Name prompt only fires for brand-new signups (flag set in Auth.tsx), and only on /home.
  useEffect(() => {
    if (!onHomeRoute) return;
    if (profileLoading) return;
    if (profile?.display_name) {
      setNamePromptOpen(false);
      try { localStorage.removeItem("pendingNamePrompt"); } catch {}
      return;
    }
    let pending = false;
    try { pending = localStorage.getItem("pendingNamePrompt") === "1"; } catch {}
    if (pending) setNamePromptOpen(true);
  }, [profile?.display_name, profileLoading, onHomeRoute]);

  const handleNamePromptChange = (open: boolean) => {
    if (!open) {
      try { localStorage.removeItem("pendingNamePrompt"); } catch {}
    }
    setNamePromptOpen(open);
  };





  const lastUpdated = useCallback((nb: any) => {
    if (!nb.notes?.length) return nb.updated_at || nb.created_at;
    return nb.notes.reduce(
      (latest: string, n: any) => (new Date(n.updated_at) > new Date(latest) ? n.updated_at : latest),
      nb.notes[0].updated_at
    );
  }, []);

  const allFiltered = useMemo<LibraryItem[]>(() => {
    const q = query.trim().toLowerCase();
    const items: LibraryItem[] = standaloneNotes.map((note) => ({ kind: "note", id: note.id, notebookId: null, note }));
    notebooks.forEach((nb) => {
      if (looksLikeStandaloneNoteWrapper(nb)) {
        items.push({ kind: "note", id: nb.notes[0].id, notebookId: nb.id, note: { ...nb.notes[0], emoji: nb.notes[0].emoji || nb.emoji }, deleteNotebookId: nb.id });
      } else {
        items.push({ kind: "notebook", id: nb.id, notebook: nb });
      }
    });

    const filtered = !q
      ? items
      : items.filter((item) => {
          if (item.kind === "note") {
            return item.note.title.toLowerCase().includes(q) || item.note.content?.toLowerCase().includes(q);
          }
          const nb = item.notebook;
          return nb.name.toLowerCase().includes(q) || nb.notes.some((n: any) => n.title.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q));
        });

    filtered.sort((a, b) => {
      const aTitle = a.kind === "note" ? a.note.title : a.notebook.name;
      const bTitle = b.kind === "note" ? b.note.title : b.notebook.name;
      if (sort === "title") return aTitle.localeCompare(bTitle);
      const aT = new Date(a.kind === "note" ? a.note.updated_at : lastUpdated(a.notebook)).getTime();
      const bT = new Date(b.kind === "note" ? b.note.updated_at : lastUpdated(b.notebook)).getTime();
      return sort === "newest" ? bT - aT : aT - bT;
    });
    return filtered;
  }, [notebooks, standaloneNotes, query, sort, lastUpdated]);

  const paged = useMemo(() => allFiltered.slice(0, visible), [allFiltered, visible]);
  const hasMore = visible < allFiltered.length;

  useEffect(() => {
    setVisible(PAGE_SIZE);
    setFocusedIdx(0);
  }, [query, sort]);

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

  const totalNotes = useMemo(
    () => notebooks.reduce((acc, nb) => acc + (nb.notes?.length ?? 0), 0),
    [notebooks]
  );

  const formatDate = (d: string) =>
    new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(d));

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
          const item = paged[idx];
          if (item.kind === "note") onOpenNote?.(item.notebookId, item.note.id);
          else onOpenNotebook(item.notebook.id);
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
      {/* Home top bar (chrome) */}
      <TooltipProvider delayDuration={150}>
        <header className="sticky top-0 z-20 backdrop-blur bg-background/85 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1 min-w-0">
              {onOpenSidebar && (
                <button
                  type="button"
                  onClick={onOpenSidebar}
                  aria-label="Open sidebar"
                  className="md:hidden mr-1 inline-flex items-center justify-center h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                </button>
              )}
              <button
                type="button"
                onClick={() => onExitToWebsite?.()}
                className="flex items-center gap-2 min-w-0 group"
                title="Back to website"
              >
              <img src="/logo.png" alt="Notespace" className="h-[1.4rem] w-[1.4rem] sm:h-[1.6rem] sm:w-[1.6rem] object-contain flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />
                <span className="font-serif font-bold text-foreground text-base sm:text-lg whitespace-nowrap group-hover:text-primary transition-colors">
                  Notespace
                </span>
              </button>
            </div>


            <div className="flex items-center gap-1">
              <HomeHeaderMenu trashCount={trashCount} />
            </div>
          </div>
        </header>
      </TooltipProvider>

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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 py-[1.65rem] sm:py-[2.2rem] flex items-center justify-between gap-8">
          <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.25em] text-primary/80 font-mono mb-2">
            ◆ Your Library
          </p>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-foreground tracking-tight break-words">
            {profile?.display_name ? `Welcome back, ${profile.display_name}.` : "Welcome back."}
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            {notebooks.length} {notebooks.length === 1 ? "notebook" : "notebooks"} · {totalNotes}{" "}
            {totalNotes === 1 ? "note" : "notes"}. Pick one up where you left off.
          </p>


          {/* Quick actions row - separated from the notebook grid */}
          <div className="flex flex-wrap items-center gap-2 mt-6">
            {(onCreateNotebookDirect || onCreateNoteDirect || onCreateNotebook) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    data-testid="home-create"
                    className="inline-flex w-auto items-center justify-center gap-2.5 px-[1.35rem] py-[0.8rem] rounded-xl bg-primary text-primary-foreground text-[0.95rem] font-medium shadow-sm hover:opacity-90 transition-all duration-150 active:scale-[0.97]"
                  >
                    <Plus className="h-[1.15rem] w-[1.15rem]" />
                    Create
                    <ChevronDown className="h-4 w-4 opacity-80" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[var(--radix-dropdown-menu-trigger-width)]">

                  <DropdownMenuItem
                    onSelect={() => (onCreateNoteDirect ?? onCreateNotebook)?.()}
                    className="gap-2 cursor-pointer focus:bg-primary/10 focus:text-primary hover:bg-primary/10 hover:text-primary"
                  >
                    <FileText className="h-4 w-4 text-primary" />
                    <span>Note</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => (onCreateNotebookDirect ?? onCreateNotebook)?.()}
                    className="gap-2 cursor-pointer focus:bg-primary/10 focus:text-primary hover:bg-primary/10 hover:text-primary"
                  >
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span>Notebook</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {tempEnabled && onCreateScratchNote ? (
              <button
                onClick={onCreateScratchNote}
                data-testid="home-create-temporary"
                title="Open a temporary workspace - auto-deletes after 24h."
                className="group inline-flex min-w-[8rem] sm:min-w-[10.5rem] items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl border border-amber-500/40 bg-amber-500/[0.07] text-amber-600 dark:text-amber-400 text-sm font-medium hover:bg-amber-500/[0.13] transition-all duration-150 active:scale-[0.97]"
              >
                <ScratchIcon className="h-4 w-4 transition-transform duration-200 group-hover:rotate-[-3deg]" />
                <span className="sm:hidden">Temp Note</span>
                <span className="hidden sm:inline">Temporary Note</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => homeUploadInputRef.current?.click()}
                  data-testid="home-upload"
                  title="Upload a file (PDF, EPUB, DOCX, TXT, MD, CSV, JSON, images - up to 1 GB)."
                  className="inline-flex min-w-[8rem] sm:min-w-[10.5rem] items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl border border-primary/30 bg-primary/[0.06] text-primary text-sm font-medium hover:bg-primary/[0.12] transition-all duration-150 active:scale-[0.97]"
                >
                  <Upload className="h-4 w-4" />
                  <span className="sm:hidden">Upload</span>
                  <span className="hidden sm:inline">Upload a file</span>
                </button>
                <input
                  ref={homeUploadInputRef}
                  type="file"
                  className="hidden"
                  accept=".png,.jpg,.jpeg,.gif,.webp,.pdf,.epub,.txt,.md,.markdown,.csv,.json,.doc,.docx,.xls,.xlsx,.mp4,.mov,.webm,image/*,video/mp4,video/quicktime,video/webm,application/pdf,application/epub+zip,text/plain,text/markdown,text/csv,application/json,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      window.dispatchEvent(new CustomEvent("na:home-upload-file", { detail: file }));
                    }
                    if (homeUploadInputRef.current) homeUploadInputRef.current.value = "";
                  }}
                />
              </>
            )}
          </div>


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

            <div
              role="tablist"
              aria-label="Sort notebooks"
              className="flex w-full sm:inline-flex sm:w-auto items-center gap-1 p-1 rounded-xl border border-border bg-card/80 backdrop-blur"
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
                  className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
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

          <div className="hidden lg:block flex-shrink-0">
            <HeroNotebookStack />
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
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
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card/80 text-muted-foreground text-sm font-medium hover:text-foreground hover:bg-muted transition-colors"
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
              {paged.map((item, idx) => {
                const isNote = item.kind === "note";
                const nb = isNote ? null : item.notebook;
                const note = isNote ? item.note : null;
                const noteCount = isNote ? 1 : nb.notes?.length ?? 0;
                const preview = isNote ? [] : nb.notes?.slice(0, 3) ?? [];
                const title = isNote ? note.title : nb.name;
                const emoji = isNote ? note.emoji || "📝" : nb.emoji;
                const updatedAt = isNote ? note.updated_at : lastUpdated(nb);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(idx * 0.03, 0.3), ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ y: -4 }}
                    className="group relative rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                  >
                    {/* Delete button (hover-revealed) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingDelete(
                          isNote
                            ? { kind: "note", notebookId: item.notebookId, noteId: note.id, name: title, deleteNotebookId: item.deleteNotebookId }
                            : { kind: "notebook", id: nb.id, name: title }
                        );
                      }}
                      className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-lg bg-background/80 backdrop-blur text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-all"
                      aria-label={`Delete ${title}`}
                      title="Move to Trash"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      ref={(el) => (cardRefs.current[idx] = el)}
                      role="gridcell"
                      tabIndex={focusedIdx === idx ? 0 : -1}
                      onFocus={() => setFocusedIdx(idx)}
                      onKeyDown={(e) => onCardKeyDown(e, idx)}
                      onClick={() => {
                        if (isNote) onOpenNote?.(item.notebookId, note.id);
                        else onOpenNotebook(nb.id);
                      }}
                      className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-2xl"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/60 via-primary/40 to-primary/20 opacity-70 group-hover:opacity-100 transition-opacity" />
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="text-3xl leading-none transform group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 origin-bottom-left">
                            {emoji}
                          </div>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                            {isNote ? "note" : `${noteCount} ${noteCount === 1 ? "note" : "notes"}`}
                          </span>
                        </div>

                        <h3 className="font-serif font-bold text-base text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
                          {title}
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
                          Updated {formatDate(updatedAt)}
                        </div>
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </div>

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

            <p className="text-center text-xs text-muted-foreground mt-6 font-mono">
              Showing {paged.length} of {allFiltered.length}
            </p>
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title="Move to Trash?"
        description={pendingDelete ? (pendingDelete.kind === "note" ? `"${pendingDelete.name}" will be moved to Trash. You can restore it later.` : `"${pendingDelete.name}" and all its notes will be moved to Trash. You can restore them later.`) : ""}
        confirmLabel="Move to Trash"
        onConfirm={async () => {
          if (pendingDelete) {
            if (pendingDelete.kind === "note") {
              if (pendingDelete.deleteNotebookId) await deleteNotebook(pendingDelete.deleteNotebookId);
              else await deleteNote(pendingDelete.notebookId, pendingDelete.noteId);
            }
            else await deleteNotebook(pendingDelete.id);
            setPendingDelete(null);
          }
        }}
      />

      <NamePromptDialog open={namePromptOpen} onOpenChange={handleNamePromptChange} />
      <WelcomeBackDialog
        name={profile?.display_name ?? ""}
        open={welcomeBackOpen}
        onOpenChange={setWelcomeBackOpen}
      />

    </div>
  );
}
