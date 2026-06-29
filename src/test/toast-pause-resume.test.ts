import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  queuedToast,
  pauseToast,
  resumeToast,
  resetToastQueue,
  getToastSnapshot,
} from "@/lib/toast-queue";
import { TOAST_DURATIONS } from "@/lib/notification-config";

describe("toast pause/resume + central durations", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetToastQueue();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("warning and error use the same centralized duration (4200ms)", () => {
    expect(TOAST_DURATIONS.warning).toBe(4200);
    expect(TOAST_DURATIONS.error).toBe(4200);
  });

  it("auto-dismisses after the configured duration", () => {
    const id = queuedToast("warning", "Heads up");
    expect(getToastSnapshot()).toHaveLength(1);
    vi.advanceTimersByTime(TOAST_DURATIONS.warning + 50);
    expect(getToastSnapshot()).toHaveLength(0);
    void id;
  });

  it("pause freezes the timer, resume continues from remaining time", () => {
    const id = queuedToast("error", "Boom");
    vi.advanceTimersByTime(1000);
    pauseToast(id);
    // Time passes while paused - should NOT dismiss.
    vi.advanceTimersByTime(10_000);
    expect(getToastSnapshot()).toHaveLength(1);
    // Resume - ~3200ms remaining (4200 - 1000).
    resumeToast(id);
    vi.advanceTimersByTime(3100);
    expect(getToastSnapshot()).toHaveLength(1);
    vi.advanceTimersByTime(200);
    expect(getToastSnapshot()).toHaveLength(0);
  });
});
