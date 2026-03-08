

## Plan: Step Reel Line Continuity, Direct Return, Hero Parallax, and Mobile Fixes

### 1. Connect the step reel lines into one continuous track

**Problem**: Each step card has its own disconnected line segment (`flex-1 h-px bg-border`). The dot appears to jump between gaps rather than gliding on a continuous rail.

**Fix in `HowItWorks.tsx`**:
- Add a single continuous horizontal line spanning the full width of the filmstrip, positioned at the vertical center of the numbered circles (top area).
- Remove the per-step `<div className="flex-1 h-px bg-border" />` segments.
- The continuous line sits behind the circles (z-0), so the dot (z-30) and circles (z-10) layer on top of it.
- This creates the visual of the dot traveling along a connected rail through all 6 circles.

### 2. Direct return from step 6 to step 1

**Problem**: User wants a single smooth 0.5s animation from 6 back to 1 — no step-by-step reverse. The current code already does a 0.5s slide, but we need to ensure the dot doesn't visually retrace through intermediate circles.

**Fix**: Keep the existing fast return logic (slide + dot in parallel over 0.5s). The continuous line from fix #1 will make this look like a smooth glide rather than a jump. No step-by-step reverse is needed.

### 3. Hero parallax on How It Works page

**Fix in `HowItWorks.tsx`**:
- Use `useScroll` + `useTransform` from framer-motion on the hero section.
- The badge, heading, and subtitle each get a slightly different Y-transform rate based on scroll progress, creating a subtle depth/parallax feel as the user scrolls past the hero.

### 4. Mobile responsiveness fixes

**Step Reel on mobile** (`HowItWorks.tsx`):
- On small screens, the 6 cards in a horizontal filmstrip are too cramped. Show 1-2 steps at a time instead of 3 by adjusting card widths from `w-[calc(100%/6)]` to responsive values (e.g., `w-full sm:w-1/2 md:w-[calc(100%/6)]`). Alternatively, hide the step reel on mobile and show a vertical step list instead.
- Reduce padding (`px-8` → `px-4`) on mobile for step cards.

**Zigzag cards on mobile** (`HowItWorks.tsx`):
- Already stacks vertically via `flex-col`. Ensure the center icon dot and vertical line display correctly on mobile (currently hidden via `hidden md:block`).

**All pages**: Audit text sizes, padding, and card layouts for mobile. Key items:
- **Landing**: App preview sidebar is hidden on mobile (already handled). Verify hero text sizing.
- **Pricing**: Comparison table grid-cols-4 may overflow on mobile — add horizontal scroll wrapper or stack differently.
- **About**: Mission/Approach 2-col grid already collapses to single column.

### Files to modify
- `src/pages/HowItWorks.tsx` — continuous line, parallax hero, mobile step reel sizing
- `src/pages/Pricing.tsx` — mobile table scroll wrapper

### Summary of changes
1. Replace per-step line segments with one continuous horizontal rail line across the filmstrip
2. Keep the existing direct 0.5s return (no step-by-step reverse)
3. Add scroll-based parallax transforms to the How It Works hero elements
4. Adjust step reel card widths and padding for mobile readability
5. Wrap pricing comparison table for mobile horizontal scroll

