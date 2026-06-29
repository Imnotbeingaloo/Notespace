#!/usr/bin/env python3
"""Regression: blog -> auth flow must not show a form blink for returning users.

Seeds the `na_has_session` localStorage hint on the blog origin, navigates to
/auth, and polls the DOM for the email input during the hint-grace window.
Exits non-zero if the form paints before the session resolves.

Run:  python3 scripts/test-auth-flicker.py
"""
import asyncio, os, sys
from playwright.async_api import async_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:8080")
BLOG_PATH = "/blog/best-note-taking-app"
SAMPLE_MS = 900   # matches hintGrace in Auth.tsx
POLL_MS = 30

async def main() -> int:
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 390, "height": 800})
        page = await ctx.new_page()
        blink = False
        try:
            await page.goto(f"{BASE}{BLOG_PATH}", wait_until="domcontentloaded")
            await page.evaluate("localStorage.setItem('na_has_session','1')")
            await page.goto(f"{BASE}/auth", wait_until="domcontentloaded")

            elapsed = 0
            while elapsed < SAMPLE_MS:
                visible = await page.locator("input[type='email']").first.is_visible()
                if visible:
                    blink = True
                    break
                await page.wait_for_timeout(POLL_MS)
                elapsed += POLL_MS
        finally:
            await browser.close()

        if blink:
            print("\u2717 Auth form blink detected for returning user.", file=sys.stderr)
            return 1
        print("\u2713 No auth form blink during hint-grace window.")
        return 0

sys.exit(asyncio.run(main()))
