

## Plan: Add Analyze Notes, Sidebar Enhancements, and Document Upload Support

### Changes

#### 1. Add "Analyze Notes" button to the editor toolbar (`src/components/NoteEditor.tsx`)
- New `AnalyzeButton` component (similar pattern to `FlashcardsButton`) that calls the `ai-tools` edge function with a new `action: "analyze"`
- Opens a slide-in panel showing AI analysis (key themes, gaps, suggestions, connections between ideas)
- Only runs when the user clicks -- never auto-analyzes

#### 2. Add "analyze" action to the edge function (`supabase/functions/ai-tools/index.ts`)
- Add `"analyze"` to the action enum and a new system prompt:
  - "You are a study analyst. Analyze the note and provide: key themes, knowledge gaps, study suggestions, and connections to broader topics. Use markdown formatting."
- Streams response like flashcards/summarize

#### 3. Add a text input bar and useful button above the search bar in the sidebar (`src/components/AppSidebar.tsx`)
- Add a quick-note text input above the search bar -- type text and press Enter to instantly create a new note with that text in the active notebook
- Add an "Analyze All Notes" button that sends all note titles to AI for a high-level overview of the notebook's topics

#### 4. Support HTML and MD document uploads (`src/lib/file-validation.ts`)
- Add `text/html` and `application/xhtml+xml` to `ALLOWED_TYPES`
- Also add fallback: if browser reports empty mime type for `.md`/`.html` files, detect by extension

#### 5. Auto-parse uploaded HTML/MD documents into note content (`src/components/FileUpload.tsx`)
- When an HTML or MD file is uploaded, read its text content via `FileReader` and append/insert it into the note content
- For HTML: strip tags to extract text, or insert raw HTML as markdown code block
- For MD: insert content directly into the note

### Files to Modify
- `supabase/functions/ai-tools/index.ts` -- add "analyze" action
- `src/components/NoteEditor.tsx` -- add AnalyzeButton to toolbar
- `src/components/AppSidebar.tsx` -- add quick-note text bar + analyze-all button above search
- `src/lib/file-validation.ts` -- allow HTML/MD file types
- `src/components/FileUpload.tsx` -- parse HTML/MD content into notes on upload

