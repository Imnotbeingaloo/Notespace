import { test, expect } from "@playwright/test";

/**
 * Visual regression snapshots — run with `--update-snapshots` to refresh.
 * Targets the header border alignment and editor bottom-right region (Grammarly anchor).
 */
test.describe("Visual regression", () => {
  test("landing hero is stable", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("landing-hero.png", {
      fullPage: false,
      animations: "disabled",
    });
  });

  test("app header border alignment", async ({ page }) => {
    await page.goto("/app");
    if (page.url().includes("/auth")) test.skip(true, "Requires logged-in session");
    await page.waitForTimeout(800);
    const header = page.locator("header").first();
    await expect(header).toHaveScreenshot("app-header.png", { animations: "disabled" });
  });

  test("editor bottom-right region stays clear", async ({ page }) => {
    await page.goto("/app");
    if (page.url().includes("/auth")) test.skip(true, "Requires logged-in session");
    await page.waitForTimeout(800);
    const viewport = page.viewportSize();
    if (!viewport) return;
    const clip = {
      x: viewport.width - 240,
      y: viewport.height - 200,
      width: 230,
      height: 190,
    };
    await expect(page).toHaveScreenshot("editor-bottom-right.png", {
      clip,
      animations: "disabled",
    });
  });
});
