import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, BookOpen, Trash2, ChevronRight, Menu, FileText, LogOut, Upload, Home, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { validateFile, buildStoragePath } from "@/lib/file-validation";
import { SearchDialog } from "@/components/SearchDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNotebooks } from "@/context/NotebookContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onSelectNote?: () => void;
}

export function AppSidebar({ collapsed, onToggle, onSelectNote }: AppSidebarProps) {
  const { signOut, user } = useAuth();
  const {
    notebooks,
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

  const handleSidebarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;
    setSidebarUploading(true);

    // Ensure we have a notebook and note to upload into
    let nbId = activeNotebookId;
    let noteId = activeNoteId;

    if (!nbId) {
      // Create a notebook first
      await createNotebook("My Notebook");
      // After creating, the context sets activeNotebookId
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
              className="flex items-center gap-2"
            >
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-serif font-bold text-foreground text-lg">Notebook Archive</span>
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
          <div className="mb-2">
            <SearchDialog />
          </div>

          {/* Quick Upload Button */}
          <button
            onClick={() => sidebarUploadRef.current?.click()}
            disabled={sidebarUploading}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground notebook-hover rounded-xl mb-1 magnetic-btn"
          >
            <Upload className="h-4 w-4" />
            {sidebarUploading ? "Uploading..." : "Upload to note"}
          </button>
          <input ref={sidebarUploadRef} type="file" multiple className="hidden" onChange={handleSidebarUpload} />

          {/* New Notebook Button */}
          <button
            onClick={() => setShowNewNotebook(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground notebook-hover rounded-xl mb-1 magnetic-btn"
          >
            <Plus className="h-4 w-4" />
            New Notebook
          </button>

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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotebook(nb.id);
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
                          {nb.notes.map((note) => (
                            <div
                              key={note.id}
                              className={`group/note flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-xs transition-all duration-200 ${
                                activeNoteId === note.id
                                  ? "bg-primary/10 text-foreground font-medium"
                                  : "text-muted-foreground notebook-hover"
                              }`}
                              onClick={() => {
                                setActiveNotebookId(nb.id);
                                setActiveNoteId(note.id);
                                onSelectNote?.();
                              }}
                            >
                              <FileText className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate flex-1">{note.title}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNote(nb.id, note.id);
                                }}
                                className="opacity-0 group-hover/note:opacity-100 p-0.5 rounded hover:bg-destructive/10 hover:text-destructive transition-all"
                              >
                                <Trash2 className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => createNote(nb.id)}
                            className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground notebook-hover rounded-md w-full"
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

      {/* Footer */}
      <div className="p-2 border-t border-sidebar-border mt-auto flex flex-col gap-1">
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
    </motion.aside>
  );
}
