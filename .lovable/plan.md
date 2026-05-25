This is a large multi-feature pass. Outlining each change so we agree before I edit ~10 files.

## 1. Flashcards — make them interactive

- Parse the AI-generated `**Q:** … **A:** …` blocks into a real card deck.
- Build a quiz UI: front shows Q, flip to reveal A, then "Got it right" / "Got it wrong" buttons.
- Track score, show "X / Y correct" at the end with a Restart button.
- Replace the current read-only markdown render inside the existing AI Tools panel.

## 2. "Ask AI" → dedicated interactive chat area (not a sidebar)

- Replace `AIExplainPanel` with a centered modal (or full-width inline panel above the editor) named "Ask AI".
- Two quick-action buttons inside it: **Explain** and **Edit**.
- Free-text input so the user can ask anything ("explain paragraph 2", "rewrite this in plainer English", etc.).
- Streamed assistant replies, multi-turn message thread kept in component state for the session.
- For "Edit" actions, replies include an **Apply to note** button that writes the suggested markdown into the active note.
- Edge function: reuse `ai-tools` with a new `chat` action that accepts the note + a conversation history.

## 3. Voice transcript

- Inspect why the mic isn't inserting text. Current `VoiceTranscription` only fires `onTranscript` on `isFinal` — verify the consumer in `NoteEditor` actually appends to the markdown.
- Fix the wiring and add a visible "Listening…" indicator.

## 4. Share dialog title

- `ShareNoteDialog` title becomes **"Share '{notebookName}' Notebook"** (falls back to "Share Note" if no notebook context).

## 5. Three-dots menu — AI Edit

- Keep the "AI Edit" item. Wire it through the same `ai-tools` edge function `action: "edit"`, passing the full note content + user instruction. Replace the note body with the returned markdown after a confirm step.

## 6. Preview button (attachments)

- The attachment preview button in `NoteEditor` currently doesn't open. Fix it to open the signed URL in a new tab (images/PDF inline, others download).

## 7. Upload loading popup

- `FileUpload` shows a toast/dialog "Preparing your document…" with a spinner while extraction/upload runs, dismisses on success/failure.
- Tighten validation to reuse `validateFile` helpers already in `file-validation.ts`.

## 8. Sidebar Upload — Notes vs Notebook

- New dropdown on the sidebar "+ Upload" button:
  - **Upload Notes** → asks "Which notebook?" with two options: pick existing (dropdown) or create new (opens `CreateNotebookDialog`, then continues).
  - **Upload Notebook** → file picker for `.md`/`.txt`/`.docx`, creates a new notebook named after the file and ingests it as the first note.

## 9. Scratch (temporary notes)

- Add a **Scratch** button in the editor top bar next to Focus Mode (custom icon: pencil with dashed outline).
- Clicking opens (or creates) the per-user Scratch notebook and a new scratch note.
- Before navigating away from a scratch note, show a confirm: **Download as .md**, **Save to a notebook** (notebook picker), or **Discard**.

## 10. New-notebook routing bug

- After creating a notebook the URL still has `?notebook=<old>&note=<old>`, so the editor shows the previous notebook contents under the new title.
- Fix: when `createNotebook` resolves, navigate to `/app?notebook=<newId>` and clear `activeNoteId`. `HomeView` and `AppSidebar` both call `createNotebook` — both need this.

## Files to touch

- `src/components/AIToolsPanel.tsx` — flashcards interactive mode
- `src/components/AIExplainPanel.tsx` → rewrite as `AskAIPanel.tsx` (chat UI)
- `src/components/AIEditPanel.tsx` — reuse from three-dots menu, accept instruction
- `src/components/VoiceTranscription.tsx` + `NoteEditor.tsx` wiring
- `src/components/ShareNoteDialog.tsx`
- `src/components/FileUpload.tsx` — loading dialog, preview fix
- `src/components/NoteEditor.tsx` — attachment preview, scratch button, ask-ai placement
- `src/components/AppSidebar.tsx` — upload dropdown
- `src/components/CreateNotebookDialog.tsx` / `HomeView.tsx` / `Index.tsx` — routing fix
- `src/context/NotebookContext.tsx` — scratch helpers, return new id from createNotebook
- `supabase/functions/ai-tools/index.ts` — add `chat` action

## Out of scope (will not touch)

- Drag-to-create-notebook flow (already in the codebase from previous turn — leaving as-is).
- Sub-notebook nesting UI (DB already supports it; sidebar tree stays as-is).
- Pricing/marketing pages.

Reply **"go"** (or with edits) and I'll execute end to end in this turn — it'll be a large diff but no follow-ups needed.  
  
it shouldnt make every document temporary, only the ones that are chatted or done in the temporary option and also the colors that i told you to do on the buttons like trash, signout dark mode etc are gone, can you bring them back