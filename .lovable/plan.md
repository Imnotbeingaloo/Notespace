

## Plan: Inline Image Rendering in Editor, Preview Button Relocation, and Improvements

### Problem
The editor uses a plain `<textarea>` which can only display raw text — images show as `![name](url)` instead of rendering. A `<textarea>` cannot render HTML/images inline. We need to replace it with a hybrid editor.

### Changes

#### 1. Replace textarea with hybrid contentEditable editor
**`src/components/NoteEditor.tsx`** — Replace the `<textarea>` with a new `<HybridEditor>` component that:
- Splits the markdown content into segments: **text chunks** and **image references** (`![alt](url)`)
- Renders text chunks as editable `<textarea>` segments and image references as actual `<img>` elements between them
- When any text segment changes, reconstructs the full markdown content and calls `debouncedUpdate`
- This way images appear inline exactly where the markdown reference is, while text remains fully editable

**`src/components/HybridEditor.tsx`** (new file):
- Takes `content`, `onChange`, and `ref` props
- Uses regex `/!\[([^\]]*)\]\(([^)]+)\)/g` to split content into alternating text/image segments
- Each text segment is a `<textarea>` with auto-height (grows with content)
- Each image segment renders an `<img>` with styling (rounded, shadow, max-width)
- On any text change, reassembles full content from all segments and calls `onChange`
- Supports clicking to position cursor in any text segment

#### 2. Move Preview button next to Summarize
**`src/components/NoteEditor.tsx`**:
- Move the Preview/Edit toggle button from its current position (after ExportButtons) to right before the Summarize button in the desktop toolbar
- On mobile, keep it always visible (not inside the "More" dropdown)

#### 3. Recommendations for improvement (to present to user)
- **Auto-save indicator**: Show a small "Saved" / "Saving..." badge so users know their work is persisted
- **Keyboard shortcuts**: Add Ctrl+B for bold, Ctrl+I for italic, Ctrl+P for preview toggle
- **Word/character count**: Show a small counter in the footer
- **Undo AI edits**: Add a one-step undo after AI makes changes to the document
- **Note search within content**: Ctrl+F style search within the current note

### Files to Create/Modify
- `src/components/HybridEditor.tsx` — new hybrid editor component
- `src/components/NoteEditor.tsx` — integrate HybridEditor, move Preview button

