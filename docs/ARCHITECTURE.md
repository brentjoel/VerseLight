# Verselight architecture

Inspected 2026-10-15. **DONE** means present in the repository. **PLANNED** means an unbuilt design. Steps 1 to 6 are merged on main as confirmed by the owner; Step 7 code is implemented on step-7-launch-checks with latest main integrated. Step 7 hosting and preview/accessibility verification remain pending. See [SPEC](SPEC.md), [progress](PROGRESS.md), and [design](DESIGN.md).

## Overview

**Step 8 implemented:** Home passes existing emotion data and the original server-rendered grid into a client WheelPicker. Eligible browsers dynamically load WheelScene/Three.js; labels and controls stay DOM-based. The scene has one instanced bar mesh, capped DPR, hidden-tab pause and explicit GPU cleanup. Reduced motion, low capability, WebGL failure and slow rendering retain the original grid. Inner selection reuses FeelingLink and existing browser-only recordMood behavior; routes and translation rendering stay unchanged. Intensity lives only in component state and scales the decorative waveform, never storage, URLs or requests. No schema/migration change. Step 9 adds a one-use in-memory wheel navigation intent and a client DawnReveal wrapper around server-rendered results. Only the first passage has server-rendered word spans, preserving exact whitespace; the browser animates readable colors without hiding or injecting Scripture. Skip, reduced motion and hidden tabs cancel effects; simple/direct visits are instant. Emotion atmosphere reuses CSS tokens. No provider, storage or 3D changes. Steps 10 and 11 remain planned. See [wheel UI plan](wheel-ui-plan.md).

**DONE decision:** Everyone is a guest and every feature is available without an identity requirement. Verselight is strictly noncommercial, with no ads, payments, subscriptions, donations, or paid features. No server persistence will hold personal data.

```text
DONE
Browser -> static home and two-step feeling picker
        -> translation preference cookie + validated compare URL
        -> Next.js Server Components + Suspense
             -> emotions.json + prompts.json
             -> server-only passage service
                  -> KJV / WEB / ASV / BSB static JSON
                  -> official NLT API with server-only key
                       -> failure/quota: WEB + visible fallback note
             -> source text, actual translation tag, attribution
Browser -> localStorage theme preference -> CSS dark/light variables

DONE
Browser interactions -> typed lib/storage.ts -> versioned localStorage JSON
                        -> saved references, collections, preferences
Browser file APIs <-> validated JSON Export and Import (local only)

DONE Step 5
Browser -> local mood journal, activity ledger -> pure streak/badge calculations
No personal records flow to the Next.js server or any external service.
```

**DONE:** Picker, four verses per feeling, prompts, translation preference, comparison and credits work. **DONE:** Reference-only saved verses, collections, My Verses and local backups. **DONE Step 5:** Journal, heatmap, streaks and badges. **DONE Step 6:** WEB share cards and a real local daily WEB passage, merged into main per owner confirmation. Remaining manual review is tracked in the Step 7 launch checklist.

## Folder map

| Status | Path | Responsibility |
| --- | --- | --- |
| DONE | `app/` | App Router pages, root layout, CSS, error and not-found screens |
| DONE | `app/emotions/[emotion]/` | Broad feelings and nested results |
| DONE | `app/compare/`, `app/licenses/` | Comparison and publisher notices |
| DONE | `components/`, `components/ui/` | Shared shell, theme/translation controls, notices, attribution, shadcn foundation |
| DONE | `lib/emotions.ts`, `lib/compare.ts` | Typed content lookups and URL validation |
| DONE | `lib/translations.ts`, `lib/translation-preference.ts` | Extensible metadata, ids, defaults, validated cookie reading |
| DONE | `lib/verses.ts`, `lib/verse-passage.ts`, `lib/bible-api.ts` | Static reader, server-only dispatcher, NLT parser and request guards |
| DONE | `data/` | Emotions, prompts, public-domain verses and notice metadata |
| DONE | `scripts/` | Public-domain downloader, validator, provider tests |
| DONE | `proxy.ts` | Results path validation before streaming for HTTP 404 |
| DONE | `public/`, `docs/` | Static assets and project documents |
| DONE | `lib/storage.ts`, `lib/storage-schema.ts`, `lib/storage-migrations.ts`, `lib/browser-storage.ts` | Typed browser persistence, strict validation, migration runner, local backups and reactive client bridge |
| DONE | `lib/streaks.ts`, `lib/badges.ts` | Pure calendar, continuity and award functions |
| DONE | `app/my-verses/`, local storage components | Static shell with client-only saved references, collections, backups and recovery |
| DONE | `app/journal/` | Static shell with client-only journal |

