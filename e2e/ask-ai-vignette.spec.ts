import { test, expect } from "@playwright/test";

/**
 * Regression: Ask AI empty-state vignette must render all three serif words
 * first, then replace the vignette with the quill. The quill must not sit on
 * top of the word animation.
 *
 * Requires an authenticated session with at least two notebooks/notes.
 */
test.describe("Ask AI vignette", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/app");
    if (page.url().includes("/auth")) test.skip(true, "Requires logged-in session");
  });

  test("three words play before the quill appears", async ({ page }) => {
    const openAskAI = async () => {
      const trigger = page.getByRole("button", { name: /ask ai/i }).first();
      await trigger.click();
      await expect(page.locator('[aria-label="Close Ask AI"]')).toBeVisible();
    };

    await openAskAI();
    await expect(page.getByText("idea")).toBeVisible();
    await expect(page.locator('svg.lucide-feather')).toHaveCount(0);
    await page.waitForTimeout(800);
    await expect(page.getByText("spark")).toBeVisible();
    await expect(page.locator('svg.lucide-feather')).toHaveCount(0);
    await page.waitForTimeout(800);
    await expect(page.getByText("note")).toBeVisible();
    await expect(page.locator('svg.lucide-feather')).toHaveCount(0);
    await page.waitForTimeout(900);
    await expect(page.locator('svg.lucide-feather').first()).toBeVisible();
    await expect(page.getByText("idea", { exact: true })).toHaveCount(0);
    await expect(page.getByText("spark", { exact: true })).toHaveCount(0);
    await expect(page.getByText("note", { exact: true })).toHaveCount(0);

    // Close + reopen: word vignette must remount before quill.
    await page.locator('[aria-label="Close Ask AI"]').click();
    await page.waitForTimeout(300);
    await openAskAI();
    await expect(page.getByText("idea")).toBeVisible();

    // Switch note/notebook then reopen - vignette must still show.
    await page.locator('[aria-label="Close Ask AI"]').click();
    const anotherNote = page.locator("aside").getByRole("button").nth(3);
    if (await anotherNote.count()) await anotherNote.click().catch(() => {});
    await openAskAI();
    await expect(page.getByText("idea")).toBeVisible();
  });
});
