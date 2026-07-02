## Goal

1. Bring the deleted paperclip "attach any file" flow back - but folded into the existing **Import Notes** button so mobile users (and everyone else) can attach images / PDFs / videos / docs directly into the current note again.
2. When **Settings → Temporary Notes** is toggled **off** (the default state stays as-is), the Temporary Note should be replaced by Upload on only the home page. Applies to all devices.
3. The **Create** button/dropdown stays exactly as it is today.

---

## 1. Import Notes button = Import + Attach (one button)

File: `src/components/ImportNotesButton.tsx`

- Broaden `accept` to the same set `FileUpload` used (images, video, epub, docx, xlsx, etc.), and switch the `<input>` to `multiple`.
- Keep the current text-extraction path (`.txt/.md/.html/.csv/.json/.pdf` under 100 MB → `formatImportedDocument` → `onInsert` / `ImportActionDialog`).
- Add a new binary path (mirrors old `FileUpload.handleUpload`):
  - Uses `useAuth` + `useNotebooks` to reach `activeNote`, `activeNotebookId`, `updateNote`.
  - Uploads to the `note-attachments` Supabase bucket via `buildStoragePath`, creates a signed URL, appends to `activeNote.attachments`, and calls `onInsert` with `![name](url)` for images or `[📎 name](url)` for other files so it lands at the caret.
  - Large PDF branch (>5 pages) keeps the "spin up new notebook" behaviour from the old component.
- Progress/step state surfaced in the button label (`Uploading… 1/3`) and spinner, matching the old paperclip UX.
- Toast wording updated: replace the stale "paperclip menu" hint with "Try attaching a smaller file."
- Button label stays "Import Notes" on desktop, icon-only on mobile; tooltip reads "Import or attach files (images, PDFs, docs)".

File: `src/components/NoteEditor.tsx`

- `handleInsertMarkdown` is reused as the caret-insert callback for attachments (no longer dead code).
- Both mobile-More and desktop-More `ImportNotesButton` usages get the new upload capability automatically (same component). No layout changes.
- Remove the now-unused `FileUpload` file (`src/components/FileUpload.tsx`) after confirming no other importers.

Non-goals: no change to drag-and-drop in the editor, no change to the sidebar upload input, no change to storage bucket policies.

---

## 2. Temp Notes off → Upload entry (all devices, default)

The `useTempNotesEnabled` hook already defaults to `true`; no change to defaults. Two surfaces render the Temp Note entry today - both get an Upload fallback:

### 2a. Sidebar - `src/components/AppSidebar.tsx` (~L415)

- The existing top "Upload" action already covers uploads, so when `tempNotesEnabled === false` we simply hide the `Temporary Note` `<Link>` (current behaviour) - no second Upload button needed there because one already sits directly above it. Confirmed by reading L370-388.

### 2b. Home quick actions - `src/components/HomeView.tsx` (~L300-364)

- Keep the **Create** dropdown exactly as it renders today when `tempEnabled` is true (don't split into two buttons when off). Currently the `else` branch replaces Create with two separate buttons - revert that so Create is always the same dropdown.
- Replace the amber "Temporary Note" pill with an **Upload** pill when `tempEnabled === false`:
  - Same pill shape / sizing as the temp button, but neutral primary tint (`border-primary/30 bg-primary/[0.06] text-primary`).
  - Icon: `Upload` from lucide.
  - Label: `Upload` (mobile) / `Upload a file` (sm+).
  - Click opens a hidden `<input type="file" multiple>` that forwards the picked files to a new `onUploadFiles?: (files: FileList) => void` prop on `HomeView`.
- `src/pages/Index.tsx` wires `onUploadFiles` to the same handler the sidebar's Upload button uses (`handleSidebarUpload`'s inner processing), so behaviour is identical across surfaces.

---

## 3. Verification

- Manual smoke via Playwright script (`/tmp/browser/import-attach/`):
  1. Toggle Temporary Notes off in Settings → confirm sidebar hides Temp link, Home shows Upload pill instead, Create dropdown unchanged.
  2. In an active note, open "More" on mobile viewport (390px) → tap Import Notes → pick a PNG → confirm image markdown appears at caret and attachment persists after reload.
  3. Repeat with a small `.md` file to confirm the existing import-dialog flow still runs.
- `tsgo` + vitest run afterwards.

---

## Technical notes

- Bucket `note-attachments`, `buildStoragePath`, `validateFile`, `isTextDocument`, `isPdfFile`, `isHtmlFile`, `stripHtmlTags` are all still exported from `src/lib/file-validation.ts` - reused directly.
- `ImportNotesButton` gains an optional `onSaveSelection?: () => void` prop; `NoteEditor` passes `() => hybridEditorRef.current?.saveSelection()` so the caret is preserved before the file picker steals focus (same trick the old paperclip used).
- No schema, RLS, or edge-function changes.

the create button and temporary button changes were asked for hte home section of the app to make it easier for mobile and tablet users to upload files