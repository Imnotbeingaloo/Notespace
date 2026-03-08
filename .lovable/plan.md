

## Plan: Undo toast, Empty Trash confirmation, fix FileUpload text/sizing, fix "no note" centering

### 1. Fix "no note/notebook selected" centering (`NoteEditor.tsx`)
Change `pt-[15vh]` back to `items-center justify-center` on both empty state containers (lines 414 and 428). This restores the original centered layout.

### 2. Restore FileUpload text and sizing (`FileUpload.tsx`)
Currently the bottom bar is just a bare icon button with `py-0`. Restore it to show helper text like "Attach files or drag & drop" next to the paperclip icon, and restore proper padding (`py-2`) so it looks like the original attachment area.

### 3. Add undo toast on delete (`NotebookContext.tsx`)
- When `deleteNotebook` or `deleteNote` is called (soft-delete), show a sonner toast with an "Undo" action button and a 5-second timer.
- If the user clicks Undo within 5 seconds, restore the item (set `deleted_at` back to null).
- If they don't, the soft-delete stays.

### 4. Add "Empty Trash" count confirmation (`Trash.tsx`)
The Empty Trash button already has a confirmation dialog. Update the description to show the exact count: "X notebooks and Y notes will be permanently deleted."

### Files changed
- `src/components/NoteEditor.tsx` — restore centered layout for empty states
- `src/components/FileUpload.tsx` — restore text label and proper sizing
- `src/context/NotebookContext.tsx` — add undo toast with 5s delay on soft-delete
- `src/pages/Trash.tsx` — improve Empty Trash confirmation with item counts

