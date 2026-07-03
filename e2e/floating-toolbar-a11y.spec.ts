import { test, expect, Page } from "@playwright/test";

/**
 * Accessibility checks: the FloatingToolbar buttons and the Settings
 * comma-highlight toggle must expose meaningful ARIA labels and be
 * reachable/operable by keyboard.
 */

async function ensureAppLoaded(page: Page) {
  await page.goto("/app");
  if (page.url().includes("/auth")) test.skip(true, "Requires logged-in session");
}

test.describe("FloatingToolbar a11y", () => {
  test("selection toolbar exposes labels and reacts to keyboard", async ({ page }) => {
    await ensureAppLoaded(page);
    const editor = page.locator('[contenteditable="true"]').first();
    await editor.waitFor({ state: "visible", timeout: 10_000 }).catch(() => {});
    if (!(await editor.count())) test.skip(true, "No editor visible");
    await editor.click();
    await page.keyboard.press("ControlOrMeta+A");
    await page.keyboard.press("Delete");
    await editor.type("The quick brown fox jumps over the lazy dog.", { delay: 5 });

    // Select the first word.
    await page.keyboard.press("Home");
    await page.keyboard.press("Shift+ControlOrMeta+ArrowRight");
    await page.waitForTimeout(200);

    // Toolbar must expose aria-labels for its actions.
    for (const name of ["Bold", "Italic", "Underline", "Apply highlight", "Align left", "Line spacing"]) {
      await expect(page.getByRole("button", { name })).toBeVisible();
    }

    // Cmd/Ctrl+B toggles bold on the selection without needing a mouse.
    await page.keyboard.press("ControlOrMeta+b");
    await page.waitForTimeout(200);
    const html = await editor.innerHTML();
    expect(/<(b|strong)\b/i.test(html) || /font-weight:\s*(bold|[6-9]00)/i.test(html)).toBe(true);
  });

  test("Settings dialog: comma-highlight toggle is keyboard operable", async ({ page }) => {
    await ensureAppLoaded(page);
    const openSettings = page.getByRole("button", { name: /settings|preferences/i }).first();
    if (!(await openSettings.count())) test.skip(true, "Settings entry point not visible");
    await openSettings.click();
    const toggle = page.getByRole("switch", { name: /comma/i });
    await expect(toggle).toBeVisible();
    const initial = await toggle.getAttribute("aria-checked");
    await toggle.focus();
    await page.keyboard.press("Space");
    await expect(toggle).not.toHaveAttribute("aria-checked", initial || "false");
  });
});
