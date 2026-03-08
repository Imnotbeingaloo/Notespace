

## Plan: Revert Changes & Clean Up File Upload Section

### What needs to change

**1. HybridEditor — Revert text styling to original**
- In `src/components/HybridEditor.tsx` line 202, revert the editor class from:
  - `text-base sm:text-lg text-center prose prose-base` + center-alignment classes
- Back to:
  - `text-sm sm:text-[15px] prose prose-sm` with left-aligned text (remove `text-center`, `prose-headings:text-center`, `prose-p:text-center`)

**2. NoteEditor — Revert empty states & editor background**
- Lines 350 and 364: Change `bg-background` back to `editor-surface` and restore `justify-center` (these were the original classes)
- Line 398: Change `bg-background` back to `editor-surface` on the main editor container

**3. Remove the FileUpload section entirely from the bottom**
- In `src/components/NoteEditor.tsx` lines 537-540, remove the entire `<div>` containing `<FileUpload />` at the bottom of the editor. The drag-and-drop functionality still works since it's handled separately in the editor area.

**4. Sidebar — Revert to original layout**
- In `src/components/AppSidebar.tsx`, restore the original order: Search → Actions (Upload + New Notebook) → Quick Note Input → New Notebook input. The recent changes reordered these sections.

