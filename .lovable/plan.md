## Goal

Bring the hero back to the editorial layout from the PDF (left-aligned headline, orange kicker, "VOL. 01" side column, "Start writing" + "See what it does" CTAs) — but solve its biggest weakness: the giant blank area on the right. Also pull the hero height back down (it grew taller in a recent change).

Nothing outside the hero `<section>` changes. Navbar, app preview, features grid, testimonials, CTA, footer all stay untouched.

## What the new hero looks like

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ ── A NOTE-TAKER THAT THINKS WITH YOU                                     │
│                                                                          │
│ Your thoughts, organized                          ╭──────────────────╮  │
│ & understood.                                     │ §  Chapter 1     │  │
│ ───────────────────                               │ ───────────────  │  │
│ A quiet place to write, link, and                 │ ─── highlight ── │  │
│ revisit your ideas — with intelligence            │ ───────────────  │  │
│ woven in only where it actually helps.            │ ─────────        │  │
│                                                   ╰──────────────────╯  │
│ [ Start writing → ]   See what it does              ↳ ╭──────────────╮  │
│                                                       │ ✦ Explain    │  │
│ NO CREDIT CARD · FREE FOREVER TIER                    │ Wave theory…│  │
│                                                       ╰──────────────╯  │
│                                                                          │
│                                                   VOL. 01                │
│                                                   A writing tool for     │
│                                                   people who think on    │
│                                                   the page.              │
└──────────────────────────────────────────────────────────────────────────┘
```

Two-column grid on `lg`, single column on mobile. Headline column left (≈7/12), composition column right (≈5/12). On mobile the manuscript card stacks below the CTAs.

## Right column: "manuscript card" vignette

A single tasteful composition — purpose-built to fill the empty area without overlapping anything that already exists on the page (no app mockup, no typing demo, no feature cards, no graph).

Pieces:

1. **Paper card** — cream `bg-card` with thin border, soft shadow, very slight `-rotate-1`. Contains:
  - A small JetBrains-Mono eyebrow: `§  CHAPTER ONE`
  - Merriweather title: "On wave theory"
  - 4 short ruled lines (`<div class="h-px bg-border/60">`-style ink strokes of varying widths) — one stroke uses `bg-primary/30` to indicate a highlighted passage.
  - A tiny tag chip bottom-left: `# physics`
2. **Floating "Explain" popover** — smaller card, `+rotate-2`, anchored bottom-right of the paper card with a dotted leader line up to the highlighted stroke. Contains a Sparkles icon, label "Explain", and one short streaming-style line: "Wave theory describes how…" with a blinking caret. (Reuses the existing 60fps typing pattern but on a *different* sentence, so it reads as AI output, not the typing-demo input below.)
3. **VOL. 01 side note** — sits under the card, right-aligned, exactly as in the PDF: mono `VOL. 01` over a thin vertical rule, then the small paragraph "A writing tool for people who think on the page — and want their notes to think back."

Motion: card fades + lifts in (`y: 20 → 0`, 0.6s, delay 0.4s). Popover fades in delayed 0.9s. Typing line starts after popover settles. Both honour `prefers-reduced-motion` by snapping in place. No infinite background animations.

## Why this and not the other options

- Not the feature-card stack — those literally appear directly below the hero.
- Not a full app mockup — that's the next section ("App Preview").
- Not the typing demo — already used further down.
- Not a knowledge-graph — too abstract, doesn't match the paper/editorial brand.

The manuscript card *demonstrates* the product (paper + highlight + AI explanation) in a single editorial still life, which is exactly the brand promise from the headline.

## Hero height

Reduce to `min-h-[88vh]` with `pt-28 pb-20` (down from the recent taller version). On `lg`+ the two columns are vertically centered so the section feels intentional rather than empty.

## Copy & colors

Exactly as in the PDF:

- Kicker: orange (`text-accent`), JetBrains Mono, tracking-widest, with a leading short rule.
- Headline: "Your thoughts, organized & *understood*." — "organized" in default foreground, "understood" italic in teal (`text-primary`), trailing period in foreground.
- Subhead: muted, as in PDF.
- Primary CTA: solid teal "Start writing →" → `/auth` (or `/app` if signed in).
- Secondary: ghost "See what it does" → `#features`.
- Microcopy: `NO CREDIT CARD · FREE FOREVER TIER` (mono, tracking-widest, muted).

## Files touched

- `src/pages/Landing.tsx` — replace the current centered hero `<section>` (lines ~180–231) with the two-column editorial hero described above. Nothing else in the file changes.
- `src/index.css` — no new tokens needed; uses existing `--primary`, `--accent`, `--card`, `--border`, `--muted-foreground`.

## Out of scope

Header/nav, app preview, features, testimonials, CTA band, footer, favicon, theme tokens, any backend or data work.

&nbsp;

also do this too, increase the favicon size to whatever lovable's is