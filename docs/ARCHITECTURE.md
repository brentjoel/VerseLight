# Verselight architecture

This document describes the inspected repository as of 2026-10-15. **DONE** means implemented in this repository. **PLANNED** means a design decision for a later checklist step, not working code. Steps 1 through 3 are complete; this documentation does not start Step 4.

## Overview

**DONE:** Verselight is a strictly noncommercial personal and portfolio app. Guests choose a broad emotion, then a specific feeling, and read four curated passages with reflection questions and prayer starters. They can change translation and compare two to four translations. NLT is the default. There are no ads, subscriptions, donations, or paid features.

```text
DONE
Browser: feeling picker, translation cookie, compare URL
  -> Next.js Server Components
       -> data/emotions.json + data/prompts.json
       -> lib/verse-passage.ts
            -> KJV / WEB / ASV / BSB: local JSON
            -> NLT: official Tyndale API, server-side key
                 -> failure or quota: local WEB + visible note
       -> passage text + actual translation tag + attribution

PLANNED
Email or Google -> Supabase Auth -> cookie session in Next.js
Authenticated event -> Server Action -> validate identity and input
  -> Supabase transaction under caller identity and ownership rules
       -> private user rows, activity ledger, streak totals, badges
```

**PLANNED:** Accounts, saved verses, collections, mood journal, streaks, badges, share cards, and a real verse of the day. The home page's daily verse is currently only a placeholder. Share cards need another license review before including licensed text.

## Folder map

| Status | Path | Responsibility |
| --- | --- | --- |
| DONE | `app/` | App Router pages, root layout, global CSS, error and not-found screens |
| DONE | `app/emotions/[emotion]/` | Broad feeling page and nested results route |
| DONE | `app/compare/`, `app/licenses/` | Comparison route and publisher notices |
| DONE | `components/` | Shared shell, theme and translation controls, notices and attribution |
| DONE | `components/ui/` | shadcn/ui component foundation |
| DONE | `lib/emotions.ts`, `lib/compare.ts` | Typed content lookup and URL validation |
| DONE | `lib/translations.ts` | Central translation metadata, derived ids, default and fallback |
| DONE | `lib/translation-preference.ts` | Server-side cookie reading and validation |
| DONE | `lib/verses.ts`, `lib/verse-passage.ts`, `lib/bible-api.ts` | Static reader, server-only provider entry point, NLT request/parser/quota handling |
| DONE | `data/` | Curated references, prompts, public-domain verse files, publisher notice metadata |
| DONE | `scripts/` | Resumable public-domain downloader, data validator, NLT provider tests |
| DONE | `proxy.ts` | Reject invalid results paths before streaming to preserve HTTP 404 |
| DONE | `public/`, `docs/` | Static assets and project documentation |
| PLANNED | `lib/supabase/` | Separate browser/server clients and session refresh helper |
| PLANNED | `app/auth/` and private account routes | Login, callback, sign-out, and protected views |
| PLANNED | Server Action modules under `app/` | Validated authenticated mutations |
| PLANNED | Pure streak helpers under `lib/` | Calendar and streak calculations without I/O |
| PLANNED | `supabase/migrations/` | Versioned schema, constraints, grants, RLS and transaction functions |

**DONE:** No Supabase SDK, clients, tables, migrations, authentication routes, or database writes exist yet. Planned folder names are proposals, not existing directories.

## Data sources

### Static files and external provider

| Status | Source | Stored content |
| --- | --- | --- |
| DONE | `data/emotions.json` | Eight emotions, 32 specific feelings, four distinct references per feeling |
| DONE | `data/prompts.json` | Reflection question and prayer starter for each of 84 unique references |
| DONE | `data/verses/{kjv,web,asv,bsb}.json` | Exact downloaded text keyed by reference; ranges join source verses with a space |
| DONE | `data/translation-notices.json` | Required publisher copyright metadata, not licensed verse text |
| DONE | Official Tyndale NLT API | Runtime text only, with no persistent licensed-text storage |

**DONE:** KJV, WEB and ASV text is sourced from bible-api.com; BSB comes from BereanBible.com. These are public-domain texts, with special UK rights applying to KJV. `fetch:verses` downloads missing references with retries and polite spacing. `validate:data` rejects missing or empty text in any of the four local translations and runs before builds. Never author or paraphrase Bible text. Full sources and notices are in [translation licensing](TRANSLATION-LICENSES.md) and the site's licenses page.

**DONE:** NIV already appears disabled as Coming soon. It is pending a license and provider setup; there is no NIV text ingestion.

