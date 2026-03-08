

## Plan: Fix Toolbar Button Sizing & Mobile Layout

### Problems
1. **Symbol button (Ω) is visually smaller** — it uses `text-sm` (14px) inside a `h-4 w-4` (16px) container, while Lucide icons fill their `h-4 w-4` space fully. The text character renders smaller than SVG icons.
2. **Toolbar is congested on mobile** — buttons at the end get squished. The container has `overflow-x-auto` but `scrollbar-none` hides the scrollbar, and `sm:px-[4px]` reduces padding on small screens which makes it worse.

### Changes

**1. `src/components/SymbolsPicker.tsx`** — Make the Ω button match icon size:
- Change the inner span from `text-sm` to `text-base` or `text-[16px]` so the Ω character visually matches the 16×16 Lucide icons
- Keep the outer button class identical to toolbar buttons (`p-1.5 rounded-lg ...`)

**2. `src/components/NoteEditor.tsx`** (lines ~764-774) — Move the SymbolsPicker inside the MarkdownToolbar's scrollable container so all buttons scroll together uniformly, instead of the Ω being outside and potentially causing layout issues.

**3. `src/components/MarkdownToolbar.tsx`** (line 105) — Ensure the scrollable toolbar container allows smooth horizontal scrolling on mobile:
- Keep `overflow-x-auto scrollbar-none` but ensure consistent padding (`px-2 py-2`) so buttons aren't cramped
- All buttons already have `flex-shrink-0` which is correct

### Technical Detail
- The toolbar wrapper currently renders `MarkdownToolbar` and `SymbolsPicker` as siblings inside a flex container. Moving `SymbolsPicker` inside the scrollable area (or passing it as a child/prop) ensures uniform spacing.
- The Ω character at `text-base` (16px) will visually match the `h-4 w-4` Lucide SVG icons.

