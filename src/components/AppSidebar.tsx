import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, BookOpen, Trash2, ChevronRight, Menu, FileText, LogOut, Upload, Home, Pencil, Search as SearchIcon, Loader2, RotateCcw, Tag, CalendarDays, X } from "lucide-react";
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

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onSelectNote?: () => void;
  onOpenPlanner?: () => void;
}

export function AppSidebar({ collapsed, onToggle, onSelectNote, onOpenPlanner }: AppSidebarProps) {
  const { signOut, user } = useAuth();
  const {
    notebooks,
    trashedNotebooks,
    trashedNotes,
    activeNotebookId,
    activeNoteId,
    setActiveNotebookId,
    setActiveNoteId,
    createNotebook,
    deleteNotebook,
    updateNotebook,
    createNote,
    deleteNote,
    updateNote,
    reorderNotes,
    restoreNotebook,
    restoreNote,
    permanentlyDeleteNotebook,
    permanentlyDeleteNote,
    refreshData,
  } = useNotebooks();

  const EMOJIS = ["📓", "📕", "📗", "📘", "📙", "📔", "📒", "🗂️", "💡", "🔬", "🎯", "✏️"];
  const [showNewNotebook, setShowNewNotebook] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState("");
  const [expandedNotebook, setExpandedNotebook] = useState<string | null>(activeNotebookId);
  const sidebarUploadRef = useRef<HTMLInputElement>(null);
  const [sidebarUploading, setSidebarUploading] = useState(false);
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
    // Subscribe to study_plans changes for live updates
    const channel = supabase
      .channel("sidebar-study-plans")
      .on("postgres_changes", { event: "*", schema: "public", table: "study_plans" }, () => {
        fetchUpcomingPlans();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
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
  const [dragOverNoteId, setDragOverNoteId] = useState<string | null>(null);
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




  const handleSidebarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;
    setSidebarUploading(true);

    let nbId = activeNotebookId;
    let noteId = activeNoteId;

    if (!nbId) {
      await createNotebook("My Notebook");
      setSidebarUploading(false);
      return;
    }

    if (!noteId) {
      await createNote(nbId);
      setSidebarUploading(false);
      return;
    }

    const currentNotebook = notebooks.find(n => n.id === nbId);
    const currentNote = currentNotebook?.notes.find(n => n.id === noteId);
    if (!currentNote) { setSidebarUploading(false); return; }

    const existingAttachments = currentNote.attachments || [];
    const newAttachments = [...existingAttachments];
    let contentAppend = "";

    for (const file of Array.from(files)) {
      if (!validateFile(file)) continue;
      const path = buildStoragePath(user.id, noteId, file.name);
      const { error } = await supabase.storage.from("note-attachments").upload(path, file);
      if (error) { console.error("Upload error:", error); continue; }
      const { data: publicUrlData } = supabase.storage.from("note-attachments").getPublicUrl(path);
      const fileUrl = publicUrlData?.publicUrl || '';
      newAttachments.push({ name: file.name, url: fileUrl, path: path, type: file.type, size: file.size });
      if (file.type.startsWith("image/")) {
        contentAppend += `\n![${file.name}](${fileUrl})\n`;
      }
    }

    const contentUpdate = contentAppend ? { content: (currentNote.content || "") + contentAppend } : {};
    await updateNote(nbId, noteId, { attachments: newAttachments, ...contentUpdate });

    setSidebarUploading(false);
    if (sidebarUploadRef.current) sidebarUploadRef.current.value = "";
  };

  const handleCreateNotebook = () => {
    if (newNotebookName.trim()) {
      createNotebook(newNotebookName.trim());
      setNewNotebookName("");
      setShowNewNotebook(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedNotebook((prev) => (prev === id ? null : id));
    setActiveNotebookId(id);
  };

  const trashCount = trashedNotebooks.length + trashedNotes.length;

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 56 : 280 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="h-screen bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden flex-shrink-0 w-[280px] max-w-[85vw] scrollbar-thin"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-sidebar-border">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 min-w-0 overflow-hidden"
            >
              <img src="/favicon.png" alt="Notebook Archive" className="h-5 w-5 object-contain flex-shrink-0" />
              <span className="font-serif font-bold text-foreground text-lg whitespace-nowrap overflow-hidden text-ellipsis">Notebook Archive</span>
              <Link
                to="/"
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ml-1"
                title="Back to Home"
              >
                <Home className="h-4 w-4" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-md notebook-hover text-muted-foreground hover:text-foreground transition-colors"
        >
          <Menu className="h-4 w-4" />
        </button>
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
              onClick={() => sidebarUploadRef.current?.click()}
              disabled={sidebarUploading}
              className="w-full flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground notebook-hover rounded-lg magnetic-btn"
            >
              <Upload className="h-3.5 w-3.5" />
              {sidebarUploading ? "..." : "Upload"}
            </button>
            <button
              onClick={() => setShowNewNotebook(true)}
              className="w-full flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground notebook-hover rounded-lg magnetic-btn"
            >
              <Plus className="h-3.5 w-3.5" />
              New Notebook
            </button>
          </div>

          <input ref={sidebarUploadRef} type="file" multiple className="hidden" onChange={handleSidebarUpload} />

          {/* New Notebook Input */}
          <AnimatePresence>
            {showNewNotebook && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-2 overflow-hidden"
              >
                <div className="flex gap-1 px-1">
                  <Input
                    value={newNotebookName}
                    onChange={(e) => setNewNotebookName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateNotebook()}
                    placeholder="Notebook name..."
                    className="h-8 text-sm"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleCreateNotebook} className="h-8 px-2">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Notebooks List */}
          <div className="space-y-0.5">
            <AnimatePresence>
              {notebooks.map((nb) => (
                <motion.div
                  key={nb.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Notebook Item */}
                  <div
                    className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-all duration-200 ${
                      activeNotebookId === nb.id
                        ? "bg-primary/10 text-foreground font-medium"
                        : "text-sidebar-foreground notebook-hover"
                    }`}
                    onClick={() => toggleExpand(nb.id)}
                  >
                    <motion.div
                      animate={{ rotate: expandedNotebook === nb.id ? 90 : 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    </motion.div>
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

                  {/* Notes inside notebook */}
                  <AnimatePresence>
                    {expandedNotebook === nb.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-5 pl-3 border-l-2 border-sidebar-border space-y-0.5 py-1">
                          {nb.notes.map((note, noteIndex) => (
                            <div
                              key={note.id}
                              draggable
                              onDragStart={(e) => {
                                setDragNoteId(note.id);
                                e.dataTransfer.effectAllowed = "move";
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.dataTransfer.dropEffect = "move";
                                setDragOverNoteId(note.id);
                              }}
                              onDragLeave={() => setDragOverNoteId(null)}
                              onDrop={(e) => {
                                e.preventDefault();
                                setDragOverNoteId(null);
                                if (!dragNoteId || dragNoteId === note.id) return;
                                const fromIdx = nb.notes.findIndex((n) => n.id === dragNoteId);
                                if (fromIdx === -1) return;
                                reorderNotes(nb.id, fromIdx, noteIndex);
                                setDragNoteId(null);
                              }}
                              onDragEnd={() => {
                                setDragNoteId(null);
                                setDragOverNoteId(null);
                              }}
                              className={`group/note flex items-center gap-2 px-2 py-1.5 rounded-md cursor-grab text-[13px] transition-all duration-200 ${
                                activeNoteId === note.id
                                  ? "bg-primary/10 text-foreground font-medium"
                                  : "text-muted-foreground notebook-hover"
                              } ${dragOverNoteId === note.id && dragNoteId !== note.id ? "border-t-2 border-primary" : ""} ${dragNoteId === note.id ? "opacity-40" : ""}`}
                              onClick={() => {
                                setActiveNotebookId(nb.id);
                                setActiveNoteId(note.id);
                                onSelectNote?.();
                              }}
                            >
                              <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="truncate flex-1 text-sm">{note.title}</span>
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
                                className="opacity-0 group-hover/note:opacity-100 p-0.5 rounded hover:bg-destructive/10 hover:text-destructive transition-all"
                              >
                                <Trash2 className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => createNote(nb.id)}
                            className="flex items-center gap-2 px-2 py-1.5 text-[13px] text-muted-foreground notebook-hover rounded-md w-full"
                          >
                            <Plus className="h-3 w-3" />
                            Add note
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

        </div>
      )}

      {collapsed && (
        <div className="flex-1 flex flex-col items-center py-3 gap-2">
          {notebooks.map((nb) => (
            <button
              key={nb.id}
              onClick={() => {
                setActiveNotebookId(nb.id);
                setExpandedNotebook(nb.id);
                onToggle();
              }}
              className={`p-2 rounded-lg transition-all duration-200 text-base ${
                activeNotebookId === nb.id ? "bg-primary/10" : "notebook-hover"
              }`}
              title={nb.name}
            >
              {nb.emoji}
            </button>
          ))}
        </div>
      )}

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
            /* Single plan — show inline, no dropdown */
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
            /* No plans — helpful message */
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
        {/* Trash Link */}
        {!collapsed && (
          <Link
            to="/trash"
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground notebook-hover rounded-xl mb-1"
          >
            <Trash2 className="h-4 w-4" />
            <span className="flex-1 text-left">Trash</span>
            {trashCount > 0 && (
              <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{trashCount}</span>
            )}
          </Link>
        )}

        <div className={`flex items-center ${collapsed ? "justify-center" : "px-1"}`}>
          <ThemeToggle />
          {!collapsed && <span className="text-xs text-muted-foreground ml-1">Theme</span>}
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground notebook-hover rounded-lg"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmTitle}
        description={confirmDesc}
        confirmLabel={confirmLabel}
        onConfirm={confirmAction}
      />
    </motion.aside>
  );
}
