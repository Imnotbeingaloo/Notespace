# End-to-end & visual regression tests

Playwright suites for:

1. Sidebar collapse/expand + animated logo morph
2. Notification (sonner) non-overlap
3. Header border alignment & editor bottom-right overlay snapshots

## First-time setup

```bash
bun add -d @playwright/test
bunx playwright install chromium
```

## Run

```bash
bunx playwright test               # all tests
bunx playwright test --ui          # interactive
bunx playwright test --update-snapshots   # refresh baselines after intentional UI changes
```

## Notes

- The suite expects `bun run dev` on `http://localhost:8080` (auto-started by config).
- Tests that need an authenticated session are skipped automatically when the
  app redirects to `/auth`. Set up `storageState` in `playwright.config.ts` to
  enable them in CI.
