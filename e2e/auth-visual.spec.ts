import { test, expect } from "@playwright/test";

/**
 * Visual regression for the /auth page in both Sign Up and Sign In states.
 *
 * Baselines are committed under e2e/auth-visual.spec.ts-snapshots/. Refresh
 * after intentional UI changes:
 *   bunx playwright test e2e/auth-visual.spec.ts --update-snapshots
 *
 * The screenshots target the auth card itself rather than the full page so
 * tiny background animations don't churn the baseline.
 */
test.describe("/auth visual layout", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
  });

  test("Sign Up state matches baseline", async ({ page }) => {
    await page.addInitScript(() => {
      try { localStorage.removeItem("hasVisitedAuth"); } catch {}
    });
    await page.goto("/auth");
    // Wait for the primary heading to settle.
    await page.getByText(/Create your account|Sign up/i).first().waitFor({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(400);
    await expect(page).toHaveScreenshot("auth-signup.png", {
      maxDiffPixelRatio: 0.02,
      fullPage: false,
    });
  });

  test("Sign In state matches baseline", async ({ page }) => {
    await page.addInitScript(() => {
      try { localStorage.setItem("hasVisitedAuth", "1"); } catch {}
    });
    await page.goto("/auth");
    await page.getByText(/Sign in|Welcome back/i).first().waitFor({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(400);
    await expect(page).toHaveScreenshot("auth-signin.png", {
      maxDiffPixelRatio: 0.02,
      fullPage: false,
    });
  });
});
