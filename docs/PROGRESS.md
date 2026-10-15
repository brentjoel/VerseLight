# Progress

Steps 1 to 4 are implemented. Step 4 is on `step-4-local-verses` for preview approval before merging. Step 5 has not started. Browser visual/keyboard review remains an explicit preview handoff because no browser is connected to this session.

## Checklist

### [x] 1. Setup and first deploy

**Goal:** Establish the Next.js app, repository and Vercel delivery path.

**Acceptance criteria:** Strict TypeScript, Tailwind and shadcn foundation; initial shell and environment template; ignored local secrets; tsc, lint and build pass; repository pushed and first-deployment handoff documented. Historical records do not verify a live Vercel deployment; confirm hosting during the operational handoff and Step 7 rather than treating this checkbox as proof.

**Files likely touched:** `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `components/ui/`, package/config files, `.env.example`, `.gitignore`, `README.md`.

### [x] 2. Content and two-step emotion picker

**Goal:** Choose one of eight emotions, then one of 32 specific feelings, and see curated references with reflection/prayer prompts.

**Acceptance criteria:** Four distinct references per feeling; 84 unique prompt records; validated parent/child paths; invalid routes return styled 404; responsive cards and shared loading/empty/error treatments as appropriate; no invented verse text; data validation and required checks pass.

**Files likely touched:** `data/emotions.json`, `data/prompts.json`, `lib/emotions.ts`, `app/emotions/`, shared shell and state components, `proxy.ts`, `scripts/validate-data.mjs`.

### [x] 3. Translations, NLT default, compare view

**Goal:** Read the selected translation and compare two to four translations with exact source text and credits.

**Acceptance criteria:** NLT default through official server-only API; validated persistent translation cookie; KJV/WEB/ASV/BSB static files complete; WEB fallback visibly labeled; existing NIV disabled Coming soon; extensible metadata; validated compare inputs/return paths; required attribution; no persistent NLT text; provider tests and required checks pass.

**Files likely touched:** `lib/translations.ts`, `lib/translation-preference.ts`, `lib/verse-passage.ts`, `lib/bible-api.ts`, `lib/verses.ts`, `lib/compare.ts`, translation/attribution components, results/compare/licenses routes, `data/verses/`, notices, scripts, `.env.example`, translation terms.

### [x] 4. Local storage layer, saved verses, collections, My Verses page, Export and Import

**Goal:** Keep saved Scripture references and collections in the browser with portable local backups.

**Acceptance criteria:** Typed localStorage layer with schema version, sequential migrations and safe parsing/validation; bounded input and collection relationships; reference-only saves with no NLT text; My Verses save/remove and collection management; guest access for everyone; existing preference adoption/reconciliation; storage-unavailable memory fallback and clear recovery copy; cross-tab conflict handling; validated local JSON Export and Import, count preview and confirmed replacement; invalid/failed import preserves existing data; loading/empty/error states; meaningful storage/migration/backup tests; design checklist and required checks pass. Establish empty validated shapes for Step 5 without implementing its features.

**Files likely touched:** `lib/storage.ts`, `lib/storage-migrations.ts`, storage tests, `app/my-verses/`, client save/collection/backup components, results UI, docs. All names for unbuilt files are proposals.

### [ ] 5. Mood journal with calendar heatmap, streaks with grace day, badges

**Goal:** Offer private local reflection history and gentle progress milestones.

**Acceptance criteria (PLANNED):** Locally stored mood entries with optional bounded notes; accessible calendar heatmap and useful loading/empty/error states; device-local dates; idempotent daily activity; pure streak/badge functions; one non-accumulating grace day per Monday week assigned to the missed date; no invented activity; clock-change safety and historical date preservation; unique badge awards; backup round trips include all new records; tests cover boundaries, DST, retries, clock and timezone changes, imports and grace exhaustion; design checklist and required checks pass.

**Files likely touched:** `app/journal/`, journal/heatmap/badge components, `lib/streaks.ts`, `lib/badges.ts`, storage schema/migrations and tests, docs.

### [ ] 6. Share cards (ImageResponse), verse of the day, polish, empty and error states, accessibility pass

**Goal:** Complete public sharing and daily inspiration with consistent accessible presentation.

**Acceptance criteria (PLANNED):** ImageResponse cards with validated public inputs and no private records/notes; publisher terms rechecked before any licensed-text image use, no persistent NLT text; required attribution; deterministic daily verse by device-local day of year with leap-year coverage; replace the current placeholder; design checklist on every route; loading/empty/error recovery; mobile/desktop light/dark review; keyboard/focus, labels, contrast and reduced-motion checks; required checks pass.

**Files likely touched:** Public share image route (proposed), `app/page.tsx`, daily verse helper, share controls, shared state components, `app/globals.css` where needed, tests, translation/design docs.

### [ ] 7. Launch checks: privacy note and About page with translation credits, rate limit and quota handling for the NLT route, error monitoring basics, README

**Goal:** Verify licensing, privacy, resilience and hosting before launch.

**Acceptance criteria (PLANNED):** Plain privacy note explains browser-only records, deletion/eviction, backup safety and cookie/network exception; About page includes complete translation credits; existing NLT server passage request path handles abuse, timeout, Retry-After and provider quotas across deployment instances without adding a personal-data service; document and test limits of any process-local guard; preserve labeled WEB fallback; error monitoring excludes personal records, request cookies, secrets and credential-bearing URLs, with no analytics/tracking without approval; environment/deployment and local backup instructions current in README; preview and production configuration verified; security/licensing/accessibility review and required checks pass; user approval before main merge. A standalone NLT HTTP route is not currently built and is not implied by this label.

**Files likely touched:** `app/about/`, privacy copy, `app/licenses/`, `lib/bible-api.ts`, `lib/verse-passage.ts`, provider tests, operational configuration if needed, `README.md`, docs.

## Decisions log

- 2026-10-15: Step 4 verification passed: `npx.cmd tsc --noEmit`, `npm.cmd run lint`, `npm.cmd run build` including content validation (57 generated pages), and all 12 `npm.cmd run test:storage` tests. Production HTTP smoke checks passed home, My Verses, broad feeling, WEB results with save controls, and comparison. The new storage/backup components make no fetch, beacon, upload or logging calls. `.env.local` remains ignored and unread. No browser is connected, so narrow/wide, light/dark, keyboard and file-picker interaction must be reviewed on the preview; no visual verification is claimed.

- 2026-10-15: Step 4 implemented on `step-4-local-verses` with no new dependencies: typed schema-1 localStorage envelope, bounded validation, reference-only saves, collections with rename/delete/membership management, static `/my-verses` shell and browser-only JSON Export/Import. Stored preferences reconcile with the current theme and validated translation cookie. Saves use the actually displayed translation, including WEB on fallback. No Scripture text, personal requests, Step 5 activity, streak or badge awards are stored.
- 2026-10-15: Step 4 safety choices: 5 MiB UTF-8 limit, 10,000 items/list, collection names 1-80 trimmed characters, exact record keys, canonical reference/feeling validation, UUIDs, ISO timestamps, unique saves/memberships and valid links. Version 1 is the first format; the sequential migration runner rejects missing/unknown migrations instead of guessing a legacy format. Reserved Step 5 arrays must be empty and streak totals zero; importing later-step data is explicitly rejected until a compatible implementation ships.
- 2026-10-15: Step 4 storage failures keep ordinary edits in a shared in-memory session with an Export notice. A failed persistent Import/reset preserves both stored and visible data. Unreadable data stays untouched until explicit recovery/reset; raw recovery is a separate download. Import validates a staged copy, previews counts, offers Export first and requires confirmed full replacement; stale previews are rejected. Cross-tab edits use Web Locks where available plus exact stored-value checks; conflicts require explicit reload. Without Web Locks, checks cannot guarantee an atomic simultaneous cross-tab write, a platform limitation rather than a server dependency.
- 2026-10-15: Step 4 try-it path: `npm.cmd run dev`, choose Anxious > Worried about the future, Save verse, open My Verses, create/rename a collection and check membership. Reload to verify persistence, Export, remove a saved verse, then choose the JSON file and confirm replacement to restore it. Use two tabs to see the conflict notice and explicit reload. In browser settings that block storage, use Export before leaving the memory-only session. Backups are local, unencrypted, and origin-specific. No connected browser is available for visual/keyboard testing; complete narrow/wide, both-theme and keyboard review on the Vercel preview before merge approval.

- 2026-10-15: Restructure verification passed: `npx.cmd tsc --noEmit`, `npm.cmd run lint`, and `npm.cmd run build` (including content validation and all 56 generated pages). Final cleanup search found no obsolete provider or identity-system references in tracked app/config/docs; `.env.example` already contains only `NLT_API_KEY`, so no edit was needed. `.env.local` remains ignored and unread. Only documentation and the stale comment changed; no runtime behavior, dependencies or personal-data features changed. New docs contain no em dashes; the generated Next.js instruction block is preserved.

- 2026-10-15: Current product decision supersedes earlier roadmap assumptions: everyone is a guest, all personal data stays in the browser, no server data service. Strictly noncommercial. Existing translation cookie is the documented narrow preference exception. No personal payloads in requests/logs, no analytics or tracking without asking.
- 2026-10-15: Documentation restructure only on `docs-restructure`: recorded exact source design in DESIGN, replaced ARCHITECTURE and SPEC with local shapes, replaced the roadmap with seven steps, updated branch/preview approval workflow, removed obsolete references and one stale code comment. No feature code or dependencies added. Step 4 remains unstarted.
- 2026-10-15: PLANNED Step 4 choices: typed localStorage envelope, schema version 1, pure migrations, validated full-replacement local JSON Import with confirmation, Export first, memory fallback and cross-tab conflict notice. No verse text in personal storage or backups.
- 2026-10-15: PLANNED Step 5 choices: device local date, Monday-through-Sunday weeks, one non-accumulating grace day assigned to the missed date's week, unique activity ledger, pure calculations and conservative backward-clock handling. No streak implementation added.
- 2026-10-15: NLT is the current default through the official server-only provider; WEB is the labeled fallback. Keep existing disabled NIV pending licensed access. No changes to current usage, caching, display or sharing behavior in this branch.

### Earlier implementation records

These records preserve completed work and past handoffs. Current decisions and step numbers above take precedence over older checkpoint status and defaults.

- 2026-10-15: Added parse5 because the official NLT endpoint returns HTML; a real HTML parser safely extracts source verse text and decodes entities without injecting remote markup. Parser fixtures are explicitly labeled synthetic test data, not invented Scripture. The existing KJV/WEB/ASV/BSB files, downloader, and validation stay unchanged. NIV has a legitimate express-license route via API.Bible or YouVersion for qualifying noncommercial apps, but no provider license/access is configured, so it remains disabled as Coming soon. No NIV text was scraped or copied.
- 2026-10-15: Step 3 complete. npm run fetch:verses saved all 84 references in each of KJV, WEB, ASV, and BSB; a second offline run skipped all 336 saved entries. npm run validate:data, npx tsc --noEmit, npm run lint, and npm run build pass. Production HTTP checks passed all 32 results routes in all four translations, exact local text including ranges, default/invalid cookies, comparison defaults for every preference, all-four/repeated/comma-separated selections, back links, invalid references/translations/return URLs, and missing/empty-data rejection. A route-scoped proxy checks parent/feeling pairs before streaming to preserve styled HTTP 404s; home, licenses, and broad feelings still prerender statically. No dependencies added.
- 2026-10-15: Step 3 manual handoff: browser inventory is empty, so visual appearance, keyboard dropdown interaction, cookie persistence across reloads, and mobile comparison stacking still need browser review. Try npm.cmd run dev, open http://localhost:3000, choose Anxious > Worried about the future, change the header translation, reload, then Compare and select two to four translations. The source uses singular Psalm; corrected the initial BSB importer assumption and successfully resumed without replacing saved text. Step 4 remains unchecked and unstarted.
- 2026-10-15: Step 3 sources: KJV, WEB, and ASV from https://bible-api.com/ (free API, at most one request every 2.3 seconds); BSB from the publisher's https://bereanbible.com/bsb.txt. WEB and ASV are public domain per https://ebible.org/engwebp/copyright.htm and https://ebible.org/asv/copyright.htm. BSB was dedicated to the public domain April 30, 2023 per https://berean.bible/licensing.htm. KJV is public domain outside the UK; https://ebible.org/eng-kjv/copyright.htm documents special UK letters-patent rights. No replacement translation or new dependency was needed.
- 2026-10-15: Step 3 uses committed, reference-keyed local JSON only at runtime. The resumable fetch script retries network/HTTP failures, respects Retry-After, saves after each reference, verifies every range member and the API translation/book/chapter/verse, and preserves source words and punctuation. Scripture punctuation takes precedence over the no-em-dash app-copy rule; no source verse text was authored or paraphrased.
- 2026-10-15: Comparison is /compare?ref=...&from=... with optional repeated translations parameters (comma-separated values also work). It defaults to the preferred translation plus WEB, or BSB when WEB is preferred. A native GET form chooses two to four translations; unknown references, unknown translation ids, too few selections, and invalid return paths receive friendly messages. Return paths are allowlisted to existing results routes. Footer credits link to /licenses.
- 2026-10-15: Redesign checks passed: npx tsc --noEmit, npm run lint, npm run build (including content validation), production HTTP checks for home, all 40 emotion/results pages with four complete prompt cards per results page, and three invalid paths returning the styled 404. Data, lookup logic, validation scripts, dependencies, and route paths match the checkpoint. Browser inventory is empty, so rendered appearance and interactive theme switching still need manual browser review. Try npm.cmd run dev, open http://localhost:3000, use the header theme button, then Anxious > Worried about the future. Step 3 was unchecked at this earlier checkpoint.
- 2026-10-15: UI redesign only, after checkpoint commit "Before UI redesign". Dark is the default; a small client theme toggle remembers light/dark locally, with a pre-paint script to prevent a theme flash. Routes, static params, lookups, data files, prompts, and verse placeholders are unchanged. Step 3 had not started at this earlier checkpoint.
- 2026-10-15: Design tokens in app/globals.css: dark background #0B0D10, card #12151A, text #EEEDF2, muted #A2A5AF, lavender #B4ACD5, white 8% borders; light background #F7F7FA, card #FFFFFF, text #272833, muted #666875, lavender #6D5B96. Eight muted emotion accents tint small dots and subtle glows. Geist UI and Lora headings/verse placeholders are self-hosted through next/font. No dependencies added.
- 2026-10-15: Home uses a full-width daily verse placeholder above a 2/4-column emotion grid. Specific feelings use a 1/2-column grid; results use a 700px column with distinct reflection and prayer treatments. Shared empty/error/404 styling, keyboard focus rings, subtle hover/fade effects, and reduced-motion support complete the presentation.
- 2026-10-15: Step 2 only. Added the exact 8 broad emotions and 32 specific feelings from SPEC, with 4 distinct references per feeling, 84 unique reference-keyed reflection/prayer prompts, typed lookup helpers, and no verse text or new dependencies. The daily verse remains a placeholder. Step 3 had not started at this earlier checkpoint.
- 2026-10-15: Verified every selected book, chapter, verse, and range member against the public-domain KJV OSIS dataset from https://github.com/seven1m/open-bibles/blob/master/eng-kjv.osis.xml, downloaded temporarily outside the repository. No reference is uncertain about existence. Context review recommended: Joshua 1:9 originally addresses Joshua's commission; 1 Samuel 1:27 recounts Hannah's particular answered prayer and is not a guarantee that every request will be granted. The prompts avoid promising specific outcomes. Philippians 4:12-13 retains the contentment context, and 1 Corinthians 10:13 is applied to temptation.
- 2026-10-15: Use local JSON in Server Components with generateStaticParams for all 40 emotion/results routes. With this project's Next.js 16.4 Cache Components configuration, use ensureStatic="navigation" rather than the unsupported dynamicParams setting. Unknown ids and wrong parent/child pairs call notFound and return HTTP 404. Prebuilt content needs no data-fetch loading screen; friendly empty states, missing-prompt fallback, a retry error boundary, and a custom 404 cover unavailable content.
- 2026-10-15: Give each emotion a distinct soft CSS accent in both device themes, keeping shared readable text colors, visible keyboard focus, large touch targets, and reduced-motion support. Reuse the home header/footer across the picker and results. Browser inventory contains no connected browsers, so mobile/theme visual inspection remains manual.
- 2026-10-15: npm run validate:data, npx tsc --noEmit, npm run lint, and npm run build passed. Validation also runs before every production build. Focused negative checks confirm rejection of missing prompts, malformed references, unknown books, reversed ranges, and duplicate references. Local production HTTP checks passed for home, all 8 broad pages and 32 results pages with complete prompts and 4 verse cards each, plus five invalid routes returning 404; the prerender manifest contains all 40 content routes. Try npm.cmd run dev, then choose Anxious > Worried about the future at http://localhost:3000.
- 2026-10-15: User authorized pushing to https://github.com/brentjoel/verselight. Destination is empty; use main as the primary branch and origin as the remote. First Vercel deployment remains pending.
- 2026-10-14: User supplied Git author brentjoel <aguilabrentjoel@gmail.com>; configure this repository only and create the requested Initial setup commit.
- 2026-10-14: Final verification passed: npx tsc --noEmit, npm run lint, npm run build. Confirmed .env.local ignored and .env.example tracked. npm reported vulnerabilities during installation; no audit fix was run. Step 2 remains untouched.
- 2026-10-14: Local page responds HTTP 200 and includes all eight emotions and the daily verse placeholder. No connected browser is available, so mobile and theme visual checks remain manual.
- 2026-10-14: Manual GitHub instructions default to a private repository. The original README included repository setup and Vercel import instructions, now replaced by the branch preview workflow.
- 2026-10-14: Dependencies come from the requested Next.js scaffold and shadcn/ui initializer: framework/build/lint packages, shadcn base UI, class utilities, icons, and animation CSS support the requested stack and component foundation. No feature dependencies added.
- 2026-10-14: Step 1 only. Emotion cards are static placeholders and the daily verse is explicitly empty; no Bible text is invented.
- 2026-10-14: Light/dark mode uses the system preference and CSS variables. Manual theme controls remain for the later polish step.
- 2026-10-14: Use system fonts to avoid build-time font downloads.
- 2026-10-14: Use npm.cmd/npx.cmd on this Windows machine because PowerShell blocks the script launchers. Node v24.15.0, npm 11.12.1, Git 2.54.0 are available.
- 2026-10-14: GitHub CLI is missing. No workaround, remote push, or deployment is performed; provide manual commands. Vercel first deployment remains a handoff item.

## Open questions

- Confirm the Vercel Git integration, first deployment status and branch preview URL; earlier implementation records only establish the deployment handoff.
- Complete visual browser review of narrow/wide layouts, both themes, keyboard controls, cookie persistence and Step 4 save/collection/JSON file-picker interactions. Earlier records report no connected browser.
- Before Step 6 licensed-text share cards, re-check current publisher and issued-key terms.
- Resolve deployment-wide NLT abuse/quota handling in Step 7 without personal-data storage or tracking; current timestamp guards are process-local only.
