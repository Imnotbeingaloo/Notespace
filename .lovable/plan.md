

## Plan: Move FileUpload to Below Toolbar

Currently the `FileUpload` component sits at the very bottom of the editor (after the content area, line 597-599 in `NoteEditor.tsx`). The user wants it moved to sit right under the toolbar section, before the content area.

### Change in `src/pages/NoteEditor.tsx`

1. **Remove** the `FileUpload` block from lines 597-599 (below the content area)
2. **Insert** it between the Toolbar section (line 585) and the Content area (line 588), so the layout becomes:
   - Title bar
   - Toolbar
   - **FileUpload** ("Add to note" bar)
   - Content area (HybridEditor)

This is a single move of ~3 lines within `NoteEditor.tsx`. No other files change.

