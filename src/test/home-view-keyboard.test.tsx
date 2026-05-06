import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HomeView } from "@/components/HomeView";

// Mock framer-motion to render plain elements with full props
vi.mock("framer-motion", async () => {
  const React = await import("react");
  const passthrough = (tag: string) =>
    React.forwardRef((props: any, ref: any) => React.createElement(tag, { ref, ...props }));
  return {
    motion: new Proxy(
      {},
      { get: (_t, key: string) => passthrough(key) }
    ),
    AnimatePresence: ({ children }: any) => children,
  };
});

const makeNotebook = (i: number) => ({
  id: `nb-${i}`,
  name: `Notebook ${i}`,
  emoji: "📓",
  notes: [],
  created_at: new Date(2025, 0, i + 1).toISOString(),
  updated_at: new Date(2025, 0, i + 1).toISOString(),
  deleted_at: null,
});

const fixture = Array.from({ length: 6 }, (_, i) => makeNotebook(i));

vi.mock("@/context/NotebookContext", () => ({
  useNotebooks: () => ({ notebooks: fixture, loading: false }),
}));

describe("HomeView keyboard navigation", () => {
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1440 });
  });

  it("Enter on focused card calls onOpenNotebook with that id", () => {
    const onOpen = vi.fn();
    render(<HomeView onOpenNotebook={onOpen} />);
    const cards = screen.getAllByRole("gridcell");
    expect(cards.length).toBe(6);
    cards[0].focus();
    fireEvent.keyDown(cards[0], { key: "Enter" });
    expect(onOpen).toHaveBeenCalledWith("nb-0");
  });

  it("ArrowRight moves focus to next card", () => {
    const onOpen = vi.fn();
    render(<HomeView onOpenNotebook={onOpen} />);
    const cards = screen.getAllByRole("gridcell") as HTMLButtonElement[];
    cards[0].focus();
    fireEvent.keyDown(cards[0], { key: "ArrowRight" });
    expect(document.activeElement).toBe(cards[1]);
  });

  it("ArrowDown jumps by row (3 cols on desktop)", () => {
    const onOpen = vi.fn();
    render(<HomeView onOpenNotebook={onOpen} />);
    const cards = screen.getAllByRole("gridcell") as HTMLButtonElement[];
    cards[0].focus();
    fireEvent.keyDown(cards[0], { key: "ArrowDown" });
    expect(document.activeElement).toBe(cards[3]);
  });

  it("End key focuses the last card; Home returns to first", () => {
    const onOpen = vi.fn();
    render(<HomeView onOpenNotebook={onOpen} />);
    const cards = screen.getAllByRole("gridcell") as HTMLButtonElement[];
    cards[0].focus();
    fireEvent.keyDown(cards[0], { key: "End" });
    expect(document.activeElement).toBe(cards[5]);
    fireEvent.keyDown(cards[5], { key: "Home" });
    expect(document.activeElement).toBe(cards[0]);
  });
});
