## 1. Home header cleanup

- Remove the "Website" button entirely.
- Make the "Notebook Archive" logo + wordmark clickable → navigates to `/` (the marketing site). Add an explicit "Home" icon button next to it (same style as the app section's home button) for clarity.
- Remove the Trash + Theme + Sign-out trio from the visible header row. Replace with a single compact icon button (avatar circle showing user's initial) that opens a small popover containing: Theme toggle, Trash, Sign out. This keeps the header clean without the heaviness of an avatar dropdown menu and avoids cramming three colored buttons into the top bar.
- Faster app→website transition: drop the splash/loader animation when navigating away from `/app` from ~2s to ~600ms (skip the staged framer-motion sequence on exit; keep entry splash intact).

## 2. Temporary Notes — full rework

Temporary notes stop being a "Scratch" notebook. They become a dedicated ephemeral workspace.

**Storage**

- New `temporary_notes` table: `id`, `user_id`, `title`, `content`, `attachments`, `created_at`, `updated_at`, `expires_at` (default `now() + 24h`).
- RLS: authenticated users CRUD only their own rows.
- Daily cleanup: extend the existing `cleanup-trash` edge function (or add a sibling cron) to delete rows where `expires_at < now()`.
- Remove the auto-created "Scratch" notebook logic from `NotebookContext` (existing scratch notebooks stay intact but no new ones are created; the sidebar "Temporary Note" entry no longer points to them).

**Entry points**

- Single "Temporary Note" button in the sidebar (under New Notebook). Removes the home card and the floating FAB.
- Clicking routes to `/app/temporary` (new route).

**Temporary workspace UI** (`/app/temporary`)

- No sidebar, no top bar — clean, distraction-free.
- Small floating top-left cluster: Notebook Archive logo (→ `/app` home), a "Permanent notes" toggle button that opens a slim read-only drawer listing the user's real notebooks/notes so they can reference (and open in a new tab) permanent content without leaving temporary mode.
- Editor occupies the full viewport. Uses the same `HybridEditor` + markdown toolbar as regular notes.
- Visible expiry chip: "Auto-deletes in 23h 47m".
- The note cannot be deleted manually — no delete button anywhere.

**Leave confirmation**

- Intercept navigation away (router guard + `beforeunload` for tab close) whenever the temp note has unsaved or non-empty content.
- Dialog copy: *"This document is temporary and will be deleted in 24 hours. What would you like to do?"*
- Buttons, in order:
  1. **Save as notebook** (primary) — promotes the temp note into a new notebook with one note inside, then navigates to it.
  2. **Save into existing notebook** — opens a notebook picker; appends as a new note.
  3. **Download** — exports as `.md`.
  4. **Discard** — deletes the temp note immediately and routes to `/app` home.
  - **X / Cancel** on the dialog keeps the user inside the temporary workspace (no navigation).

## 3. Technical notes

- New table migration with RLS + trigger for `updated_at`.
- New route `/app/temporary` in `Index.tsx` / router.
- New components: `TemporaryWorkspace.tsx`, `LeaveTempDialog.tsx`, `PermanentNotesDrawer.tsx`, `HeaderUserMenu.tsx` (popover for trash/theme/signout).
- Edit `HomeView.tsx` header: remove Website button, wire logo + Home icon to navigate, swap trio for `HeaderUserMenu`.
- Edit `AppSidebar.tsx`: point "Temporary Note" button at `/app/temporary` route instead of `createScratchNote`. Remove the home FAB in `Index.tsx`.
- Edit `SplashScreen.tsx` / route transition: bypass animation on `/app` → `/` transitions.
- Extend cleanup edge function: add `DELETE FROM temporary_notes WHERE expires_at < now()`.

## 4. Out of scope

- No changes to existing notebooks, notes, trash, or AI features.
- Existing "Scratch" notebooks already in users' accounts are left alone (they just become regular notebooks).

change the logo of the temporary notes to something like what chatgpt or better what claude uses to show it temporay chat

&nbsp;