import { test, expect, Page } from "@playwright/test";

/**
 * Regression: alignment, underline, and highlight applied from the
 * FloatingToolbar must survive closing and reopening the note (i.e. the
 * markup makes it through the save round-trip).
 */

async function ensureAppLoaded(page: Page) {
  await page.goto("/app");
  if (page.url().includes("/auth")) test.skip(true, "Requires logged-in session");
}

async function clickFirstNote(page: Page) {
  const note = page.locator('[data-note-id]').first();
  if (!(await note.count())) test.skip(true, "No existing note to reopen");
  await note.click();
}

test("underline + center align + highlight persist across reopen", async ({ page }) => {
  await ensureAppLoaded(page);
  const editor = page.locator('[contenteditable="true"]').first();
  await editor.waitFor({ state: "visible", timeout: 10_000 }).catch(() => {});
  if (!(await editor.count())) test.skip(true, "No editor visible");
  await editor.click();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.press("Delete");
  await editor.type("Formatting persistence test line.", { delay: 5 });

  // Select the whole line and open the floating toolbar.
  await page.keyboard.press("ControlOrMeta+A");
  await page.waitForTimeout(200);

  await page.getByRole("button", { name: "Underline" }).click();
  await page.getByRole("button", { name: "Align center" }).click();
  await page.getByRole("button", { name: "Apply highlight" }).click();

  // Wait for debounced autosave.
  await page.waitForTimeout(1200);

  const noteId = await page.locator('[data-note-id][data-active="true"]').getAttribute("data-note-id").catch(() => null);

  // Navigate away and back — reload is the strictest form of "reopen".
  await page.reload();
  await editor.waitFor({ state: "visible", timeout: 10_000 });
  if (noteId) {
    await page.locator(`[data-note-id="${noteId}"]`).first().click().catch(() => {});
  } else {
    await clickFirstNote(page);
  }

  const html = await page.locator('[contenteditable="true"]').first().innerHTML();
  expect(html).toMatch(/<u\b|text-decoration:\s*underline/i);
  expect(html).toMatch(/text-align:\s*center|justify-?center/i);
  expect(html).toMatch(/background-color|<mark\b/i);
});
