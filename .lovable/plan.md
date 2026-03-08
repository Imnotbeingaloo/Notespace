

## Fix: Vertically align rolling dot with step number circles

### Problem
The rolling dot overlay has `top-[12px]`, placing it lower than the step number circles which sit at `top: 0` within their card. The dot needs to be at the same vertical position as the `w-8 h-8` step circles.

### Change in `src/pages/HowItWorks.tsx`

**Line 124:** Change `top-[12px]` to `top-0` on the rolling dot's container so it aligns perfectly with the step number circles at the top of each card.

That's the only change needed -- a single CSS class fix.

