import { useState, useEffect, useMemo } from "react";
import { Search, FileText, Tag, X } from "lucide-react";
import { useNotebooks } from "@/context/NotebookContext";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const { notebooks, setActiveNotebookId, setActiveNoteId } = useNotebooks();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const allNotes = useMemo(
    () =>
      notebooks.flatMap((nb) =>
        nb.notes.map((note) => ({
          ...note,
          notebookName: nb.name,
          notebookEmoji: nb.emoji,
          notebookId: nb.id,
        }))
      ),
    [notebooks]
  );

  // Collect all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    allNotes.forEach((n) => n.tags?.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [allNotes]);

  // Filter notes by selected tags
  const filteredNotes = useMemo(() => {
    if (selectedTags.length === 0) return allNotes;
    return allNotes.filter((n) =>
      selectedTags.every((tag) => n.tags?.includes(tag))
    );
  }, [allNotes, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSelect = (notebookId: string, noteId: string) => {
    setActiveNotebookId(notebookId);
    setActiveNoteId(noteId);
    setOpen(false);
  };

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) setSelectedTags([]);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground notebook-hover rounded-lg border border-border"
      >
        <Search className="h-3 w-3" />
        <span>Search…</span>
        <kbd className="ml-auto pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        <CommandInput placeholder="Search notes by title, content, or tag…" />

        {/* Tag filter bar */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border flex-wrap">
            <Tag className="h-3 w-3 text-muted-foreground shrink-0" />
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full transition-all ${
                  selectedTags.includes(tag)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                #{tag}
                {selectedTags.includes(tag) && <X className="h-2.5 w-2.5" />}
              </button>
            ))}
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="text-[10px] text-muted-foreground hover:text-foreground ml-1"
              >
                Clear
              </button>
            )}
          </div>
        )}

        <CommandList>
          <CommandEmpty>No notes found.</CommandEmpty>
          <CommandGroup heading={selectedTags.length > 0 ? `Notes tagged ${selectedTags.map(t => `#${t}`).join(", ")}` : "Notes"}>
            {filteredNotes.map((note) => (
              <CommandItem
                key={note.id}
                value={`${note.title} ${note.content} ${note.notebookName} ${(note.tags || []).join(" ")}`}
                onSelect={() => handleSelect(note.notebookId, note.id)}
                className="cursor-pointer"
              >
                <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-medium">{note.title}</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs text-muted-foreground">
                      {note.notebookEmoji} {note.notebookName}
                      {note.content && ` — ${note.content.slice(0, 50)}…`}
                    </span>
                    {note.tags?.map((tag) => (
                      <span key={tag} className="text-[9px] px-1.5 py-0 rounded-full bg-primary/10 text-primary">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
