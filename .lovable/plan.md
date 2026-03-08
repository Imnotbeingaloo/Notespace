

## Plan: Fix spacing and font in notebook view

Two issues to fix, nothing else:

### 1. Remove serif font from notebook headings (`src/index.css`)
The global CSS rule `h1, h2, h3 { font-family: 'Merriweather', serif; }` (line 107-109) is applying serif font to headings inside the notebook editor (e.g. "notebook" title in the no-note-selected state). Remove this rule so all headings use the default Inter/sans-serif font. The Merriweather font should only be used on marketing/landing pages where `font-serif` is explicitly applied via class.

### 2. Remove extra spacing in the notebook editor (`src/components/NoteEditor.tsx`)
The empty space at the bottom of the editor (visible in image-33.png) comes from the `pb-2 sm:pb-3` padding on the title bar section (line 487). The toolbar wrapper div (line 577) also has unnecessary vertical structure. Tighten the padding on the title bar from `pt-3 sm:pt-6 pb-2 sm:pb-3` to `pt-3 sm:pt-4 pb-1 sm:pb-2` to reduce the gap between sections.

### Files changed
- `src/index.css` — remove the `h1, h2, h3` serif font rule
- `src/components/NoteEditor.tsx` — reduce title bar padding

