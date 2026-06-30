import { test, expect } from "@playwright/test";

/**
 * Auth rate-limit regression.
 *
 * Hammers the login form with 6 wrong passwords for a known-nonexistent email
 * and verifies the 5th+ attempt surfaces the "Too many failed attempts" cooldown
 * copy. Then exercises the recovery path by clearing the failure rows via the
 * service role (which "fast-forwards" the 15-min window) and confirming the
 * form unblocks.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in env to reset state between runs; if
 * unset, the cleanup step is skipped and the test only verifies blocking.
 */

const TEST_EMAIL = `ratelimit-${Date.now()}@example-invalid.test`;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? "https://unjvbmgnicldmxwmuepc.supabase.co";
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function purgeFailures(email: string) {
  if (!SERVICE_ROLE) return;
  await fetch(`${SUPABASE_URL}/rest/v1/auth_failure_logs?email=eq.${encodeURIComponent(email)}`, {
    method: "DELETE",
    headers: {
      apikey: SERVICE_ROLE,
      Authorization: `Bearer ${SERVICE_ROLE}`,
      Prefer: "return=minimal",
    },
  });
}

test.describe("auth rate limit", () => {
  test.beforeEach(async () => { await purgeFailures(TEST_EMAIL); });
  test.afterEach(async () => { await purgeFailures(TEST_EMAIL); });

  test("shows cooldown after 5 failed login attempts and clears after reset", async ({ page }) => {
    await page.goto("/auth");
    // Ensure we are on the login tab.
    const loginTab = page.getByRole("button", { name: /sign in/i }).first();
    if (await loginTab.isVisible().catch(() => false)) await loginTab.click();

    const emailInput = page.getByLabel(/email/i).first();
    const passwordInput = page.getByLabel(/password/i).first();
    const submit = page.getByRole("button", { name: /sign in|continue|log in/i }).last();

    for (let i = 0; i < 6; i++) {
      await emailInput.fill(TEST_EMAIL);
      await passwordInput.fill(`wrong-pw-${i}`);
      await submit.click();
      await page.waitForTimeout(700);
    }

    await expect(
      page.getByText(/too many failed attempts/i)
    ).toBeVisible({ timeout: 10_000 });

    // Recovery: clear the failure window and confirm the cooldown is gone.
    test.skip(!SERVICE_ROLE, "SUPABASE_SERVICE_ROLE_KEY not set; skipping recovery assertion");
    await purgeFailures(TEST_EMAIL);
    await emailInput.fill(TEST_EMAIL);
    await passwordInput.fill("still-wrong-but-not-blocked");
    await submit.click();
    await expect(page.getByText(/too many failed attempts/i)).toBeHidden({ timeout: 10_000 });
  });
});
