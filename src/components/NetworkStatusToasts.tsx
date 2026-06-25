import { useEffect, useRef } from "react";
import { toast } from "sonner";

/**
 * Mounts global network listeners:
 *  - Offline / online status toasts
 *  - "Slow connection" warning when any fetch is outstanding for >5s
 *
 * Non-intrusive: each toast is shown at most once until conditions reset.
 */
const SLOW_MS = 5000;
const SLOW_TOAST_ID = "network-slow";
const OFFLINE_TOAST_ID = "network-offline";

export function NetworkStatusToasts() {
  const inflightRef = useRef(0);
  const slowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // ---- Online / Offline ----
    const showOffline = () => {
      toast.error("📡 Connection lost. Please check your internet connection and try again.", {
        id: OFFLINE_TOAST_ID,
        duration: Infinity,
      });
    };
    const showOnline = () => {
      toast.dismiss(OFFLINE_TOAST_ID);
      toast.success("✅ Back online — syncing your data.", { duration: 2500 });
    };
    if (typeof navigator !== "undefined" && navigator.onLine === false) showOffline();
    window.addEventListener("offline", showOffline);
    window.addEventListener("online", showOnline);

    // ---- Slow-connection detector (wraps fetch) ----
    const originalFetch = window.fetch.bind(window);

    const armSlowTimer = () => {
      if (slowTimerRef.current) return;
      slowTimerRef.current = setTimeout(() => {
        if (inflightRef.current > 0 && navigator.onLine !== false) {
          toast.warning(
            "⏳ Your internet connection is running a bit slow right now. Hang tight while we sync your data!",
            { id: SLOW_TOAST_ID, duration: 6000 }
          );
        }
      }, SLOW_MS);
    };
    const disarmSlowTimer = () => {
      if (inflightRef.current === 0 && slowTimerRef.current) {
        clearTimeout(slowTimerRef.current);
        slowTimerRef.current = null;
        toast.dismiss(SLOW_TOAST_ID);
      }
    };

    const wrapped: typeof fetch = async (...args) => {
      inflightRef.current += 1;
      armSlowTimer();
      try {
        return await originalFetch(...args);
      } catch (err) {
        // Network failure while "online" usually means flaky connection.
        if (navigator.onLine === false) showOffline();
        throw err;
      } finally {
        inflightRef.current = Math.max(0, inflightRef.current - 1);
        disarmSlowTimer();
      }
    };
    window.fetch = wrapped;

    return () => {
      window.removeEventListener("offline", showOffline);
      window.removeEventListener("online", showOnline);
      window.fetch = originalFetch;
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    };
  }, []);

  return null;
}
