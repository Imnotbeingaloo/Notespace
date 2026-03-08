

## Plan

### 1. Stack sidebar buttons vertically (one per line)
In `src/components/AppSidebar.tsx` lines 202-218, change the actions container from `flex gap-1` (horizontal) to `flex flex-col gap-1` so Upload and New Notebook each take a full line.

### 2. Make Search fill the full sidebar width
In `src/components/SearchDialog.tsx`, update the search button to use `w-full` so it stretches across the sidebar.

### 3. Remove excess spacing below file upload
In `src/components/NoteEditor.tsx` lines 537-540, reduce padding on the file upload container — change `py-2` to `py-1` and tighten it so there's minimal whitespace below.

