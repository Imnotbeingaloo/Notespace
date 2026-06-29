import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, act, cleanup } from "@testing-library/react";
import { OnboardingHelp } from "@/components/OnboardingHelp";

const FIRST_SEEN_KEY = "onboarding-hint-first-seen-at";
const DISMISS_KEY = "onboarding-hint-dismissed";
const SESSION_COUNT_KEY = "onboarding-hint-session-count";

describe("OnboardingHelp - Confused? hint gating", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    sessionStorage.clear();
  });
  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it("shows hint to a brand-new user after 5s idle", () => {
    render(<OnboardingHelp />);
    act(() => { vi.advanceTimersByTime(5050); });
    expect(screen.getByText(/Confused\? Click here/i)).toBeInTheDocument();
  });

  it("does not show the hint to a user past the new-user window", () => {
    localStorage.setItem(FIRST_SEEN_KEY, String(Date.now() - 2 * 60 * 60 * 1000));
    render(<OnboardingHelp />);
    act(() => { vi.advanceTimersByTime(60_000); });
    expect(screen.queryByText(/Confused\? Click here/i)).not.toBeInTheDocument();
  });

  it("never reappears once dismissed", () => {
    localStorage.setItem(DISMISS_KEY, "1");
    render(<OnboardingHelp />);
    act(() => { vi.advanceTimersByTime(60_000); });
    expect(screen.queryByText(/Confused\? Click here/i)).not.toBeInTheDocument();
  });

  it("escalates idle threshold: 5s → 15s → 30s across sessions", () => {
    // Session 1: 5s
    sessionStorage.setItem(SESSION_COUNT_KEY, "0");
    const r1 = render(<OnboardingHelp />);
    act(() => { vi.advanceTimersByTime(5050); });
    expect(screen.getByText(/Confused\? Click here/i)).toBeInTheDocument();
    r1.unmount();

    // Session 2: 15s
    sessionStorage.setItem(SESSION_COUNT_KEY, "1");
    const r2 = render(<OnboardingHelp />);
    act(() => { vi.advanceTimersByTime(5050); });
    expect(screen.queryByText(/Confused\? Click here/i)).not.toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(10_050); });
    expect(screen.getByText(/Confused\? Click here/i)).toBeInTheDocument();
    r2.unmount();

    // Session 3: 30s
    sessionStorage.setItem(SESSION_COUNT_KEY, "2");
    const r3 = render(<OnboardingHelp />);
    act(() => { vi.advanceTimersByTime(15_050); });
    expect(screen.queryByText(/Confused\? Click here/i)).not.toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(15_050); });
    expect(screen.getByText(/Confused\? Click here/i)).toBeInTheDocument();
    r3.unmount();

    // Session 4: never shows.
    sessionStorage.setItem(SESSION_COUNT_KEY, "3");
    render(<OnboardingHelp />);
    act(() => { vi.advanceTimersByTime(60_000); });
    expect(screen.queryByText(/Confused\? Click here/i)).not.toBeInTheDocument();
  });
});
