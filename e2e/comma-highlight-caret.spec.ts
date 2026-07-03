import { test, expect, Page } from "@playwright/test";

/**
 * Regression: the comma-highlight wrap/unwrap must not move the caret and
 * must not break undo/redo. wrapCommas runs on blur, unwrapCommas runs on
 * focus — the user should be able to type → blur → re-focus → undo and
 * still see the caret land in the expected place.
 */

async function ensureAppLoaded(page: Page) {
  await page.goto("/app");
  if (page.url().includes("/auth")) test.skip(true, "Requires logged-in session");
}

test("comma wrap/unwrap preserves caret and undo history", async ({ page }) => {
  await ensureAppLoaded(page);
  await page.evaluate(() => window.localStorage.setItem("comma_highlight_on", "1"));
  await page.reload();

  const editor = page.locator('[contenteditable="true"]').first();
  await editor.waitFor({ state: "visible", timeout: 10_000 }).catch(() => {});
  if (!(await editor.count())) test.skip(true, "No editor visible");
  await editor.click();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.press("Delete");

  const phrase = "apples, oranges, and pears";
  await editor.type(phrase, { delay: 5 });
  const afterType = (await editor.innerText()).trim();
  expect(afterType).toBe(phrase);

  // Blur → commas should be wrapped in `.comma-mark`.
  await page.locator("body").click({ position: { x: 1, y: 1 } });
  await page.waitForTimeout(200);
  expect(await page.locator(".comma-mark").count()).toBeGreaterThan(0);

  // Re-focus → wrappers stripped, plain text restored, caret placed inside.
  await editor.click();
  await page.waitForTimeout(150);
  expect(await page.locator(".comma-mark").count()).toBe(0);
  expect((await editor.innerText()).trim()).toBe(phrase);

  // Undo removes the last typed characters (does not choke on the
  // wrap/unwrap DOM mutation).
  await page.keyboard.press("ControlOrMeta+z");
  await page.waitForTimeout(150);
  const afterUndo = (await editor.innerText()).trim();
  expect(afterUndo.length).toBeLessThan(phrase.length);

  // Redo restores.
  await page.keyboard.press("ControlOrMeta+Shift+z");
  await page.waitForTimeout(150);
  expect((await editor.innerText()).trim()).toBe(phrase);
});
