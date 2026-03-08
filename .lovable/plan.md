

## Plan: Mobile Responsiveness, Export Formats, Unlock Features, Toast Auto-dismiss, and Image Upload Fix

### Issues Identified

1. **Image upload shows raw markdown URL** — From the screenshot, images are inserted as `![name](url)` text in edit mode, which is expected for markdown. The issue is the images aren't rendering. Looking at the URLs, they use the correct public URL pattern. The problem is likely that the user is in **edit mode** (textarea) rather than **preview mode**. The textarea shows raw markdown — this is by design. However, we should improve UX by showing a brief toast telling the user to click "Preview" to see images, or better yet, render inline image previews within the editor.

2. **Download dropdown missing formats** — User wants: Microsoft Word (.docx), PDF (.pdf), OpenDocument Format (.odt), Plain Text (.txt), Rich Text Format (.rtf), Web Page (.html), EPUB (.epub), Markdown (.md). Currently only has PDF, Markdown, Plain Text, Word.

3. **Pro feature toast doesn't auto-dismiss** — `TOAST_REMOVE_DELAY` is set to `1000000` (essentially never). Need to add a 3-second duration to the pro gate toast.

4. **Features should NOT be locked** — User says "right now dont lock the features". Remove the pro gate checks so all features are accessible.

5. **Mobile responsiveness** — Need to audit:
   - NoteEditor toolbar buttons overflow on mobile (too many buttons in one row)
   - Landing, About, HowItWorks, Pricing pages need checking

### Changes

#### 1. Unlock All Features (remove pro gate)
- **`AIToolsPanel.tsx`**: Remove the `isPro` check — let `runTool` proceed directly
- **`VoiceTranscription.tsx`**: Remove the `isPro` check
- **`NoteTags.tsx`**: Remove the `isPro` check
- Remove `Lock` icons from all buttons

#### 2. Toast Auto-Dismiss (3 seconds)
- **`src/hooks/use-toast.ts`**: Change `TOAST_REMOVE_DELAY` from `1000000` to `3000`

#### 3. Expand Download Dropdown Formats
- **`ExportButtons.tsx`**: Add these formats from the user's screenshot:
  - PDF (.pdf) ✓ exists
  - Microsoft Word (.docx) ✓ exists
  - Plain Text (.txt) ✓ exists
  - Markdown (.md) ✓ exists
  - **Add**: Rich Text Format (.rtf) — generate simple RTF content
  - **Add**: OpenDocument Format (.odt) — generate as HTML-based ODT
  - **Add**: Web Page (.html) — export as HTML
  - **Add**: EPUB (.epub) — generate simple EPUB package

#### 4. Image Upload UX Improvement
- The images ARE uploading correctly with public URLs. The "issue" is that the user sees raw markdown in edit mode. Add a toast notification after image upload telling user to click Preview, OR add inline image rendering in the textarea area.
- Better approach: Show small image thumbnails below the textarea when images are embedded, and add a toast "Image added — switch to Preview to see it rendered".

#### 5. Mobile Responsiveness Fixes
- **`NoteEditor.tsx`**: The toolbar row (Voice, Download, Summarize, Flashcards, Ask AI, Preview) overflows on mobile. Wrap these into a collapsible "more tools" dropdown on small screens, or stack them more intelligently.
- **`NoteEditor.tsx`**: Reduce padding and font sizes on mobile for the actions bar.
- **Landing/About/HowItWorks/Pricing pages**: Already have responsive layouts with `md:` breakpoints. The main concern is the app editor page.
- **`AppSidebar.tsx`**: Already handles mobile overlay. Good.

### Files to Modify
- `src/components/AIToolsPanel.tsx` — remove pro gate
- `src/components/VoiceTranscription.tsx` — remove pro gate  
- `src/components/NoteTags.tsx` — remove pro gate
- `src/hooks/use-toast.ts` — change TOAST_REMOVE_DELAY to 3000
- `src/components/ExportButtons.tsx` — add RTF, HTML, EPUB, ODT formats
- `src/components/NoteEditor.tsx` — mobile-responsive toolbar layout, image upload toast
- `src/components/FileUpload.tsx` — add toast after image upload

