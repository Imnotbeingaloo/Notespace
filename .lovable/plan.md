# Plan — Bug Fixes & Polish (Two Sections)

I'll ship this in two passes so nothing slips. Section A is the critical functional work (uploads, editor persistence, tab reload). Section B is visual polish (notifications, notebook paper, classic-style reload).

---

## Section A — Critical Functionality

### A1. Sidebar Upload — rewrite end-to-end
**File:** `src/components/AppSidebar.tsx`, new `src/components/SidebarUploadDialog.tsx`

- Raise size limit to **1 GB** (separate from attach-files 10 MB rule — see A2).
- Accept: PDF, EPUB, TXT, DOC/DOCX, XLSX, MD, CSV, JSON, images (block scripts/HTML/SVG/archives as before).
- After file is selected, open a **destination modal** with two buttons:
  - **New Notebook** — creates a notebook named after the file, then a single note inside it with extracted/attached content.
  - **Add to Existing Notebook** — searchable list of notebooks; picks one and adds the file as a new note.
- Show an **upload progress dialog** (same visual style as Attach-Files popup): spinner, filename, percent, and message:
  - `< 10 MB` → "Uploading… just a sec"
  - `≥ 10 MB` → "Uploading… this may take a moment"
- **Verify success/failure**: await Supabase storage response, then re-fetch the signed URL to confirm the object exists. On any error → red toast with reason; do not pretend it succeeded.
- After success → green toast + auto-navigate to the new note/notebook.

### A2. Attach-Files button — insert at cursor
**Files:** `src/components/FileUpload.tsx`, `src/components/HybridEditor.tsx`, `src/components/NoteEditor.tsx`

- Track last caret position in the editor (save selection range on `blur`/`selectionchange`).
- When a file is uploaded via attach: call `editorRef.insertAtCursor()` at the saved range instead of appending to `activeNote.content`.
- Works for text docs (insert extracted text), images (insert `![]()`), and PDFs/other (insert a link chip).
- Replace the long blocking validation message with: "Uploading your files…".

### A3. Editor spacing persistence
**Files:** `src/components/HybridEditor.tsx`

- Turndown currently strips blank `<p>` / `<div>`. Confirm/extend the `blankReplacement` rule so consecutive empty paragraphs round-trip as `\n\n&nbsp;\n\n` (already partially in place — verify it survives save→reload).
- On render (`markdownToHtml`), preserve consecutive blank lines by converting standalone `&nbsp;` paragraphs back to empty `<p><br></p>`.
- Add a unit test in `src/test/` covering: type → save → reload → blank lines preserved.
- **No DB schema change needed** — `notes.content` is plain text and stores `\n\n` fine; the loss is purely in the HTML↔MD conversion.

### A4. Tab visibility — 60-second grace period
**Files:** `src/context/NotebookContext.tsx` (or wherever the current `visibilitychange` reload lives — I'll grep and patch the right place)

- On `visibilitychange` → hidden: start a 60s timer, record `hiddenAt = Date.now()`.
- On `visibilitychange` → visible:
  - If `< 60s` elapsed → cancel timer, **do nothing** (no reload, no spinner, no refetch).
  - If `≥ 60s` → trigger the existing refresh.
- Clear timer on unmount; reset cleanly on every focus.

---

## Section B — Visual Polish

### B1. Notification stack (fix overlap + redesign)
**File:** `src/components/ui/sonner.tsx`

- Switch Sonner to `visibleToasts={4}`, `expand={false}`, `gap={12}` so toasts stack with spacing instead of overlapping.
- Redesign toast: rounded-2xl, drop shadow, slide-in from right + fade-out, explicit ✕ close button, type icons (✅ ⚠️ ❌ 📋).
- Cap to 4 visible; rest are queued by Sonner automatically.
- Add a `toast.task()` helper preset for "Task Created" with 📋.

### B2. Notebook Classic paper — readable lines in both themes
**File:** `src/index.css` (`.notebook-paper` rule)

- Light mode: cream background `hsl(40 40% 96%)`, blue ruled lines `hsl(210 60% 60% / 0.35)` every 32px, red margin `hsl(0 70% 55% / 0.55)` at 56px.
- Dark mode (`.dark .notebook-paper`): deep navy bg `hsl(220 25% 12%)`, ruled lines `hsl(210 70% 70% / 0.22)`, red margin `hsl(0 80% 65% / 0.5)`.
- Use layered `repeating-linear-gradient` + `linear-gradient` so both lines and margin always render.
- Match `line-height` to the 32px ruling so text sits ON the lines (not between).
- Verify with screenshots in light + dark.

### B3. Classic toggle reloads first
**File:** `src/hooks/use-paper-style.tsx` + `src/components/SettingsDialog.tsx`

- On toggle change, persist the new value to localStorage, then call `window.location.reload()` so the page mounts cleanly with the style applied.

---

## Verification Checklist

- [ ] Upload `brainrot (1).pdf` and `The Four Agreements.pdf` via sidebar → destination modal appears → both land in chosen notebook → preview opens.
- [ ] Upload via attach-files → file inserted at caret, not at end.
- [ ] Type with blank lines, save, reload note → spacing intact.
- [ ] Switch tabs for 10s → no reload. Switch tabs for 70s → reload fires once.
- [ ] Fire 6 toasts rapidly → 4 visible, neatly stacked, no overlap.
- [ ] Toggle Classic paper → page reloads → blue rules + red margin clearly visible in both light and dark mode (screenshot check).

Confirm and I'll start with Section A.