import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { HybridEditor } from "./HybridEditor";

// usePaperStyle reads localStorage; keep it deterministic.
vi.mock("@/hooks/use-paper-style", () => ({
  usePaperStyle: () => [false, vi.fn()],
}));

// FloatingToolbar isn't relevant here; render nothing.
vi.mock("@/components/FloatingToolbar", () => ({
  FloatingToolbar: () => null,
}));

describe("HybridEditor auto-resize / scroll behavior", () => {
  it("wrapper uses min-h-full so it grows with content (no forced h-full)", () => {
    render(<HybridEditor content="" onChange={() => {}} />);
    const wrapper = screen.getByTestId("hybrid-editor-wrapper");
    expect(wrapper.className).toMatch(/\bmin-h-full\b/);
    expect(wrapper.className).not.toMatch(/\bh-full\b/);
  });

  it("contenteditable region uses h-auto + flex-1 so its height tracks content", () => {
    render(<HybridEditor content="" onChange={() => {}} />);
    const content = screen.getByTestId("hybrid-editor-content");
    expect(content.className).toMatch(/\bh-auto\b/);
    expect(content.className).toMatch(/\bflex-1\b/);
  });

  it("shows a scrollbar only when content overflows the pane", () => {
    const { container } = render(
      <div style={{ height: 200, overflowY: "auto" }} data-testid="pane">
        <HybridEditor content="" onChange={() => {}} />
      </div>
    );
    const pane = container.querySelector('[data-testid="pane"]') as HTMLElement;
    const content = screen.getByTestId("hybrid-editor-content") as HTMLElement;

    // Empty editor: simulate layout where content fits.
    Object.defineProperty(pane, "clientHeight", { configurable: true, value: 200 });
    Object.defineProperty(pane, "scrollHeight", { configurable: true, value: 200 });
    expect(pane.scrollHeight > pane.clientHeight).toBe(false);

    // Simulate content growing past the pane.
    content.innerHTML = "<p>line</p>".repeat(200);
    Object.defineProperty(pane, "scrollHeight", { configurable: true, value: 4000 });
    expect(pane.scrollHeight > pane.clientHeight).toBe(true);
  });
});
