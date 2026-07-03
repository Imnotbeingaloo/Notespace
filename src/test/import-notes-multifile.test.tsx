import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { ImportNotesButton } from "@/components/ImportNotesButton";

/**
 * Regression suite for the "multi-file import drops all but the last file"
 * class of bugs. Covers:
 *   1. Binary attachments (images / PDFs / videos) — every file must land in
 *      the final attachments array via a single updateNote call.
 *   2. Plain-text multi-file merges — content from every file must reach
 *      onInsert / onMergeAt; nothing gets silently overwritten.
 */

const uploadMock = vi.fn();
const signMock = vi.fn();
const removeMock = vi.fn();
const updateNoteMock = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    storage: {
      from: () => ({
        upload: (...args: unknown[]) => uploadMock(...args),
        createSignedUrl: (...args: unknown[]) => signMock(...args),
        remove: (...args: unknown[]) => removeMock(...args),
      }),
    },
  },
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ user: { id: "user-1" } }),
}));

const activeNote = {
  id: "note-1",
  attachments: [{ name: "existing.pdf", url: "u", path: "p/existing.pdf", type: "application/pdf", size: 1 }],
};

vi.mock("@/context/NotebookContext", () => ({
  useNotebooks: () => ({
    activeNote,
    activeNotebookId: "nb-1",
    updateNote: (...args: unknown[]) => updateNoteMock(...args),
  }),
}));

vi.mock("@/hooks/use-toast", () => ({ toast: vi.fn() }));
vi.mock("@/components/ui/sonner", () => ({
  toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn(), warning: vi.fn() }),
}));

// PDFs in the "attach" branch of this test are treated as scanned so the
// component falls through to the storage-upload path instead of text import.
vi.mock("@/lib/pdf-extract", () => ({
  extractPdfText: vi.fn(async () => ({ text: "", isScanned: true, pageCount: 3 })),
}));

function makeFile(name: string, type: string, body = "x") {
  return new File([body], name, { type });
}

beforeEach(() => {
  uploadMock.mockReset().mockResolvedValue({ error: null });
  signMock.mockReset().mockResolvedValue({ data: { signedUrl: "https://signed/url" }, error: null });
  removeMock.mockReset().mockResolvedValue({ error: null });
  updateNoteMock.mockReset().mockResolvedValue(undefined);
  activeNote.attachments = [
    { name: "existing.pdf", url: "u", path: "p/existing.pdf", type: "application/pdf", size: 1 },
  ];
});

describe("ImportNotesButton multi-file persistence", () => {
  it("persists every image / scanned-PDF / video in a single updateNote call", async () => {
    const onInsert = vi.fn();
    const { container } = render(<ImportNotesButton onInsert={onInsert} hasExistingContent={false} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    const files = [
      makeFile("photo.png", "image/png"),
      makeFile("scan.pdf", "application/pdf"),
      makeFile("clip.mp4", "video/mp4"),
    ];
    Object.defineProperty(input, "files", { value: files, configurable: true });
    fireEvent.change(input);

    await waitFor(() => expect(updateNoteMock).toHaveBeenCalledTimes(1));
    const [, , updates] = updateNoteMock.mock.calls[0];
    // Existing attachment preserved + all three new files appended.
    expect(updates.attachments).toHaveLength(4);
    const names = updates.attachments.map((a: { name: string }) => a.name);
    expect(names).toEqual(["existing.pdf", "photo.png", "scan.pdf", "clip.mp4"]);
    // Every file drove exactly one upload — none was skipped.
    expect(uploadMock).toHaveBeenCalledTimes(3);
  });

  it("routes multi-file text imports through onInsert without losing earlier files", async () => {
    const onInsert = vi.fn();
    // No dialog wiring → all files should take the plain-onInsert branch and
    // each contribute their content, in order.
    const { container } = render(<ImportNotesButton onInsert={onInsert} hasExistingContent={false} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    const files = [
      makeFile("a.md", "text/markdown", "ALPHA-BODY"),
      makeFile("b.md", "text/markdown", "BETA-BODY"),
      makeFile("c.md", "text/markdown", "GAMMA-BODY"),
    ];
    Object.defineProperty(input, "files", { value: files, configurable: true });
    fireEvent.change(input);

    await waitFor(() => expect(onInsert).toHaveBeenCalledTimes(3));
    const merged = onInsert.mock.calls.map((c) => c[0]).join("\n");
    expect(merged).toMatch(/ALPHA-BODY/);
    expect(merged).toMatch(/BETA-BODY/);
    expect(merged).toMatch(/GAMMA-BODY/);
    // Text-only batch must never touch storage or attachments.
    expect(uploadMock).not.toHaveBeenCalled();
    expect(updateNoteMock).not.toHaveBeenCalled();
  });

  it("merges a text + PDF batch, keeping the text import AND persisting the attachment", async () => {
    const onInsert = vi.fn();
    const onMergeAt = vi.fn();
    const { container } = render(
      <ImportNotesButton
        onInsert={onInsert}
        onMergeAt={onMergeAt}
        onReplace={vi.fn()}
        onCreateNew={vi.fn()}
        hasExistingContent={false}
      />,
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    const files = [
      makeFile("notes.md", "text/markdown", "FIRST-TEXT"),
      makeFile("scan.pdf", "application/pdf"),
    ];
    Object.defineProperty(input, "files", { value: files, configurable: true });
    fireEvent.change(input);

    // First file (text) → onInsert. PDF is scanned → attachment upload path.
    await waitFor(() => expect(uploadMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(updateNoteMock).toHaveBeenCalledTimes(1));
    expect(onInsert).toHaveBeenCalled();
    const insertedText = onInsert.mock.calls.map((c) => c[0]).join("\n");
    expect(insertedText).toMatch(/FIRST-TEXT/);
    const [, , updates] = updateNoteMock.mock.calls[0];
    expect(updates.attachments.map((a: { name: string }) => a.name)).toContain("scan.pdf");
    expect(updates.attachments).toHaveLength(2); // existing + scan.pdf
  });
});