### Supabase tables

Every row in this table is **PLANNED**. These are the product model and proposed additions, not a deployed schema.

| Table | Purpose and important fields or constraints |
| --- | --- |
| `profiles` | Auth user id, display name, preferred translation, IANA timezone defaulting to Asia/Manila, cached current/longest streak and grace state |
| `saved_verses` | Owner, canonical reference, translation id, emotion context and timestamp; store references, not licensed text |
| `collections` | Owner, name and timestamp |
| `collection_verses` | Links to an owned collection and owned saved verse; unique membership pair |
| `mood_entries` | Owner, validated emotion/specific feeling, optional bounded note, timestamp and local date |
| `activity_days` | Owner and local date, activity timezone and real/grace marker; unique owner/local-date pair |
| `badges` | Owner, badge key and award time; unique owner/badge-key pair |

**PLANNED:** `profiles.id` references the Supabase Auth user. Personal rows use ownership foreign keys and appropriate deletion behavior. The activity ledger is authoritative; profile totals are transactionally maintained summaries. Curated emotions, prompts and Bible files remain repository content rather than Supabase tables. There is no planned database cache of NLT text.

## Rendering strategy

| Status | Route | Rendering and reason |
| --- | --- | --- |
| DONE | `/` | Static content from local files; daily verse remains a placeholder |
| DONE | `/emotions/[emotion]` | Eight prebuilt broad-feeling pages using `generateStaticParams` and `ensureStatic = "navigation"` |
| DONE | `/emotions/[emotion]/[sub]` | Known params are generated, with a static shell and request-time content behind Suspense because the cookie selects the translation |
| DONE | `/compare` | Static shell with request-time comparison behind Suspense because search params and the cookie must be validated |
| DONE | `/licenses` | Static publisher credits and copyright metadata |
| DONE | Error/not-found UI | Shared friendly states; the narrow results proxy rejects unknown parent/feeling pairs before streaming |
| PLANNED | Account, saved verses, collections and journal views | Request-time authenticated data with loading, empty and error states; no shared cache of personal rows |

**DONE:** Installed Next.js 16.4 has Cache Components and Partial Prefetching enabled. Results and compare read async cookies inside Suspense. The results page does not require static navigation output. The header reads its cookie in the browser on otherwise static pages, while personalized routes also provide the server preference. Small client components handle translation and theme controls. Theme preference alone uses localStorage; translation preference uses a cookie. Dark and light CSS variables and self-hosted next/font output are implemented.

**PLANNED:** Adding session refresh must preserve public static routes where possible and must not cache authenticated responses across users. The existing proxy is a path validator, not an auth guard.

## Translation flow

**DONE:** `lib/translations.ts` holds the five active choices: NLT, KJV, WEB, ASV and BSB. `TranslationId` derives from its metadata array. The tuple is extensible; there is no separate hardcoded selector list for active choices. Disabled NIV is not an allowed id.

**DONE:** A selector change validates the id, writes the `translation` cookie for one year with path `/` and SameSite=Lax, adds Secure over HTTPS, and refreshes the route. The cookie contains a preference, not authentication. Server reads validate it again; absent or unknown ids resolve to NLT. A valid existing choice remains selected.

**DONE:** Results validate the feeling pair; comparison validates a reference against the local collection, deduplicates translation ids, requires two to four, and allowlists the return path. Default comparison is the preference plus WEB, or BSB when WEB is preferred. Friendly notices handle invalid query values. The server-only passage service returns both text and its actual translation id.

**DONE:** Local translations use JSON. NLT uses `NLT_API_KEY` only on the server and requests the official endpoint with an eight-second timeout, no redirects and `cache: "no-store"`. The parse5 parser checks reference/range metadata, removes labels and notes, decodes entities, and returns source text plus `(NLT)`. Remote HTML is never injected. Only request timestamps and cooldowns are held between requests, not passage text. Development HMR fetch caching is disabled.

**DONE:** Tyndale's published API limits are 50 verses/request and 500 requests/day anonymously, or 500 verses/request and 5,000 requests/day under standard keyed noncommercial terms. The published API pages do not state a cache TTL, stored-verse allowance, or separate page display cap. This app chooses no persistent NLT storage and caps each requested curated range at 50 verses. Retain the quotation marker, publisher link and full notice at `/licenses#nlt`. Review issued-key terms and re-check before changing storage or sharing. Sources: [NLT API terms](https://api.nlt.to/), [documentation](https://api.nlt.to/Documentation), [publisher notices](https://www.tyndale.com/permissions).