## Data sources and rendering

**DONE:** `data/emotions.json` has eight broad emotions, 32 specific feelings, and four references per feeling. `data/prompts.json` covers 84 unique references. `data/verses/{kjv,web,asv,bsb}.json` holds exact public-domain text by reference. KJV, WEB and ASV were downloaded from bible-api.com; BSB from BereanBible.com. KJV has special UK rights. `data/translation-notices.json` holds copyright metadata only. NLT is fetched at runtime. Never invent or paraphrase Bible text. Source terms remain in [translation licensing](TRANSLATION-LICENSES.md).

| Status | Route / behavior | Rendering and reason |
| --- | --- | --- |
| DONE | `/`, `/licenses`, `/about` | Static local content, with client controls |
| DONE | `/emotions/[emotion]` | Eight prebuilt routes, generateStaticParams and ensureStatic="navigation" |
| DONE | `/emotions/[emotion]/[sub]` | Known params generated; static shell, request-time passages inside Suspense because translation uses async cookies |
| DONE | `/compare` | Static shell and request-time comparison inside Suspense for validated search params/cookie |
| DONE | Results path proxy | Rejects unknown parent/feeling pairs before streaming to preserve HTTP 404 |
| DONE | `/my-verses` | Static page shell; client reads browser storage after hydration, with loading/empty/error states |
| DONE | Journal | Static shell and client-only personal history |
| DONE Step 6 | `/share` and daily verse | WEB-only ImageResponse route with strict public inputs; client daily selection from public WEB data, no date or personal data requests |

**DONE:** Next.js 16.4 enables Cache Components and Partial Prefetching. Server Components are the default. Small client controls handle theme and translation. Static pages read the preference cookie in the browser; results and compare use server cookie reads behind Suspense. **DONE:** Personal records are outside server rendering, requests and shared caches. Static data has no artificial loading delay; dynamic passages already show loading notices.

## Translation flow

**DONE:** `lib/translations.ts` supplies five active metadata entries and derived `TranslationId`: NLT, KJV, WEB, ASV, BSB. The existing NIV option is disabled Coming soon and is not a valid active id. Adding a provider requires metadata, validation, dispatch, attribution, fallback behavior, tests and licensed access. **PLANNED:** A generic adapter registry is optional future work, not an existing abstraction.

**DONE:** Selection validates an id, writes `translation` for one year at path `/`, SameSite=Lax and Secure on HTTPS, then refreshes the route. Missing/unknown cookies resolve to NLT; valid choices survive. Results validate emotion/feeling pairs. Compare validates the known reference, deduplicates ids, accepts two to four translations and allowlists the return path. Default comparison uses the preference plus WEB, or BSB when WEB is preferred.

**DONE:** The server-only service reads local JSON for static translations or calls the official Tyndale endpoint using `NLT_API_KEY`. NLT fetches use `cache: "no-store"`, an eight-second timeout and no redirects. Development HMR response caching is disabled. parse5 checks the returned reference and verse range, removes labels/notes, decodes entities and returns source text with `(NLT)`. Remote HTML is never injected. No NLT verse text is persisted to files, framework caches or the repository; runtime text lives only for request/display. Retain per-passage publisher links and the full notice at `/licenses#nlt`.

**DONE Step 7:** The existing server passage path (no standalone NLT HTTP route) caps curated ranges at 50 verses. A per-instance guard admits at most 20 attempts per rolling minute and 500 TEST or 5,000 registered-key attempts per rolling 24 hours. Reservations happen synchronously before the first await, so concurrent calls in one instance cannot overspend that budget. Failed attempts remain counted. It stores bounded timestamps and cooldowns only, never IPs, cookies, references, visitor identifiers or Scripture. HTTP 429 and 503 honor seconds or HTTP-date Retry-After with a 60-second minimum/default; 401/403 pause requests for 24 hours. A later cooldown never shortens an existing one. No upstream retries. Streamed bodies are capped at 200,000 bytes, including when Content-Length is absent or wrong. Fetch/parse errors are replaced with fixed errors without causes or credential-bearing URLs.

