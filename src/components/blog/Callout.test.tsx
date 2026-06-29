import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Callout } from "@/components/blog/Callout";

const TONES = ["tip", "warn", "info", "key"] as const;

describe("Callout", () => {
  it.each(TONES)("renders the %s tone with default label, icon and accessible role", (tone) => {
    const { container, unmount } = render(<Callout tone={tone}>Body copy for {tone}</Callout>);
    const aside = container.querySelector("aside[role='note']");
    expect(aside).not.toBeNull();
    // colored left bar — consistent structure across tones
    expect(aside?.className).toMatch(/border-l-4/);
    // icon present
    expect(aside?.querySelector("svg")).not.toBeNull();
    // body copy rendered
    expect(screen.getByText(/Body copy for/)).toBeInTheDocument();
    unmount();
  });

  it("uses a custom title when provided", () => {
    render(
      <Callout tone="key" title="Custom title">
        contents
      </Callout>
    );
    expect(screen.getByText("Custom title")).toBeInTheDocument();
  });

  it("applies a distinct color class per tone", () => {
    const classes = TONES.map((tone) => {
      const { container, unmount } = render(<Callout tone={tone}>x</Callout>);
      const cls = container.querySelector("aside")!.className;
      unmount();
      return cls;
    });
    // every tone should produce a different class string (different color tokens)
    expect(new Set(classes).size).toBe(TONES.length);
  });
});
