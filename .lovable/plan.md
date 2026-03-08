## Plan: Fix spacing, restore buttons, move FileUpload, reposition Trash

### 1. Remove bottom spacing on "no note selected" view (`NoteEditor.tsx`)

The `mb-6` on the paragraph (line 434) and `mb-6` on the emoji container (line 430) create excess space. Reduce `mb-6` to `mb-3` on the emoji container and `mb-4` on the paragraph to tighten the layout.

### 2. Restore VoiceTranscription and ExportButtons on desktop (`NoteEditor.tsx`)

Add `VoiceTranscription` and `ExportButtons` back into the desktop actions row (line 536-542), after SymbolsPicker. These were previously visible on desktop but are now only in the mobile dropdown.

### 3. Move FileUpload back to the bottom (`NoteEditor.tsx`)

- Remove `FileUpload` from the toolbar div (line 585)
- Add it back as a separate `<div className="shrink-0 px-4 sm:px-8 py-3 border-t border-border">` below the content area (before the closing `</motion.div>`)

### 4. Move Trash section above Theme in sidebar footer (`AppSidebar.tsx`)

- Remove the Trash section from its current position (lines 540-643, inside the scrollable area)
- Move it into the footer area (line 669), placing it above the ThemeToggle row
- Keep the same collapsible trash UI, just repositioned

### Files changed

- `src/components/NoteEditor.tsx` — fix spacing, restore buttons, move FileUpload
- `src/components/AppSidebar.tsx` — move Trash to footer area above Theme  
  
add the preview button where it orginally was, no and same for the tool bar, dont change the locations of anything from  what it oringally was, lastly no changes other than this
- &nbsp;