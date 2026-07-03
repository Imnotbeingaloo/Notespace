import { test, expect, Page } from "@playwright/test";

/**
 * Visual regression for editor chrome that is prone to layout drift:
 *   - the `---` divider (imported from PDFs)
 *   - blockquote styling
 *   - the comma-highlight reading overlay
 *
 * Requires an authenticated session with at least one note; skips otherwise.
 * Snapshots are per-element (not full page) so unrelated UI churn does not
 * invalidate them. Update with `bunx playwright test --update-snapshots`.
 */

async function ensureAppLoaded(page: Page) {
  await page.goto("/app");
  if (page.url().includes("/auth")) test.skip(true, "Requires logged-in session");
}

async function focusFirstEditor(page: Page) {
  const editor = page.locator('[contenteditable="true"]').first();
  await editor.waitFor({ state: "visible", timeout: 10_000 }).catch(() => {});
  if (!(await editor.count())) test.skip(true, "No editor visible");
  await editor.click();
  await page.keyboard.press("ControlOrMeta+A").catch(() => {});
  await page.keyboard.press("Delete").catch(() => {});
  return editor;
}

test.describe("Editor visual regression", () => {
  test("horizontal divider renders consistently", async ({ page }) => {
    await ensureAppLoaded(page);
    const editor = await focusFirstEditor(page);
    await editor.type("Section one\n\n---\n\nSection two", { delay: 5 });
    await page.waitForTimeout(500);
    await expect(editor).toHaveScreenshot("divider.png", { maxDiffPixelRatio: 0.02 });
  });

  test("blockquote renders consistently", async ({ page }) => {
    await ensureAppLoaded(page);
    const editor = await focusFirstEditor(page);
    await editor.type("> A quote block that spans one line for the snapshot.", { delay: 5 });
    await page.waitForTimeout(500);
    await expect(editor).toHaveScreenshot("blockquote.png", { maxDiffPixelRatio: 0.02 });
  });

  test("comma-highlight overlay tints commas on blur", async ({ page }) => {
    await ensureAppLoaded(page);
    // Enable overlay via the same localStorage key the hook uses.
    await page.evaluate(() => window.localStorage.setItem("comma_highlight_on", "1"));
    await page.reload();
    const editor = await focusFirstEditor(page);
    await editor.type("Red, green, and blue are the primary display colors.", { delay: 5 });
    // Blur so wrapCommas runs.
    await page.locator("body").click({ position: { x: 1, y: 1 } });
    await page.waitForTimeout(300);
    const marks = page.locator(".comma-mark");
    await expect(marks.first()).toBeVisible();
    await expect(editor).toHaveScreenshot("comma-highlight.png", { maxDiffPixelRatio: 0.02 });
  });
});
