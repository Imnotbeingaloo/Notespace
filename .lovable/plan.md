

## Plan: Set All Popups to Auto-Dismiss After 3 Seconds

### Current State
- **Radix toasts** (`use-toast.ts`): Already set to `TOAST_REMOVE_DELAY = 3000` (3 seconds) -- this is fine.
- **Sonner toasts** (`sonner.tsx`): Used in `file-validation.ts` for error toasts. No `duration` is set, so Sonner uses its default of ~4-5 seconds.
- Both toast systems are mounted in `App.tsx`.

### Changes

#### 1. Set Sonner toast duration to 3 seconds (`src/components/ui/sonner.tsx`)
- Add `duration={3000}` prop to the `<Sonner>` component so all Sonner-based toasts (errors from file validation, etc.) auto-dismiss after 3 seconds.

That's it -- one line change. The Radix toasts already dismiss at 3 seconds.

