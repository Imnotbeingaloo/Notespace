

## Plan: Keep dot always visible + animate along the connecting line

### Current behavior
- The dot disappears (`showDot: false`) when stationary on a circle — user wants it always visible.
- The dot animates between circle centers but visually floats above the cards rather than traveling along the horizontal line connecting the numbered circles.

### Changes in `src/pages/HowItWorks.tsx`

**1. Keep dot always visible**
- Remove `showDot` state entirely.
- Set dot `opacity` to always `1`.
- The dot sits on top of the active circle at all times — this is fine since it's a ring with a small inner dot, visually wrapping the numbered circle.

**2. Make dot travel along the connecting line**
- The dot is currently positioned at `top-2` (matching the `pt-2` buffer), which aligns with the top of the numbered circles. This is correct vertically.
- The `dotX` already animates between `measureCircleX(n)` positions (circle centers). Since the `h-px bg-border` line connects circles horizontally in the same row, the dot already moves along that line path. The issue is that the dot disappears during pauses, so the user never sees it sitting on the line endpoints (the circles).
- By keeping the dot always visible, the visual will be: dot sits on circle 1 → smoothly slides along the line to circle 2 → sits on circle 2 → slides to circle 3, etc.

**3. Adjust dot z-index**
- Ensure the dot renders above the numbered circle (`z-30` already) so when stationary on a circle, it wraps around it cleanly as a glowing ring indicator.

### Summary of code changes
- Delete `showDot` state and all `setShowDot` calls.
- Change dot opacity from `showDot ? 1 : 0` to just `1`.
- Remove `transition-opacity duration-200` class (no longer needed).
- Everything else stays the same — the animation sequence, timing, slide transition, and `measureCircleX` logic are all correct.

