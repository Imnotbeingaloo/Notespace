## Batch 1 — Shipped

- **Explain card** repositioned to overlap the manuscript card's bottom-right corner (Landing.tsx).
- **Auth** now enforces min 6-character passwords with inline validation (Auth.tsx).
- **Trash → Back** returns to the last opened notebook (Trash.tsx, uses persisted `activeNotebookId`).
- **Display name** captured via first-run "What should we call you?" dialog on Home, shown in Home greeting + sidebar footer, editable in Settings.
- **Settings dialog** (Personal / Password / Appearance / Data & Export) accessible from header menu and sidebar; password change rate-limited to once per 30 days via `profiles.password_last_changed_at`.

## Next batches (queued)

- Batch 2: Upload/Attach fix + scope prompt + progress · Image-from-upload toolbar button · Focus Mode merges Pomodoro.
- Batch 3: "Confused?" onboarding (i icon) · Toolbar tooltips · Temp Workspace reload fix.
- Batch 4: Toolbar drag-customization + Archive zone · Flashcards right/wrong with animations.
