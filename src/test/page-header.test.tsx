import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { AuthProvider } from "@/context/AuthContext";

// Mock supabase client used inside AuthProvider
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: () => Promise.resolve({ error: null }),
    },
  },
}));

const setViewport = (w: number) => {
  Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: w });
  window.dispatchEvent(new Event("resize"));
};

const renderHeader = () =>
  render(
    <MemoryRouter>
      <AuthProvider>
        <PageHeader activePage="features" />
      </AuthProvider>
    </MemoryRouter>
  );

describe("PageHeader responsive", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("desktop: shows full nav, brand text, and Get Started CTA on one row", () => {
    setViewport(1440);
    renderHeader();

    // Brand text visible (sm+)
    expect(screen.getByText(/Notebook Archive/i)).toBeInTheDocument();

    // All nav links present
    ["Features", "Pricing", "About", "How It Works"].forEach((label) => {
      expect(screen.getByRole("link", { name: new RegExp(label, "i") })).toBeInTheDocument();
    });

    // CTA is whitespace-nowrap so it never wraps
    const cta = screen.getByRole("link", { name: /Get Started/i });
    expect(cta.className).toMatch(/whitespace-nowrap/);
  });

  it("tablet: nav still visible (md breakpoint) without overlapping CTA", () => {
    setViewport(820);
    renderHeader();
    const howItWorks = screen.getByRole("link", { name: /How It Works/i });
    // Must stay on a single line
    expect(howItWorks.className).toMatch(/whitespace-nowrap/);
    expect(screen.getByRole("link", { name: /Get Started/i })).toBeInTheDocument();
  });

  it("mobile: hamburger present, CTA still rendered, brand hidden via class", () => {
    setViewport(375);
    renderHeader();
    // CTA always rendered
    expect(screen.getByRole("link", { name: /Get Started/i })).toBeInTheDocument();
    // Hamburger button (md:hidden) exists
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(1);
    // Brand span uses hidden sm:inline so it carries the responsive class
    const brand = screen.getByText(/Notebook Archive/i);
    expect(brand.className).toMatch(/hidden\s+sm:inline/);
  });
});
