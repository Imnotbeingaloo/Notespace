
Issue confirmed from your screenshot: the active numbered step circle is being visually clipped when highlighted.

Plan to fix it quickly in `src/pages/HowItWorks.tsx` (StepReel):

1) Remove the clipping trigger on active step state
- Current active state scales the numbered circle (`scale: 1.15`), which can render badly inside the reel clipping area.
- Change active emphasis from scale animation to non-size effects:
  - keep active background/text color
  - add a subtle ring/shadow glow for focus
  - keep `scale: 1` for both active/inactive states

2) Add a tiny vertical safety buffer in the reel track
- Add small top breathing room in the reel viewport (e.g. `pt-1`/`pt-2`) so the top edge never cuts circular elements.
- Shift the moving dot’s absolute top offset to match that buffer so alignment stays perfect.

3) Keep the dot behavior stable (no rotation, no overlap)
- Keep the existing “show only while traveling” behavior (`showDot`) so it never sits on top of numbered circles.
- Keep rotation removed.

4) Verify sequence behavior while touching this area
- Re-check full animation loop: 1→2→3, slide to 4→5→6, then reset.
- Confirm no clipping on desktop and mobile widths.

Expected result:
- No more half-cut/flat-top number circle.
- Same clean animation rhythm, but with safer visuals and no extra motion.
