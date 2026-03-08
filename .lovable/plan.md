

## Plan: Fix Undo/Redo and Editor Performance

### Root Causes

**1. Undo/Redo broken**: `MarkdownToolbar` operates on `contentRef` (a `React.RefObject<HTMLTextAreaElement>`), but since switching to `HybridEditor`, `contentRef` is never attached to any DOM element. It's always `null`, so all toolbar actions silently fail.

**2. Laggy typing (5-second delay)**: The `HybridEditor` has a render loop problem:
- Each keystroke calls `onChange(reassemble(...))` → `debouncedUpdate` → after 500ms, `updateNote` updates context state → `activeNote.content` changes → `HybridEditor` re-renders → `parseContent(content)` runs on every render (line 133) AND in a `useEffect` (line 129) → segments get rebuilt → controlled textareas re-render with new values
- This creates a feedback loop: type → onChange → context update → prop change → re-parse → re-render all textareas → cursor position lost

### Changes

#### 1. Fix HybridEditor performance (`src/components/HybridEditor.tsx`)
- Store segments in `useState` instead of re-parsing from props on every render
- Only re-parse from the `content` prop when it changes externally (not from local typing) — use a "last emitted" ref to detect external vs internal changes
- Remove the redundant `parseContent(content)` call on line 133 (currently runs on every render)
- This eliminates the re-render loop: typing updates local state immediately, onChange still fires for debounced save, but incoming prop changes from the save don't re-parse since the content matches

#### 2. Fix MarkdownToolbar integration (`src/components/HybridEditor.tsx` + `src/components/NoteEditor.tsx`)
- Expose a `getActiveTextarea()` method from `HybridEditorHandle` that returns the currently focused textarea ref
- In `NoteEditor.tsx`, pass `hybridEditorRef` to `MarkdownToolbar` instead of the dead `contentRef` — create a proxy ref object that delegates to the active textarea inside HybridEditor
- Alternatively: track the last-focused textarea inside HybridEditor and expose it via the imperative handle, then wire the toolbar to use it

### Files to Modify
- `src/components/HybridEditor.tsx` — local state for segments, skip re-parse on internal changes, expose active textarea ref
- `src/components/NoteEditor.tsx` — wire toolbar to HybridEditor's active textarea instead of dead contentRef

