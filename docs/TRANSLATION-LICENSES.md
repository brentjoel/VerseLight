# Translation terms and setup

Reviewed 2026-10-15 against the official pages below, covering Step 6 daily WEB passages/share cards and Step 7 NLT limits and launch checks. No NLT artwork or persistent licensed-text caching is introduced.

Verselight is a strictly noncommercial personal and portfolio project. No ads, subscriptions, donations, or paid features. Re-check the publisher terms before changing this, display behavior, sharing, or storage.

## NLT

Sources: [official API terms](https://api.nlt.to/), [API documentation](https://api.nlt.to/Documentation), [publisher permissions and copyright notices](https://www.tyndale.com/permissions).

- Anonymous-tier details are recorded only in [SECURITY.md](SECURITY.md#licensing-evidence).
- Registered key: at most 500 verses per request and 5,000 requests per day under the published standard noncommercial terms. Your issued license may set different conditions; review it before use.
- The API pages do not specify a cache TTL, stored-verse allowance, or a separate per-page display limit. Do not infer that these are unrestricted. Verselight makes short, curated passage requests with no persistent response caching or storage.
- Tyndale's separate print/eBook quotation guidelines allow up to 500 verses, no complete book, and no more than 25% of the work. Those are not a substitute for the API's usage conditions.
- Mark each quotation (NLT). Use the publisher's mixed-translation copyright notice. The exact notice, downloaded from the permissions page, is in `data/translation-notices.json` and displayed at `/licenses#nlt`; it is copyright metadata, not verse text.
- The API returns HTML. Only source-delimited verses matching the requested reference/range are parsed. Verse labels and notes are excluded, HTML entities decoded, inline text preserved, and remote HTML is never injected into the app.

## Step 6 daily verse and share cards

Rechecked the [WEB publisher statement](https://ebible.org/engwebp/copyright.htm), [NLT API terms](https://api.nlt.to/) and [Tyndale permissions](https://www.tyndale.com/permissions) on 2026-10-15. WEB explicitly permits copying, distribution and sharing, with its trademark identifying unchanged text. Cards preserve exact local source wording, identify WEB and World English Bible, and credit eBible.org/public domain.

Decision: daily verses and downloadable PNG cards use WEB only. The daily panel labels WEB even when another translation is preferred, and links to comparison for reading in other translations. The existing NLT reading path remains unchanged. Tyndale's artwork guidance calls for a permissions request; API access alone is not treated as permission for downloadable artwork. No issued-key artwork grant has been established in this task, and Verselight's own no-persistent-NLT-text rule also excludes downloadable NLT images. This is a conservative implementation decision, not a claim that all NLT social sharing is prohibited. No NLT text is fetched by the share route or daily panel, or written to image files, storage or backups.

The share route accepts a single canonical curated reference and explicit `translation=web` only. Other translations, extra/duplicate inputs and arbitrary text are rejected. Responses are `no-store`. Browser downloads contain only public WEB Scripture and credits; private records never enter card requests. New translations for image sharing require their own terms review.

## Step 9 DOM reveal

Step 9 review, 2026-10-15: Rechecked the official [NLT API terms](https://api.nlt.to/), [Tyndale permissions](https://www.tyndale.com/permissions) and [WEB copyright statement](https://ebible.org/engwebp/copyright.htm) before adding DOM-only word emphasis. Exact source wording, whitespace, translation tags and existing notices remain intact. Full text is readable from the start. No verse text is drawn into imagery, duplicated into artwork, persisted or newly cached; provider requests and sharing stay unchanged.

## Step 9 presentation redesign

Rechecked the [official NLT API terms](https://api.nlt.to/), [Tyndale permissions](https://www.tyndale.com/permissions) and [WEB copyright statement](https://ebible.org/engwebp/copyright.htm) on 2026-10-15 for the carousel and dialogs. The same source quotations remain selectable DOM text, with the actual translation name and the existing full NLT copyright metadata now visible under each NLT passage. Daily verses and share downloads remain WEB only with their credits and an explicit public-domain text only note. No licensed verse text is drawn into WebGL, added to imagery or persisted; no request, cache, provider or image-route behavior changes.

## NIV

[Biblica's official permissions page](https://www.biblica.com/permissions/) lists a legitimate express-license route for qualifying strictly noncommercial apps without AI/ML features, through [API.Bible](https://api.bible/) or [YouVersion Platform](https://platform.youversion.com/). Royalty-free licensing does not necessarily mean a provider has no usage fees. No NIV provider account, license, or credential has been configured for Verselight. NIV is disabled as Coming soon until that is done. No NIV text is scraped, copied, or stored. The application has no AI features; using a coding assistant to develop it does not add an AI feature to the app.

## Setup and behavior

1. Request an [NLT key](https://api.nlt.to/Account/Register). Review the terms associated with your issued key.
2. Put `NLT_API_KEY` in `.env.local` locally and in hosting environment secrets. `.env.example` lists it without a value. Never use a NEXT_PUBLIC name for this key. Anonymous-tier configuration is documented only in [SECURITY.md](SECURITY.md#nlt-requests-inputs-and-errors).
3. Restart `npm.cmd run dev` after changing key. For hosting, apply the environment variables to the intended environment and rebuild there when ready.
4. New or invalid preferences resolve to NLT; existing valid cookies retain the user's choice. Missing key, timeouts, network errors, 429s, server errors, empty or malformed responses fall back to local WEB with a WEB tag and a note. A compare column retains the requested translation's heading so its fallback is understandable.
5. Requests are server-only, use no-store, have an eight-second timeout, and never log provider errors or credential-bearing URLs. Development HMR response caching is disabled. Licensed verse text is not saved to the repository, database, files, or framework data cache. Only publisher notices are committed.
6. Step 7 per-instance guards bound attempts to 20 per rolling minute and 5,000 keyed per rolling 24 hours. Attempts include failures. 429/503 respect seconds/date Retry-After with upstream cooldowns documented in SECURITY.md. No automatic retry. Counters/cooldowns reset on restart and are not shared between serverless instances or deployments, so account-wide limits are not guaranteed. The owner explicitly accepted best-effort protection without Redis or another service. Provider quotas remain authoritative; failures use labeled WEB. A shared operational store is a future option if traffic grows. No personal identifiers or Scripture are stored by these guards.
7. KJV, WEB, ASV, and BSB stay in the four existing JSON files. `fetch:verses` and `validate:data` operate on those only. KJV's UK rights exception is documented at `/licenses`.

Verify with `npm.cmd run validate:data`, `npm.cmd run test:bible-api`, `npx.cmd tsc --noEmit`, `npm.cmd run lint`, and `npm.cmd run build`. Parser tests use unmistakably labeled synthetic data, not invented Bible wording. Check mobile layout, keyboard controls, and preference persistence by hand.


## Motion polish display review
Rechecked the official [NLT API terms](https://api.nlt.to/), [Tyndale permissions](https://www.tyndale.com/permissions) and [WEB copyright statement](https://ebible.org/engwebp/copyright.htm) on 2026-10-15. All four result passages now receive DOM-only emphasis on every activation, with exact text, whitespace, attribution and immediate selection preserved. NLT remains excluded from artwork, browser records, backups and persistent caches. Restyled share cards retain only existing WEB text and credits with identical input validation/no-store behavior. Social previews contain brand copy only. No translation support, provider request, license scope or storage behavior changes.


## Security audit review (2026-10-17)
Official API, publisher permissions, WEB/ASV/KJV and BSB terms rechecked; exact excerpts and links are in [SECURITY.md](SECURITY.md). Standard NLT quotas and the absence of a published cache TTL are unchanged. NLT still uses no-store and is excluded from storage, backups, imagery and persistent caches, with the full existing mixed-translation notice at every passage. The issued-key agreement still requires owner verification.

The owner requested public image caching for cost control. This supersedes earlier share-route no-store decisions for **successful public WEB cards only**: canonical-reference framework caching plus one-day browser/30-day shared caching and one-day stale-while-revalidate. Invalid/error responses remain no-store; no private fields or NLT enter the cache. Branding-only social images now prerender using cached OFL font bytes. No translation/license scope, Scripture wording or attribution changes.
