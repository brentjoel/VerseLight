# Verselight architecture

Inspected 2026-10-15. **DONE** means present in the repository. **PLANNED** means an unbuilt design, even when its shape is specified below. Steps 1 to 3 are complete. Step 4 has not started. See [SPEC](SPEC.md), [progress](PROGRESS.md), and [design](DESIGN.md).

## Overview

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

PLANNED
Browser interactions -> typed lib/storage.ts -> versioned localStorage JSON
                        -> saved verses, collections, mood journal
                        -> activity ledger -> pure streak/badge calculations
                        -> preferences
Browser file APIs <-> validated JSON Export and Import (local only)
No personal records flow to the Next.js server or any external service.
```

**DONE:** Picker, four verses per feeling, prompts, translation preference, comparison and credits work. **PLANNED:** Saved verses, collections, My Verses, backups, journal, heatmap, streaks, badges, share cards and a real verse of the day. The daily verse panel is currently a placeholder.

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
| PLANNED | `lib/storage.ts`, `lib/storage-migrations.ts` | Typed browser persistence, validation, migrations and backups |
| PLANNED | `lib/streaks.ts`, `lib/badges.ts` | Pure calendar, continuity and award functions |
| PLANNED | `app/my-verses/`, `app/journal/` | Static shells with client-only personal data views |

## Data sources and rendering

**DONE:** `data/emotions.json` has eight broad emotions, 32 specific feelings, and four references per feeling. `data/prompts.json` covers 84 unique references. `data/verses/{kjv,web,asv,bsb}.json` holds exact public-domain text by reference. KJV, WEB and ASV were downloaded from bible-api.com; BSB from BereanBible.com. KJV has special UK rights. `data/translation-notices.json` holds copyright metadata only. NLT is fetched at runtime. Never invent or paraphrase Bible text. Source terms remain in [translation licensing](TRANSLATION-LICENSES.md).

| Status | Route / behavior | Rendering and reason |
| --- | --- | --- |
| DONE | `/`, `/licenses` | Static local content, with client controls |
| DONE | `/emotions/[emotion]` | Eight prebuilt routes, generateStaticParams and ensureStatic="navigation" |
| DONE | `/emotions/[emotion]/[sub]` | Known params generated; static shell, request-time passages inside Suspense because translation uses async cookies |
| DONE | `/compare` | Static shell and request-time comparison inside Suspense for validated search params/cookie |
| DONE | Results path proxy | Rejects unknown parent/feeling pairs before streaming to preserve HTTP 404 |
| PLANNED | My Verses and journal | Static page shell; client reads browser storage after hydration, with loading/empty/error states |
| PLANNED | Share image route and daily verse | Public reference/translation inputs only, license review before including NLT; personal records never posted |

**DONE:** Next.js 16.4 enables Cache Components and Partial Prefetching. Server Components are the default. Small client controls handle theme and translation. Static pages read the preference cookie in the browser; results and compare use server cookie reads behind Suspense. No personal records currently exist. **PLANNED:** Keep future personal content outside server rendering, requests and shared caches. Static data has no artificial loading delay; dynamic passages already show loading notices.

## Translation flow

**DONE:** `lib/translations.ts` supplies five active metadata entries and derived `TranslationId`: NLT, KJV, WEB, ASV, BSB. The existing NIV option is disabled Coming soon and is not a valid active id. Adding a provider requires metadata, validation, dispatch, attribution, fallback behavior, tests and licensed access. **PLANNED:** A generic adapter registry is optional future work, not an existing abstraction.

**DONE:** Selection validates an id, writes `translation` for one year at path `/`, SameSite=Lax and Secure on HTTPS, then refreshes the route. Missing/unknown cookies resolve to NLT; valid choices survive. Results validate emotion/feeling pairs. Compare validates the known reference, deduplicates ids, accepts two to four translations and allowlists the return path. Default comparison uses the preference plus WEB, or BSB when WEB is preferred.

**DONE:** The server-only service reads local JSON for static translations or calls the official Tyndale endpoint using `NLT_API_KEY`. NLT fetches use `cache: "no-store"`, an eight-second timeout and no redirects. Development HMR response caching is disabled. parse5 checks the returned reference and verse range, removes labels/notes, decodes entities and returns source text with `(NLT)`. Remote HTML is never injected. No NLT verse text is persisted to files, framework caches or the repository; runtime text lives only for request/display. Retain per-passage publisher links and the full notice at `/licenses#nlt`.

