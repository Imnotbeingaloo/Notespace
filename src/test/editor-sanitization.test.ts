import { describe, it, expect } from "vitest";
import { marked } from "marked";
import DOMPurify from "dompurify";

// Mirrors HybridEditor's markdownToHtml() pipeline.
function renderEditorMarkdown(md: string): string {
  const raw = marked.parse(md, { async: false }) as string;
  return DOMPurify.sanitize(raw, { ADD_ATTR: ["target"] });
}

describe("Editor sanitization (XSS payloads)", () => {
  it("strips <script> tags entirely", () => {
    const out = renderEditorMarkdown("hi <script>alert(1)</script> world");
    expect(out).not.toMatch(/<script/i);
    expect(out).not.toMatch(/alert\(1\)/);
  });

  it("removes onerror and other on* event attributes from images", () => {
    const out = renderEditorMarkdown('<img src=x onerror=alert(1)>');
    expect(out).not.toMatch(/onerror/i);
    expect(out).not.toMatch(/\son[a-z]+\s*=/i);
  });

  it("blocks javascript: URIs in anchor href", () => {
    const out = renderEditorMarkdown('[click](javascript:alert(1))');
    expect(out).not.toMatch(/javascript:/i);
  });

  it("removes inline event handlers from arbitrary HTML", () => {
    const out = renderEditorMarkdown('<a href="#" onclick="alert(1)">x</a>');
    expect(out).not.toMatch(/onclick/i);
  });

  it("preserves safe markdown formatting", () => {
    const out = renderEditorMarkdown("**bold** and [link](https://example.com)");
    expect(out).toMatch(/<strong>bold<\/strong>/);
    expect(out).toMatch(/href="https:\/\/example\.com"/);
  });
});
