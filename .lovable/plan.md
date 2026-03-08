

## Plan: Fix Image Uploads, Add Paywall, Back Button, and Download Dropdown

### 1. Fix Image Uploads (not rendering inline)

**Problem:** Images are uploaded to private storage with 7-day signed URLs. These long signed URLs get inserted as raw markdown text (`![name](very-long-url)`). In edit mode, users see the raw URL text. The signed URLs also expire after 7 days, breaking images permanently.

**Solution:**
- Change the `note-attachments` storage bucket to **public** via a SQL migration so images can be accessed with stable public URLs.
- Update `FileUpload.tsx`, `NoteEditor.tsx` (drop handler), and `AppSidebar.tsx` upload handler to use `getPublicUrl()` instead of `createSignedUrl()`. Public URLs are short, permanent, and don't expire.
- This means uploaded images will always render properly in both edit and preview mode.

### 2. Pro Feature Paywall

**Problem:** AI Summaries, Flashcards, Voice Transcription, and Smart Auto-tagging are listed as Pro features on the Pricing page but are currently accessible to all users.

**Solution:**
- Since there's no subscription/payment system yet, gate these features behind a visual paywall: when a free user clicks Summarize, Flashcards, Voice, or Auto-tag, show a modal/toast prompting them to upgrade to Pro, linking to `/pricing`.
- The free features (Export, AI Explain with 5/day limit, search, auto-save) remain accessible.
- Create a small utility hook `useIsFreeUser()` that returns `true` for now (since no payment is integrated), which can later be connected to a real subscription check.

### 3. Add Back/Home Button

**Problem:** No way to navigate back from the `/app` page to the landing page.

**Solution:**
- Add a small home/back icon button in the sidebar header (next to "Notebook Archive" text) that links to `/` (landing page).
- On the About, Pricing, and How It Works pages, the logo already links to `/`, so those are covered.

### 4. Replace Export Buttons with Download Dropdown

**Problem:** Currently shows separate `.md` and `PDF` buttons. User wants a single "Download" button with a dropdown showing multiple formats.

**Solution:**
- Replace `ExportButtons.tsx` with a single "Download" button using a Radix `DropdownMenu`.
- Dropdown options: **PDF**, **Markdown (.md)**, **Plain Text (.txt)**, **Word (.docx)** (generated client-side as a simple HTML-based .doc file, which Word can open).
- Each option triggers the appropriate export function.
- Add a subtle `framer-motion` animation on the dropdown trigger button.

---

### Files to modify:
- `src/components/ExportButtons.tsx` -- rewrite as Download dropdown
- `src/components/FileUpload.tsx` -- use public URLs
- `src/components/NoteEditor.tsx` -- use public URLs in drop handler
- `src/components/AppSidebar.tsx` -- use public URLs + add home link
- `src/components/AIToolsPanel.tsx` -- add paywall check
- `src/components/VoiceTranscription.tsx` -- add paywall check
- `src/components/NoteTags.tsx` -- add paywall check on auto-tag
- New: `src/hooks/use-pro-gate.tsx` -- paywall utility hook + upgrade prompt
- SQL migration: make `note-attachments` bucket public

