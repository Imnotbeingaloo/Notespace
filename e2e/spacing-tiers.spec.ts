import { test, expect } from "@playwright/test";

/**
 * The paragraph-spacing tier (tight/normal/relaxed) is stored in
 * localStorage under `paragraph_spacing_tier` and applied as a
 * `.spacing-<tier>` class on <html>. It must round-trip across reloads.
 */

const KEY = "paragraph_spacing_tier";

for (const tier of ["tight", "normal", "relaxed"] as const) {
  test(`spacing tier "${tier}" applies .spacing-${tier} and survives reload`, async ({ page }) => {
    await page.goto("/");
    await page.evaluate(([k, v]) => window.localStorage.setItem(k, v), [KEY, tier]);
    await page.reload();

    const cls = await page.evaluate(() => document.documentElement.className);
    expect(cls).toContain(`spacing-${tier}`);
    // And the other two tiers must NOT be present simultaneously.
    for (const other of ["tight", "normal", "relaxed"] as const) {
      if (other === tier) continue;
      expect(cls.split(/\s+/)).not.toContain(`spacing-${other}`);
    }
  });
}
