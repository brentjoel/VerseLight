# Verselight

An emotion-based Bible verse app. Choose a feeling, read Scripture with a reflection and prayer starter, and compare NLT, KJV, WEB, ASV, and BSB. NLT is the default; NIV is coming soon, pending licensed provider access. Verselight is a strictly noncommercial personal and portfolio project with no ads, subscriptions, donations, or paid features.

## Run locally
Use Node.js 24 and npm, including for the parser tests that import TypeScript directly.

```sh
npm install
npm run dev
```

Open http://localhost:3000, choose Anxious > Worried about the future, and change the header translation dropdown. Use Compare on a verse card to choose two to four translations. The header theme button switches light and dark mode. The daily verse remains a placeholder until Step 6.

On PowerShell with blocked script launchers, use `npm.cmd` and `npx.cmd`.

## Verify
```sh
npm run fetch:verses
npm run validate:data
npm run test:bible-api
npx tsc --noEmit
npm run lint
npm run build
```

NLT uses the official Tyndale API, server-side only. Request a key and set `NLT_API_KEY` in `.env.local` and your hosting environment. `.env.example` lists it without a value. `NLT_API_KEY=TEST` explicitly enables the documented anonymous NLT tier for local testing. A missing key or provider failure shows WEB with a note. Never put secrets in tracked files. Full terms, exact notice locations, quotas, and setup: [translation licensing](docs/TRANSLATION-LICENSES.md).

Read [the spec](docs/SPEC.md), [progress](docs/PROGRESS.md), and [rules](AGENTS.md) before each task. Read [architecture](docs/ARCHITECTURE.md) before structure/data flow changes and [design](docs/DESIGN.md) before UI work. Step 4 is next and remains unstarted. Everyone is a guest; planned saved verses, collections and journal use browser storage with Export and Import, with no server persistence for personal data.

## Verse data and licensing

`npm run fetch:verses` downloads only the public-domain translations for references used by `data/emotions.json`, stores each under `data/verses/`, and resumes by skipping saved nonempty references. Run it when adding references, then commit the downloaded public-domain JSON. Normal builds validate the local data and never contact a Bible service. This downloader needs no API keys or additional dependencies. The runtime NLT HTML parser uses parse5 to extract text safely.

KJV, WEB, and ASV are downloaded from [bible-api.com](https://bible-api.com/), sequentially at no more than one request every 2.3 seconds, with retries and Retry-After handling. BSB comes from the publisher's [tab-separated text](https://bereanbible.com/bsb.txt). Every member of a range is verified before joining with a space. Only surrounding layout whitespace is removed; source wording and punctuation are preserved.

Licenses: [KJV](https://ebible.org/eng-kjv/copyright.htm) is public domain outside the UK, where special rights under letters patent apply; [WEB](https://ebible.org/engwebp/copyright.htm) and [ASV 1901](https://ebible.org/asv/copyright.htm) are public domain; [BSB](https://berean.bible/licensing.htm) was dedicated to the public domain on April 30, 2023. World English Bible is an eBible.org trademark. The site footer links to the same credits at `/licenses`.

NLT is the default; WEB is the fallback. NLT text is requested at runtime without persistent caching or storage. The required publisher notices appear at `/licenses` with per-passage markers and links. NIV stays disabled until a licensed provider is configured. The `translation` cookie lasts one year, is validated against five active ids, and is read by Server Components for results and compare defaults. Existing valid preferences are preserved. The selector reads the cookie in the browser on static pages, so the home and feeling pages can remain static. Step 4 will add typed browser storage and local JSON backups; personal records stay on the device. The existing translation cookie remains the narrow preference exception for server passage rendering.

## Branch previews and merging

For a feature step, create `step-N-short-name`, do only the next unchecked step, meet its acceptance criteria, update progress and run the required checks. Commit small and push the branch. This documentation-only restructure uses `docs-restructure`.

```sh
git push -u origin docs-restructure
```

If the GitHub repository is connected to Vercel with Git previews enabled, open the branch deployment from the Vercel project Deployments tab or its GitHub deployment check. Set the server-only NLT key in the intended hosting environment; WEB fallback works when the key is absent. Preview origins have separate browser storage. The historical setup records do not verify a first live deployment; import the existing GitHub repository into Vercel with the Next.js preset if it is not connected yet.

Open a pull request from `docs-restructure` to `main`, review the diff and preview, and wait for explicit user approval before merging. After approval and passing checks, merge through the pull request. A main-branch merge can trigger production deployment when Vercel is configured for it. Never commit `.env.local` or copy secrets into a pull request.
