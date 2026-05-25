## Plan

Move the floating **Explain** card back to its original position: overlapping the bottom-right corner of the "On wave theory" manuscript card (as shown in the second reference), instead of sitting fully below it.

## Technical details

- In `src/pages/Landing.tsx`, change the Explain card's absolute positioning from `-bottom-16 sm:-bottom-20 right-0 sm:-right-4` to something like `-bottom-8 -right-4 sm:-right-8` so it overlaps the manuscript card's bottom-right corner.
- Keep all other styling intact (border, rotate, typewriter content, hover lift).
- No other changes.

add a color hover over effect on the see what it does button when hovered it should become grey-ish colored