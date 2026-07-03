import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";
import { render } from "@testing-library/react";
import { HybridEditor, type HybridEditorHandle } from "@/components/HybridEditor";

vi.mock("@/hooks/use-paper-style", () => ({
  usePaperStyle: () => [false, vi.fn()],
}));

vi.mock("@/components/FloatingToolbar", () => ({
  FloatingToolbar: () => null,
}));

/**
 * These tests lock in the guarantee that ImportNotesButton / attach flows
 * rely on: whatever caret position we captured via `saveSelection()` is the
 * position content ends up inserted at. Regressions here would silently
 * dump imported markdown or attachment links at the end of the note.
 */
describe("HybridEditor cursor / selection preservation", () => {
  it("inserts plain text at the saved caret position, not at the end", () => {
    const ref = createRef<HybridEditorHandle>();
    render(<HybridEditor ref={ref} content="Hello World" onChange={() => {}} />);
    const el = ref.current!.getEditorElement()!;

    // Place caret between "Hello" and " World" (offset 5 in the first text node)
    const textNode = el.querySelector("p")?.firstChild as Text;
    expect(textNode).toBeTruthy();
    const range = document.createRange();
    range.setStart(textNode, 5);
    range.setEnd(textNode, 5);
    const sel = window.getSelection()!;
    sel.removeAllRanges();
    sel.addRange(range);

    ref.current!.saveSelection();
    ref.current!.insertAtCursor(" INSERTED");

    // Caret was at position 5 → the injected text must appear right after
    // "Hello" and before " World", not appended at the end.
    expect(el.textContent).toMatch(/^Hello INSERTED World/);
  });

  it("mergeAt('cursor') honors the saved caret position", () => {
    const ref = createRef<HybridEditorHandle>();
    render(<HybridEditor ref={ref} content="Alpha Beta" onChange={() => {}} />);
    const el = ref.current!.getEditorElement()!;

    const textNode = el.querySelector("p")?.firstChild as Text;
    const range = document.createRange();
    range.setStart(textNode, 5);
    range.setEnd(textNode, 5);
    const sel = window.getSelection()!;
    sel.removeAllRanges();
    sel.addRange(range);

    ref.current!.saveSelection();
    ref.current!.mergeAt("MID", "cursor");

    expect(el.textContent).toMatch(/^Alpha.*MID.*Beta/);
  });

  it("mergeAt('top') always inserts before existing content regardless of caret", () => {
    const ref = createRef<HybridEditorHandle>();
    render(<HybridEditor ref={ref} content="Original body" onChange={() => {}} />);
    const el = ref.current!.getEditorElement()!;
    ref.current!.mergeAt("PREFIX", "top");
    expect(el.textContent?.indexOf("PREFIX")).toBeLessThan(el.textContent?.indexOf("Original") ?? -1);
  });

  it("mergeAt('end') always appends after existing content regardless of caret", () => {
    const ref = createRef<HybridEditorHandle>();
    render(<HybridEditor ref={ref} content="Body" onChange={() => {}} />);
    const el = ref.current!.getEditorElement()!;
    ref.current!.mergeAt("SUFFIX", "end");
    expect(el.textContent?.indexOf("Body")).toBeLessThan(el.textContent?.indexOf("SUFFIX") ?? -1);
  });
});
