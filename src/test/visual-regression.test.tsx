import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { HomeView } from "@/components/HomeView";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: () => Promise.resolve({ error: null }),
    },
  },
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ user: null, loading: false, session: null }),
  AuthProvider: ({ children }: any) => children,
}));

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
    notebooks: [
      {
        id: "nb-1",
        name: "Sample",
        emoji: "📓",
        notes: [],
        created_at: "2025-01-01",
        updated_at: "2025-01-01",
        deleted_at: null,
      },
    ],
    loading: false,
  }),
}));

const setViewport = (w: number) => {
  Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: w });
  window.dispatchEvent(new Event("resize"));
};

const breakpoints: Array<[string, number]> = [
  ["mobile-375", 375],
  ["tablet-820", 820],
  ["desktop-1440", 1440],
];

describe("Visual regression - PageHeader markup snapshots", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  for (const [name, w] of breakpoints) {
    it(`PageHeader matches snapshot @ ${name}`, () => {
      setViewport(w);
      const { container } = render(
        <MemoryRouter>
          <PageHeader activePage="features" />
        </MemoryRouter>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  }
});

describe("Visual regression - HomeView markup snapshots", () => {
  for (const [name, w] of breakpoints) {
    it(`HomeView matches snapshot @ ${name}`, () => {
      setViewport(w);
      const { container } = render(<HomeView onOpenNotebook={() => {}} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  }
});