**Accepted limitation, owner decision 2026-10-15:** Rate limiting is best effort because serverless instances do not share memory. Every restart, instance and deployment has fresh counters/cooldowns; these limits do not enforce the account-wide quota or guarantee availability under abuse. Provider quotas remain authoritative. No Redis, shared quota service, personal-data service or new dependency is introduced. A shared operational store is a future option if traffic grows. Tests explicitly demonstrate a new instance bypassing an existing instance's cooldown. Missing key, guard rejection, timeout, HTTP/network error, invalid/oversized passage or provider quota failure preserves the actual WEB tag and explicit fallback note. Existing valid translation preference cookies remain unchanged. The owner explicitly accepted this limitation in place of the original deployment-wide Step 7 criterion.

**Caching:** No persistent NLT response caching, request deduplication or licensed-text storage was added. API pages do not specify a safe cache TTL. Existing no-store, disabled HMR fetch caching, per-passage markers and full publisher notices remain. See translation terms and issued-key caveats.

**DONE:** Backups and saved verses contain references and translation ids only, including for NLT. Do not cache licensed text in browser storage or exported JSON. Step 7 strengthens the existing request path with the explicitly accepted per-instance limitation above.

## Client storage design (DONE)

**DONE:** `lib/storage-schema.ts` validates personal data, envelopes and backups. `lib/storage.ts` is a browser-independent store with injected I/O and immutable snapshots. `lib/storage-migrations.ts` runs sequential pure migrations on copies. `lib/browser-storage.ts` supplies the client-only singleton, browser preferences, subscription hook and Web Locks adapter. No storage reads occur during server rendering or module initialization. No new dependencies were added.

**DONE decision:** Use localStorage key `verselight-data`, with `schemaVersion: 1`, increasing `revision`, `updatedAt` ISO timestamp and `data`. A single JSON write replaces a validated envelope. The initial scope is small text/reference records, with no images or verse text. IndexedDB remains unnecessary; reconsider only with measured size/performance evidence. Version 1 is the first released format; no invented legacy migration exists. Unknown future versions and older versions without an explicitly registered migration are rejected while preserving original data. Tests exercise multi-step migration ordering, copy isolation and invalid/missing steps.

**DONE validation:** JSON is parsed as unknown. Exact keys, active translations, known canonical references, valid matching feeling context, UUIDs, ISO instants, unique record ids, reference/translation pairs and collection membership are checked. Reject unsafe prototype-related keys, unexpected fields (including verse text), duplicate or dangling links, files/envelopes over 5 MiB UTF-8 and lists over 10,000 entries. Collection names are trimmed, 1-80 characters. Accepted edits must fit both persisted and exported representations. Step 5 accepts bounded 2,000-character notes, matching feeling ids, valid local dates/ISO instants, unique activity dates and sources, offsets from -840 to 840 minutes matching the recorded date/instant, supported unique badge keys, and paired maximum clock metadata covering the ledger. Reflections must have an emotion activity day. Streak totals and grace dates are rebuilt from the ledger on validation and Import.

**DONE writes and fallback:** The typed methods return success/error results. Each write re-reads and compares the exact stored value before replacement. Cooperating browser tabs use a named Web Lock when the API is available. Storage/focus events detect another tab's writes or clearing and block edits until explicit reload; Export preserves the current tab's view first. Without Web Locks, the stored-value checks are best effort and cannot eliminate a simultaneous check/write race. No server coordination is added.

**DONE:** When reads fail or ordinary writes exceed browser quota, the shared store keeps edits in memory for this tab's session and shows a notice with an Export link. No automatic retry overwrites persisted data. Reload explicitly warns about losing session changes. A persistent Import/reset write failure leaves both visible and persisted records unchanged. Unreadable stored data is blocked rather than erased, with a separate raw recovery download and confirmed fresh start. The raw file is labeled as unvalidated data, not a normal backup.