**DONE:** Missing keys, timeouts, network/HTTP errors, malformed or empty responses, and quota failures return local WEB with a WEB tag and a small note. A 429 starts a Retry-After cooldown of at least one minute. Per-process daily guards are not global Vercel quota accounting. No provider errors or credential-bearing URLs are logged by the passage service.

**PLANNED:** Sync the validated cookie preference with `profiles.preferred_translation` in Step 4. Adding another provider requires metadata, validation, server dispatch, limits, attribution, fallback and tests, plus an appropriate license. A generic provider adapter registry and shared quota service are not built. Do not refactor them into this documentation task.

## Auth flow

This section is entirely **PLANNED** for Step 4. Use Supabase Auth with email/password and Google, including email confirmation and password recovery. Use separate browser and server clients with the Supabase SSR package and cookie-based sessions. A callback route exchanges a validated authorization code for a session and permits only safe internal return paths.

**PLANNED:** Extend the Next.js proxy with a scoped session refresh helper that propagates refreshed cookies to the request and response. Verify identity using `getClaims()`, or `getUser()` when fresh server-side user state is required. Do not trust the user object from `getSession()` as authorization evidence. Re-check authentication inside every protected route and mutation; a proxy redirect alone is insufficient. Sign-out clears the session through the supported server flow. Source: [Supabase SSR clients and session verification](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs).

**PLANNED:** Guests retain the current public browsing, translation and comparison flow without database permissions. Authenticated users gain private saved verses, collections, journal, activity and badges. Proposed `/saved`, `/collections`, `/journal` and profile pages are protected and do not exist yet. Initial profile creation is idempotent and uses the verified auth id, with validated translation and timezone defaults. Cookie/profile precedence and sign-out behavior must be tested when implemented.

## Write path

This section is entirely **PLANNED**. Server Actions are the application entry point for saving a verse, changing collections, adding mood entries, recording qualifying activity, and synchronizing profile preferences.

**PLANNED:** Each action verifies the session, derives ownership from the caller rather than submitted user ids, validates bounded input, and verifies related row ownership. References, translation ids, emotion pairs, timezone identifiers, collection names and journal notes require validation. Store references and user metadata, not provider text. Return warm field errors and revalidate only affected private views after a committed write.

**PLANNED:** Save/collection/mood actions use the authenticated user's Supabase context and RLS. A narrowly scoped database transaction function makes the eligible write, daily activity insert, streak summary update and badge award atomic. Server Actions alone do not make multiple database requests atomic. The function must verify caller identity, constrain its operations and protect derived fields. Uniqueness constraints and conflict handling make retries safe. Collection edits do not independently qualify as activity under the current product rule.

## Streak logic

Everything here is **PLANNED** for Step 7. Keep calendar and streak decisions in pure functions under `lib/`; pass the timestamp, validated timezone, prior ledger and grace state as inputs. Database I/O and locking remain outside these functions. Tests must cover same-day retries, missing days, week boundaries and timezone transitions.

**PLANNED:** Store a validated IANA timezone in the profile, defaulting to **Asia/Manila**. A day is a calendar date in that timezone, from local midnight to the next local midnight, not an elapsed 24 hours or the server's date. Derive it from a trusted server timestamp. Keep timezone context on activity records; a later timezone change applies prospectively and does not rewrite prior dates.

**PLANNED:** Count authenticated emotion selection or saving a verse. Recording the associated mood entry and saving several verses on the same date count only once. Enforce a unique `(user_id, local_date)` activity row inside the transaction, lock the affected profile/ledger state, and award each badge once. Guests do not accrue a persistent streak. Mood notes and collection edits do not create extra daily counts.

**PLANNED decision:** Use a Monday-through-Sunday local calendar week, with one non-accumulating grace day per week. On the next qualifying activity, exactly one missed date can be bridged if that missed date's week has unused grace. Store an explicit grace ledger marker assigned to the missed date's week, including across a Sunday/Monday boundary. A grace marker preserves continuity but does not increment active-day streak length or badge activity counts. A larger gap, or unavailable grace, starts a new streak. Repeating an action does not consume grace again. Evaluate this on activity rather than using a reminder or scheduled job. Profile grace counters are derived summaries of the ledger.

## Security model

**DONE:** Current reads validate ids/references, comparison return paths are allowlisted, and the NLT key is confined to the server. `.env.local` is ignored. No private database or auth permissions exist yet.

