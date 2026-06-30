import { test, expect, Page } from "@playwright/test";

/**
 * Splash playback rules:
 *  - Landing (/) -> /home  ............ splash plays (Landing arms `playSplash` in sessionStorage)
 *  - Direct deep link to /home  ....... NO splash (Landing never mounted)
 *  - Reload /home in same session  .... NO splash (flag was consumed)
 *  - Internal SPA nav back to /home ... NO splash
 *
 * These tests require an authenticated session. Without one, /home redirects
 * to /auth and the suite is skipped.
 */

const SPLASH_SELECTOR = 'img[alt="Notespace"]';

async function splashVisibleWithin(page: Page, ms: number): Promise<boolean> {
  try {
    await page.locator(SPLASH_SELECTOR).first().waitFor({ state: "visible", timeout: ms });
    // The splash sits at z-[9999] with a full-viewport overlay. Use that to
    // distinguish it from the sidebar logo.
    return await page.evaluate(() => {
      const overlay = document.querySelector('div[class*="z-[9999]"]');
      return !!overlay;
    });
  } catch {
    return false;
  }
}

async function requireAuth(page: Page) {
  await page.goto("/home");
  if (page.url().includes("/auth")) test.skip(true, "Requires logged-in session");
}

test.describe("Splash replay rules", () => {
  test("plays on Landing -> /home, not on reload or internal nav", async ({ page }) => {
    await requireAuth(page);

    // 1) Reload /home: splash should NOT autoplay (flag was consumed).
    await page.reload();
    expect(await splashVisibleWithin(page, 600)).toBe(false);

    // 2) Internal nav: /home -> /trash -> /home, still no splash.
    await page.goto("/trash");
    await page.goBack();
    expect(await splashVisibleWithin(page, 600)).toBe(false);

    // 3) Landing -> /home: splash replays.
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await page.goto("/home");
    expect(await splashVisibleWithin(page, 1500)).toBe(true);
  });

  test("direct deep link to /home does not play splash", async ({ page, context }) => {
    await requireAuth(page);
    // Fresh tab simulates a cold deep link with no Landing visit in this session.
    const fresh = await context.newPage();
    await fresh.goto("/home");
    if (fresh.url().includes("/auth")) test.skip(true, "Requires logged-in session");
    expect(await splashVisibleWithin(fresh, 800)).toBe(false);
    await fresh.close();
  });
});
