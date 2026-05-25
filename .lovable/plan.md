## Why it reads as AI right now

Looking at the current hero, the colors themselves are fine. The "AI smell" comes from how they're arranged. Specifically:

1. **The sparkle-icon badge** saying "AI-Powered Note Taker" — this exact pill is on roughly every Lovable/v0/Bolt landing page in the wild
2. **Two different accent colors splitting one headline** ("organized" in teal, "understood" in orange) — classic AI default
3. **Dead-centered everything** — badge, headline, subtext, buttons all stacked on the centerline
4. **Soft radial teal gradient washing the whole background** — the most-overused AI hero treatment
5. **"Beautiful workspace" type copy** — generic SaaS voice

## What I'll change (palette stays identical)

### Composition
- Switch hero from dead-center stack to a **left-aligned editorial layout** on desktop (headline + sub left, small meta column right). Stays centered on mobile.
- Remove the wash gradient. Replace with a single, off-center warm-cream tint behind the headline so the page reads as paper, not as a generated card.
- Add a hairline rule above the headline (Swiss-editorial signal, not an AI trope).

### Headline
- Drop the sparkle badge entirely.
- Headline becomes **one line of restrained color**: only one accent word (teal "understood"), the rest in foreground ink. No orange word.
- Move the orange accent to a **small kicker label** above the headline (uppercase mono, like "◆ A note-taker that thinks with you") — same orange/teal already in the palette, but used as editorial chrome instead of as headline highlights. This is how serious publications use accent color.
- Slightly tighter leading on the headline so it feels typeset, not generated.

### Subhead & CTAs
- Rewrite the subhead to drop the "intelligent / beautiful workspace" phrasing. Replace with a shorter, more specific line.
- CTAs left-aligned under the subhead, not centered. Primary button gets a subtle inset highlight instead of the big glowing shadow.
- Add a small secondary text line under the buttons ("No credit card · Free forever tier") in muted mono — anchors trust without adding a badge.

### Background
- Remove `bg-gradient-to-b from-primary/[0.04]`.
- Add a faint dotted-grid texture (same dot pattern already used on the Home view inside the app) at very low opacity — ties marketing to product, and dotted grids don't read as AI gradients.

## Files touched

- `src/pages/Landing.tsx` — only the `{/* ── Hero ── */}` section (lines ~180–228). Everything else (navbar, app preview, features, dividers, footer) untouched.

## Out of scope

- No new colors, no font swaps, no changes to the app preview mockup, features grid, or any other section. Strictly the hero block.
