import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, BookOpen, Trash2, ChevronRight, ChevronDown, Menu, FileText, NotebookPen, LogOut, Upload, Home, Pencil, Search as SearchIcon, RotateCcw, Tag, CalendarDays, X, Settings } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import { SettingsDialog } from "@/components/SettingsDialog";
import { ScratchIcon } from "@/components/ScratchIcon";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday, isTomorrow, addDays, isSameDay } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { validateFile, buildStoragePath } from "@/lib/file-validation";
import { SearchDialog } from "@/components/SearchDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNotebooks } from "@/context/NotebookContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CreateNotebookDialog } from "@/components/CreateNotebookDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SidebarUploadDialog } from "@/components/SidebarUploadDialog";
import { useTempNotesEnabled } from "@/hooks/use-temp-notes-enabled";

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onSelectNote?: () => void;
  onOpenPlanner?: () => void;
  onOpenHome?: () => void;
  /** Open the full upload/blank/template chooser instead of immediately creating a blank note. */
  onRequestNewNote?: () => void;
}

export function AppSidebar({ collapsed, onToggle, onSelectNote, onOpenPlanner, onOpenHome, onRequestNewNote }: AppSidebarProps) {
  const { signOut, user } = useAuth();
  const { profile } = useProfile();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tempNotesEnabled] = useTempNotesEnabled();
  const {
    notebooks,
    standaloneNotes,
    trashedNotebooks,
    trashedNotes,
    activeNotebookId,
    activeNoteId,
    setActiveNotebookId,
    setActiveNoteId,
    createNotebook,
    deleteNotebook,
    updateNotebook,
    nestNotebook,
    promoteNoteToNotebook,
    moveNoteToNotebook,
    createNote,
    deleteNote,
    updateNote,
    reorderNotes,
    restoreNotebook,
    restoreNote,
    permanentlyDeleteNotebook,
    permanentlyDeleteNote,
    refreshData,
    createScratchNote,
    createStandaloneNote,
  } = useNotebooks();

  // Top-level vs nested notebooks
  const topLevelNotebooks = useMemo(() => notebooks.filter((nb) => !nb.parent_id), [notebooks]);
  const childrenByParent = useMemo(() => {
    const map = new Map<string, typeof notebooks>();
    notebooks.forEach((nb) => {
      if (nb.parent_id) {
        const arr = map.get(nb.parent_id) || [];
        arr.push(nb);
        map.set(nb.parent_id, arr);
      }
    });
    return map;
  }, [notebooks]);

  const EMOJIS = ["📓", "📕", "📗", "📘", "📙", "📔", "📒", "🗂️", "💡", "🔬", "🎯", "✏️"];
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [pendingNestChild, setPendingNestChild] = useState<{ childId: string; parentId: string } | null>(null);
  const [draggedNotebookId, setDraggedNotebookId] = useState<string | null>(null);
  const [dragOverNotebookId, setDragOverNotebookId] = useState<string | null>(null);
  const [expandedNotebook, setExpandedNotebook] = useState<string | null>(activeNotebookId);
  const sidebarUploadRef = useRef<HTMLInputElement>(null);
  const [pendingUploadFile, setPendingUploadFile] = useState<File | null>(null);
  const [sidebarUploadProcessing, setSidebarUploadProcessing] = useState(false);

  const [editingNotebook, setEditingNotebook] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmoji, setEditEmoji] = useState("");
  const [quickNote, setQuickNote] = useState("");

  // Smart Tags
  const [tagsOpen, setTagsOpen] = useState(false);
  const [activeFilterTag, setActiveFilterTag] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState("");
  const [showAddTag, setShowAddTag] = useState(false);

  // Study Schedule
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notebooks.forEach((nb) => {
      nb.notes?.forEach((note) => {
        if (note.tags && Array.isArray(note.tags)) {
          note.tags.forEach((t: string) => tagSet.add(t));
        }
      });
    });
    return Array.from(tagSet).sort();
  }, [notebooks]);

  // Notes matching the active filter tag
  const filteredByTag = useMemo(() => {
    if (!activeFilterTag) return [];
    const results: { notebookId: string; notebookName: string; notebookEmoji: string; noteId: string; noteTitle: string }[] = [];
    notebooks.forEach((nb) => {
      nb.notes?.forEach((note) => {
        if (note.tags?.includes(activeFilterTag)) {
          results.push({ notebookId: nb.id, notebookName: nb.name, notebookEmoji: nb.emoji, noteId: note.id, noteTitle: note.title });
        }
      });
    });
    return results;
  }, [activeFilterTag, notebooks]);

  const handleAddGlobalTag = async () => {
    const tag = newTagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!tag || !activeNoteId || !activeNotebookId) return;
    const nb = notebooks.find((n) => n.id === activeNotebookId);
    const note = nb?.notes.find((n) => n.id === activeNoteId);
    if (!note) return;
    const currentTags = note.tags || [];
    if (currentTags.includes(tag)) { setNewTagInput(""); return; }
    await supabase.from("notes").update({ tags: [...currentTags, tag] }).eq("id", activeNoteId);
    // Update local state via context
    await updateNote(activeNotebookId, activeNoteId, { } as any);
    setNewTagInput("");
    setShowAddTag(false);
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    // Update local state immediately, then persist to DB
    for (const nb of notebooks) {
      for (const note of (nb.notes || [])) {
        if (note.tags?.includes(tagToRemove)) {
          const newTags = note.tags.filter((t) => t !== tagToRemove);
          updateNote(nb.id, note.id, { tags: newTags });
        }
      }
    }
    if (activeFilterTag === tagToRemove) setActiveFilterTag(null);
  };

  // Study plans - fetch upcoming and subscribe to changes
  const [upcomingPlans, setUpcomingPlans] = useState<{ id: string; title: string; scheduled_date: string; scheduled_time: string | null; completed: boolean; notebook_id: string | null }[]>([]);
  
  const fetchUpcomingPlans = useCallback(async () => {
    if (!user) return;
    const today = format(new Date(), "yyyy-MM-dd");
    const threeDaysOut = format(addDays(new Date(), 2), "yyyy-MM-dd");
    const { data } = await supabase
      .from("study_plans" as any)
      .select("id, title, scheduled_date, scheduled_time, completed, notebook_id")
      .eq("user_id", user.id)
      .eq("completed", false)
      .gte("scheduled_date", today)
      .lte("scheduled_date", threeDaysOut)
      .order("scheduled_date", { ascending: true })
      .limit(8);
    setUpcomingPlans((data as any) ?? []);
  }, [user]);

  useEffect(() => {
    fetchUpcomingPlans();
    // Poll periodically as backup
    const interval = setInterval(fetchUpcomingPlans, 30000);
    // Instant refresh on local changes from StudyPlanner
    const handler = () => fetchUpcomingPlans();
    window.addEventListener("study-plans-changed", handler);
    return () => {
      clearInterval(interval);
      window.removeEventListener("study-plans-changed", handler);
    };
  }, [fetchUpcomingPlans]);

  const getDayLabel = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    if (isToday(d)) return "Today";
    if (isTomorrow(d)) return "Tomorrow";
    return format(d, "EEE");
  };

  const getDayColor = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    if (isToday(d)) return "bg-primary";
    if (isTomorrow(d)) return "bg-amber-500";
    return "bg-muted-foreground/40";
  };

  const [dragNoteId, setDragNoteId] = useState<string | null>(null);
  const [dragNoteFromNb, setDragNoteFromNb] = useState<string | null>(null);
  const [dragOverNoteId, setDragOverNoteId] = useState<string | null>(null);
  const [noteDropTargetNb, setNoteDropTargetNb] = useState<string | null>(null);
  const [promoteDropActive, setPromoteDropActive] = useState(false);
  const [pendingMoveNote, setPendingMoveNote] = useState<null | { noteId: string; fromNbId: string | null; toNbId: string; noteTitle: string; toNbName: string }>(null);
  const [pendingPromoteNote, setPendingPromoteNote] = useState<null | { noteId: string; fromNbId: string; title: string }>(null);
  const [pendingSimpleMove, setPendingSimpleMove] = useState<null | { noteId: string; fromNbId: string | null; title: string }>(null);
  const [simpleDropActive, setSimpleDropActive] = useState(false);
  const [trashExpanded, setTrashExpanded] = useState(false);

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmDesc, setConfirmDesc] = useState("");
  const [confirmLabel, setConfirmLabel] = useState("Delete");
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});

  const showConfirm = (title: string, desc: string, action: () => void, label = "Delete") => {
    setConfirmTitle(title);
    setConfirmDesc(desc);
    setConfirmLabel(label);
    setConfirmAction(() => action);
    setConfirmOpen(true);
  };

  const AI_TOOLS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tools`;

  const handleQuickNote = async () => {
    if (!quickNote.trim() || !activeNotebookId) return;
    await createNote(activeNotebookId);
    const nb = notebooks.find(n => n.id === activeNotebookId);
    if (nb && nb.notes.length > 0) {
      const lastNote = nb.notes[nb.notes.length - 1];
      await updateNote(activeNotebookId, lastNote.id, { content: quickNote.trim(), title: quickNote.trim().slice(0, 40) });
    }
    setQuickNote("");
  };




  // Sidebar upload: open the destination chooser dialog with the picked file.
  const handleSidebarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setPendingUploadFile(file);
    // Allow the user to pick the same file again later.
    if (sidebarUploadRef.current) sidebarUploadRef.current.value = "";
  };



  // (Inline create form removed; we now use the CreateNotebookDialog modal.)

  const toggleExpand = (id: string) => {
    setExpandedNotebook((prev) => (prev === id ? null : id));
    setActiveNotebookId(id);
  };

  const trashCount = trashedNotebooks.length + trashedNotes.length;

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 280 }}
      transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
      className="h-screen bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden flex-shrink-0 w-[280px] max-w-[85vw] scrollbar-thin"
    >
      {/* Header - collapsed state matches the editor topbar height (48px + 1px border)
          so the horizontal divider continues flush across the entire app width. */}
      <div
        className={
          collapsed
            ? "flex items-center justify-center h-12 px-1 border-b border-sidebar-border"
            : "flex items-center justify-between p-3 border-b border-sidebar-border"
        }
      >
        <AnimatePresence initial={false} mode="wait">
          {!collapsed ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              className="flex items-center gap-2 min-w-0"
            >
              <img
                src="/logo.png"
                alt="Notebook Archive"
                className="h-[1.05rem] w-[1.05rem] sm:h-[1.2rem] sm:w-[1.2rem] object-contain flex-shrink-0"
              />
              <span className="font-serif font-bold text-foreground text-base whitespace-nowrap">Notebook Archive</span>
              <button
                type="button"
                onClick={() => onOpenHome?.()}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ml-1"
                title="Home - All documents"
              >
                <Home className="h-4 w-4" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed-logo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            >
              <button
                onClick={onToggle}
                aria-label="Open sidebar"
                className="group relative h-10 w-10 rounded-xl hover:bg-muted transition-all duration-200 flex items-center justify-center overflow-hidden"
              >
                <img
                  src="/logo.png"
                  alt="Notebook Archive"
                  className="absolute h-[1.425rem] w-[1.425rem] sm:h-[1.6625rem] sm:w-[1.6625rem] object-contain transition-all duration-300 group-hover:opacity-0 group-hover:scale-75 group-hover:rotate-[-8deg]"
                />
                <Menu className="absolute h-5 w-5 text-foreground opacity-0 scale-75 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        {!collapsed && (
          <button
            onClick={onToggle}
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
            className="p-1.5 rounded-md notebook-hover text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}
      </div>


      {!collapsed && (
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          {/* Search */}
          <div className="mb-1.5">
            <SearchDialog />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-0.5 mb-2">
            <button
              onClick={() => !sidebarUploadProcessing && sidebarUploadRef.current?.click()}
              disabled={sidebarUploadProcessing}
              title="Upload a file (PDF, EPUB, DOCX, TXT, MD, CSV, JSON, images - up to 1 GB)."
              className="w-full flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground notebook-hover rounded-lg magnetic-btn disabled:cursor-wait disabled:opacity-70"
            >
              {sidebarUploadProcessing ? (
                <span className="inline-flex h-3.5 w-3.5 items-center justify-center gap-0.5" aria-hidden="true">
                  <span className="h-1 w-1 rounded-full bg-current animate-bounce [animation-delay:-0.24s]" />
                  <span className="h-1 w-1 rounded-full bg-current animate-bounce [animation-delay:-0.12s]" />
                  <span className="h-1 w-1 rounded-full bg-current animate-bounce" />
                </span>
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              {sidebarUploadProcessing ? "Processing" : "Upload"}
            </button>
            <button
              onClick={() => setCreateMenuOpen(true)}
              onDragOver={(e) => {
                if (dragNoteId && dragNoteFromNb) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setPromoteDropActive(true); }
              }}
              onDragLeave={() => setPromoteDropActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setPromoteDropActive(false);
                if (dragNoteId && dragNoteFromNb) {
                  const nb = notebooks.find((n) => n.id === dragNoteFromNb);
                  const note = nb?.notes.find((n) => n.id === dragNoteId);
                  if (note) setPendingPromoteNote({ noteId: dragNoteId, fromNbId: dragNoteFromNb, title: note.title });
                  setDragNoteId(null); setDragNoteFromNb(null);
                }
              }}
              title="Create a new note or notebook."
              className={`w-full flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg magnetic-btn transition-colors ${
                promoteDropActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}
            >
              <Plus className="h-3.5 w-3.5" />
              {promoteDropActive ? "Drop to make notebook" : "Create"}
            </button>
            {tempNotesEnabled && (
              <Link
                to="/app/temporary"
                title="Open a temporary workspace - auto-deletes after 24h."
                className="w-full flex items-center gap-1.5 px-3 py-1.5 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 rounded-lg magnetic-btn transition-colors active:scale-[0.98]"
              >
                <ScratchIcon className="h-3.5 w-3.5" />
                Temporary Note
              </Link>
            )}
          </div>

          <input
            ref={sidebarUploadRef}
            type="file"
            accept=".png,.jpg,.jpeg,.gif,.webp,.pdf,.epub,.txt,.md,.markdown,.csv,.json,.doc,.docx,.xls,.xlsx,.mp4,.mov,.webm,image/*,video/mp4,video/quicktime,video/webm,application/pdf,application/epub+zip,text/plain,text/markdown,text/csv,application/json,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            onChange={handleSidebarUpload}
          />


          {/* Notebooks List */}
          <div className="space-y-0.5">
            <AnimatePresence>
              {standaloneNotes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  onDragStartCapture={(e) => {
                    setDragNoteId(note.id);
                    setDragNoteFromNb(null);
                    (e as React.DragEvent<HTMLDivElement>).dataTransfer.effectAllowed = "move";
                  }}
                  onDragEnd={() => {
                    setDragNoteId(null);
                    setDragNoteFromNb(null);
                    setDragOverNoteId(null);
                  }}
                  className={`group/note flex items-center gap-2 px-3 py-2 rounded-lg cursor-grab text-sm transition-all duration-200 border-l-2 ${
                    activeNoteId === note.id
                      ? "bg-primary/10 text-foreground font-medium border-primary/60"
                      : "text-sidebar-foreground notebook-hover border-transparent hover:border-primary/30"
                  } ${dragNoteId === note.id ? "opacity-40" : ""}`}
                  onClick={() => {
                    setActiveNotebookId(null);
                    setActiveNoteId(note.id);
                    onSelectNote?.();
                  }}
                  title="Standalone note"
                >
                  <span className="text-base leading-none">{note.emoji || "📝"}</span>
                  <span className="truncate flex-1 text-sm">{note.title}</span>
                  <span className="hidden group-hover/note:inline text-[9px] uppercase tracking-wider text-muted-foreground/70 font-medium shrink-0">
                    Note
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      showConfirm(
                        "Move to Trash?",
                        `"${note.title}" will be moved to Trash. You can restore it later.`,
                        () => deleteNote(null, note.id),
                        "Move to Trash"
                      );
                    }}
                    className="opacity-0 group-hover/note:opacity-100 p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-all"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            <AnimatePresence>
              {topLevelNotebooks.map((nb) => (
                <motion.div
                  key={nb.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Notebook Item */}
                  <div
                    draggable
                    onDragStart={(e) => {
                      setDraggedNotebookId(nb.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnd={() => { setDraggedNotebookId(null); setDragOverNotebookId(null); }}
                    onDragOver={(e) => {
                      const canAcceptNotebook = draggedNotebookId && draggedNotebookId !== nb.id && !nb.parent_id;
                      const canAcceptNote = dragNoteId && dragNoteFromNb !== nb.id;
                      if (canAcceptNotebook || canAcceptNote) {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                        setDragOverNotebookId(nb.id);
                        if (canAcceptNote) {
                          setNoteDropTargetNb(nb.id);
                          // Auto-expand the notebook so user can choose a position
                          if (expandedNotebook !== nb.id) setExpandedNotebook(nb.id);
                        }
                      }
                    }}
                    onDragLeave={() => {
                      setDragOverNotebookId(null);
                      setNoteDropTargetNb(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOverNotebookId(null);
                      setNoteDropTargetNb(null);

                      // Cross-notebook note move
                      if (dragNoteId && dragNoteFromNb !== nb.id) {
                        const sourceNb = dragNoteFromNb ? notebooks.find((n) => n.id === dragNoteFromNb) : null;
                        const note = dragNoteFromNb ? sourceNb?.notes.find((n) => n.id === dragNoteId) : standaloneNotes.find((n) => n.id === dragNoteId);
                        if (note) {
                          setPendingMoveNote({
                            noteId: dragNoteId,
                            fromNbId: dragNoteFromNb,
                            toNbId: nb.id,
                            noteTitle: note.title,
                            toNbName: nb.name,
                          });
                        }
                        setDragNoteId(null); setDragNoteFromNb(null);
                        return;
                      }
                      // Nest notebook
                      if (draggedNotebookId && draggedNotebookId !== nb.id) {
                        setPendingNestChild({ childId: draggedNotebookId, parentId: nb.id });
                        setDraggedNotebookId(null);
                      }
                    }}
                    className={`group flex items-center gap-2 px-3 py-2 rounded-l-lg rounded-r-lg cursor-grab text-sm transition-all duration-200 border-l-2 ${
                      activeNotebookId === nb.id
                        ? "bg-primary/10 text-foreground font-medium border-primary"
                        : "text-sidebar-foreground notebook-hover border-transparent hover:border-primary/50"
                    } ${dragOverNotebookId === nb.id ? "ring-2 ring-primary/50 bg-primary/5" : ""} ${draggedNotebookId === nb.id ? "opacity-40" : ""}`}
                    onClick={() => {
                      setActiveNotebookId(nb.id);
                      const first = nb.notes?.[0]?.id ?? null;
                      if (first) setActiveNoteId(first);
                      onSelectNote?.();
                    }}
                    title={`Notebook · ${nb.notes?.length ?? 0} ${(nb.notes?.length ?? 0) === 1 ? "note" : "notes"}`}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedNotebook((prev) => (prev === nb.id ? null : nb.id));
                      }}
                      aria-label={expandedNotebook === nb.id || activeNotebookId === nb.id ? "Collapse notebook" : "Expand notebook"}
                      className="p-0.5 -ml-1 rounded hover:bg-accent/60 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    >
                      <ChevronRight
                        className={`h-3 w-3 transition-transform duration-200 ${
                          (activeNotebookId === nb.id || expandedNotebook === nb.id) ? "rotate-90" : ""
                        }`}
                      />
                    </button>
                    <span>{nb.emoji}</span>
                    <span className="flex-1 truncate">{nb.name}</span>
                    <Popover open={editingNotebook === nb.id} onOpenChange={(open) => {
                      if (!open) setEditingNotebook(null);
                    }}>
                      <PopoverTrigger asChild>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingNotebook(nb.id);
                            setEditName(nb.name);
                            setEditEmoji(nb.emoji);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-accent hover:text-accent-foreground transition-all"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-3" side="right" align="start">
                        <div className="space-y-3">
                          <div className="text-sm font-medium text-foreground">Edit Notebook</div>
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Notebook name"
                            className="h-8 text-sm"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && editName.trim()) {
                                updateNotebook(nb.id, { name: editName.trim(), emoji: editEmoji });
                                setEditingNotebook(null);
                              }
                            }}
                          />
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Emoji</div>
                            <div className="grid grid-cols-6 gap-1">
                              {EMOJIS.map((em) => (
                                <button
                                  key={em}
                                  onClick={() => setEditEmoji(em)}
                                  className={`p-1.5 rounded-md text-base hover:bg-accent transition-colors ${editEmoji === em ? "bg-primary/15 ring-1 ring-primary" : ""}`}
                                >
                                  {em}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingNotebook(null)}>Cancel</Button>
                            <Button size="sm" className="h-7 text-xs" onClick={() => {
                              if (editName.trim()) {
                                updateNotebook(nb.id, { name: editName.trim(), emoji: editEmoji });
                                setEditingNotebook(null);
                              }
                            }}>Save</Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        showConfirm(
                          "Move to Trash?",
                          `"${nb.name}" and all its notes will be moved to Trash. You can restore them later.`,
                          () => deleteNotebook(nb.id),
                          "Move to Trash"
                        );
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-all"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Nested notes - shown when this notebook is active or expanded. */}
                  <AnimatePresence initial={false}>
                    {(activeNotebookId === nb.id || expandedNotebook === nb.id) && (
                      <motion.div
                        key={`notes-${nb.id}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden ml-4 mt-0.5 border-l-2 border-sidebar-border pl-2 space-y-0.5"
                      >
                        {nb.notes?.map((note) => (
                          <div
                            key={note.id}
                            draggable
                            onDragStart={(e) => {
                              setDragNoteId(note.id);
                              setDragNoteFromNb(nb.id);
                              e.dataTransfer.effectAllowed = "move";
                            }}
                            onDragEnd={() => { setDragNoteId(null); setDragNoteFromNb(null); }}
                            onClick={() => {
                              setActiveNotebookId(nb.id);
                              setActiveNoteId(note.id);
                              onSelectNote?.();
                            }}
                            className={`group/nn flex items-center gap-2 px-2 py-1.5 rounded-md cursor-grab text-[13px] transition-colors ${
                              activeNoteId === note.id
                                ? "bg-primary/10 text-foreground font-medium"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                          >
                            <FileText className="h-3 w-3 shrink-0 opacity-70" />
                            <span className="truncate flex-1">{note.title || "Untitled"}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                showConfirm(
                                  "Move to Trash?",
                                  `"${note.title}" will be moved to Trash. You can restore it later.`,
                                  () => deleteNote(nb.id, note.id),
                                  "Move to Trash"
                                );
                              }}
                              className="opacity-0 group-hover/nn:opacity-100 p-0.5 rounded hover:bg-destructive/10 hover:text-destructive transition-all"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveNotebookId(nb.id);
                            createNote(nb.id);
                            onSelectNote?.();
                          }}
                          title="Add a note to this notebook"
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add note</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Drop-to-Simple-Notes zone (only visible while dragging a note) */}
          {dragNoteId && dragNoteFromNb && (
            <div
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setSimpleDropActive(true); }}
              onDragLeave={() => setSimpleDropActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setSimpleDropActive(false);
                if (dragNoteId && dragNoteFromNb) {
                  const nb = notebooks.find((n) => n.id === dragNoteFromNb);
                  const note = nb?.notes.find((n) => n.id === dragNoteId);
                  if (note) setPendingSimpleMove({ noteId: dragNoteId, fromNbId: dragNoteFromNb, title: note.title });
                  setDragNoteId(null); setDragNoteFromNb(null);
                }
              }}
              className={`mt-2 mx-1 rounded-lg border border-dashed text-[11px] text-center py-3 px-2 transition-colors ${
                simpleDropActive
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-border/60 text-muted-foreground"
              }`}
            >
              {simpleDropActive ? "Drop to move into Notes" : "Drop here to make it a standalone Note"}
            </div>
          )}

        </div>
      )}

      {collapsed && (
        <div className="flex-1 flex flex-col items-center py-3 gap-2 overflow-y-auto scrollbar-thin">
          {standaloneNotes.map((note) => (
            <Tooltip key={note.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    setActiveNotebookId(null);
                    setActiveNoteId(note.id);
                    onSelectNote?.();
                  }}
                  className={`p-2 rounded-lg transition-all duration-200 text-base ${
                    activeNoteId === note.id ? "bg-primary/10" : "notebook-hover"
                  }`}
                  aria-label={note.title}
                >
                  {note.emoji || "📝"}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">{note.title}</TooltipContent>
            </Tooltip>
          ))}
          {notebooks.map((nb) => (
            <div key={nb.id} className="flex flex-col items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      setActiveNotebookId(nb.id);
                      setExpandedNotebook(nb.id);
                    }}
                    className={`p-2 rounded-lg transition-all duration-200 text-base ${
                      activeNotebookId === nb.id ? "bg-primary/10" : "notebook-hover"
                    }`}
                    aria-label={nb.name}
                  >
                    {nb.emoji}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">{nb.name}</TooltipContent>
              </Tooltip>
              {/* Nested notes intentionally hidden in collapsed view. */}
            </div>
          ))}
        </div>
      )}

      {/* Standalone notes are rendered at the top of the sidebar. */}

      {/* Smart Tags & Study Planner - above footer */}
      {!collapsed && (
        <div className="px-2 space-y-1 mb-2 border-t border-sidebar-border pt-2">
          {/* Smart Tags - collapsible */}
          <button
            onClick={() => { setTagsOpen((p) => !p); if (tagsOpen) setActiveFilterTag(null); }}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground notebook-hover rounded-lg"
          >
            <Tag className="h-3.5 w-3.5" />
            <span className="flex-1 text-left text-xs font-semibold uppercase tracking-wider">Smart Tags</span>
            {allTags.length > 0 && (
              <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{allTags.length}</span>
            )}
            <ChevronRight className={`h-3 w-3 transition-transform duration-200 ${tagsOpen ? "rotate-90" : ""}`} />
          </button>

          <AnimatePresence>
            {tagsOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="px-1 pb-2 pt-1">
                  {/* Tag chips */}
                  {allTags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {allTags.map((tag) => (
                        <span
                          key={tag}
                          className={`inline-flex items-center gap-0.5 pl-2 pr-1 py-0.5 rounded-full text-[11px] font-medium border transition-all duration-150 ${
                            activeFilterTag === tag
                              ? "bg-primary text-primary-foreground border-primary shadow-sm"
                              : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                          }`}
                        >
                          <button
                            onClick={() => setActiveFilterTag(activeFilterTag === tag ? null : tag)}
                            className="hover:opacity-80"
                          >
                            #{tag}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveTag(tag);
                            }}
                            className="ml-0.5 p-0.5 rounded-full hover:bg-destructive/20 hover:text-destructive transition-colors"
                            title={`Remove #${tag} from all notes`}
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted-foreground px-1 mb-2">No tags yet. Add tags to your notes!</p>
                  )}

                  {/* Filtered notes */}
                  <AnimatePresence>
                    {activeFilterTag && filteredByTag.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider px-1 mb-1">
                          Notes with #{activeFilterTag}
                        </p>
                        <div className="space-y-0.5">
                          {filteredByTag.map((item) => (
                            <button
                              key={item.noteId}
                              onClick={() => {
                                setActiveNotebookId(item.notebookId);
                                setExpandedNotebook(item.notebookId);
                                setActiveNoteId(item.noteId);
                                onSelectNote?.();
                              }}
                              className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-lg transition-colors ${
                                activeNoteId === item.noteId ? "bg-primary/10 text-primary" : "text-muted-foreground notebook-hover"
                              }`}
                            >
                              <span>{item.notebookEmoji}</span>
                              <span className="truncate">{item.noteTitle}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Add tag button */}
                  {!showAddTag ? (
                    <button
                      onClick={() => setShowAddTag(true)}
                      className="w-full flex items-center gap-1.5 px-2 py-1.5 text-[11px] text-muted-foreground hover:text-foreground notebook-hover rounded-lg mt-1"
                    >
                      <Plus className="h-3 w-3" />
                      Add tag to current note
                    </button>
                  ) : (
                    <div className="flex gap-1 mt-1">
                      <Input
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddGlobalTag()}
                        placeholder="tag name..."
                        className="h-7 text-xs"
                        autoFocus
                      />
                      <Button size="sm" onClick={handleAddGlobalTag} className="h-7 px-2">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Study Schedule */}
          {upcomingPlans.length > 1 ? (
            <>
              {/* Collapsible when multiple */}
              <button
                onClick={() => setScheduleOpen((p) => !p)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground notebook-hover rounded-lg"
              >
                <CalendarDays className="h-3.5 w-3.5" />
                <span className="flex-1 text-left text-xs font-semibold uppercase tracking-wider">Study Schedule</span>
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">{upcomingPlans.length}</span>
                <ChevronRight className={`h-3 w-3 transition-transform duration-200 ${scheduleOpen ? "rotate-90" : ""}`} />
              </button>
              <AnimatePresence>
                {scheduleOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-1 pb-2 pt-1 space-y-1">
                      {upcomingPlans.map((plan) => {
                        const today = isToday(new Date(plan.scheduled_date + "T00:00:00"));
                        const linkedNotebook = plan.notebook_id ? notebooks.find((nb) => nb.id === plan.notebook_id) : null;
                        return (
                          <div
                            key={plan.id}
                            className={`flex items-center gap-2 py-1.5 px-2 rounded-lg text-xs transition-colors ${
                              today ? "bg-primary/10 border border-primary/20" : "hover:bg-muted"
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full shrink-0 ${getDayColor(plan.scheduled_date)} ${today ? "animate-pulse" : ""}`} />
                            <div className="flex-1 min-w-0">
                              {today && <span className="text-[9px] font-bold uppercase text-primary">📚 Study time</span>}
                              <span className="text-foreground truncate block font-medium">{plan.title}</span>
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <span>{getDayLabel(plan.scheduled_date)}</span>
                                {plan.scheduled_time && <span>· {plan.scheduled_time.slice(0, 5)}</span>}
                                {linkedNotebook && <span>· {linkedNotebook.emoji} {linkedNotebook.name}</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <button
                        onClick={() => onOpenPlanner?.()}
                        className="w-full flex items-center gap-1.5 px-2 py-1.5 text-[11px] text-muted-foreground hover:text-foreground notebook-hover rounded-lg"
                      >
                        <Plus className="h-3 w-3" />
                        Create new session
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : upcomingPlans.length === 1 ? (
            /* Single plan - show inline, no dropdown */
            <div className="px-1">
              <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground px-2 mb-1.5 mt-2 flex items-center gap-1.5">
                <CalendarDays className="h-3 w-3" />
                Study Schedule
              </p>
              {(() => {
                const plan = upcomingPlans[0];
                const today = isToday(new Date(plan.scheduled_date + "T00:00:00"));
                const linkedNotebook = plan.notebook_id ? notebooks.find((nb) => nb.id === plan.notebook_id) : null;
                return (
                  <div className={`flex items-center gap-2 py-1.5 px-2 rounded-lg text-xs transition-colors ${today ? "bg-primary/10 border border-primary/20" : ""}`}>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${getDayColor(plan.scheduled_date)} ${today ? "animate-pulse" : ""}`} />
                    <div className="flex-1 min-w-0">
                      {today && <span className="text-[9px] font-bold uppercase text-primary">📚 Study time</span>}
                      <span className="text-foreground truncate block font-medium">{plan.title}</span>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <span>{getDayLabel(plan.scheduled_date)}</span>
                        {plan.scheduled_time && <span>· {plan.scheduled_time.slice(0, 5)}</span>}
                        {linkedNotebook && <span>· {linkedNotebook.emoji} {linkedNotebook.name}</span>}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            /* No plans - helpful message */
            <div className="px-1">
              <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground px-2 mb-1.5 mt-2 flex items-center gap-1.5">
                <CalendarDays className="h-3 w-3" />
                Study Schedule
              </p>
              <p className="text-[11px] text-muted-foreground px-2">🎉 No upcoming sessions. Open the Study Planner to create one!</p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="p-2 border-t border-sidebar-border mt-auto flex flex-col gap-1">
        {!collapsed ? (
          <>
            <button
              onClick={() => setSettingsOpen(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
              <span className="flex-1 text-left">Settings</span>
            </button>
            <Link
              to="/trash"
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span className="flex-1 text-left">Trash</span>
              {trashCount > 0 && (
                <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{trashCount}</span>
              )}
            </Link>
            <ThemeToggle asSidebarButton />
            <button
              onClick={signOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </button>
          </>
        ) : (
          <TooltipProvider delayDuration={200}>
            <div className="flex flex-col items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setSettingsOpen(true)}
                    className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    aria-label="Settings"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Settings</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/trash" className="p-2 rounded-lg text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors" aria-label="Trash">
                    <Trash2 className="h-4 w-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Trash{trashCount > 0 ? ` (${trashCount})` : ""}</TooltipContent>
              </Tooltip>
              <ThemeToggle />
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={signOut}
                    className="p-2 rounded-lg text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                    aria-label="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Sign out</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        )}
      </div>

      {/* Settings Modal */}
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />

      {/* Sidebar Upload Dialog (PDF / TXT / DOCX / images → notebook or note) */}
      <SidebarUploadDialog
        open={!!pendingUploadFile}
        file={pendingUploadFile}
        onClose={() => setPendingUploadFile(null)}
        onProcessingChange={setSidebarUploadProcessing}
      />

      {/* Unified Create dialog - choose Note or Notebook in one popup */}
      <CreateNotebookDialog
        mode="choose"
        open={createMenuOpen}
        onOpenChange={setCreateMenuOpen}
        onPickNote={onRequestNewNote}
        onCreateNotebook={async (name, emoji) => { await createNotebook(name, emoji); }}
        onCreateNote={async (name, emoji) => {
          const created = await createStandaloneNote(name, emoji);
          if (created) {
            setActiveNotebookId(null);
            setActiveNoteId(created.noteId);
            onSelectNote?.();
          }
        }}
      />



      {/* Confirm Sub-Notebook nesting */}
      <ConfirmDialog
        open={!!pendingNestChild}
        onOpenChange={(o) => !o && setPendingNestChild(null)}
        title="Create sub-notebook?"
        description={(() => {
          if (!pendingNestChild) return "";
          const child = notebooks.find((n) => n.id === pendingNestChild.childId)?.name;
          const parent = notebooks.find((n) => n.id === pendingNestChild.parentId)?.name;
          return `Are you sure you want to move "${child}" inside "${parent}" as a sub-notebook?`;
        })()}
        confirmLabel="Create Sub-Notebook"
        destructive={false}
        onConfirm={async () => {
          if (pendingNestChild) {
            await nestNotebook(pendingNestChild.childId, pendingNestChild.parentId);
            setPendingNestChild(null);
          }
        }}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmTitle}
        description={confirmDesc}
        confirmLabel={confirmLabel}
        onConfirm={confirmAction}
      />

      <ConfirmDialog
        open={!!pendingMoveNote}
        onOpenChange={(o) => !o && setPendingMoveNote(null)}
        title="Move note?"
        description={pendingMoveNote ? `Are you sure you want to move "${pendingMoveNote.noteTitle}" into "${pendingMoveNote.toNbName}"?` : ""}
        confirmLabel="Move Note"
        destructive={false}
        onConfirm={async () => {
          if (pendingMoveNote) {
            await moveNoteToNotebook(pendingMoveNote.fromNbId, pendingMoveNote.noteId, pendingMoveNote.toNbId);
            setPendingMoveNote(null);
          }
        }}
      />

      <ConfirmDialog
        open={!!pendingPromoteNote}
        onOpenChange={(o) => !o && setPendingPromoteNote(null)}
        title="Create new notebook from note?"
        description={pendingPromoteNote ? `Are you sure you want to turn "${pendingPromoteNote.title}" into its own notebook?` : ""}
        confirmLabel="Create Notebook"
        destructive={false}
        onConfirm={async () => {
          if (pendingPromoteNote) {
            await promoteNoteToNotebook(pendingPromoteNote.fromNbId, pendingPromoteNote.noteId);
            setPendingPromoteNote(null);
          }
        }}
      />

      <ConfirmDialog
        open={!!pendingSimpleMove}
        onOpenChange={(o) => !o && setPendingSimpleMove(null)}
        title="Move to Notes?"
        description={pendingSimpleMove ? `Move "${pendingSimpleMove.title}" into your Notes?` : ""}
        confirmLabel="Move to Notes"
        destructive={false}
        onConfirm={async () => {
          if (pendingSimpleMove) {
            await moveNoteToNotebook(pendingSimpleMove.fromNbId, pendingSimpleMove.noteId, null);
            setPendingSimpleMove(null);
          }
        }}
      />
    </motion.aside>
  );
}