**DONE Export/Import:** Export creates a local browser download with `format: "verselight-backup"`, `schemaVersion`, `exportedAt` and validated data, never Scripture or keys. Import reads the selected file locally after a file-size check, migrates only supported schemas, validates every record and relationship, previews reference/collection/reflection/activity/badge counts and warns about full replacement. Export of current data is offered before the explicit Replace confirmation. Cancellation, invalid files, stale previews, conflicts and failed persistent writes preserve current records. Memory-only imports carry a session-only warning. Backup files are unencrypted; the UI tells visitors to keep them safe. No upload, remote conversion or automatic download occurs.

### Personal data shapes

**DONE:** Stable browser-generated UUIDs, canonical curated references and active TranslationId values. Saves and collections have ISO device instants. Preferences, saves, collections and the envelope are implemented. **DONE Step 5:** Full MoodEntry, ActivityDay, StreakState and Badge behavior below is implemented. Schema 1 retains the reserved fields and accepts both Step 4 empty progress and the validated Step 5 records. No structural migration is necessary. Streak totals and consumed grace are reconstructed from the activity ledger; historical earned badges are retained. Older clients reject nonempty progress rather than silently discarding it.

| Shape | Fields |
| --- | --- |
| `Preferences` | `theme: "dark" or "light"`, `preferredTranslation: TranslationId` |
| `SavedVerse` | `id`, `reference`, `translationId`, optional `emotionId` and `specificEmotionId` (valid pair), `createdAt` |
| `Collection` | `id`, `name`, `savedVerseIds: string[]` (unique valid saved ids), `createdAt`, `updatedAt` |
| `MoodEntry` | `id`, `emotionId`, `specificEmotionId`, optional `note`, `localDate`, `createdAt` |
| `ActivityDay` | `localDate` (unique), `firstActivityAt`, `utcOffsetMinutes` at recording, `sources: ("emotion" or "save")[]` (unique) |
| `StreakState` | `currentStreak`, `longestStreak`, optional `lastActiveDate`, `graceDates: LocalDate[]`, optional `maxObservedLocalDate` and `maxObservedAt`; derived from activity plus clock-safety metadata |
| `Badge` | `key`, `earnedAt`; one award per supported key |
| `PersonalData` | `preferences`, `savedVerses`, `collections`, `moodEntries`, `activityDays`, `streakState`, `badges` |


**DONE:** Saves deduplicate by `(reference, translationId)`. Removing a saved verse removes collection memberships; collection deletion keeps saves. My Verses stores/displays references only and opens the existing public comparison view on demand, with prefetch disabled. Only public curated reference/translation inputs go to that reading view, never collection names or saved-record ids. The Save button stores the actual displayed translation, including WEB when NLT falls back. Step 5 records save activity and awards milestones. Existing Step 4 saves do not create historical activity.

**DONE preferences:** Adopt the current DOM theme and validated translation cookie on client load; missing/invalid cookies retain the existing NLT default behavior. These reconcile the envelope's in-memory preferences and persist on the next accepted edit. Explicit theme/translation changes also update the envelope when writable. Confirmed Import applies the backup's theme to the DOM and existing `verselight-theme` key, writes the existing preference cookie, notifies the selector and refreshes the public route. The valid cookie remains the runtime server passage source; conflict/blocked stores keep working controls without replacing unreadable or competing records. Theme/cookie values are the only preference mirrors outside the envelope.

## Streak logic (DONE Step 5)

Everything here is **DONE** in Step 5. Keep functions pure in `lib/`; pass device timestamp, local calendar date, offset and existing ledger explicitly. Keep storage I/O outside calculations. There is no trusted server clock or anti-cheat guarantee in a local-only app.

