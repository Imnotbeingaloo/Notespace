## 1. Revert hero to original centered layout

Restore the previous version of the hero in `src/pages/Landing.tsx`:
- Sparkle pill badge ("AI-Powered Note Taker") with the rotating Sparkles icon
- Centered two-tone headline ("Your thoughts, organized & understood")
- Centered subhead and two CTAs ("Start for Free" + "See Features")
- Re-add the `Sparkles` import that was removed

## 2. Replace the orange accent (hero only) with forest green

The global `--accent` orange token is used in many other places (Temporary Note button, study planner dots, the sparkle icon, etc.), so the global token stays.

- Add one new CSS variable `--hero-green: 152 42% 32%` to `:root` and `.dark` in `src/index.css`
- In the hero headline, change the word "understood" from `text-accent` to `text-[hsl(var(--hero-green))]`
- Everything else that uses orange (sparkle icon, badges, buttons across the rest of the site) is untouched

If a different green is wanted later (sage, emerald, olive), it's a one-value swap.

## 3. Aurora-wash background animation behind the hero

Add two large blurred blobs behind the hero content:
- Blob A: teal (`--primary`), top-left area, ~32rem, blur-3xl, ~12% opacity
- Blob B: forest green (`--hero-green`), bottom-right area, ~28rem, blur-3xl, ~10% opacity
- Both animated with framer-motion: slow drift (x/y by ~40px) and scale (1 → 1.08) on a 14–18s loop, `repeatType: "mirror"`, `ease: "easeInOut"`
- `mix-blend-mode: multiply` so they tint the cream paper rather than sitting on top
- Wrapped in `motion.div` with `aria-hidden` and `pointer-events-none`
- A `@media (prefers-reduced-motion: reduce)` rule freezes them at their initial position

The existing soft gradient wash (`bg-gradient-to-b from-primary/[0.04]`) is kept so the hero still has its warm halo; the aurora blobs sit on top of it and provide the motion.

## Files touched

- `src/index.css` — add `--hero-green` to `:root` and `.dark`, plus the reduced-motion rule for the aurora blobs
- `src/pages/Landing.tsx` — revert hero JSX to the centered version, swap the "understood" color class, add the two animated blob divs as the first children inside the hero `<section>`, re-add `Sparkles` import

## Out of scope

- No changes to the navbar, app preview, features grid, dividers, footer, or any other page
- No change to the global `--accent` token
- No new fonts, no copy rewrites beyond what's already in the original hero