**DONE:** The implementation caps curated ranges at 50 verses. Its rolling per-process request timestamp guard permits 500 requests for TEST or 5,000 for a key per 24 hours. It stores timestamps/cooldowns only. HTTP 429 applies Retry-After with at least a minute of cooldown. These are implementation guards, not global Vercel accounting. Missing key, timeout, HTTP/network error, malformed/empty passage, or quota failure returns WEB with an actual WEB tag and visible note. The service avoids logging errors and key-bearing URLs. Full publisher terms and issued-key caveats are in the licensing document; re-check them before changing display, caching, storage or sharing.

**PLANNED:** Backups and saved verses contain references and translation ids only, including for NLT. Do not cache licensed text in browser storage or exported JSON. Step 7 strengthens route abuse/quota handling without personal data collection or a server database.

## Client storage design (PLANNED)

Everything in this section is **PLANNED** except the explicitly noted existing theme/cookie behavior.

**PLANNED decision:** Use localStorage behind a small typed client-only layer in `lib/`. Current personal records are small text and references; a single JSON envelope keeps related edits together without a dependency. Do not store verse text or images. IndexedDB is unnecessary for the initial scope; reconsider only with measured size/performance evidence. Do not access storage during server rendering or module initialization.

**PLANNED envelope:** Key `verselight-data`, `schemaVersion: 1`, monotonically increasing `revision`, `updatedAt` ISO timestamp, and `data` holding the shapes below. Future schema versions run sequential pure migrations on a copy, then validate the entire result before writing. Reject unknown future versions and preserve the original if parsing/migration fails. Keep an explicit migration path from each supported version and test invalid/old versions.

**PLANNED typed API:** Load, subscribe, mutate, export and import return typed success/error outcomes. Parse JSON into `unknown`, validate enums, canonical references, emotion/feeling relationships, unique ids, valid local dates/ISO timestamps, bounded strings and cross-record collection membership before exposing records. Reject unexpected properties, prototype-related keys, duplicate records and dangling links. Proposed initial limits: 5 MiB file/envelope, 10,000 records per list, collection names 1-80 trimmed characters, notes at most 2,000 characters. Check before parsing and before writes; actual browser quota may be lower. All limits are PLANNED choices to verify in Step 4.

**PLANNED writes:** Construct and validate a complete next envelope, serialize once and replace the key with one setItem. Catch unavailable storage, quota and serialization failures. Re-read revision before edits, subscribe to storage events across tabs and ask the visitor to reload on conflicting edits rather than silently overwrite. localStorage is not a multi-tab transaction system. Keep a shared in-memory state when persistence fails; explain that changes last only this session and offer Export. Never silently erase corrupted stored data; show recovery/reset choices and allow a raw local recovery download clearly distinguished from a validated backup.

**PLANNED Export:** Browser-generated JSON file with `format: "verselight-backup"`, `schemaVersion`, `exportedAt` and validated data. Include preferences and all personal records, exclude keys and verse text. No upload, remote conversion, or automatic download. Warn that the file includes private notes and should be kept safely.

**PLANNED Import:** Read the chosen file locally with a size limit, validate format/version, migrate supported older schemas, validate every field and relationship, and preview counts before confirmation. Version 1 uses full replacement, not merge, to keep relationships and streak ledgers predictable. Offer Export of current data first. Validate a staged copy before replacing anything; cancel, invalid files and failed persistence leave existing persisted data intact. Recompute streaks and streak-badge eligibility from the imported activity ledger. Validate content-badge keys and award timestamps structurally; retained content milestones may outlive deleted saves or collections, so current records cannot prove their history. Local backups are not tamper-proof. An unavailable-storage session can import into memory with an explicit persistence warning.

### Personal data shapes (PLANNED)

All ids are browser-generated stable UUID strings. References must exist in curated content; translations must be active `TranslationId` values. ISO timestamps are device instants; `LocalDate` is a validated `YYYY-MM-DD` calendar date derived using the device's local date, never UTC slicing.

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

**PLANNED:** Deduplicate saved verses by `(reference, translationId)`; removing a saved verse removes its collection memberships. Collection deletion leaves saved verses intact. Activity records do not disappear when a verse is removed. Store no user identifier and no verse text. Mood notes remain optional. Step 4 adds the envelope and backup validation for all shapes; later-step lists stay empty until their features are built.

**DONE:** Theme currently uses `verselight-theme`; translation uses the validated cookie. **PLANNED:** Adopt the existing theme value and valid cookie preference on first local envelope creation. On explicit preference changes or confirmed Import, update the existing theme key/DOM and translation cookie so controls remain consistent. Treat the cookie as the runtime translation source for existing server passage rendering. When an existing valid cookie differs from the envelope, reconcile the envelope to it; never silently reset it to the default.

## Streak logic (PLANNED)

Everything here is **PLANNED** for Step 5. Keep functions pure in `lib/`; pass device timestamp, local calendar date, offset and existing ledger explicitly. Keep storage I/O outside calculations. There is no trusted server clock or anti-cheat guarantee in a local-only app.

