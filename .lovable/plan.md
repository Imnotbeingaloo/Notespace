

## Plan: Redesign Mission, Approach & Philosophy Sections on About Page

**Scope**: Only the Mission/Approach section (lines 47-69) and Philosophy section (lines 73-93) will be changed. Hero, Values, Timeline, CTA, and Footer remain untouched.

### Changes to `src/pages/About.tsx`

#### 1. Replace Mission & Approach: Zigzag layout with connector line
Instead of a flat 2-column grid, use an alternating zigzag layout similar to the "Why It Matters" section on How It Works:
- Mission on the left with an icon dot in the center, then Approach on the right
- A vertical connector line runs down the center (hidden on mobile, stacked vertically instead)
- Each card has a hover glow effect (radial gradient overlay), subtle lift, and border highlight on hover
- Scroll-triggered reveal animations with alternating x-offset (`-50`/`+50`)

#### 2. Replace Philosophy: Interactive reveal cards
Instead of two static side-by-side boxes, use the `RevealCard` pattern from How It Works:
- Two cards in a grid: "The Old Way" (storing info) and "Our Way" (understanding info)
- Each card starts with a blurred emoji/icon front face and "Tap to reveal" hint
- On click, the front blurs away and the detailed description is revealed with a gradient overlay
- Section gets a mono uppercase label above the heading ("Our Philosophy") for visual hierarchy
- Scroll-triggered staggered entrance animations

#### 3. Animations
- Import additional icons if needed (e.g., `BookOpen`, `Eye`)
- All animations use the same easing curve `[0.16, 1, 0.3, 1]` as How It Works for consistency

### File modified
- `src/pages/About.tsx` — rewrite lines 47-93 (Mission/Approach and Philosophy sections)

