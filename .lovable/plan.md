

## Plan: Fix Toolbar Consistency, Mobile Responsiveness, and Page Loading

### Issues Found

1. **Inconsistent toolbar button sizes** — From the screenshot, all toolbar buttons use similar styling but `AIToolsPanel` renders TWO buttons (Summarize + Flashcards) wrapped in a `flex gap-1` div, while other components render single buttons. This creates uneven spacing. The `AIEditPanel` button also has slightly different padding compared to others.

2. **Page not loading** — The user says the page isn't loading. Since there are no console errors captured, this is likely a rendering issue. The `NoteEditor` textarea uses `flex-1` but is inside a `flex flex-col` without a fixed height — the textarea may collapse to zero height. The `InlineImagePreviews` component could also cause layout issues if images fail to load.

3. **Preview button missing** — The user says "dont remove the preview button." The preview button IS in the code (line 284-294), so it should be visible. But on mobile, if the toolbar overflows, it may get pushed out of view.

4. **Mobile toolbar overflow** — The "More" dropdown on mobile works but the buttons inside it (Voice, AI Edit, Summarize, Flashcards, Ask AI) all render at full width. The `AIToolsPanel` renders two side-by-side buttons inside the dropdown which looks cramped.

### Changes

#### 1. Normalize all toolbar button sizes
- **`NoteEditor.tsx`**: Ensure all buttons in the toolbar row use identical `px-3 py-1.5 text-xs rounded-xl` styling consistently.
- Make the mobile "More" dropdown items render as full-width stacked buttons with consistent height.

#### 2. Fix `AIToolsPanel` rendering two buttons
- **`AIToolsPanel.tsx`**: The component renders two separate buttons (Summarize, Flashcards). These should remain separate in desktop but stack properly in the mobile "More" dropdown.

#### 3. Fix textarea height / page not loading
- **`NoteEditor.tsx`**: The textarea has `flex-1` class but the parent div `flex-1 flex flex-col` may not be passing height correctly. Add `min-h-0` to the flex containers and ensure the textarea gets proper height with `h-full` instead of relying solely on `flex-1`.

#### 4. Keep Preview button always visible
- Already visible in code. Ensure it's not accidentally hidden on any breakpoint.

#### 5. Mobile responsiveness audit
- **`NoteEditor.tsx`**: The meta/actions row wraps correctly with `flex-wrap` isn't set — add `flex-wrap` so buttons wrap to next line on small screens instead of overflowing.
- **About, HowItWorks pages**: The nav headers on About/HowItWorks/Pricing hide nav links on mobile (`hidden md:flex`) but don't have a mobile hamburger menu like Landing does. Add a simple mobile menu toggle to these pages.

### Files to Modify
- `src/components/NoteEditor.tsx` — fix textarea height, normalize toolbar, add flex-wrap for mobile
- `src/components/AIToolsPanel.tsx` — adjust button layout for mobile dropdown context
- `src/pages/About.tsx` — add mobile nav menu
- `src/pages/HowItWorks.tsx` — add mobile nav menu  
- `src/pages/Pricing.tsx` — add mobile nav menu

