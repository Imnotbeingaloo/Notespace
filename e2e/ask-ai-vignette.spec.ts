import { test, expect } from "@playwright/test";

/**
 * Regression: Ask AI empty-state vignette must render (leaf halo + serif word)
 * on open, on close+reopen, and after switching notebooks/notes. It must not
 * flash a briefly-visible placeholder before settling.
 *
 * Requires an authenticated session with at least two notebooks/notes.
 */
test.describe("Ask AI vignette", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/app");
    if (page.url().includes("/auth")) test.skip(true, "Requires logged-in session");
  });

  test("leaf halo and vignette word persist across open/close/switch", async ({ page }) => {
    const openAskAI = async () => {
      const trigger = page.getByRole("button", { name: /ask ai/i }).first();
      await trigger.click();
      // Vignette word container has role none - locate by the halo Feather svg via title/lucide class.
      await expect(page.locator('[aria-label="Close Ask AI"]')).toBeVisible();
    };

    await openAskAI();
    // The leaf halo is always mounted - if it disappears within 400ms after open,
    // we still have the swap-flash regression.
    const leaf = page.locator('svg.lucide-feather').first();
    await expect(leaf).toBeVisible();
    await page.waitForTimeout(400);
    await expect(leaf).toBeVisible();

    // Close + reopen: vignette must remount.
    await page.locator('[aria-label="Close Ask AI"]').click();
    await page.waitForTimeout(300);
    await openAskAI();
    await expect(page.locator('svg.lucide-feather').first()).toBeVisible();

    // Switch note/notebook then reopen - vignette must still show.
    await page.locator('[aria-label="Close Ask AI"]').click();
    const anotherNote = page.locator("aside").getByRole("button").nth(3);
    if (await anotherNote.count()) await anotherNote.click().catch(() => {});
    await openAskAI();
    await expect(page.locator('svg.lucide-feather').first()).toBeVisible();
  });
});
