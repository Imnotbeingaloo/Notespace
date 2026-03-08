## Plan: Fix bottom spacing, create Trash page, auto-expire after 30 days

### Issue identified

The screenshot shows the "no note selected" view with a large empty beige area below the "New Note" button. The content is vertically centered (`items-center justify-center`) but the `editor-surface` background creates a visual "dead zone." The fix is to remove the bottom empty area by pushing content slightly higher and ensuring the layout feels intentional.

### 1. Fix bottom spacing in "no note selected" view (`NoteEditor.tsx`)

- Change the "no note selected" container from `flex-1 flex items-center justify-center` to `flex-1 flex flex-col items-center pt-[15vh]` so content sits in the upper portion rather than dead-center with a huge empty bottom half.
- Apply the same fix to the "no notebook selected" view (line 414).

### 2. Create dedicated Trash page (`src/pages/Trash.tsx`)

- New route `/trash` added to `App.tsx`
- Page shows all trashed notebooks and notes in a clean list/card layout
- Each item shows: name, type (notebook/note), date deleted, parent notebook (for notes)
- Actions per item: Restore, Delete Forever (with confirmation dialog)
- "Empty Trash" button at the top to permanently delete everything (with confirmation)
- Auto-calculates days remaining before expiry (30 days)
- Protected route (requires auth)

### 3. Update sidebar Trash section (`AppSidebar.tsx`)

- Replace the inline collapsible trash list with a link to `/trash` page
- Keep the trash icon and count badge
- Clicking opens the dedicated trash page

### 4. Auto-expire trash after 30 days (backend function)

- Create a new edge function `supabase/functions/cleanup-trash/index.ts` that:
  - Deletes notebooks where `deleted_at < now() - 30 days`
  - Deletes notes where `deleted_at < now() - 30 days`
  - Also deletes associated storage attachments for permanently deleted notes
- Set up a pg_cron job via migration to call this function daily

### 5. Add "days remaining" display on Trash page

- Show "Expires in X days" next to each trashed item based on `deleted_at + 30 days`

### Files changed

- `src/components/NoteEditor.tsx` — fix vertical centering to remove bottom dead space
- `src/pages/Trash.tsx` — new dedicated trash page
- `src/App.tsx` — add `/trash` route
- `src/components/AppSidebar.tsx` — link trash to dedicated page instead of inline list
- `supabase/functions/cleanup-trash/index.ts` — auto-expire edge function
- New migration — add pg_cron schedule for daily cleanup  
  
add the text like there was before with the attachment, replace the analyze button with preview and make e the second last button