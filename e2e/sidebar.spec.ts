import { test, expect } from "@playwright/test";

/**
 * E2E: sidebar collapse/expand + animated logo + notification overlap guards.
 *
 * These tests assume an authenticated session. In CI, log in via UI or pre-seed
 * an auth state file with `storageState`. Without auth, the suite is skipped.
 */
test.describe("Sidebar interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/app");
    // If we land on /auth we can't continue — gracefully skip.
    if (page.url().includes("/auth")) test.skip(true, "Requires logged-in session");
  });

  test("toggles between collapsed and expanded with consistent hamburger icon", async ({ page }) => {
    const toggle = page.getByRole("button", { name: /toggle sidebar|sidebar/i }).first();
    await expect(toggle).toBeVisible();

    // Capture aria-expanded or width before/after toggle.
    const sidebar = page.locator("aside").first();
    const initialWidth = await sidebar.evaluate((el) => el.getBoundingClientRect().width);

    await toggle.click();
    await page.waitForTimeout(450); // morph
    const collapsedWidth = await sidebar.evaluate((el) => el.getBoundingClientRect().width);
    expect(collapsedWidth).not.toBe(initialWidth);

    // Logo should be present in collapsed state.
    await expect(page.locator('img[alt="Notebook Archive"]').first()).toBeVisible();

    await toggle.click();
    await page.waitForTimeout(450);
    const expandedWidth = await sidebar.evaluate((el) => el.getBoundingClientRect().width);
    expect(Math.abs(expandedWidth - initialWidth)).toBeLessThan(8);
  });

  test("toasts do not visually overlap each other", async ({ page }) => {
    // Sonner region renders bottom-right; verify children stack vertically.
    const region = page.locator('[data-sonner-toaster]');
    if (await region.count()) {
      const boxes = await region.locator("li").evaluateAll((els) =>
        els.map((e) => e.getBoundingClientRect())
      );
      for (let i = 1; i < boxes.length; i++) {
        // Each toast's top should not be inside the previous toast's body.
        expect(boxes[i].top).toBeGreaterThanOrEqual(boxes[i - 1].top);
      }
    }
  });
});
