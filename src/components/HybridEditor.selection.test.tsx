import { describe, it, expect, vi, beforeAll } from "vitest";
import { createRef } from "react";
import { render } from "@testing-library/react";
import { HybridEditor, type HybridEditorHandle } from "@/components/HybridEditor";

vi.mock("@/hooks/use-paper-style", () => ({
  usePaperStyle: () => [false, vi.fn()],
}));

vi.mock("@/components/FloatingToolbar", () => ({
  FloatingToolbar: () => null,
}));

// jsdom doesn't implement execCommand. Shim it with the minimum
// behavior HybridEditor relies on so we can assert cursor semantics
// without wiring up a full browser.
beforeAll(() => {
  (document as any).execCommand = (command: string, _ui: boolean, value?: string) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return true;
    const range = sel.getRangeAt(0);
    range.deleteContents();
    if (command === "insertText" && value !== undefined) {
      range.insertNode(document.createTextNode(value));
    } else if (command === "insertHTML" && value !== undefined) {
      const tpl = document.createElement("template");
      tpl.innerHTML = value;
      const frag = tpl.content;
      const last = frag.lastChild;
      range.insertNode(frag);
      if (last) {
        range.setStartAfter(last);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    } else if (command === "selectAll") {
      const editor = document.querySelector('[data-testid="hybrid-editor-content"]');
      if (editor) {
        const r = document.createRange();
        r.selectNodeContents(editor);
        sel.removeAllRanges();
        sel.addRange(r);
      }
    }
    return true;
  };
});



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

    expect(el.textContent).toMatch(/^Alpha[\s\S]*MID[\s\S]*Beta/);
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
