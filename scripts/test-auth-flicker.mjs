#!/usr/bin/env node
/**
 * Regression: blog -> auth flow must not show a form blink for returning users.
 *
 * Simulates a returning visitor by pre-seeding the `na_has_session` localStorage
 * hint, navigates from a blog post to /auth, and asserts the email input never
 * paints during the hint-grace window. Exits non-zero on regression.
 *
 * Requires the dev server at http://localhost:8080.
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:8080";
const BLOG_PATH = "/blog/best-note-taking-app";
const SAMPLE_MS = 900; // matches hintGrace in Auth.tsx
const POLL_MS = 30;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } });
const page = await ctx.newPage();

let blinkDetected = false;
try {
  // 1. Land on blog page first so we share an origin and can seed localStorage.
  await page.goto(`${BASE}${BLOG_PATH}`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.setItem("na_has_session", "1"));

  // 2. Click through to auth — same SPA navigation a returning reader would do.
  await page.goto(`${BASE}/auth`, { waitUntil: "domcontentloaded" });

  // 3. Poll the DOM for the email input during the hint-grace window.
  const start = Date.now();
  while (Date.now() - start < SAMPLE_MS) {
    const visible = await page
      .locator("input[type='email']")
      .first()
      .isVisible()
      .catch(() => false);
    if (visible) {
      blinkDetected = true;
      break;
    }
    await page.waitForTimeout(POLL_MS);
  }
} finally {
  await browser.close();
}

if (blinkDetected) {
  console.error("✗ Auth form blink detected for returning user (na_has_session set).");
  process.exit(1);
}
console.log("✓ No auth form blink during hint-grace window.");
