import { describe, it, expect, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

// Active selection lives in the mock context module
const state = {
  activeNotebookId: null as string | null,
  activeNoteId: null as string | null,
};
const fixture = [
  {
    id: "nb-1",
    name: "Notebook One",
    emoji: "📓",
    notes: [
      { id: "note-A", title: "Note A", content: "", attachments: [], tags: [], created_at: "", updated_at: "", deleted_at: null },
      { id: "note-B", title: "Note B", content: "", attachments: [], tags: [], created_at: "", updated_at: "", deleted_at: null },
    ],
    created_at: "",
    deleted_at: null,
  },
];

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

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ user: { id: "u1" }, loading: false, session: null }),
  AuthProvider: ({ children }: any) => children,
}));

vi.mock("@/context/NotebookContext", () => ({
  NotebookProvider: ({ children }: any) => children,
  useNotebooks: () => ({
    notebooks: fixture,
    activeNotebookId: state.activeNotebookId,
    activeNoteId: state.activeNoteId,
    setActiveNotebookId: (id: string | null) => { state.activeNotebookId = id; },
    setActiveNoteId: (id: string | null) => { state.activeNoteId = id; },
    loading: false,
  }),
}));

// Stub heavy children so we just verify wiring
vi.mock("@/components/AppSidebar", () => ({ AppSidebar: () => <div data-testid="sidebar" /> }));
vi.mock("@/components/NoteEditor", () => ({
  NoteEditor: () => (
    <div data-testid="editor">
      editor-notebook:{state.activeNotebookId}|editor-note:{state.activeNoteId}
    </div>
  ),
}));
vi.mock("@/components/StudyPlanner", () => ({ StudyPlanner: () => null }));
vi.mock("@/components/PomodoroTimer", () => ({ PomodoroTimer: () => null }));
vi.mock("@/components/SplashScreen", () => ({ SplashScreen: () => null }));
vi.mock("@/components/HomeView", () => ({ HomeView: () => <div data-testid="home" /> }));
vi.mock("@/components/LoadingScreen", () => ({ LoadingScreen: () => <div data-testid="loading" /> }));
vi.mock("@/components/KeyboardShortcuts", () => ({ KeyboardShortcuts: () => null }));

import AppPage from "@/pages/Index";

const renderAt = (url: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path="/app" element={<AppPage />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );

describe("Deep linking /app?notebook=&note=", () => {
  it("hydrates active notebook + note from URL params on initial render", async () => {
    state.activeNotebookId = null;
    state.activeNoteId = null;
    const { findByTestId } = renderAt("/app?notebook=nb-1&note=note-B");
    const editor = await findByTestId("editor");
    await waitFor(() => {
      expect(editor.textContent).toContain("editor-notebook:nb-1");
      expect(editor.textContent).toContain("editor-note:note-B");
    });
  });

  it("preserves selection on remount (refresh) with same URL", async () => {
    state.activeNotebookId = null;
    state.activeNoteId = null;
    const { unmount } = renderAt("/app?notebook=nb-1&note=note-A");
    await waitFor(() => expect(state.activeNoteId).toBe("note-A"));
    unmount();

    state.activeNotebookId = null;
    state.activeNoteId = null;
    const { findByTestId } = renderAt("/app?notebook=nb-1&note=note-A");
    const editor = await findByTestId("editor");
    expect(editor.textContent).toContain("editor-note:note-A");
  });
});
