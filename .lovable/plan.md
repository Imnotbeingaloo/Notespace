
Goal: Fix the Step Reel continuity issues and polish the “Why it matters” zigzag cards with better hover/reveal motion.

1) Step Reel: rebuild transition timeline for continuity
- Refactor the loop in `StepReel` into small helpers (`wait`, `nextFrame`, `moveToStep`, `snapIntoStep`) so timing is explicit and stable.
- Keep the dot visible through the full cycle (remove fade-out reset behavior that causes perceived disappearance).
- Preserve smooth 1→6 forward movement, but make each arrival feel deliberate (line travel + quick “snap into circle” micro-motion).

2) Add real animated return from 6 back to 1
- Replace the current hard reset with a visible reverse sequence:
  - step 6 → 5 → 4 → 3
  - animated group shift back to the first panel
  - then 3 → 2 → 1 (finishes back at step 1 naturally)
- No instant jump/snap reset; the dot should always be moving or resting on a step.

3) Make “line → number circle” motion obvious
- Introduce a two-phase arrival on each target step:
  - phase A: move along the line to just before the circle center
  - phase B: short snap into center + tiny scale/glow accent
- This creates the missing visual cue that the dot is entering the numbered circle, not just teleporting onto it.

4) Pulse/glow timing and intensity tuning
- Update pulse to be slightly crisper and more readable (shorter cycle, cleaner peak glow).
- Keep glow subtle at rest, but combine with a short arrival emphasis so active state is noticeable without looking flashy.
- Files: `tailwind.config.ts` (pulse keyframes/timing) and `src/pages/HowItWorks.tsx` (arrival micro-animation).

5) Zigzag “Why it matters” visual polish
- Enhance card hover state with subtle layered gradient/glow (low-opacity radial/linear overlay).
- Add gentle lift on hover (slight translate/scale + soft shadow).
- Strengthen scroll reveal so it’s clearly visible:
  - initial: opacity 0 + slight Y/X offset (+ optional tiny blur)
  - in-view: opacity 1 + neutral transform
  - stagger by index for premium feel
- Keep existing alternating zigzag layout and line markers.

6) Verification checklist after implementation
- Dot never disappears at step 4.
- 3→4 transition stays smooth and readable.
- 6→1 is fully animated (no instant reset).
- “Line to circle” arrival is visibly apparent on each step.
- Zigzag cards show clear scroll-in reveal and subtle hover glow on desktop/mobile.
