# Plan

Two tracks: ship the SEO surfaces for the "study planner / study schedule" cluster, and fix the three editor issues from your message.

---

## Track 1 - SEO (study planner / study schedule)

### 1. Optimize homepage + marketing for "study planner" + "study schedule"

Targeted, additive copy only - no visual redesign.

- `index.html`: rewrite `<title>` and `<meta name="description">` to naturally include both phrases (e.g. *"Notebook Archive - AI study planner & note-taking app"* / desc mentioning "study schedule").
- `src/pages/Landing.tsx`: add one short sub-headline / eyebrow line under the hero that includes "study planner" and "study schedule" in human prose, plus one feature row mentioning both. No layout shift.
- `src/pages/Features.tsx`: extend the existing "Organize" / planner section copy with the two phrases.
- `SeoHead` defaults reviewed so the homepage canonical/OG mirror the new title.

### 2. Two new guide posts (long-form, ranking-grade)

Each follows the existing `Blog*` page pattern (PageHeader, SeoHead with HowTo + FAQ JSON-LD, Merriweather sections, internal links to `/templates/study-planner` and `/app`).

- `**/blog/how-to-make-a-study-plan**` - targets "how to make a study plan", "how to create a study plan", "study plan template". Includes a copy-pasteable weekly study plan template inside the post.
- `**/blog/how-to-make-a-study-plan-for-exams**` - targets "how to make a study plan for exams", "exam study plan", plus long-tails (finals/MCAT/GRE phrasing in one FAQ block).

Wire each into `src/App.tsx`, `scripts/site-routes.ts` (PUBLIC_ROUTES), and `src/pages/BlogIndex.tsx`.

### 3. New `/templates/study-planner` page

Targets "exam study planner" + "study planner app". Built as a dedicated route (not a `TemplateDetail` slug, so it can carry its own SEO + CTA shape):

- Hero with the two keywords in H1 + sub-headline.
- Visible template preview (weekly + exam-week layouts).
- "Open this template in Notebook Archive" CTA → creates a note from the template via the existing `NoteTemplatePicker` flow.
- FAQ schema covering "Is there a free study planner app?", "What's the best study planner for exams?".
- Add to `App.tsx`, `site-routes.ts`, and link from `/templates` gallery + both new blog posts.

---

## Track 2 - Editor fixes

### 4. Kill the scrollbar on the editor (regression)

`src/components/NoteEditor.tsx` line 907: `overflow-y-auto` is back on the editor scroll container. Restore the previous behavior - the editor body scrolls without a visible scrollbar (use `scrollbar-none` like the toolbar row at line 878, keep scrolling functional).

### 5. Hide the whole stats strip when "word goal" is toggled off

Right now `WordCount` (words / chars / min read - the strip in your screenshot) renders unconditionally at line 918. Gate the entire footer block on `wordCountGoalEnabled`:

- When ON → show `WordCount` + `WordCountGoal` (today's behavior).
- When OFF → render nothing (no words, no chars, no reading time, no goal row).

### 6. Fix the "words /chars / minute read counter" on  documents

`currently its showing 70 characters, 8 words and 1 minute read for a blank document thats how you know its not fixed, fix it entirely`

`src/components/WordCount.tsx` strips HTML with a regex but the editor's empty state is `<p><br></p>` / nbsp / placeholder markup that survives the strip and inflates the count. Fix:

- Strip tags, decode `&nbsp;`, collapse whitespace, then trim before counting.
- If the cleaned text is empty → return null (don't render the strip at all).
- `readTime` uses `Math.max(1, ...)` which forces "1 min" even at 0 words - change to: 0 words → no strip; otherwise compute normally.

---

## Files touched

```text
SEO
  index.html
  src/pages/Landing.tsx
  src/pages/Features.tsx
  src/pages/BlogHowToMakeStudyPlan.tsx          (new)
  src/pages/BlogHowToMakeStudyPlanForExams.tsx  (new)
  src/pages/TemplateStudyPlanner.tsx            (new)
  src/pages/BlogIndex.tsx
  src/pages/TemplatesGallery.tsx
  src/App.tsx
  scripts/site-routes.ts

Editor
  src/components/NoteEditor.tsx     (scrollbar + gate stats strip)
  src/components/WordCount.tsx      (blank-doc fix)
```

Sitemap regenerates automatically via the existing `predev`/`prebuild` hook once `site-routes.ts` is updated.

No backend, schema, or auth changes.