import { test, expect } from "@playwright/test";

/**
 * HIBP leaked-password rejection.
 *
 * Supabase's Auth has Password HIBP Check enabled. Any signup using a password
 * found in the haveibeenpwned breach corpus must be rejected. We use "Password1"
 * - one of the most-leaked strings ever recorded - so the check is deterministic.
 */

const LEAKED_PASSWORD = "Password1";

test("signup with a breached password is rejected with a clear UI reason", async ({ page }) => {
  await page.goto("/auth");

  // Switch to the signup tab if the form starts in login mode.
  const signupTab = page.getByRole("button", { name: /sign up|create account/i }).first();
  if (await signupTab.isVisible().catch(() => false)) await signupTab.click();

  const email = `hibp-${Date.now()}@example-invalid.test`;
  await page.getByLabel(/email/i).first().fill(email);

  const pwInputs = page.getByLabel(/password/i);
  await pwInputs.first().fill(LEAKED_PASSWORD);
  // Confirm-password field if present.
  if ((await pwInputs.count()) > 1) await pwInputs.nth(1).fill(LEAKED_PASSWORD);

  await page.getByRole("button", { name: /sign up|create account|continue/i }).last().click();

  // The friendlyError mapper surfaces HIBP rejections as "data breach" / "leaked" / "weak".
  await expect(
    page.getByText(/data breach|leaked|compromised|weak password|breach/i)
  ).toBeVisible({ timeout: 15_000 });
});