- A day is the device's local calendar date, midnight to next midnight, including DST days. Read local year/month/day, not UTC date and not elapsed 24-hour buckets. Retain the date and offset recorded at the time; later travel does not rewrite history.
- Selecting a specific feeling or saving a verse records activity. Repeated actions and retries on the same date merge sources into one ActivityDay. Collection/note edits do not add days. Record a mood entry for the selection in Step 5; extra note changes do not multiply daily counts.
- One non-accumulating grace day is available per local Monday-through-Sunday week. On the next activity, bridge exactly one missed date only when its week has no consumed grace. Store that date in `graceDates`, assigned to the missed date's week even at a Sunday/Monday boundary. Grace preserves continuity but adds no active day to streak length or badges. Larger gaps or unavailable grace start a new streak. Retry never consumes grace twice.
- Derive current/longest streaks from the activity ledger and validated grace dates, counting active days only. Keep the completed run visible through one pending missed date if grace is available; break it when that allowance is exceeded, and consume grace only upon return. Recompute on load and qualifying activity so the displayed streak does not stay stale indefinitely.
- Compare the supplied clock with persisted max-observed timestamp/date. On a backward timestamp/date, avoid duplicate counts, new grace consumption, badge awards or rewriting previous days; show a warm clock-change notice and resume accrual once time catches up. A large forward jump is evaluated as a real gap, never filled with invented activity. Detectable changes cannot establish true elapsed time; local clock manipulation cannot be fully prevented. Keep prior dates fixed across timezone changes and document this tradeoff.
- Badge keys: `streak-3`, `streak-7`, `streak-30`, `streak-100`, `first-save`, `saved-10`, `first-collection`, `first-mood`. Award once on qualifying evidence, retain earned awards when ordinary content is removed, and validate supported keys and timestamps on Import using the backup rules above.

**DONE tests:** Repeated same-day activity, retries, no activity, one and multiple missed dates, used grace, Monday/Sunday and year/leap-day boundaries, DST, clock rollback/forward, timezone travel, import recomputation and duplicate badge prevention. Streak totals are derived; clock metadata is safety input rather than proof of activity.

## Privacy

**DONE decision:** Never send personal records, notes, backups, activity, streaks or badges to any server. No analytics or tracking is present; ask before adding either. **DONE:** Personal data stays in this browser and origin; no cross-device synchronization. Clearing browser data, private browsing, device loss or eviction can lose it, so explain Export and Import. Backups are unencrypted local files; do not imply device-level secrecy.

**DONE limitation:** The existing translation cookie goes to this site's server to select passages. Requests also expose normal network metadata; NLT requests send a curated passage reference and the server key, never personal records. This is the narrow documented preference exception to the local-only rule. Never put personal data in URLs, cookies, logs, share-image requests or monitoring reports. **DONE Step 6:** Share cards use public WEB reference/translation data; browser download fetches omit cookies and referrers. Private notes and mood history are excluded. Step 7 adds only fixed operational server warnings; analytics or tracking still require approval.

## Daily verse and sharing (Step 6)

Home passes the existing public WEB reference/text map to a small client component. Sorted canonical references form a stable 84-passage cycle indexed by `(localDayOfYear - 1) % 84`, resetting each January 1. The pure helper calculates day of year from device-local calendar parts with UTC arithmetic solely to avoid DST day lengths. Leap day has its own ordinal; no reference is missing on day 366. The cycle repeats within the year, rather than claiming 366 unique passages. Hydration shows a loading message until the local date is available; a timer and focus/visibility events refresh across midnight or travel. Dates and timezone are never sent to a server. WEB is explicitly labeled, with comparison available for other preferred translations. No-JavaScript and missing-content states offer a public reading link.

`GET /share?ref=<canonical reference>&translation=web` rejects unknown references, other translations, extra fields and repeated parameters. It imports WEB only, never the licensed provider or personal store. ImageResponse renders complete exact text, reference, translation and source credit at 1200px width with content-dependent height. The route consumes rendering before responding so errors return a useful 503; invalid requests return 400, unsupported POST returns 405. All responses are no-store. Controls on Home, results and comparison download PNGs via browser object URLs or open the public image in a new tab. Only an explicit click starts an image request. Downloads have timeout, loading, status and retry guidance; object URLs are revoked. This introduces no NLT endpoint, dependencies, analytics or personal data service.

## Environment and deployment

| Status | Environment name | Purpose |
| --- | --- | --- |
| DONE | `NLT_API_KEY` | Server-only official Tyndale credential |
| DONE Step 7 | `NEXT_PUBLIC_SITE_URL` | Validated public build-time origin for About link and metadata; localhost default locally |

