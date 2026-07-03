import { test, expect, Page } from "@playwright/test";

/**
 * E2E: flashcard generator empty states.
 *
 *  1. Gibberish note → the "Make it make sense for me 🙃" panel is shown
 *     and no flashcard deck is rendered.
 *  2. Edge function returns NO_CONCEPTS → same empty state, deck hidden.
 *
 * Both tests require an authenticated session with at least one note open.
 * They skip gracefully when the preview is signed out (mirrors sidebar.spec.ts).
 */

async function ensureAppLoaded(page: Page) {
  await page.goto("/app");
  if (page.url().includes("/auth")) test.skip(true, "Requires logged-in session");
}

async function openOrCreateNoteAndSetContent(page: Page, content: string) {
  // Best-effort: click the first note in the sidebar, else create one via the
  // Create button. The exact accessibility label varies, so we try a few.
  const firstNote = page.locator('[data-note-id], aside button:has-text("Note"), aside a:has-text("Note")').first();
  if (await firstNote.count()) {
    await firstNote.click().catch(() => {});
  } else {
    const createBtn = page.getByRole("button", { name: /create|new note/i }).first();
    if (await createBtn.count()) {
      await createBtn.click().catch(() => {});
    }
  }

  const editor = page.locator('[contenteditable="true"], textarea').first();
  await editor.waitFor({ state: "visible", timeout: 10_000 }).catch(() => {});
  if (!(await editor.count())) test.skip(true, "No editor visible — cannot exercise flashcards");

  await editor.click();
  // Clear existing text.
  await page.keyboard.press("ControlOrMeta+A").catch(() => {});
  await page.keyboard.press("Delete").catch(() => {});
  await editor.type(content, { delay: 5 });
  // Give the debounced autosave a moment so getFlashcardSourceText sees it.
  await page.waitForTimeout(600);
}

async function openFlashcardsPanel(page: Page) {
  const btn = page.getByRole("button", { name: /flashcards/i }).first();
  await expect(btn).toBeVisible();
  await btn.click();
}

test.describe("Flashcards empty states", () => {
  test("gibberish note shows 'Make it make sense for me 🙃' and hides the deck", async ({ page }) => {
    await ensureAppLoaded(page);
    // Long enough to pass the MIN_FLASHCARD_BODY_CHARS check but pure noise.
    const gibberish =
      "asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf";
    await openOrCreateNoteAndSetContent(page, gibberish);
    await openFlashcardsPanel(page);

    const empty = page.getByTestId("flashcards-empty-state");
    await expect(empty).toBeVisible();
    await expect(empty).toContainText("Make it make sense for me");
    // The client-side gibberish path should also surface the reason chip.
    await expect(page.getByTestId("gibberish-reason")).toBeVisible();
    // Deck must not render.
    await expect(page.getByTestId("flashcards-deck")).toHaveCount(0);
  });

  test("edge function returning NO_CONCEPTS shows the empty state with no deck", async ({ page }) => {
    await ensureAppLoaded(page);

    // Mock the ai-tools edge function to return an SSE stream whose only
    // content is the sentinel "NO_CONCEPTS".
    await page.route(/\/functions\/v1\/ai-tools(\?.*)?$/, async (route) => {
      const payload =
        `data: ${JSON.stringify({ choices: [{ delta: { content: "NO_CONCEPTS" } }] })}\n\n` +
        `data: [DONE]\n\n`;
      await route.fulfill({
        status: 200,
        headers: {
          "content-type": "text/event-stream",
          "cache-control": "no-cache",
        },
        body: payload,
      });
    });

    // Real-looking prose so the client-side gibberish check passes and we
    // actually reach the (mocked) edge function.
    const prose =
      "Photosynthesis is the process by which green plants convert sunlight into chemical energy. " +
      "Chlorophyll absorbs light in the blue and red parts of the spectrum. " +
      "The reaction produces glucose and releases oxygen as a byproduct.";
    await openOrCreateNoteAndSetContent(page, prose);
    await openFlashcardsPanel(page);

    const empty = page.getByTestId("flashcards-empty-state");
    await expect(empty).toBeVisible({ timeout: 15_000 });
    await expect(empty).toContainText("Make it make sense for me");
    await expect(page.getByTestId("flashcards-deck")).toHaveCount(0);
  });
});
