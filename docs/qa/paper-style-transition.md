# Manual QA — Paper-style transition overlay

Verify the loading overlay always appears when switching between **Modern** and **Classic** notebook paper, and that quick toggles don't cause visual flicker.

## Setup
1. Sign in and open any note in `/app`.
2. Open **Settings → Preferences**. Keep the dialog open while testing.

## Cases

### 1. Cold switch (Modern → Classic)
- Toggle "Classic notebook paper" **on**.
- ✅ A full-screen overlay with the logo + "Switching paper style…" appears immediately.
- ✅ Overlay stays visible for at least ~450ms (no instant flash).
- ✅ Background is fully covered (no editor visible behind it).
- ✅ Toast "Notebook paper enabled" appears in the bottom-right after the overlay dismisses.

### 2. Cold switch back (Classic → Modern)
- Toggle the switch **off**.
- ✅ Overlay appears again, same duration.
- ✅ Editor returns to the modern surface (no ruled lines, no red margin).

### 3. Rapid double-toggle (anti-flicker)
- Toggle on, then immediately toggle off within ~200ms.
- ✅ Overlay stays continuously visible — it does NOT disappear and reappear between the two toggles.
- ✅ Final state matches the last toggle position.
- ✅ Only one overlay element exists at a time in the DOM.

### 4. Rapid triple-toggle
- Toggle on/off/on as fast as possible.
- ✅ Overlay remains visible for the full sequence and ends in the "on" state.
- ✅ No console errors.

### 5. Accessibility
- With the overlay visible, press **Tab** repeatedly.
- ✅ Focus does not move into the editor underneath.
- Press **Escape**.
- ✅ Overlay is not dismissible by Escape (it's a system transition, not a dialog).
- Inspect the overlay element.
- ✅ Has `role="status"`, `aria-live="polite"`, `aria-busy="true"`, and a descriptive `aria-label`.
- ✅ A visually-hidden `<span class="sr-only">` describes the transition for screen readers.

### 6. Scroll lock
- Before toggling, scroll the editor to the middle.
- Toggle the paper style.
- ✅ Background does not scroll while the overlay is up.
- ✅ Scroll position is preserved after the overlay closes.

### 7. Dark mode
- Switch to **Settings → Appearance → Dark**.
- Toggle paper style on.
- ✅ Overlay background uses dark theme tokens (no white flash).
- ✅ Ruled lines fill the entire writing area edge-to-edge with no lighter bands.

### 8. Mobile viewport (≤ 640px)
- Resize to a phone viewport.
- Toggle paper style.
- ✅ Overlay covers the full viewport including the sidebar/topbar.
- ✅ Logo + label remain centered.

## Pass criteria
All 8 cases must pass. If any case fails, file a bug referencing this checklist and the specific case number.