**DONE:** `.env.example` lists the name; `.env.local` is ignored. Never commit or print values. Vercel is the Next.js deployment target and GitHub is the source remote. **PLANNED operational check:** Verify actual Vercel preview/production setup and environment scopes; an imported project with Git previews enabled creates a preview after a branch push. Use the branch deployment URL from Vercel or the GitHub deployment check, review it, and wait for explicit approval before merging to main. Branch storage is origin-specific and does not automatically share production records. No server data service is required.

## Key decisions

| Status | Decision |
| --- | --- |
| DONE | Everyone is a guest; all eventual features work without identity gates |
| DONE | Strictly noncommercial; NLT default, WEB fallback, four static translations, existing disabled NIV |
| DONE | Static public shells with dynamic cookie-dependent passages; server key and no persistent NLT text |
| DONE | Preserve current CSS, controls, routes and working features in this documentation change |
| DONE | Typed localStorage layer, schema-1 validation, migration runner and validated local JSON backups in Step 4 |
| DONE | Pure local-date streaks, explicit weekly grace ledger and badge calculations in Step 5 |
| DONE Step 6 | WEB share cards, daily verse and accessibility polish; merged into main per owner |
| DONE Step 7 code | About/privacy, credits, per-instance NLT guards, fixed warnings and launch README |
| Pending launch | Step 7 hosting and preview/accessibility verification |

**DONE workflow:** Typecheck, lint and build are required before completion. Build includes data validation. Provider tests are available as `npm.cmd run test:bible-api`. **DONE:** `npm.cmd run test:storage` covers persistence, collection relationships, import validation, failure preservation, migrations, memory fallback and tab conflicts. **DONE:** `npm.cmd run test:progress` covers calendar/streak behavior, clock/timezone changes, DST, grace exhaustion, notes and progress imports. No new dependencies were added in Step 4. Visual browser review of both themes, responsive layouts and keyboard interaction is a preview handoff because the implementation session has no connected browser.

Step 5 implementation details: `components/feeling-link.tsx` records a reflection during ordinary client navigation to a selected feeling, before navigating to the existing public verse route. Direct visits and modified/new-tab links remain reading actions. The journal edits/removes notes locally and filters a monthly heatmap by recorded dates. Removing a reflection retains activity and awards. `PersonalStore` accepts an injected local clock for deterministic tests, captures it once per transaction, and updates maximum observations at safe writes and minute/focus refreshes through the browser bridge. Backward time blocks new reflections and progress while allowing reference saves and existing-content edits. Recovery notices remain shared. Imported future clock metadata may conservatively pause accrual until the device catches up. No data requests, licensed-text changes or dependencies were added.

## Step 7 operational review

Licensed requests explicitly await Next.js connection() before quota clocks or provider work, excluding them from prerender/prefetch. Warning throttling uses performance.now rather than a wall clock.

The static About page shares complete translation credits with /licenses and explains browser-only records, deletion/eviction, unencrypted backups, origin separation, translation-cookie exception and normal network/hosting exposure. NEXT_PUBLIC_SITE_URL supplies metadataBase, About canonical/OG URL and its site link. It must be an HTTPS origin (HTTP localhost allowed for development); credentials, path, query and fragment are rejected with a fixed error. The owner-supplied URL is in .env.example and README, not hardcoded in app code. Changing it requires a build. No personal metadata is generated.

instrumentation.ts onRequestError accepts no arguments and emits only server_error. The passage fallback emits only nlt_fallback. The logger allows just those codes and emits at most once per code per minute per instance. No error message, stack, digest, request, cookie, URL, user input or personal record is accepted or sent to a monitoring service. No browser error upload, analytics or tracking. These are sampled operational warnings, not accurate traffic counts or durable alerts. Hosting/framework access logs and outgoing-fetch tracing are outside this logger: review retention/access, disable personal/body/cookie capture and credential-bearing fetch tracing by hand. Never log raw provider failures.

README contains the exact pending Vercel checklist. Project verselight, repository brentjoel/verselight and the live URL are owner-reported, not independently verified. The owner requested hosting verification remain pending. Check Git preview wiring, branch/commit, Node/build settings, Preview and Production environment scopes, issued-key terms, domains/stable origin, fallback/credits, safe logs and accessibility before approval. No main merge or production deployment is authorized by this branch.
