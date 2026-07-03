import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HomeView } from "@/components/HomeView";

vi.mock("framer-motion", async () => {
  const React = await import("react");
  const passthrough = (tag: string) =>
    React.forwardRef((props: any, ref: any) => React.createElement(tag, { ref, ...props }));
  return {
    motion: new Proxy({}, { get: (_t, key: string) => passthrough(key) }),
    AnimatePresence: ({ children }: any) => children,
  };
});

vi.mock("@/context/NotebookContext", () => ({
  useNotebooks: () => ({
    notebooks: [],
    standaloneNotes: [],
    trashedNotebooks: [],
    trashedNotes: [],
    deleteNotebook: vi.fn(),
    deleteNote: vi.fn(),
    loading: false,
    refreshData: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-profile", () => ({
  useProfile: () => ({ profile: { display_name: "Test" }, loading: false }),
}));

vi.mock("@/components/HomeHeaderMenu", () => ({
  HomeHeaderMenu: () => null,
}));

const renderHome = () =>
  render(
    <MemoryRouter initialEntries={["/home"]}>
      <HomeView
        onOpenNotebook={() => {}}
        onCreateNotebook={() => {}}
        onCreateScratchNote={() => {}}
      />
    </MemoryRouter>,
  );

describe("HomeView Temporary Notes toggle", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows the Temporary Note pill when Temp Notes is enabled (default)", () => {
    renderHome();
    expect(screen.getByTestId("home-create-temporary")).toBeInTheDocument();
    expect(screen.queryByTestId("home-upload")).not.toBeInTheDocument();
  });

  it("replaces the pill with Upload button when Temp Notes is disabled", () => {
    localStorage.setItem("temp-notes-enabled", "false");
    renderHome();
    expect(screen.queryByTestId("home-create-temporary")).not.toBeInTheDocument();
    expect(screen.getByTestId("home-upload")).toBeInTheDocument();
  });

  it("swaps live when the setting flips via the shared event bus", () => {
    renderHome();
    expect(screen.getByTestId("home-create-temporary")).toBeInTheDocument();
    act(() => {
      localStorage.setItem("temp-notes-enabled", "false");
      window.dispatchEvent(new Event("temp-notes-enabled-changed"));
    });
    expect(screen.queryByTestId("home-create-temporary")).not.toBeInTheDocument();
    expect(screen.getByTestId("home-upload")).toBeInTheDocument();
  });
});
