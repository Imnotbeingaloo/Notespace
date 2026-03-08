

## Plan: Add Notebook Edit Button to Sidebar

### Changes

#### 1. Add `updateNotebook` to NotebookContext (`src/context/NotebookContext.tsx`)
- New function `updateNotebook(id: string, updates: { name?: string; emoji?: string })` that calls `supabase.from("notebooks").update(updates).eq("id", id)` and updates local state
- The DB schema already supports updating `name` and `emoji`

#### 2. Add Edit Button and Dialog to Sidebar (`src/components/AppSidebar.tsx`)
- Add a pencil (Pencil) icon button next to the trash icon on each notebook row, visible on hover like the delete button
- Clicking it opens a small dialog/popover with:
  - Text input for notebook name (pre-filled)
  - Emoji picker (simple grid of the existing EMOJIS array)
  - Save / Cancel buttons
- On save, call `updateNotebook` with the new name/emoji

#### 3. Editor Performance Testing
- The HybridEditor performance fix (local state + lastEmittedRef) was already implemented in the previous approved plan. No additional changes needed — the user should test to confirm.

### Files to Modify
- `src/context/NotebookContext.tsx` — add `updateNotebook` function and expose it
- `src/components/AppSidebar.tsx` — add pencil edit button + edit dialog for each notebook

