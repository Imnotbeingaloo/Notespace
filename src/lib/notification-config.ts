// Centralized notification durations (ms).
// Tweak any value here and it propagates across the toast system.
// Per product spec: warning and error share the same duration unless the user
// hovers/focuses a toast, in which case its auto-dismiss timer pauses.
export const TOAST_DURATIONS = {
  message: 3200,
  success: 3200,
  info: 3200,
  warning: 4200,
  error: 4200,
  loading: Infinity,
} as const;

export type ToastDurationKey = keyof typeof TOAST_DURATIONS;
