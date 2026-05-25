## Plan

1. Update the hero vignette in `src/pages/Landing.tsx` so the floating `Explain` card matches the reference screenshot again.
2. Remove the extra `Vol. 01` side note entirely.
3. Reposition the `Explain` card so it sits lower-right and separate from the manuscript card instead of awkwardly overlapping the layout.
4. Keep the original typewriter text inside the `Explain` card and preserve its simple card look so it reads like a clickable button.
5. Leave the rest of the hero unchanged unless needed to avoid collisions.

## Technical details

- Edit only the hero block in `src/pages/Landing.tsx`.
- Remove the `Vol. 01` motion block.
- Adjust the `Explain` card’s absolute positioning, spacing, width, and hover behavior to match the uploaded reference.
- Preserve the typewriter content and cursor.
- Avoid changing unrelated animation timing or the main manuscript card styling unless necessary for the restored layout.

lastly "what it does " should be a button like sign up (dont make it teal)