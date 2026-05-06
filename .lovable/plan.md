## Plan

### 1. Favicon & logo split

- Replace `public/favicon.png` with the new uploaded teal open-book image (no white circle background). This file is used by the browser tab favicon AND by the in-app logo across `PageHeader.tsx`, `Landing.tsx`, `SplashScreen.tsx`, `LoadingScreen.tsx`, `SharedNote.tsx`, `AppSidebar.tsx`. By replacing the single asset with the no-white-circle version, the logo "returns to as it was" everywhere (no white halo) while the favicon also updates to the new icon. No code changes to image refs needed.

### 2. App top-bar: back-arrow replaces Home / Visit Website

In `src/pages/Index.tsx` top bar:

- Remove the current dual button (Home icon when editing / "Visit Website" link when on home).
- Replace with a single icon-only `ArrowLeft` button (no text) that links to `/` (website). Always visible (focus-mode aside). Place it as the first item in the left cluster, next to the sidebar toggle.
- Keep `openHome` reachable via the sidebar Home button (already wired).

### 3. Mobile/tablet header alignment (Landing + PageHeader)

The screenshots show "Notebook Archive | Open App | hamburger" cramped/overlapping on phone, and "Features Pricing About How It Works" too tight to logo on tablet.

`**src/pages/Landing.tsx` floating navbar (lines ~108–147):**

- Hide the "Notebook Archive" wordmark below `sm` (only show logo icon on phones) so the Open App button + hamburger fit cleanly.
- Add `gap-2 sm:gap-3` between brand / nav / CTA cluster.
- Reduce CTA padding on mobile (`px-2.5 py-1.5`) and ensure `whitespace-nowrap`.

`**src/components/PageHeader.tsx`:**

- Same wordmark hide-below-sm rule.
- Increase tablet (`md`) gap between logo and nav (`md:gap-5`) and between nav links (`md:gap-1.5`).
- Keep desktop sizing/padding as-is.

### 4. HomeView loading + error states

In `src/components/HomeView.tsx`:

- Pull `loading` flag from `NotebookContext` (add it if not exposed; it likely already loads notebooks). Show a 6-card skeleton grid (animated `bg-muted/60` placeholders) while loading.
- Pagination: when the IntersectionObserver triggers `setVisible`, show a small spinner row above the sentinel for ~250ms before revealing new cards (purely presentational, prevents flicker).
- Error: catch any context error; display a small bordered card "Couldn't load your notebooks" with a Retry button.

In `src/pages/Index.tsx`:

- Deep-link hydration: while `urlNotebook` exists but notebooks list is still empty, render `<LoadingScreen label="Opening notebook…" />` instead of `HomeView` flicker.

### 5. Tests

- **Keyboard nav** — `src/test/home-view-keyboard.test.tsx`: render `HomeView` with a mock `NotebookProvider` of 6 notebooks, simulate ArrowRight/ArrowDown/Home/End focus moves, and `Enter` to assert `onOpenNotebook` is called with the right id.
- **Deep-link refresh integration** — `src/test/app-deeplink.test.tsx`: render `<MemoryRouter initialEntries={["/app?notebook=ID&note=NID"]}>` with a mock notebooks fixture; assert the editor renders that note's title (i.e. selection survives mount). Run a second render (simulating refresh) with same URL → same note still selected.
- **Visual regression** — add `src/test/visual-regression.test.tsx` using Vitest + jsdom to snapshot `PageHeader` and `HomeView` markup at mobile (375), tablet (820), desktop (1440) viewport widths via `matchMedia` mock. (True pixel screenshots need Playwright which isn't set up; DOM/className snapshot regression is the practical equivalent inside Vitest and catches alignment-class changes.)

### Files touched

```text
public/favicon.png                       (replaced asset)
src/pages/Landing.tsx                    (mobile header)
src/components/PageHeader.tsx            (tablet/mobile spacing)
src/pages/Index.tsx                      (back-arrow, deep-link loading)
src/components/HomeView.tsx              (skeleton + pagination spinner + error)
src/test/home-view-keyboard.test.tsx     (new)
src/test/app-deeplink.test.tsx           (new)
src/test/visual-regression.test.tsx      (new)
```

### Out of scope

- No changes to existing animations/timings of SplashScreen (logo asset itself updates via favicon.png replacement).
- No backend / RLS / migration changes.
- No content/copy changes elsewhere.

Implement a strict Content Security Policy (CSP) to reduce the impact of any future XSS vectors and add automated tests that verify the editor output is sanitized and cannot render executable HTML or scripts.