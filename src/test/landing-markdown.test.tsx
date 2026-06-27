import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { RenderMarkdownLine, renderInline } from "@/lib/landing-markdown";
import { setReduceMotionPref } from "@/hooks/use-reduce-motion-pref";

describe("landing-markdown rendering", () => {
  beforeEach(() => {
    // Ensure animations are enabled by default for these checks.
    window.localStorage.clear();
    setReduceMotionPref(false);
  });

  it("renders ## as an <h3> with the trimmed text", () => {
    render(<RenderMarkdownLine text="## Wave-Particle Duality" />);
    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toHaveTextContent("Wave-Particle Duality");
    expect(heading.textContent).not.toContain("##");
  });

  it("renders ### as an <h4> with the trimmed text", () => {
    render(<RenderMarkdownLine text="### Key Equations" />);
    const heading = screen.getByRole("heading", { level: 4 });
    expect(heading).toHaveTextContent("Key Equations");
    expect(heading.textContent).not.toContain("###");
  });

  it("renders **bold** as a <strong> with stripped markers", () => {
    render(
      <RenderMarkdownLine text="This was demonstrated by the **double-slit experiment**." />,
    );
    const strong = document.querySelector("strong");
    expect(strong).not.toBeNull();
    expect(strong!.textContent).toBe("double-slit experiment");
    expect(document.body.textContent).not.toMatch(/\*\*/);
  });

  it("renders `inline code` as a <code> with stripped backticks", () => {
    render(<RenderMarkdownLine text="- Energy: `E = hf`" />);
    const code = document.querySelector("code");
    expect(code).not.toBeNull();
    expect(code!.textContent).toBe("E = hf");
    expect(document.body.textContent).not.toMatch(/`/);
  });

  it("animates lines whose formatting resolves (heading)", () => {
    const { container } = render(<RenderMarkdownLine text="## A Heading" />);
    const wrapper = container.querySelector("[data-md-animate]");
    expect(wrapper?.getAttribute("data-md-animate")).toBe("true");
  });

  it("animates lines containing **bold**", () => {
    const { container } = render(
      <RenderMarkdownLine text="A line with **emphasis** in it." />,
    );
    const wrapper = container.querySelector("[data-md-animate]");
    expect(wrapper?.getAttribute("data-md-animate")).toBe("true");
  });

  it("renders plain text instantly with no animation wrapper", () => {
    const { container } = render(
      <RenderMarkdownLine text="Light and matter exhibit properties of both." />,
    );
    const wrapper = container.querySelector("[data-md-animate]");
    expect(wrapper?.getAttribute("data-md-animate")).toBe("false");
  });

  it("disables animation when reduce-motion preference is on", () => {
    setReduceMotionPref(true);
    const { container } = render(<RenderMarkdownLine text="## A Heading" />);
    const wrapper = container.querySelector("[data-md-animate]");
    expect(wrapper?.getAttribute("data-md-animate")).toBe("false");
  });

  it("disables animation when forceReduceMotion is passed", () => {
    const { container } = render(
      <RenderMarkdownLine text="## Forced" forceReduceMotion />,
    );
    const wrapper = container.querySelector("[data-md-animate]");
    expect(wrapper?.getAttribute("data-md-animate")).toBe("false");
  });
});

describe("renderInline tokenizer", () => {
  it("handles mixed bold and code in one line", () => {
    const tokens = renderInline("Use **bold** and `code` together");
    // 5 tokens: "Use ", <strong>, " and ", <code>, " together"
    expect(tokens).toHaveLength(5);
  });

  it("leaves plain text untouched", () => {
    const tokens = renderInline("just words");
    expect(tokens).toEqual(["just words"]);
  });
});