- A day is the device's local calendar date, midnight to next midnight, including DST days. Read local year/month/day, not UTC date and not elapsed 24-hour buckets. Retain the date and offset recorded at the time; later travel does not rewrite history.
- Selecting a specific feeling or saving a verse records activity. Repeated actions and retries on the same date merge sources into one ActivityDay. Collection/note edits do not add days. Record a mood entry for the selection in Step 5; extra note changes do not multiply daily counts.
- One non-accumulating grace day is available per local Monday-through-Sunday week. On the next activity, bridge exactly one missed date only when its week has no consumed grace. Store that date in `graceDates`, assigned to the missed date's week even at a Sunday/Monday boundary. Grace preserves continuity but adds no active day to streak length or badges. Larger gaps or unavailable grace start a new streak. Retry never consumes grace twice.
- Derive current/longest streaks from the activity ledger and validated grace dates, counting active days only. Keep the completed run visible through one pending missed date if grace is available; break it when that allowance is exceeded, and consume grace only upon return. Recompute on load and qualifying activity so the displayed streak does not stay stale indefinitely.
- Compare the supplied clock with persisted max-observed timestamp/date. On a backward timestamp/date, avoid duplicate counts, new grace consumption, badge awards or rewriting previous days; show a warm clock-change notice and resume accrual once time catches up. A large forward jump is evaluated as a real gap, never filled with invented activity. Detectable changes cannot establish true elapsed time; local clock manipulation cannot be fully prevented. Keep prior dates fixed across timezone changes and document this tradeoff.
- Badge keys: `streak-3`, `streak-7`, `streak-30`, `streak-100`, `first-save`, `saved-10`, `first-collection`, `first-mood`. Award once on qualifying evidence, retain earned awards when ordinary content is removed, and validate supported keys and timestamps on Import using the backup rules above.

**PLANNED tests:** Repeated same-day activity, retries, no activity, one and multiple missed dates, used grace, Monday/Sunday and year/leap-day boundaries, DST, clock rollback/forward, timezone travel, import recomputation and duplicate badge prevention. Streak totals are derived; clock metadata is safety input rather than proof of activity.

## Privacy

**DONE decision:** Never send personal records, notes, backups, activity, streaks or badges to any server. No analytics or tracking is present; ask before adding either. **PLANNED:** Personal data stays in this browser and origin; no cross-device synchronization. Clearing browser data, private browsing, device loss or eviction can lose it, so explain Export and Import. Backups are unencrypted local files; do not imply device-level secrecy.

**DONE limitation:** The existing translation cookie goes to this site's server to select passages. Requests also expose normal network metadata; NLT requests send a curated passage reference and the server key, never personal records. This is the narrow documented preference exception to the local-only rule. Never put personal data in URLs, cookies, logs, share-image requests or monitoring reports. **PLANNED:** A share card can use public reference/translation data, with download/share happening in the browser; exclude private notes and mood history. Step 7's error monitoring must avoid personal payloads and tracking and require approval if adding analytics/tracking.

## Environment and deployment

| Status | Environment name | Purpose |
| --- | --- | --- |
| DONE | `NLT_API_KEY` | Server-only official Tyndale credential |

**DONE:** `.env.example` lists the name; `.env.local` is ignored. Never commit or print values. Vercel is the Next.js deployment target and GitHub is the source remote. **PLANNED operational check:** Verify actual Vercel preview/production setup and environment scopes; an imported project with Git previews enabled creates a preview after a branch push. Use the branch deployment URL from Vercel or the GitHub deployment check, review it, and wait for explicit approval before merging to main. Branch storage is origin-specific and does not automatically share production records. No server data service is required.

## Key decisions

| Status | Decision |
| --- | --- |
| DONE | Everyone is a guest; all eventual features work without identity gates |
| DONE | Strictly noncommercial; NLT default, WEB fallback, four static translations, existing disabled NIV |
| DONE | Static public shells with dynamic cookie-dependent passages; server key and no persistent NLT text |
| DONE | Preserve current CSS, controls, routes and working features in this documentation change |
| PLANNED | Small typed localStorage layer, versioned migrations and validated local JSON backups in Step 4 |
| PLANNED | Pure local-date streaks, explicit weekly grace ledger and badge calculations in Step 5 |
| PLANNED | Share cards, daily verse, polish in Step 6; launch privacy, quota and operational checks in Step 7 |

**DONE workflow:** Typecheck, lint and build are required before completion. Build includes data validation. Provider tests are available as `npm.cmd run test:bible-api`. **PLANNED:** Meaningful storage/migration/backup tests in Step 4 and calendar/streak tests in Step 5 accompany implementation. No new dependencies or feature code are introduced here.
