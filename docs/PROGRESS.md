# Progress

## Checklist
- [x] 1. Setup, home page placeholder, .env.example, first deploy (local setup complete; first Vercel deployment is a manual handoff)
- [x] 2. Content files, two-step emotion picker, results page
- [ ] 3. Translations, selector, compare view
- [ ] 4. Auth and profiles
- [ ] 5. Saved verses and collections
- [ ] 6. Mood journal and heatmap
- [ ] 7. Streaks, grace day, badges
- [ ] 8. Prompts in the UI, share cards
- [ ] 9. Verse of the day, polish, dark mode
- [ ] 10. Security checks and launch

## Decisions log
- 2026-10-15: Step 2 only. Added the exact 8 broad emotions and 32 specific feelings from SPEC, with 4 distinct references per feeling, 84 unique reference-keyed reflection/prayer prompts, typed lookup helpers, and no verse text or new dependencies. The daily verse remains a placeholder. Step 3 has not started.
- 2026-10-15: Verified every selected book, chapter, verse, and range member against the public-domain KJV OSIS dataset from https://github.com/seven1m/open-bibles/blob/master/eng-kjv.osis.xml, downloaded temporarily outside the repository. No reference is uncertain about existence. Context review recommended: Joshua 1:9 originally addresses Joshua's commission; 1 Samuel 1:27 recounts Hannah's particular answered prayer and is not a guarantee that every request will be granted. The prompts avoid promising specific outcomes. Philippians 4:12-13 retains the contentment context, and 1 Corinthians 10:13 is applied to temptation.
- 2026-10-15: Use local JSON in Server Components with generateStaticParams for all 40 emotion/results routes. With this project's Next.js 16.4 Cache Components configuration, use ensureStatic="navigation" rather than the unsupported dynamicParams setting. Unknown ids and wrong parent/child pairs call notFound and return HTTP 404. Prebuilt content needs no data-fetch loading screen; friendly empty states, missing-prompt fallback, a retry error boundary, and a custom 404 cover unavailable content.
- 2026-10-15: Give each emotion a distinct soft CSS accent in both device themes, keeping shared readable text colors, visible keyboard focus, large touch targets, and reduced-motion support. Reuse the home header/footer across the picker and results. Browser inventory contains no connected browsers, so mobile/theme visual inspection remains manual.
- 2026-10-15: npm run validate:data, npx tsc --noEmit, npm run lint, and npm run build passed. Validation also runs before every production build. Focused negative checks confirm rejection of missing prompts, malformed references, unknown books, reversed ranges, and duplicate references. Local production HTTP checks passed for home, all 8 broad pages and 32 results pages with complete prompts and 4 verse cards each, plus five invalid routes returning 404; the prerender manifest contains all 40 content routes. Try npm.cmd run dev, then choose Anxious > Worried about the future at http://localhost:3000.
- 2026-10-15: User authorized pushing to https://github.com/brentjoel/verselight. Destination is empty; use main as the primary branch and origin as the remote. First Vercel deployment remains pending.
- 2026-10-14: User supplied Git author brentjoel <aguilabrentjoel@gmail.com>; configure this repository only and create the requested Initial setup commit.
- 2026-10-14: Final verification passed: npx tsc --noEmit, npm run lint, npm run build. Confirmed .env.local ignored and .env.example tracked. npm reported vulnerabilities during installation; no audit fix was run. Step 2 remains untouched.
- 2026-10-14: Local page responds HTTP 200 and includes all eight emotions and the daily verse placeholder. No connected browser is available, so mobile and theme visual checks remain manual.
- 2026-10-14: Manual GitHub instructions default to a private repository. README includes exact authentication and create/push commands plus Vercel import instructions.
- 2026-10-14: Dependencies come from the requested Next.js scaffold and shadcn/ui initializer: framework/build/lint packages, shadcn base UI, class utilities, icons, and animation CSS support the requested stack and component foundation. No feature dependencies added.
- 2026-10-14: Step 1 only. Emotion cards are static placeholders and the daily verse is explicitly empty; no Bible text is invented.
- 2026-10-14: Light/dark mode uses the system preference and CSS variables. Manual theme controls remain for Step 9.
- 2026-10-14: Use system fonts to avoid build-time font downloads.
- 2026-10-14: Use npm.cmd/npx.cmd on this Windows machine because PowerShell blocks the script launchers. Node v24.15.0, npm 11.12.1, Git 2.54.0 are available.
- 2026-10-14: GitHub CLI is missing. No workaround, remote push, or deployment is performed; provide manual commands. Vercel first deployment remains a handoff item.

## Open questions
- Choose the verse text provider and confirm translation availability in Step 3.
- Define the user's timezone and weekly grace-day reset boundary in Step 7.
