#!/usr/bin/env python3
"""
Generate per-post OG images as clean, brand-styled cards using Playwright.
No AI imagery — just typography on cream paper with brand colors.

Usage: python3 scripts/generate-og-images.py
"""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

POSTS = [
    ("how-to-make-a-study-plan", "Study Guide", "How to make a study plan",
     "A simple, step-by-step guide with a free weekly template."),
    ("how-to-make-a-study-plan-for-exams", "Exam Prep", "Study plan for exams",
     "Six-week exam plan you'll actually follow."),
    ("how-to-make-a-revision-timetable", "GCSE & A-level", "Revision timetable",
     "Plan smart. Revise effectively. Stay in control."),
    ("templates-study-planner", "Template", "Study planner",
     "Open the ready-made study planner in Notespace."),
    ("ai-literature-review-guide", "Research", "AI literature reviews",
     "A practical workflow for researchers in 2026."),
    ("ai-note-taking-app-for-students", "For Students", "AI notes for students",
     "Free, honest picks compared for 2026."),
    ("ai-voice-notes-meeting-transcription", "Voice & Meetings", "AI voice notes",
     "Best transcription apps compared for 2026."),
    ("best-ai-writing-assistants-for-note-takers", "Writing Tools", "AI writing assistants",
     "Top picks for note-takers in 2026."),
    ("best-ai-note-taking-apps-2026", "Comparison", "Best AI note apps",
     "For writers and researchers in 2026."),
    ("best-note-taking-app-2026", "Comparison", "Best note-taking app",
     "7 honest picks compared for 2026."),
    ("best-note-taking-app-for-writers", "For Writers", "Best app for writers",
     "An honest comparison for 2026."),
    ("evernote-alternatives-2026", "Alternatives", "Evernote alternatives",
     "6 honest picks compared in 2026."),
    ("notion-alternatives-2026", "Alternatives", "Notion alternatives",
     "6 honest picks compared in 2026."),
    ("obsidian-alternatives-2026", "Alternatives", "Obsidian alternatives",
     "6 honest picks compared in 2026."),
    ("onenote-alternatives-2026", "Alternatives", "OneNote alternatives",
     "6 honest picks compared in 2026."),
    ("ki-notizen-app", "Vergleich", "KI-Notizen-App",
     "Ehrlicher Vergleich der besten Apps 2026."),
]

TPL = """<!doctype html><html><head><meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Inter:wght@400;600&display=swap" rel="stylesheet" />
<style>
  html,body{{margin:0;padding:0;}}
  body{{width:1200px;height:630px;background:#f6f1e6;font-family:'Inter',sans-serif;color:#0f2a30;position:relative;overflow:hidden;}}
  .rule{{position:absolute;left:96px;top:0;bottom:0;width:2px;background:#d97757;opacity:.7;}}
  .holes{{position:absolute;left:36px;top:90px;display:flex;flex-direction:column;gap:130px;}}
  .hole{{width:18px;height:18px;border-radius:50%;background:#e3dccf;}}
  .pad{{padding:80px 96px 80px 150px;display:flex;flex-direction:column;height:100%;box-sizing:border-box;justify-content:space-between;}}
  .eyebrow{{display:inline-block;background:#d97757;color:#fff;font-weight:600;font-size:20px;letter-spacing:.14em;text-transform:uppercase;padding:8px 22px;}}
  h1{{font-family:'Merriweather',serif;font-weight:900;font-size:96px;line-height:1.02;margin:28px 0 24px;letter-spacing:-.02em;color:#0f3338;}}
  .accent{{height:6px;width:160px;background:#d97757;border-radius:3px;margin-bottom:28px;}}
  p{{font-size:30px;line-height:1.35;color:#3a4f55;max-width:900px;margin:0;}}
  .foot{{display:flex;align-items:center;gap:18px;font-size:22px;color:#0f3338;font-weight:600;letter-spacing:.04em;}}
  .dot{{width:36px;height:36px;border-radius:50%;background:#0f3338;display:inline-flex;align-items:center;justify-content:center;color:#f6f1e6;font-family:'Merriweather',serif;font-weight:900;font-size:20px;}}
</style></head>
<body>
  <div class="rule"></div>
  <div class="holes"><div class="hole"></div><div class="hole"></div><div class="hole"></div><div class="hole"></div></div>
  <div class="pad">
    <div>
      <div class="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <div class="accent"></div>
      <p>{subtitle}</p>
    </div>
    <div class="foot"><span class="dot">N</span> Notespace</div>
  </div>
</body></html>"""

async def main():
    out = Path("public/og")
    out.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1200, "height": 630}, device_scale_factor=1)
        page = await ctx.new_page()
        for slug, eyebrow, title, subtitle in POSTS:
            await page.set_content(TPL.format(eyebrow=eyebrow, title=title, subtitle=subtitle), wait_until="networkidle")
            await page.wait_for_timeout(300)
            await page.screenshot(path=str(out / f"og-{slug}.jpg"), type="jpeg", quality=88,
                                  clip={"x": 0, "y": 0, "width": 1200, "height": 630})
            print("og:", slug)
        await browser.close()

asyncio.run(main())
