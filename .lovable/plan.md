

## Plan: Fix Step Reel — Slide Transition, Dot Overlap, and Card Spacing

### Problems Identified

1. **Filmstrip doesn't slide to group 2**: `slideX` animates to `-50` (pixels), but it's applied to a `200%`-width container. Need to slide by 50% of the *viewport container width* in pixels dynamically.
2. **Dot overlaps numbered circle awkwardly**: When the indicator dot sits on a step circle, both render on top of each other creating a visual glitch. Fix: hide the dot indicator while it's stationary on a circle — only show it while traveling between circles.
3. **Cards feel cramped**: Increase horizontal padding, bump title and description font sizes.

### Changes — `src/pages/HowItWorks.tsx`

**1. Fix the slide transition (stuck after step 3)**
- Before sliding, measure `viewportRef.current.offsetWidth` to get the actual pixel width of the visible area.
- Animate `slideX` to `-viewportWidth` (negative container width in px) instead of hardcoded `-50`.

**2. Fix dot/circle overlap**
- Hide the rolling dot when it's stationary on a circle (during the 1s pauses). Add a `showDot` state, set it to `false` during pauses (when dot is on a circle), `true` only while animating between circles.
- Apply `opacity: showDot ? 1 : 0` with a quick transition on the dot container.
- This way the numbered circle is clearly visible during pauses, and the dot only appears during travel.

**3. Increase card spacing and text size**
- Card padding: `px-5` → `px-8`
- Title: `text-lg` → `text-xl`
- Description: `text-sm` → `text-base`
- Gap between number row and content: `mb-5` → `mb-6`

