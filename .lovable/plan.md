
# UK + AU SEO Ranking Plan

Goal: rank Notebook Archive on page 1 in UK and AU for keywords we can realistically win in 3-6 months. Source: Semrush, June 2026.

## The opportunity (why these markets)

UK and AU difficulty scores are much lower than US for the same intent. The single biggest find: **`study planner` (UK)** has KDI 16 — "easy" territory — and we already ship a Study Planner feature. We're leaving a free 1,600/mo on the table.

## The keyword targets (validated)

### UK - primary cluster (tool intent, we have the product)

| Keyword | Volume/mo | KDI | Notes |
|---|---|---|---|
| study planner | 1,600 | 16 | Easiest win. Direct product match. |
| revision timetable | 5,400 | 27 | Highest-value page on this list. |
| revision timetable template | 2,900 | ~30 | Downloadable template = link bait. |
| revision timetable maker | 1,300 | ~30 | "Maker" = tool intent, matches our app. |
| revision timetable generator | 720 | ~30 | Same intent as "maker". |
| a level revision | 480 | 26 | Easy. Pillar for A-level content. |
| gcse revision | 1,900 | 31 | Pillar for GCSE content. |
| how to make a revision timetable | 480 | low | Top question - hook for the pillar. |
| gcse revision timetable | 1,300 | medium | Pillar sub-page. |
| a level revision timetable | 390 | 29 | Pillar sub-page. |

**Cluster total: ~16,000 searches/mo, weighted KDI ~26.**

### AU - secondary cluster (easier but smaller)

| Keyword | Volume/mo | KDI | Notes |
|---|---|---|---|
| vce notes | 170 | 17 | Very easy. |
| hsc study notes | 90 | 11 | Very easy. |
| hsc notes | 480 | low | Pair with hsc study notes. |
| atar notes (brand) | 12,100 | 50 | Skip - dominated by atarnotes.com. |

**AU is a "land grab on small terms" play - cheap to win, won't move the needle alone.**

## What we ship

### 1. New tool landing page: `/study-planner` (UK-targeted, also serves AU/US)

A real page about the Study Planner feature - currently it's just a feature inside the app. Public-indexable.

- H1: "Study Planner - Build a Revision Timetable That Actually Works"
- Targets: `study planner`, `revision planner`, `study timetable`
- 3-section structure: how it works, screenshots of the in-app planner, CTA to sign up
- FAQPage JSON-LD answering 4-5 question keywords
- Internal links from /features, /pricing, /use-cases/students

### 2. New tool landing page: `/revision-timetable`

The highest-volume single keyword on the list (5,400/mo).

- H1: "Revision Timetable Maker - Build Yours in Minutes"
- Targets: `revision timetable`, `revision timetable maker`, `revision timetable generator`, `revision timetable creator`
- Includes an embedded "starter timetable" template users can copy into the app with one click
- Sub-sections for GCSE and A-Level variants (captures `gcse revision timetable` and `a level revision timetable`)
- HowTo JSON-LD for "how to make a revision timetable"

### 3. New downloadable template page: `/templates/revision-timetable-template`

Targets `revision timetable template` (2,900/mo). Template-download pages earn backlinks naturally.

- Free downloadable PDF + one-click "Open in Notebook Archive" button
- Three variants: weekly, fortnightly, exam-week intensive
- Slots into the existing /templates gallery

### 4. New blog pillar: `/blog/gcse-revision-guide-2026`

Targets `gcse revision` (1,900/mo, KDI 31) and the 12+ "how to revise for [subject] gcse" question keywords (~3,000/mo combined).

- 2,500-3,000 words, subject-by-subject breakdown
- Internal links into /revision-timetable and /study-planner
- Article + FAQPage JSON-LD

### 5. New blog pillar: `/blog/a-level-revision-guide-2026`

Targets `a level revision` (480/mo, KDI 26) and "how to revise [subject] a level" cluster (~2,000/mo combined).

Same structure as #4.

### 6. AU page: `/blog/hsc-vce-study-notes-guide`

Single combined page for AU - captures `hsc notes`, `hsc study notes`, `vce notes`. Low volume, very low KDI, cheap to write.

## Technical SEO changes

- **hreflang tags** added to all 6 new pages: `en-GB`, `en-AU`, `en-US`, `x-default`. Already have the helper from earlier work - apply it.
- **Sitemap**: regenerate via `scripts/generate-sitemap.ts` to include new routes.
- **Canonical**: each page self-canonicals (single URL, no /uk/ prefix - hreflang handles locale).
- **Internal links**: add a "For students" group in the Footer linking to /study-planner, /revision-timetable, the two pillar guides, and /templates.
- **Structured data**: `SoftwareApplication` schema on /study-planner and /revision-timetable; `HowTo` + `FAQPage` on the pillar guides.
- **OG images**: typography-only cards via the existing `scripts/generate-og-images.py` script.

## Why this will actually rank (vs hoping)

1. **KDI is honest about how hard.** Every target is ≤31. We're not picking fights with Quizlet or BBC Bitesize.
2. **Tool-intent matches the product.** "revision timetable maker" wants a tool - we are a tool. Google rewards the match.
3. **The pillar guides feed the tool pages internal-link equity.** Standard hub-and-spoke setup.
4. **Template downloads earn backlinks.** Teachers and revision blogs link to free downloadable PDFs.

## What I'd skip (and why)

- **atar notes (AU, 12,100/mo)** - KDI 50 and the SERP is owned by the atarnotes.com brand. Branded queries don't move.
- **gcse pod / past papers cluster** - high volume but informational, not tool-intent. We'd never convert.
- **/uk/ or /au/ URL prefixes** - hreflang is the right tool. URL splits dilute link equity.

## Files to create

```text
src/pages/StudyPlanner.tsx                                    (route /study-planner)
src/pages/RevisionTimetable.tsx                               (route /revision-timetable)
src/pages/TemplateRevisionTimetable.tsx                       (route /templates/revision-timetable-template)
src/pages/BlogGCSERevisionGuide.tsx                           (route /blog/gcse-revision-guide-2026)
src/pages/BlogALevelRevisionGuide.tsx                         (route /blog/a-level-revision-guide-2026)
src/pages/BlogHSCVCEStudyNotes.tsx                            (route /blog/hsc-vce-study-notes-guide)
src/assets/og/og-study-planner.jpg                            (+ 5 more OG cards)
```

## Files to edit

```text
src/App.tsx                          add 6 routes (lazy-loaded)
src/components/Footer.tsx            add "For students" link group
scripts/site-routes.ts               add 6 routes for sitemap
public/robots.txt                    no changes (all new routes are indexable)
src/pages/BlogIndex.tsx              add 3 new blog posts to the list
src/pages/TemplatesGallery.tsx       add revision timetable template card
```

## Realistic timeline

- Pages shipped: week 1
- Indexed and crawled: 2-4 weeks
- Position visible in Search Console: 4-8 weeks
- Page 1 for the easy ones (study planner, vce notes, hsc study notes): 6-10 weeks
- Page 1 for revision timetable (5,400/mo): 3-6 months, needs 5-10 backlinks

After shipping, I'll register the new pages with Search Console and ask you to submit them for indexing.
