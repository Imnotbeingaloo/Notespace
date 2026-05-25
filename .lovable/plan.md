## Goal

Three targeted refinements to the hero area on `src/pages/Landing.tsx`, plus a favicon fix. No content/copy changes, no changes outside the hero and one section directly below it.

## 1. Hero background — slightly darker, no tint

Remove the teal-tinted gradient currently sitting on top of the hero. Replace it with a flat, *slightly* darker neutral surface so the hero reads as its own panel — close enough to the page bg that it doesn't look "off."

Implementation: change the hero `<section>` background from `bg-gradient-to-b from-primary/[0.04] …` to a flat `bg-muted/40` (which is a near-neutral cream, ~3–5% darker than `--background`). Remove the gradient overlay `<div>` entirely.

Result: hero is a quiet, paper-toned panel — same color family as the rest of the site, just a notch deeper.

## 2. Manuscript card → animate in place (best choice, not a real video)

A looping screen-capture video would be heavy (5–10MB), look out of place against the editorial typography, and won't loop cleanly. The right call for this brand is to make the existing card *feel* alive with frame-cheap CSS/Framer Motion animation. It will read as "the product is doing something" without breaking the paper aesthetic.

Loop (~9s, infinite, restart cleanly, paused under `prefers-reduced-motion`):

```text
0.0s  Card sits in place
0.4s  Highlight stroke sweeps L→R across the key line (teal bar grows in width)
1.0s  Dotted leader line draws from highlight down to popover anchor
1.4s  "Explain" popover fades+lifts in with a small +2° rotate
1.8s  Sentence types out: "Wave theory describes how energy propagates…"
5.5s  Brief pause (reader catches up)
7.0s  Popover fades out, highlight fades out
8.5s  Loop restarts
```

The typing is `useEffect` + `setInterval` driving local state (same pattern already used on this page for the typing demo, but on a separate, isolated string).

Also add a small "second page" card peeking behind the main card (slight rotation, lower z-index, just a corner showing) — adds depth so the still moments still feel composed.

## 3. Separation between hero and the section below

The next section is the typing-demo / app-preview (`<section className="container mx-auto px-6 pt-16 …">` starting around line 234). Right now both sit on the same flat background with no visual break.

Best option: **soft tonal step + hairline.** This is the editorial-magazine convention and matches existing section transitions in the project (per memory: `AnimatedDivider with gradient fades, background shading`).

- Hero stays on `bg-muted/40`.
- The app-preview section gets the plain `bg-background` it already has, but I'll wrap it so its top edge sits *above* the hero's bottom with a 1px `border-t border-border/60` and ~24px of cream-to-bg gradient fade just under the hero. Visually: hero ends → faint hairline → page reopens.
- This mirrors how the features section already uses `AnimatedDivider`, so the rhythm stays consistent.

## 4. Favicon — remove white background, just make icon bigger

The previous pass padded the trimmed book art with a white background, which is why it looks like it has a white box. Re-export so the trimmed teal book sits on a **transparent** canvas, scaled to fill ~95% of the 512×512 frame. Browsers will composite it directly onto the tab strip with no white box.

Steps:
- Reopen `public/favicon.png`
- Re-trim transparent bbox of the original art
- Resize to fill ~95% of 512×512 with transparent background (RGBA, alpha=0 outside)
- Overwrite `public/favicon.png`

If the source has been flattened to opaque white (no alpha), I'll reconstruct alpha by treating near-white pixels as transparent before re-trimming.

## Files touched

- `src/pages/Landing.tsx` — hero `<section>` background swap, manuscript card animation logic + second-page accent, hairline divider above the next section. Nothing else in the file changes.
- `public/favicon.png` — re-export with transparent background and ~95% fill.

## Out of scope

Header, navbar, features grid, testimonials, CTA band, footer, design tokens, copy, routing, backend.
