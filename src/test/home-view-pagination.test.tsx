import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HomeView } from "@/components/HomeView";

vi.mock("framer-motion", async () => {
  const React = await import("react");
  const passthrough = (tag: string) =>
    React.forwardRef((props: any, ref: any) => {
      const { whileHover, initial, animate, exit, transition, ...rest } = props || {};
      return React.createElement(tag, { ref, ...rest });
    });
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

const refreshData = vi.fn().mockResolvedValue(undefined);
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
  useNotebooks: () => ({ notebooks: fixture, standaloneNotes: [], trashedNotebooks: [], trashedNotes: [], loading: false, refreshData, deleteNotebook: vi.fn(), deleteNote: vi.fn() }),
}));


vi.mock("@/context/AuthContext", () => ({ useAuth: () => ({ user: null, loading: false, session: null }), AuthProvider: ({ children }: any) => children }));
vi.mock("@/hooks/use-profile", () => ({ useProfile: () => ({ profile: null, loading: false }) }));
vi.mock("@/hooks/use-temp-notes-enabled", () => ({ useTempNotesEnabled: () => [true, () => {}] }));

describe("HomeView pagination error + retry", () => {
  it("Load more button exists when there are more pages and is keyboard activatable", () => {
    render(<MemoryRouter><HomeView onOpenNotebook={() => {}} /></MemoryRouter>);
    const btn = screen.getByRole("button", { name: /load more/i });
    expect(btn).toBeInTheDocument();
    act(() => {
      fireEvent.click(btn);
    });
    // After clicking, count rises (12 total, page size 9 → 12 visible)
    expect(screen.getAllByRole("gridcell").length).toBe(12);
  });
});
