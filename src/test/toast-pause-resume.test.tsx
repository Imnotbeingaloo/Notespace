import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, fireEvent, cleanup, act } from "@testing-library/react";
import { Toaster, toast } from "@/components/ui/sonner";
import {
  queuedToast,
  pauseToast,
  resumeToast,
  resetToastQueue,
  getToastSnapshot,
} from "@/lib/toast-queue";
import { TOAST_DURATIONS } from "@/lib/notification-config";

describe("toast durations + pause/resume", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetToastQueue();
  });
  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it("warning and error share the same 4.2s duration", () => {
    expect(TOAST_DURATIONS.warning).toBe(4200);
    expect(TOAST_DURATIONS.error).toBe(4200);
    expect(TOAST_DURATIONS.warning).toBe(TOAST_DURATIONS.error);
  });

  it("auto-dismisses after the configured duration", () => {
    queuedToast("warning", "Heads up");
    expect(getToastSnapshot()).toHaveLength(1);
    vi.advanceTimersByTime(TOAST_DURATIONS.warning + 50);
    expect(getToastSnapshot()).toHaveLength(0);
  });

  it("pause freezes the timer; resume continues from remaining", () => {
    const id = queuedToast("error", "Boom");
    vi.advanceTimersByTime(1000);
    pauseToast(id);
    vi.advanceTimersByTime(10_000);
    expect(getToastSnapshot()).toHaveLength(1);
    resumeToast(id);
    vi.advanceTimersByTime(3100);
    expect(getToastSnapshot()).toHaveLength(1);
    vi.advanceTimersByTime(200);
    expect(getToastSnapshot()).toHaveLength(0);
  });

  it("rendered Toaster pauses on hover/focus and resumes on leave/blur", () => {
    const { container } = render(<Toaster />);
    act(() => { toast.error("Something broke"); });
    act(() => { vi.advanceTimersByTime(0); });

    const card = container.querySelector("li") as HTMLElement;
    expect(card).toBeTruthy();

    // Hover pauses - waiting past full duration must NOT dismiss.
    fireEvent.mouseEnter(card);
    act(() => { vi.advanceTimersByTime(TOAST_DURATIONS.error + 2000); });
    expect(getToastSnapshot()).toHaveLength(1);

    // Mouseleave resumes - card auto-dismisses after remaining time.
    fireEvent.mouseLeave(card);
    act(() => { vi.advanceTimersByTime(TOAST_DURATIONS.error + 100); });
    expect(getToastSnapshot()).toHaveLength(0);
  });

  it("focus pauses and blur resumes", () => {
    const { container } = render(<Toaster />);
    act(() => { toast.warning("Watch out"); });
    act(() => { vi.advanceTimersByTime(0); });

    const card = container.querySelector("li") as HTMLElement;
    fireEvent.focus(card);
    act(() => { vi.advanceTimersByTime(TOAST_DURATIONS.warning + 2000); });
    expect(getToastSnapshot()).toHaveLength(1);
    fireEvent.blur(card);
    act(() => { vi.advanceTimersByTime(TOAST_DURATIONS.warning + 100); });
    expect(getToastSnapshot()).toHaveLength(0);
  });
});
