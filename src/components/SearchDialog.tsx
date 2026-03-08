import { useState, useEffect } from "react";
import { Search, FileText } from "lucide-react";
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

  const allNotes = notebooks.flatMap((nb) =>
    nb.notes.map((note) => ({ ...note, notebookName: nb.name, notebookEmoji: nb.emoji, notebookId: nb.id }))
  );

  const handleSelect = (notebookId: string, noteId: string) => {
    setActiveNotebookId(notebookId);
    setActiveNoteId(noteId);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground notebook-hover rounded-lg border border-border"
      >
        <Search className="h-3 w-3" />
        <span>Search…</span>
        <kbd className="ml-2 pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search notes by title or content…" />
        <CommandList>
          <CommandEmpty>No notes found.</CommandEmpty>
          <CommandGroup heading="Notes">
            {allNotes.map((note) => (
              <CommandItem
                key={note.id}
                value={`${note.title} ${note.content} ${note.notebookName}`}
                onSelect={() => handleSelect(note.notebookId, note.id)}
                className="cursor-pointer"
              >
                <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{note.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {note.notebookEmoji} {note.notebookName}
                    {note.content && ` — ${note.content.slice(0, 60)}…`}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
