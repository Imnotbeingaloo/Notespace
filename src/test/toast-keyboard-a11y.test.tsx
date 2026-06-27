import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "next-themes";
import { Toaster, toast } from "@/components/ui/sonner";
import { resetToastQueue } from "@/lib/toast-queue";

function renderToaster() {
  return render(
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <main>
        <textarea aria-label="editor surface" defaultValue="hello" />
        <Toaster />
      </main>
    </ThemeProvider>
  );
}

describe("Sonner toast - keyboard + a11y", () => {
  beforeEach(() => resetToastQueue());

  it("exposes the toaster as a labelled live region", async () => {
    renderToaster();
    await act(async () => { toast.success("Saved!"); });
    const region = await waitFor(() => screen.getByLabelText(/notifications/i));
    expect(region).toBeInTheDocument();
  });

  it("close button is keyboard reachable and labelled", async () => {
    const user = userEvent.setup();
    renderToaster();
    await act(async () => { toast.success("Heads up", { duration: 60000 }); });
    const closeBtn = await waitFor(() => screen.getByRole("button", { name: /close/i }));
    expect(closeBtn).toBeInTheDocument();
    closeBtn.focus();
    expect(document.activeElement).toBe(closeBtn);
    await user.keyboard("{Enter}");
    await waitFor(() => {
      expect(screen.queryByText("Heads up")).not.toBeInTheDocument();
    });
  });

  it("after dismissal focus does not leak into the editor", async () => {
    const user = userEvent.setup();
    renderToaster();
    const editor = screen.getByLabelText("editor surface");
    editor.focus();
    expect(document.activeElement).toBe(editor);
    await act(async () => { toast("Auto-dismiss", { duration: 80 }); });
    await waitFor(() => {
      expect(screen.queryByText("Auto-dismiss")).not.toBeInTheDocument();
    });
    // Editor focus must be preserved after a toast lifecycle
    expect(document.activeElement).toBe(editor);
    // Sanity: a Tab from the editor should NOT jump into a (now empty) toast region
    await user.tab();
    expect(document.activeElement).not.toBe(editor);
  });
});
