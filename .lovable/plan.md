## Changes to `src/components/NamePromptDialog.tsx`

**1. Remove all gradients & glows (use solid colors only)**
- Delete the two blurred radial "accent glow" `motion.div`s (`bg-primary/20 blur-3xl` and `bg-orange-400/15 blur-3xl`) at lines 110-123.
- Replace the `bg-gradient-to-r from-transparent via-primary/50 to-transparent` divider in the welcome step (line 291) with a solid `bg-primary/40` line.
- Replace the custom soft primary glow shadow `shadow-[0_30px_80px_-20px_hsl(var(--primary)/0.35)]` on the card (line 95) with a flat `shadow-2xl`.
- Keep the ruled-paper background lines (they're solid borders, not gradients).
- Solid colors only: `bg-card`, `bg-primary`, `bg-orange-500`, `border-border/50`, etc. - no `bg-gradient-*`, no `blur-*`, no `from-/via-/to-`.

**2. Fix the missing entrance animation**

The current motion.div entrance gets suppressed because Radix `DialogContent` mounts with its own `data-[state=open]:animate-in` classes that fight with the inner framer-motion `initial`/`animate`. Result: the dialog snaps in with no visible movement.

Fix:
- On `DialogContent`, append classes to neutralize Radix's built-in transitions:  
  `data-[state=open]:animate-none data-[state=closed]:animate-none data-[state=open]:zoom-in-100 data-[state=open]:fade-in-100 duration-0`
- Make the framer-motion entrance more pronounced and obviously visible:
  - `initial={{ opacity: 0, scale: 0.85, y: 28 }}`
  - `animate={{ opacity: 1, scale: 1, y: 0 }}`
  - `transition={{ type: "spring", stiffness: 220, damping: 24, mass: 0.9 }}`
- Add a brief inner stagger so the brand mark + headline cascade in (already partially present; tighten delays so they fire after the card lands).

**3. No other behavior changes** - copy, steps, save flow, welcome transition, and 3s auto-close all stay exactly as they are.

### Why these specific fixes
- User asked for "simple colors, no gradients" → every gradient/blur/glow utility is removed; only flat tokens remain.
- User said the dialog "doesn't have any animation" when it shows up → Radix's default content animation classes were overriding the framer-motion entrance; disabling them and using a stronger spring makes the appear animation actually play.
