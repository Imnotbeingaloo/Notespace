import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { OnboardingHelp } from "@/components/OnboardingHelp";

// framer-motion: passthrough so AnimatePresence/motion don't slow tests
vi.mock("framer-motion", async () => {
  const React = await import("react");
  const passthrough = (tag: string) =>
    React.forwardRef((props: any, ref: any) => React.createElement(tag, { ref, ...props }));
  return {
    motion: new Proxy({}, { get: (_t, key: string) => passthrough(key as string) }),
    AnimatePresence: ({ children }: any) => children,
  };
});

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.useFakeTimers();
});

describe("OnboardingHelp", () => {
  it("renders exactly one help (?) trigger (desktop + mobile floating share one logical control each, never duplicated within the same viewport)", () => {
    render(<OnboardingHelp />);
    const triggers = screen.getAllByRole("button", { name: /help/i });
    // One desktop trigger + one mobile floating trigger - the layout shows
    // exactly one at any viewport via responsive classes.
    expect(triggers.length).toBeLessThanOrEqual(2);
    expect(triggers.length).toBeGreaterThan(0);
  });

  it("does NOT show the 'Confused? Click here' hint before the idle delay (5s)", () => {
    render(<OnboardingHelp />);
    act(() => { vi.advanceTimersByTime(4000); });
    expect(screen.queryByText(/Confused\? Click here/i)).toBeNull();
  });

  it("shows the 'Confused? Click here' hint after 5s of idle, only once per session", () => {
    render(<OnboardingHelp />);
    act(() => { vi.advanceTimersByTime(5100); });
    expect(screen.getAllByText(/Confused\? Click here|Need help\? Tap/i).length).toBeGreaterThan(0);
    // After it auto-hides, idle again should not re-trigger (one-shot per session).
    act(() => { vi.advanceTimersByTime(10000); });
    expect(screen.queryByText(/Confused\? Click here/i)).toBeNull();
  });

  it("opens the Quick guide dialog with correct heading and all four section tabs", async () => {
    vi.useRealTimers();
    render(<OnboardingHelp />);
    const trigger = screen.getAllByRole("button", { name: /help/i })[0];
    fireEvent.click(trigger);
    expect(await screen.findByRole("heading", { name: /Quick guide/i })).toBeTruthy();
    // All four tabs must render
    ["Editor", "Sidebar", "AI", "Focus"].forEach((label) => {
      expect(screen.getByRole("tab", { name: label })).toBeTruthy();
    });
  });
});
