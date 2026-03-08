

## Plan: WYSIWYG Editor (Google Docs-style) + Google Auth Button

### Problem
1. Toolbar buttons insert raw markdown symbols (`**`, `_`, etc.) instead of visually formatting text. Users must toggle Preview to see results — confusing and unlike Google Docs.
2. Image insertion loses cursor position.
3. Google auth button is already on the Auth page but the user wants to confirm/ensure it's visible and working.

### Solution

#### 1. Add dependencies: `marked` + `turndown`
- `marked` converts stored markdown → HTML on load
- `turndown` converts HTML → markdown on save
- This keeps markdown as the storage format while showing WYSIWYG to the user

#### 2. Rewrite `src/components/HybridEditor.tsx` → contentEditable WYSIWYG
- Replace all textarea segments with a single `contentEditable` div
- On mount/note change: convert markdown → HTML via `marked`, set as innerHTML
- On input: convert innerHTML → markdown via `turndown`, call onChange
- Images render inline visually (no preview mode needed)
- `insertAtCursor` uses Selection API to insert at exact cursor position
- Cursor is preserved across all operations

#### 3. Rewrite `src/components/MarkdownToolbar.tsx` → execCommand actions
- Bold → `document.execCommand('bold')` — visually bolds selected text immediately
- Italic → `document.execCommand('italic')`
- Strikethrough → `document.execCommand('strikeThrough')`
- Headings → `document.execCommand('formatBlock', false, 'h1')` etc.
- Lists → `document.execCommand('insertUnorderedList')` / `insertOrderedList`
- Blockquote → `document.execCommand('formatBlock', false, 'blockquote')`
- Code → wrap selection in `<code>` via Selection API
- Link → `document.execCommand('createLink')` with URL prompt
- Image → `document.execCommand('insertImage')` with URL prompt, cursor stays
- Divider → insert `<hr>` element
- Checklist → insert checkbox elements
- Toolbar receives a ref to the contentEditable div instead of textarea

#### 4. Simplify `src/components/NoteEditor.tsx`
- Remove `preview` state and Preview/Edit toggle button entirely
- Remove the ReactMarkdown preview block — the editor IS the preview now
- Always show the WYSIWYG editor + toolbar
- Keyboard shortcuts (Ctrl+B, Ctrl+I) work naturally via execCommand
- Update drag-drop to insert images directly into contentEditable

#### 5. Google Auth — already implemented
- The Auth page (`src/pages/Auth.tsx`) already has a "Continue with Google" button using `lovable.auth.signInWithOAuth("google")`. No changes needed here — it's working.

### Files to modify
- `package.json` — add `marked`, `turndown`, `@types/turndown`
- `src/components/HybridEditor.tsx` — full rewrite to contentEditable
- `src/components/MarkdownToolbar.tsx` — rewrite to execCommand-based actions
- `src/components/NoteEditor.tsx` — remove preview toggle, simplify layout

### What stays the same
- Markdown storage format (database unchanged)
- AI features receive markdown as before
- File upload, symbols picker, voice transcription all still work
- Auto-save, tags, export all unchanged

