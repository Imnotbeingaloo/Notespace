
## What I understood
You want 4 things on `/how-it-works`:
1. Hero should feel larger (more breathing room).
2. Moving circle must stay perfectly centered on each step node/line (no recurring offset).
3. Moving circle should **not rotate**.
4. You want a shortlist of subtle animations that improve the main site + subpages without feeling excessive.

## What I found in current code
- Hero is compact: `pt-24 pb-20 max-w-4xl`, so it reads smaller than other marketing sections.
- Step reel dot position is based on hardcoded percentages (`circlePos = [2.5, 35.8, 69.2]`), which can drift when container width/padding changes.
- Dot currently rotates via `dotRotation` motion value and `rotate` style.
- The “misaligned/pill” look in your screenshot is consistent with slight horizontal mismatch between active step circle and moving dot.

## Implementation plan

### 1) Enlarge the How It Works hero (single-page adjustment)
File: `src/pages/HowItWorks.tsx`
- Increase hero vertical spacing to match premium marketing rhythm:
  - `pt-24 pb-20` → larger values (e.g., `pt-32 md:pt-36 pb-28 md:pb-32`)
- Slightly increase hero content footprint:
  - `max-w-4xl` → `max-w-5xl`
  - Keep typography balanced (optional small bump to heading size only if needed after spacing update).

### 2) Make step-dot alignment robust (remove hardcoded guessing)
File: `src/pages/HowItWorks.tsx` (`StepReel`)
- Replace hardcoded `%` positions with measured node centers from DOM:
  - Add refs for reel viewport and each numbered circle.
  - Compute each center X from `getBoundingClientRect()` relative to viewport.
  - Store measured positions and use those for animation targets.
- Keep dot movement in **pixels** (not percentages) so it stays accurate across screen sizes.
- Recalculate centers:
  - on mount,
  - after slide-group transitions,
  - on resize (debounced/RAF-safe).
- Keep the same circle→line→circle timing flow, but targets come from live measurements.

### 3) Remove rotation completely
File: `src/pages/HowItWorks.tsx`
- Delete `dotRotation` state and all `rotate` animation calls.
- Keep only horizontal translation (`dotX`) with easing.
- Simplify dot visuals to a clean static indicator (still premium, no spin).

### 4) Subtle animation recommendations (not overdone)
I’ll keep these as lightweight enhancements you can choose next:
1. **Section header reveal standardization**: same fade-up + small stagger for title/subtitle across About/Pricing/How It Works.
2. **Card hover micro-lift**: `y: -2 to -4` + soft shadow increase (already used in some places; make consistent).
3. **CTA idle glow (very low amplitude)**: soft opacity pulse every few seconds, no movement.
4. **Divider polish**: tiny brightness pulse on center dot only when entering viewport (once).
5. **Nav active-state transition**: subtle underline/opacity slide for page changes.

## Validation checklist after implementation
- On desktop + tablet + mobile widths, moving dot lands exactly at center of step circles.
- Dot path remains circle→line→circle across both groups.
- No rotation anywhere in step indicator.
- Hero feels visually balanced vs other marketing pages (no cramped top section).
- Animation intensity remains minimal and premium, not distracting.
