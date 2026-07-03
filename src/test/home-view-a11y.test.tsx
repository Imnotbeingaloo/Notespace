import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HomeView } from "@/components/HomeView";

vi.mock("framer-motion", async () => {
  const React = await import("react");
  const cache = new Map<string, any>();
  const passthrough = (tag: string) => {
    if (!cache.has(tag)) {
      cache.set(
        tag,
        React.forwardRef((props: any, ref: any) => {
          const { whileHover, initial, animate, exit, transition, ...rest } = props || {};
          return React.createElement(tag, { ref, ...rest });
        })
      );
    }
    return cache.get(tag);
  };
  return {
    motion: new Proxy({}, { get: (_t, key: string) => passthrough(String(key)) }),
    AnimatePresence: ({ children }: any) => children,
    useReducedMotion: () => false,
    useAnimation: () => ({ start: () => Promise.resolve(), stop: () => {}, set: () => {} }),
    useMotionValue: (v: any) => ({ get: () => v, set: () => {}, on: () => () => {} }),
    useTransform: () => 0,
    useSpring: (v: any) => v,
    useScroll: () => ({ scrollY: { get: () => 0, on: () => () => {} }, scrollYProgress: { get: () => 0, on: () => () => {} } }),
  };
});

const fixture = Array.from({ length: 12 }, (_, i) => ({
  id: `nb-${i}`,
  name: `Notebook ${i}`,
  emoji: "📓",
  notes: [],
  created_at: new Date(2025, 0, i + 1).toISOString(),
  updated_at: new Date(2025, 0, i + 1).toISOString(),
  deleted_at: null,
}));

vi.mock("@/context/NotebookContext", () => ({
  useNotebooks: () => ({ notebooks: fixture, standaloneNotes: [], trashedNotebooks: [], trashedNotes: [], loading: false, refreshData: vi.fn(), deleteNotebook: vi.fn(), deleteNote: vi.fn() }),
}));


vi.mock("@/context/AuthContext", () => ({ useAuth: () => ({ user: null, loading: false, session: null }), AuthProvider: ({ children }: any) => children }));
vi.mock("@/hooks/use-profile", () => ({ useProfile: () => ({ profile: null, loading: false }) }));
vi.mock("@/hooks/use-temp-notes-enabled", () => ({ useTempNotesEnabled: () => [true, () => {}] }));

describe("HomeView a11y - keyboard reachability & focus styles", () => {
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1440 });
  });

  it("uses roving tabindex grid pattern (one tabbable entry, all reachable)", () => {
    render(<MemoryRouter><HomeView onOpenNotebook={() => {}} /></MemoryRouter>);
    const cards = screen.getAllByRole("gridcell") as HTMLButtonElement[];
    const tabbable = cards.filter((c) => c.tabIndex === 0);
    expect(tabbable.length).toBe(1);
    // Every card is focusable programmatically
    cards.forEach((c) => {
      c.focus();
      expect(document.activeElement).toBe(c);
    });
  });

  it("pagination 'Load more' control is reachable via Tab and activatable", () => {
    render(<MemoryRouter><HomeView onOpenNotebook={() => {}} /></MemoryRouter>);
    const loadMore = screen.getByRole("button", { name: /load more/i });
    expect(loadMore).toBeInTheDocument();
    expect(loadMore.tabIndex).not.toBe(-1);
    loadMore.focus();
    expect(document.activeElement).toBe(loadMore);
  });

  it("note cards expose visible focus-visible ring classes", () => {
    render(<MemoryRouter><HomeView onOpenNotebook={() => {}} /></MemoryRouter>);
    const card = screen.getAllByRole("gridcell")[0];
    expect(card.className).toMatch(/focus-visible:ring-2/);
    expect(card.className).toMatch(/focus-visible:ring-primary/);
  });
});
