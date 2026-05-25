## 1. Revert the hero back to the original look

In `src/pages/Landing.tsx`:
- Remove the two animated aurora blob `motion.div`s that were added behind the hero. Keep only the original soft gradient wash (`bg-gradient-to-b from-primary/[0.04]`).
- Change the headline so both "organized" and "understood" use the teal primary color:
  - `Your thoughts, <span className="text-primary">organized</span> & <span className="text-primary">understood</span>`
- Leave the "AI-Powered Note Taker" pill badge exactly as it currently is (rounded pill, rotating `Sparkles` icon, muted text) — that matches the original design.

In `src/index.css`:
- Remove the now-unused `--hero-green` CSS variable from both `:root` and `.dark`, and remove the `.hero-aurora` reduced-motion rule.

## 2. Make the favicon look bigger in the browser tab

The current `public/favicon.png` is 1920×1920 but the actual book artwork only fills the middle ~38% of the canvas, surrounded by white padding. That padding is why the icon looks tiny next to other sites' favicons in the tab strip.

Fix:
- Auto-trim the surrounding white from `public/favicon.png`, then re-pad with a small ~6% margin and re-export at 512×512. The visible book artwork will then fill nearly the whole 16×16 tab favicon slot, so it reads much larger.
- `index.html` already references `/favicon.png` with the correct cache-busting setup, so no markup change is needed beyond optionally bumping a query string if caching is sticky.

## Out of scope

- No changes to navbar, features grid, app preview, footer, or any other page.
- No copy changes.
- No new colors, fonts, or animations introduced.
- The book artwork itself is not redrawn — only the empty padding around it is trimmed.

## Files touched

- `src/pages/Landing.tsx` — remove aurora blobs, swap "understood" color back to `text-primary`.
- `src/index.css` — drop `--hero-green` and the `.hero-aurora` reduced-motion block.
- `public/favicon.png` — re-exported with whitespace trimmed.
