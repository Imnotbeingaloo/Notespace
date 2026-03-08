

## Plan: Fix Step Reel Animation & Widen Layout

### Changes to `src/pages/HowItWorks.tsx`

**1. Widen the Step Reel container**
- Change `max-w-3xl` → `max-w-5xl` on the Step Reel section container (line 278) so the cards use more horizontal space.

**2. Rewrite the rolling dot to travel circle-to-line-to-circle**
The dot should travel a continuous path across the full row:
- Start at circle ① → roll along connector line → arrive at circle ② (pause 1s) → roll along line → arrive at circle ③ (pause 1s)
- Slide filmstrip to group 2
- Continue: circle ④ → line → circle ⑤ (pause 1s) → line → circle ⑥ (pause 1s)
- Reset and loop

Implementation:
- Make the dot span the entire visible width (not per-card). Use a single `motion.div` positioned absolutely over the filmstrip.
- Animate its `left` from the position of circle 1 (~2%) to circle 2 (~35%) to circle 3 (~68%) with 1s pauses. The dot size should match the numbered circles (32px / `w-8 h-8`).
- On group slide, reposition dot to start at circle 4's position and continue.
- The dot rolls (rotates) as it moves.
- Remove the per-card inline rolling dot and replace with a single overlay dot that traverses the full track.

**3. Make the numbered circles the same size as the dot (both 32px)**
Already `w-8 h-8` (32px) — keep consistent. Set `DOT_SIZE = 32`.

