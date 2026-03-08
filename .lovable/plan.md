

## Plan: Toolbar Redesign, Fix AI, Add Symbols Panel, Auto-Save & Shortcuts

### Problem Analysis

**"Ask AI" fails with "failed to fetch"**: Both edge functions (`explain-topic` and `ai-tools`) use a restrictive CORS allowlist that doesn't include the preview URL origin (`id-preview--*.lovable.app`). The browser blocks the request before it even reaches the server. Fix: switch to `Access-Control-Allow-Origin: *`.

### Changes

#### 1. Fix CORS in both edge functions
**Files**: `supabase/functions/explain-topic/index.ts`, `supabase/functions/ai-tools/index.ts`
- Replace the custom `allowedOrigins` / `getCorsHeaders` logic with standard `'Access-Control-Allow-Origin': '*'` headers, matching the recommended pattern.

#### 2. Redesign the toolbar button layout in NoteEditor
**File**: `src/components/NoteEditor.tsx`
- Remove `ExportButtons` (Download) from the always-visible spot
- Move Download into the mobile "More" dropdown only
- Desktop toolbar becomes: **Ask AI** | **AI Edit** | **Flashcards** | **Symbols (Ω)** | **Preview**
- Remove standalone Summarize button (covered by Ask AI)
- Remove `AIToolsPanel` component's Summarize button; keep only Flashcards as a direct button that calls the existing `ai-tools` edge function with `action: "flashcards"`

#### 3. Add Special Symbols panel
**New file**: `src/components/SymbolsPicker.tsx`
- A popover/dropdown triggered by an **Ω** button in the toolbar
- Contains a grid of commonly used academic/study symbols organized by category:
  - Math: ∑ ∫ √ ∞ ≠ ≈ ≤ ≥ ± × ÷ π θ α β γ δ ε λ μ σ φ ω Δ ∂ ∇ ∈ ∉ ⊂ ⊃ ∪ ∩ ∅ ℝ ℤ ℕ ℚ
  - Arrows: → ← ↑ ↓ ↔ ⇒ ⇐ ⇔ ↦
  - Greek: full alphabet (Α-Ω, α-ω)
  - Chemistry/Science: ° ℃ ℉ Å ħ ⁰ ¹ ² ³ ⁴ ⁿ ₀ ₁ ₂ ₃ ₄
  - Misc: © ® ™ † ‡ § ¶ • ‰ ♠ ♣ ♥ ♦
- Search input at top to filter symbols by name
- Clicking a symbol inserts it at the cursor position via `HybridEditor.getActiveTextarea()`

#### 4. Auto-save indicator
**File**: `src/components/NoteEditor.tsx`
- Add `saveStatus` state: `"idle" | "saving" | "saved"`
- Set `"saving"` when `debouncedUpdate` fires, `"saved"` after `updateNote` resolves, reset to `"idle"` after 2s
- Display a small indicator next to the timestamp: a cloud/check icon with "Saving..." or "Saved" text

#### 5. Keyboard shortcuts
**File**: `src/components/HybridEditor.tsx`
- Add `onKeyDown` to each `AutoResizeTextarea`
- Ctrl/Cmd+B: wrap selection with `**`
- Ctrl/Cmd+I: wrap selection with `_`
- Accept a new `onTogglePreview` prop for Ctrl/Cmd+P

### Files to Modify
- `supabase/functions/explain-topic/index.ts` — fix CORS
- `supabase/functions/ai-tools/index.ts` — fix CORS
- `src/components/NoteEditor.tsx` — toolbar redesign, auto-save indicator, wire shortcuts
- `src/components/HybridEditor.tsx` — keyboard shortcuts
- `src/components/AIToolsPanel.tsx` — simplify to only flashcards button (remove summarize)
- `src/components/SymbolsPicker.tsx` — new component for symbols panel

