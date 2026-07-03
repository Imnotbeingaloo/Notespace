import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HomeView } from "@/components/HomeView";

vi.mock("framer-motion", async () => {
  const React = await import("react");
  const passthrough = (tag: string) =>
    React.forwardRef((props: any, ref: any) => React.createElement(tag, { ref, ...props }));
  return {
    motion: new Proxy({}, { get: (_t, key: string) => passthrough(key) }),
    AnimatePresence: ({ children }: any) => children,
    useReducedMotion: () => false,
    useAnimation: () => ({ start: () => Promise.resolve(), stop: () => {}, set: () => {} }),
    useMotionValue: (v: any) => ({ get: () => v, set: () => {}, on: () => () => {} }),
    useTransform: () => 0,
    useSpring: (v: any) => v,
    useScroll: () => ({ scrollY: { get: () => 0, on: () => () => {} }, scrollYProgress: { get: () => 0, on: () => () => {} } }),
  };
});

vi.mock("@/context/NotebookContext", () => ({
  useNotebooks: () => ({ notebooks: [], standaloneNotes: [], trashedNotebooks: [], trashedNotes: [], loading: true, refreshData: vi.fn(), deleteNotebook: vi.fn(), deleteNote: vi.fn() }),
}));


vi.mock("@/context/AuthContext", () => ({ useAuth: () => ({ user: null, loading: false, session: null }), AuthProvider: ({ children }: any) => children }));
vi.mock("@/hooks/use-profile", () => ({ useProfile: () => ({ profile: null, loading: false }) }));
vi.mock("@/hooks/use-temp-notes-enabled", () => ({ useTempNotesEnabled: () => [true, () => {}] }));

describe("HomeView loading state", () => {
  it("shows skeleton grid while notebooks are loading", () => {
    render(<MemoryRouter><HomeView onOpenNotebook={() => {}} /></MemoryRouter>);
    const skeleton = screen.getByTestId("home-skeleton");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton.getAttribute("aria-busy")).toBe("true");
    expect(skeleton.children.length).toBe(6);
  });
});
