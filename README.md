# Verselight

Scripture, reflection, and prayer for the feeling you bring today. Everyone is a guest. Saved references, collections, journal notes, activity, streaks, and badges stay in the browser with local JSON backups. Strictly noncommercial: no ads, payments, subscriptions, donations, or paid features.

Owner-supplied live URL: [Verselight](https://verselight-pf16jt6xm-dev-e4cd.vercel.app/). Vercel project: `verselight`; GitHub: `brentjoel/verselight`. Hosting configuration and deployment health remain **pending manual verification**. Step 6 daily WEB passages, WEB share cards and accessibility polish are merged on main. Step 7 launch verification remains open.

## Local setup

Use Node.js 24 and npm. On PowerShell, use `npm.cmd` / `npx.cmd` if script launchers are blocked.

```sh
npm ci
```

Copy `.env.example` to ignored `.env.local`, then fill in values privately:

| Variable | Purpose |
| --- | --- |
| `NLT_API_KEY` | Server-only Tyndale credential. Missing/invalid key uses labeled WEB fallback. `TEST` explicitly opts into the anonymous tier; do not use it for launch. |
| `NEXT_PUBLIC_SITE_URL` | Public, build-time HTTPS origin used by About and metadata. Set to `https://verselight-pf16jt6xm-dev-e4cd.vercel.app` for the supplied live site, or the stable production origin once assigned. No path, query, fragment, or credentials. Defaults to `http://localhost:3000` when omitted locally. Rebuild after changing it. |

```sh
npm run dev
```

Open http://localhost:3000. Choose Anxious > Worried about the future, change translations, and Compare. Try Save verse, My Verses collections, and Journal notes. The theme button switches dark/light. Home selects a WEB passage by device-local day of year from a repeating curated cycle, independent of the reading translation. Download WEB card or Open card uses public WEB text and credits only. Cards never include notes, saved-record metadata or NLT text. Footer links open About/privacy and full translation credits. Never print or commit `.env.local`.

## Checks

```sh
npm run test:bible-api
npm run test:storage
npm run test:progress
npm run test:daily-share
npx tsc --noEmit
npm run lint
npm run build
```

Build validates curated data offline; it does not request NLT text. `npm run fetch:verses` is only for intentionally updating public-domain reference data, not a build prerequisite. Provider tests use labeled synthetic fixtures and never consume live NLT quota.

## Privacy, deletion, and backups

Export from My Verses regularly. Backups are unencrypted JSON and include private journal notes. Keep them safe; do not attach them to issues or logs. Import reads a file locally, validates it, previews counts, and asks before replacing all records. Export current data first. No upload or sync occurs. Schema 1 accepts the implemented journal/activity/badge records; unknown versions, unexpected fields, invalid relationships and files over 5 MiB are rejected without replacement.

Remove saves/collections in My Verses and reflections in Journal. Reflection deletion retains historical activity and milestones. Clear this site's data in browser settings to erase all records and preferences; delete backups separately. Clearing data, eviction, private browsing, and device loss can remove records. Storage failures keep ordinary edits only in the current tab; Export before leaving. A failed persistent import keeps existing data. Conflicts require explicit reload; unreadable storage offers raw recovery before confirmed reset. Preview, localhost, and production have separate storage. To move records, Export then Import on the destination origin.

The validated one-year translation cookie is the documented preference exception sent to the server. Normal hosting requests expose public page URLs and network metadata; never put personal records in requests, cookies, URLs, or logs. See `/about#privacy` and [architecture](docs/ARCHITECTURE.md).

## NLT resilience and credits

The existing server passage path, not a new standalone HTTP endpoint, uses **best-effort per-instance** limits: 20 upstream attempts per rolling minute, 500 (`TEST`) or 5,000 (registered key) per rolling 24 hours. Attempts reserve quota before fetch, including failures. 429/503 respect numeric or HTTP-date Retry-After with a 60-second minimum/default; 401/403 pause that instance for 24 hours. Cooldowns never shorten. Memory resets on restart; serverless instances/deployments **do not share counters or cooldowns**. This cannot guarantee an account-wide quota or prevent an attacker exhausting availability. Provider limits remain authoritative. A shared operational store is a future option if traffic grows. No Redis or new service is required.

NLT requests use the official server-side API, `no-store`, an eight-second timeout, no redirects, bounded streamed response size, exact passage validation, and labeled WEB fallback. No automatic upstream retries or persistent NLT caching: published API pages do not specify a safe storage TTL. Backups hold references and translation ids, never Scripture text. [Translation terms and setup](docs/TRANSLATION-LICENSES.md) include issued-key caveats.

KJV, WEB, and ASV static data come from [bible-api.com](https://bible-api.com/); BSB from [BereanBible.com](https://bereanbible.com/bsb.txt). KJV has special UK rights. WEB/ASV are public domain; BSB was dedicated to the public domain April 30, 2023. Full source links, NLT notice, and WEB trademark credit appear at `/about#credits` and `/licenses`. NIV stays disabled pending licensed access. Recheck terms before changing usage, display, sharing, caching, or noncommercial status.

## Operational monitoring

Server logs emit only `[verselight] nlt_fallback` and `[verselight] server_error`, at most once per code per minute per instance. The error hook ignores error/request/context arguments; upstream errors are replaced with fixed messages without causes or credential-bearing URLs. Sampled warnings indicate a problem; they are not precise counts, alerts, or durable monitoring. There is no client error upload, analytics, or tracking. Do not add them without approval. Inspect warning codes in Vercel Runtime Logs; do not enable request-body/cookie capture or outgoing fetch tracing that could expose the NLT key. Hosting/framework access logs are outside this logger and require a separate retention/access review.

## Vercel manual launch checklist (pending)

- [ ] In project `verselight`, confirm Git repository `brentjoel/verselight`, production branch `main`, Next.js preset, repository-root directory, Node.js 24, lockfile install, and `npm run build`.
- [ ] Confirm Git previews are enabled and find the `step-7-launch-checks` deployment. Confirm its commit matches this branch. Keep production unchanged until approval.
- [ ] In **both Preview and Production scopes**, confirm server-only `NLT_API_KEY`, the issued-key license, and `NEXT_PUBLIC_SITE_URL` for the intended public origin. Redeploy the preview after environment changes. Never expose the NLT key through a `NEXT_PUBLIC_` name.
- [ ] Check Domains and deployment status: confirm whether the supplied URL is stable or deployment-specific; set the intended production origin in `NEXT_PUBLIC_SITE_URL`. Check HTTPS, About's site link, and its canonical/OG URL after a build. Preview About links intentionally use the configured origin.
- [ ] On the preview, verify NLT text, attribution, cookie persistence, Compare, and WEB. With a deliberately absent/invalid **preview-only** key, verify labeled WEB fallback and fixed warnings; restore it and redeploy. Do not load-test Tyndale or alter the production key. Automated tests cover quota/timeout/Retry-After failures.
- [ ] Review Runtime Logs, access settings and retention. Confirm warning codes contain no cookies, notes, backups, keys or full provider URLs. Leave Analytics, Speed Insights, session replay and external log drains disabled unless separately approved. Confirm fetch tracing does not reveal credential query strings.
- [ ] In narrow/wide layouts and both themes, check the daily WEB passage, WEB card download/open controls, `/about`, `/licenses`, footer links, keyboard focus/skip link, headings, contrast, zoom/wrapping, and reduced motion. Verify Journal and My Verses Export/Import with disposable records; confirm no record/backup requests leave the browser in DevTools Network.
- [ ] Review security/licensing, backup recovery, diff and preview. Obtain user approval before merging to `main`. After an approved merge, verify the production deployment and repeat the read/credits/privacy smoke check. A pushed branch is not proof of hosting verification.

## Delivery workflow

Read [AGENTS.md](AGENTS.md), [spec](docs/SPEC.md), and [progress](docs/PROGRESS.md). Read architecture before data flow changes and design before UI work. This branch integrates the merged Step 6 work into Step 7 at the owner's request; Step 6 is checked and the Step 7 launch checkbox remains open. Commit and push `step-7-launch-checks` for a Vercel Git preview, then wait for approval before merging. No independent production deployment.