**PLANNED:** Enable RLS on every application table, with explicit least-privilege grants. Guests have no table access. Authenticated policies bind rows to `auth.uid()`; inserts and updates also need ownership checks. Proposed per-table policy outline:

| Table | PLANNED policy |
| --- | --- |
| `profiles` | Owner reads own row and updates allowed display, preference and timezone fields; derived counters protected |
| `saved_verses` | Owner-only reads, inserts, updates and deletes; ownership cannot be reassigned |
| `collections` | Owner-only reads, inserts, updates and deletes |
| `collection_verses` | Both linked collection and saved verse must belong to caller for every allowed operation |
| `mood_entries` | Owner-only reads and validated writes; notes remain private |
| `activity_days` | Owner reads; constrained activity transaction controls writes and dates |
| `badges` | Owner reads; trusted award transaction writes; caller cannot self-award |

**PLANNED:** Ordinary user requests must not use an administrative key that bypasses RLS. Privileged functions require caller checks, narrow grants and a fixed search path. Test cross-user access and ownership changes before each table ships. This is a proposed product policy, not installed SQL. Source: [Supabase grants and RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Environment and deployment

Environment variable names only, with no sample values or secrets:

| Status | Name | Purpose |
| --- | --- | --- |
| DONE | `NLT_API_KEY` | Server-only Tyndale credential in local ignored environment and hosting secrets |
| PLANNED | `NEXT_PUBLIC_SUPABASE_URL` | Supabase client endpoint |
| PLANNED | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public client key, protected by RLS and grants rather than secrecy |
| PLANNED | `SUPABASE_ACCESS_TOKEN` | Operator/CI migration credential, not browser configuration |
| PLANNED | `SUPABASE_DB_PASSWORD` | Operator/CI database credential, not a public runtime variable |

**DONE:** The npm project builds for the Next.js Node runtime, with Vercel as its deployment target. `.env.example` currently documents only the NLT key. GitHub is the source remote. Production Supabase setup and a verified hosting configuration are not established by this document.

**PLANNED:** Create separate Supabase development and production projects, enable email and Google, and configure allowed app origins and callback URLs for local, preview and production environments. Configure Google OAuth credentials in the provider settings, not client code. Configure matching Vercel environment scopes and restrict production callback allowlists. Do not copy local secret files to Git. Sources: [redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls), [Google provider setup](https://supabase.com/docs/guides/auth/social-login/auth-google).

**PLANNED:** Keep schema changes under `supabase/migrations/`. Create migrations with `supabase migration new`, replay them against disposable local development data with `supabase db reset`, and test constraints, grants and RLS. Review migration SQL and generated types before applying reviewed migrations to the intended remote project with `supabase db push`. Apply compatible schema changes before dependent application deployment, back up production data, and plan recovery before destructive migrations. Never treat resetting a production database as a migration workflow. No migration commands run as part of this documentation task. Source: [Supabase migration workflow](https://supabase.com/docs/guides/deployment/database-migrations).

## Key decisions and trade-offs

| Status | Decision and trade-off |
| --- | --- |
| DONE | Strictly noncommercial use; any ads, payments or donations require license review first |
| DONE | NLT default through the official server API; network dependence is handled by labeled local WEB fallback |
| DONE | Four committed public-domain datasets permit offline reads; upstream changes require an explicit fetch and commit |
| DONE | No persistent NLT text cache protects the chosen licensing posture but increases request use |
| DONE | Cookie preference supports correct server rendering; the preference itself is not a session |
| DONE | Central metadata and derived ids keep translation choices extensible without adding unused providers |
| DONE | Public static pages and personalized Suspense regions keep request-time work scoped |
| DONE | Existing disabled NIV choice remains pending a license and provider setup |
| PLANNED | Supabase Auth, private Postgres tables, RLS and authenticated Server Actions, introduced one checklist step at a time |
| PLANNED | Profile timezone default Asia/Manila and local Monday week make streak dates explicit; timezone changes need prospective handling |
| PLANNED | Unique daily ledger and atomic writes prevent duplicate streak increments; profile totals are caches of that ledger |
| PLANNED | One grace day preserves continuity without inventing active days; shared transaction and calendar tests are required |
| PLANNED | Additional providers and licensed share cards require individual terms and implementation review |

**DONE:** Routine verification is `npm.cmd run validate:data`, `npx.cmd tsc --noEmit`, `npm.cmd run lint`, and `npm.cmd run build`. `npm.cmd run test:bible-api` covers the NLT adapter using synthetic test data. **PLANNED:** Auth, transaction, RLS and streak tests accompany their respective implementation steps.
