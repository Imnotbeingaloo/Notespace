

## Plan: Fix dot jump on group 3→4 transition

### Root Cause

When the filmstrip slides from group 0 to group 1, the code does:
1. `animate(slideX, -viewportWidth)` — slides the strip
2. One `requestAnimationFrame` — not enough for layout to settle
3. `dotX.set(measureCircleX(3))` — measures circle 3's position via `getBoundingClientRect()`

The single `requestAnimationFrame` isn't sufficient — the DOM/transform hasn't fully settled, so `measureCircleX(3)` returns a stale or incorrect value (near circle 6's position). The dot snaps there, then corrects on the next measurement.

### Fix in `src/pages/HowItWorks.tsx`

**1. Hide dot during group transition, reposition after layout settles**

- Add a `dotVisible` state (boolean, default `true`).
- Before the slide animation: set `dotVisible = false` (fade out dot).
- After the slide animation completes: wait for **two** `requestAnimationFrame` calls (ensures layout is fully settled), then `dotX.set(measureCircleX(3))`, then set `dotVisible = true`.
- Apply `opacity: dotVisible ? 1 : 0` with a quick 150ms CSS transition on the dot container.

**2. Same treatment for the reset (group 1 → group 0)**

- Before resetting `slideX` to 0: hide dot.
- After slide reset + layout settle: reposition dot to `measureCircleX(0)`, show dot.

This eliminates the visible jump — the dot disappears during the slide, reappears cleanly on circle 4 (step index 3).

### Code changes summary
- Add `dotVisible` state
- ~4 lines changed around the slide transition (lines 74-81)
- ~3 lines changed around the reset (lines 95-97)
- Add `opacity` + `transition` to the dot's motion div (line ~115)

