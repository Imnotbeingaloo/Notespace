

## Plan: Remove spacing, add highlight button, merge FileUpload into toolbar

### 1. Merge FileUpload into toolbar row (`NoteEditor.tsx`)
- Remove the separate `<div className="shrink-0">` wrapper around `FileUpload` (lines 587-589)
- Move the `FileUpload` component inline into the same toolbar `div` (lines 577-585), placing it after the `MarkdownToolbar` so both sit in one row with no gap

### 2. Add Highlight button (`MarkdownToolbar.tsx`)
- Import `Highlighter` icon from lucide-react
- Add a highlight action that uses `document.execCommand("hiliteColor", false, "#fef08a")` (yellow highlight)
- Insert it in the actions array after Strikethrough (index 2), update `separatorAfter` set accordingly

### 3. Adjust FileUpload styling (`FileUpload.tsx`)
- Remove the outer `px-4 sm:px-8 py-3 border-t border-border` wrapper padding since it will now live inside the toolbar bar
- Make the "Add to note" button blend into the toolbar row seamlessly

### Files changed
- `src/components/NoteEditor.tsx` — merge FileUpload into toolbar div, remove extra wrapper
- `src/components/MarkdownToolbar.tsx` — add Highlighter icon and highlight action
- `src/components/FileUpload.tsx` — adjust container styling to fit inline in toolbar

