# Progress

## Checklist
- [x] 1. Setup, home page placeholder, .env.example, first deploy (local setup complete; first Vercel deployment is a manual handoff)
- [ ] 2. Content files, two-step emotion picker, results page
- [ ] 3. Translations, selector, compare view
- [ ] 4. Auth and profiles
- [ ] 5. Saved verses and collections
- [ ] 6. Mood journal and heatmap
- [ ] 7. Streaks, grace day, badges
- [ ] 8. Prompts in the UI, share cards
- [ ] 9. Verse of the day, polish, dark mode
- [ ] 10. Security checks and launch

## Decisions log
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
- Choose the verse text provider and confirm translation availability in Steps 2 and 3.
- Define the user's timezone and weekly grace-day reset boundary in Step 7.
