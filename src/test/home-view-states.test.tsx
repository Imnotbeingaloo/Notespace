import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
  useNotebooks: () => ({ notebooks: [], loading: true }),
}));

describe("HomeView loading state", () => {
  it("shows skeleton grid while notebooks are loading", () => {
    render(<HomeView onOpenNotebook={() => {}} />);
    const skeleton = screen.getByTestId("home-skeleton");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton.getAttribute("aria-busy")).toBe("true");
    expect(skeleton.children.length).toBe(6);
  });
});
