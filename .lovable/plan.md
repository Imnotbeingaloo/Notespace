## 1. Home header — show "Notebook Archive" wordmark

In `src/components/HomeView.tsx` (line ~170):

- Remove `hidden sm:inline` from the wordmark span so it shows on every viewport.
- Tighten gap so the logo + wordmark + Home icon button sit cleanly together at 1187px and below.

## 2. Temporary workspace — full editor parity

The user wants the temp note to look and behave like a real note editor (toolbar, AI buttons, Ask AI, AI Edit, Voice, Import, Flashcards, Export, Preview, Share-off, find/replace, word count, etc.) — just without the **sidebar**.

Approach:

- Extend `NotebookContext` with an optional `overrideActiveNote` (and `setOverrideActiveNote`) plus an optional `overrideUpdateNote` callback. When set, `activeNote` resolves to the override and `updateNote` for that synthetic id routes through `overrideUpdateNote`. Real `notebooks` / `activeNotebookId` stay untouched.
- Rewrite `src/pages/TemporaryWorkspace.tsx`:
  - Load/create the temp row exactly as today.
  - Register it as the override note (`{ id, title, content, ... }`); supply an `overrideUpdateNote` that writes `title`/`content` back to `temporary_notes`.
  - Render `<NoteEditor />` (no `AppSidebar`) inside the same `min-h-screen` shell.
  - Keep the floating top cluster (logo+back, "Temporary", countdown chip, notebooks drawer) overlaid above the editor.
  - Keep navigation guard (`popstate` + `beforeunload`) and the Leave dialog logic.
- Hide the `ShareNoteDialog` row in `NoteEditor` when the active note is the override (sharing a temp note doesn't make sense). Everything else (Ask AI, AI Edit, Voice, Import, Flashcards, Export, Preview, Find/Replace, Word Count, Goal, Pomodoro topbar, Focus toggle) renders unchanged.

## 3. Leave dialog cleanup

In `TemporaryWorkspace.tsx` Leave dialog:

- **Remove** the "Download as Markdown" button entirely.
- Order: 1) Save as new notebook (primary), 2) Save into existing notebook (outline), 3) **Discard** rendered as a real solid button (destructive variant: `bg-destructive text-destructive-foreground hover:bg-destructive/90`) instead of the current ghost link.
- Closing the dialog with X / Esc / backdrop still cancels the navigation (already handled).

## 4. App → Website transition: bare book, no splash

User says the current splash on exit is too heavy. Replace with a minimal 200–250 ms book swap.

- Delete the `fast` SplashScreen invocation from `src/pages/Landing.tsx`.
- New tiny component `src/components/ExitBookFlash.tsx`: full-screen `bg-background` with just a centered `BookOpen` lucide icon (or `/logo.png` stripped of label — confirm: user said "just a book, no logo nothing", so use the lucide `BookOpen` icon at ~h-12 in `text-primary`). No motion, no text, no dots; fades out via a single 180ms opacity transition, total visible time ~220ms.
- `Landing.tsx` renders `<ExitBookFlash />` only when `location.state.fromApp === true`, then clears the state.
- Remove the splash entry-trigger branch in `SplashScreen.tsx`'s `fast` mode (no longer used). Leave the initial app splash intact.

## 5. AI Edit button → open Ask AI in Edit mode + swap "Explain this note" → "Edit this note"

Goal: Clicking "AI Edit" should open the same Ask-AI modal but with the **Edit** tab preselected; in that state the quick action button labelled "Explain this note" becomes "Edit this note".

- Lift open state and initial mode into `AskAIPanel`: accept optional `defaultMode?: "chat" | "edit"` and expose an imperative `openWith(mode)` via `forwardRef`, OR (simpler) accept controlled `open` / `onOpenChange` + `mode` props.
- In `NoteEditor.tsx`, render a single shared `AskAIPanel` ref/state, and turn `AIEditPanel` into a trigger-only button: clicking "AI Edit" calls `askAIRef.current.openWith("edit")` instead of opening the side drawer. Keep the AI Edit button visual and label.
- In the Ask-AI panel, when `mode === "edit"`:
  - Quick action button label switches from "Explain this note" → "Edit this note", and clicking it sends `callAI("edit", "Improve this note")` (or focuses the input with a sensible default placeholder) instead of being disabled as it is today.
  - In `mode === "chat"` it stays "Explain this note" (unchanged).
- Delete the standalone `AIEditPanel` side-drawer UI (the file can stay for the trigger button or be removed; safer: keep the export as a thin trigger-only button that calls the parent handler).

## Technical notes

- `NotebookContext` override pattern keeps the change isolated: no schema changes, no edits to `notes`/`notebooks` paths.
- `temporary_notes` table already exists with `expires_at`; no migration needed.
- `NoteEditor` will not break for empty notebooks because the override fills `activeNote` and supplies its own write path.
- Test viewports: 1187 (current) and 375 — wordmark must be visible at both.

## Out of scope

- No changes to notebooks, notes, trash, auth, AI gateway, or marketing pages other than `Landing.tsx` exit flash.
- No new database fields.  
  
also the ai edit option, i told it to write the equation of light (whole) it just did this, i need it to add signs, it can pick up the signs from the signs buttons and upload them into thedoucment, this doesnt look good  
  
$c = \lambda f$
  Where:
  $c$ is the speed of light (approximately $3 \times 10^8$ m/s)
  $\lambda$ (lambda) is the wavelength
  $f$ (or $\nu$) is the frequency
  Additionally, in the context of energy:  
  $E = hf = \frac{hc}{\lambda}$
  Where:
  $E$ is energy
  $h$ is Planck's constant ($6.626 \times 10^{-34}$ J·s)