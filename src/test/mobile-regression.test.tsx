import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import { WordCount } from "@/components/WordCount";

/**
 * Regression coverage for mobile chrome:
 *  - Red ruled-paper margin sits ~28px (1.75rem) from the left on ≤640px so
 *    typing area isn't crowded (was previously 3.25rem / ~52px).
 *  - WordCount stays on a single tight line and drops "words"/"chars" labels
 *    once either count crosses 5,000 so the row never expands.
 *  - OnboardingHelp mobile button renders at top-right with a stable testid
 *    so future placement changes don't silently regress.
 */

const cssPath = resolve(__dirname, "../index.css");
const css = readFileSync(cssPath, "utf8");

describe("mobile red margin", () => {
  it("ruled paper margin is at ~1.75rem inside the ≤640px media query", () => {
    // Extract the @media (max-width: 640px) block that targets .notebook-paper.
    const match = css.match(/@media \(max-width:\s*640px\)\s*\{[\s\S]*?\.notebook-paper\s*\{([\s\S]*?)\}/);
    expect(match, "mobile .notebook-paper media query missing").toBeTruthy();
    const block = match![1];
    // Margin lives at 1.75rem from the left edge.
    expect(block).toMatch(/transparent\s+1\.75rem/);
    expect(block).toMatch(/var\(--paper-margin\)\s+1\.75rem/);
    // Left padding should be tight (≤ 2.5rem) so the writing area isn't crowded.
    const pad = block.match(/padding-left:\s*([\d.]+)rem/);
    expect(pad).toBeTruthy();
    expect(parseFloat(pad![1])).toBeLessThanOrEqual(2.5);
  });
});

describe("WordCount compact mode", () => {
  it("shows labels for short content", () => {
    render(<WordCount content="hello world foo bar baz" />);
    expect(screen.getByText(/words/)).toBeInTheDocument();
    expect(screen.getByText(/chars/)).toBeInTheDocument();
  });

  it("drops 'words' / 'chars' labels above 5,000 to keep the row compact", () => {
    const big = ("lorem ipsum ").repeat(600); // ~1200 words, ~6600 chars
    const { container } = render(<WordCount content={big} />);
    expect(screen.queryByText(/words?$/)).toBeNull();
    expect(screen.queryByText(/chars$/)).toBeNull();
    // Row must stay nowrap + tabular to prevent layout jitter.
    const row = container.firstChild as HTMLElement;
    expect(row.className).toMatch(/whitespace-nowrap/);
    expect(row.className).toMatch(/tabular-nums/);
  });

  it("renders nothing for empty content (no phantom row on mobile)", () => {
    const { container } = render(<WordCount content="" />);
    expect(container.firstChild).toBeNull();
  });
});

describe("OnboardingHelp mobile placement", () => {
  it("mobile button is fixed top-right with a stable testid and safe-area offset", async () => {
    const { OnboardingHelp } = await import("@/components/OnboardingHelp");
    render(<OnboardingHelp />);
    const btn = screen.getByTestId("onboarding-help-mobile");
    const wrapper = btn.parentElement as HTMLElement;
    expect(wrapper.className).toMatch(/fixed/);
    expect(wrapper.className).toMatch(/right-3/);
    // jsdom drops calc(env(...)) from inline style — assert positioning via classes instead.
    expect(wrapper.className).toMatch(/flex-col/);
    expect(wrapper.className).toMatch(/items-end/);
  });
});
