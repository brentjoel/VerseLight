# Translation terms and setup

Reviewed 2026-10-15 against the official pages below. This extends Step 3 only.

Verselight is a strictly noncommercial personal and portfolio project. No ads, subscriptions, donations, or paid features. Re-check the publisher terms before changing this, display behavior, sharing, or storage.

## NLT

Sources: [official API terms](https://api.nlt.to/), [API documentation](https://api.nlt.to/Documentation), [publisher permissions and copyright notices](https://www.tyndale.com/permissions).

- Anonymous/TEST: at most 50 verses per request and 500 requests per day.
- Registered key: at most 500 verses per request and 5,000 requests per day under the published standard noncommercial terms. Your issued license may set different conditions; review it before use.
- The API pages do not specify a cache TTL, stored-verse allowance, or a separate per-page display limit. Do not infer that these are unrestricted. Verselight makes short, curated passage requests with no persistent response caching or storage.
- Tyndale's separate print/eBook quotation guidelines allow up to 500 verses, no complete book, and no more than 25% of the work. Those are not a substitute for the API's usage conditions.
- Mark each quotation (NLT). Use the publisher's mixed-translation copyright notice. The exact notice, downloaded from the permissions page, is in `data/translation-notices.json` and displayed at `/licenses#nlt`; it is copyright metadata, not verse text.
- The API returns HTML. Only source-delimited verses matching the requested reference/range are parsed. Verse labels and notes are excluded, HTML entities decoded, inline text preserved, and remote HTML is never injected into the app.

ESV was removed at the user's request. No ESV key is needed.

## NIV

[Biblica's official permissions page](https://www.biblica.com/permissions/) lists a legitimate express-license route for qualifying strictly noncommercial apps without AI/ML features, through [API.Bible](https://api.bible/) or [YouVersion Platform](https://platform.youversion.com/). Royalty-free licensing does not necessarily mean a provider has no usage fees. No NIV provider account, license, or credential has been configured for Verselight. NIV is disabled as Coming soon until that is done. No NIV text is scraped, copied, or stored. The application has no AI features; using a coding assistant to develop it does not add an AI feature to the app.

## Setup and behavior

1. Request an [NLT key](https://api.nlt.to/Account/Register). Review the terms associated with your issued key.
2. Put `NLT_API_KEY` in `.env.local` locally and in hosting environment secrets. `.env.example` lists it without a value. Never use a NEXT_PUBLIC name for this key. `NLT_API_KEY=TEST` explicitly opts into the official anonymous limits for local testing.
3. Restart `npm.cmd run dev` after changing key. For hosting, apply the environment variables to the intended environment and rebuild there when ready.
4. New or invalid preferences resolve to NLT; existing valid cookies retain the user's choice. Missing key, timeouts, network errors, 429s, server errors, empty or malformed responses fall back to local WEB with a WEB tag and a note. A compare column retains the requested translation's heading so its fallback is understandable.
5. Requests are server-only, use no-store, have an eight-second timeout, and never log provider errors or credential-bearing URLs. Development HMR response caching is disabled. Licensed verse text is not saved to the repository, database, files, or framework data cache. Only publisher notices are committed.
6. Per-process timestamp guards enforce published request limits and Retry-After cooldowns; they store no Scripture. They are not a global quota counter across Vercel instances. Providers remain authoritative; quota responses trigger WEB fallback. A shared quota service would require separate infrastructure and is not introduced in Step 3.
7. KJV, WEB, ASV, and BSB stay in the four existing JSON files. `fetch:verses` and `validate:data` operate on those only. KJV's UK rights exception is documented at `/licenses`.

Verify with `npm.cmd run validate:data`, `npm.cmd run test:bible-api`, `npx.cmd tsc --noEmit`, `npm.cmd run lint`, and `npm.cmd run build`. Parser tests use unmistakably labeled synthetic data, not invented Bible wording. Check mobile layout, keyboard controls, and preference persistence by hand.
