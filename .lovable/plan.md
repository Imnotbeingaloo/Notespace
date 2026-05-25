# Plan

A focused set of additive changes across UX, data, and uploads. Nothing existing is removed.

## 1. Scratch / temporary notes

- Auto-create a per-user notebook named **"Scratch"** (📝 emoji) on first app load if missing.
- New top-bar button next to Focus Mode (✏️ "Scratch") — clicking it opens the Scratch notebook and creates a fresh blank note inside it.
- Scratch notes are marked visually (subtle "Scratch" tag) but otherwise behave normally.

## 2. Drag-and-drop

- **Drag a note out of its notebook** (drop on empty Home grid area) → confirm dialog "Promote this note to a new notebook?" → on confirm, create notebook (named after note title) and move the note into it.
- **Drag a notebook onto another notebook** → confirm dialog "Make X a sub-notebook of Y?" → on confirm, set `parent_id`.
- Sub-notebooks: **one level deep only** (keeps UI simple; sub-notebook can't itself be a parent). Sidebar shows nested children under an expandable caret. Home grid shows parents only with a "N sub" badge.

## 3. Create-notebook modal

- Remove the inline name input on sidebar + Home.
- Replace with `+ New Notebook` button → opens a centered modal (Framer Motion fade+scale, backdrop blur) with name input, emoji picker (reuse existing), Create / Cancel.
- Same modal triggered from:
  - Sidebar header `+`
  - New **"Create Notebook"** tile rendered as the first card on Home grid
  - Mobile collapsed-sidebar state (visible on Home even when sidebar closed)

## 4. Collapsed sidebar icons

- When collapsed, footer shows icon-only buttons (no labels) for: Theme toggle (sun/moon), Trash, Sign Out. All with tooltips. Sign Out keeps destructive hover tint.

## 5. File upload fixes + extraction

- Fix the broken upload trigger in `FileUpload.tsx` (input ref / accept attribute).
- **Allow-list** by MIME + extension: images (jpg, png, webp, gif), PDFs, plain text, markdown, docx. **Block** html, exe, scripts, archives, svg with inline scripts. Reject with a clear toast.
- Keep 10 MB limit, private bucket, signed URLs.
- **Extraction** on upload:
  - PDFs: client-side `pdfjs-dist` text extraction → inserted into the note as markdown.
  - Images: edge function `extract-file` calling Lovable AI (`google/gemini-2.5-flash`) vision to OCR / describe → inserted as markdown under a `## From <filename>` heading.
  - DOCX/TXT/MD: parsed client-side, inserted as markdown.
- Original file is still saved to storage and shown as an attachment chip below the note for download.

## 6. Header logo sizing

- On `PageHeader` and `Landing` header, scale the "Notebook Archive" text to match the action button heights at every breakpoint (mobile gets a real readable size, not the current tiny one). Logo image sizing stays as-is.

## Technical details

**DB migration**
- `notebooks`: add `parent_id uuid null references notebooks(id) on delete set null`, `is_scratch boolean not null default false`. Index on `(user_id, parent_id)`.
- `notes`: add `is_scratch boolean not null default false`.
- Add CHECK trigger preventing a notebook whose `parent_id is not null` from itself being a parent (enforces one level).

**Edge function**
- `extract-file`: accepts base64 image, returns `{ markdown }`. JWT-verified. Uses `LOVABLE_API_KEY`, Gemini vision, prompt-injection-hardened with XML wrappers.

**Frontend**
- `src/components/CreateNotebookDialog.tsx` (new) — modal w/ framer-motion.
- `src/components/HomeView.tsx` — first-tile "Create Notebook", drag-out drop zone, sub-notebook badge.
- `src/components/AppSidebar.tsx` — nested children render, collapsed footer icons, drag handlers.
- `src/context/NotebookContext.tsx` — `createNotebook(name, emoji, parentId?)`, `nestNotebook(childId, parentId)`, `promoteNoteToNotebook(noteId)`, `ensureScratchNotebook()`, `createScratchNote()`.
- `src/components/FileUpload.tsx` — fixed click trigger, MIME allow-list, extraction routing.
- `src/lib/file-extraction.ts` (new) — pdfjs / docx / txt parsers.
- Top-bar in `pages/Index.tsx` — Scratch button + tooltip.

**Out of scope (will not do)**
- Multi-level nested sub-notebooks.
- Server-side virus scanning.
- Moving sub-notebooks via drag back to root (use a context-menu "Move to root" later if needed).

Suggested order: 6 → 3 → 4 → 1 → 5 → 2.
