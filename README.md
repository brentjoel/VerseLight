# Verselight

An emotion-based Bible verse app. Choose a feeling, read Scripture with a reflection and prayer starter, and compare NLT, ESV, KJV, WEB, ASV, and BSB. NLT is the default; NIV is coming soon, pending licensed provider access. Verselight is a strictly noncommercial personal and portfolio project with no ads, subscriptions, donations, or paid features.

## Run locally
Use Node.js 24 and npm, including for the parser tests that import TypeScript directly.

```sh
npm install
npm run dev
```

Open http://localhost:3000, choose Anxious > Worried about the future, and change the header translation dropdown. Use Compare on a verse card to choose two to four translations. The header theme button switches light and dark mode. The daily verse remains a placeholder until Step 9.

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

NLT and ESV use official APIs, server-side only. Request keys and set `NLT_API_KEY` and `ESV_API_KEY` in `.env.local` and your hosting environment. `.env.example` lists them without values. `NLT_API_KEY=TEST` explicitly enables the documented anonymous NLT tier for local testing. Missing keys or provider failures show WEB with a note. Never put secrets in tracked files. Full terms, exact notice locations, quotas, and setup: [translation licensing](docs/TRANSLATION-LICENSES.md).

Read [the spec](docs/SPEC.md), [progress](docs/PROGRESS.md), and [rules](AGENTS.md) before changing code. Do not begin Step 4 without instruction.

## Verse data and licensing

`npm run fetch:verses` downloads only the public-domain translations for references used by `data/emotions.json`, stores each under `data/verses/`, and resumes by skipping saved nonempty references. Run it when adding references, then commit the downloaded public-domain JSON. Normal builds validate the local data and never contact a Bible service. This downloader needs no API keys or additional dependencies. The runtime NLT HTML parser uses parse5 to extract text safely.

KJV, WEB, and ASV are downloaded from [bible-api.com](https://bible-api.com/), sequentially at no more than one request every 2.3 seconds, with retries and Retry-After handling. BSB comes from the publisher's [tab-separated text](https://bereanbible.com/bsb.txt). Every member of a range is verified before joining with a space. Only surrounding layout whitespace is removed; source wording and punctuation are preserved.

Licenses: [KJV](https://ebible.org/eng-kjv/copyright.htm) is public domain outside the UK, where special rights under letters patent apply; [WEB](https://ebible.org/engwebp/copyright.htm) and [ASV 1901](https://ebible.org/asv/copyright.htm) are public domain; [BSB](https://berean.bible/licensing.htm) was dedicated to the public domain on April 30, 2023. World English Bible is an eBible.org trademark. The site footer links to the same credits at `/licenses`.

NLT is the default; WEB is the fallback. NLT and ESV text is requested at runtime without persistent caching or storage. Their required publisher notices appear at `/licenses` with per-passage markers and links. NIV stays disabled until a licensed provider is configured. The `translation` cookie lasts one year, is validated against six active ids, and is read by Server Components for results and compare defaults. Existing valid preferences are preserved. The selector reads the cookie in the browser on static pages, so the home and feeling pages can remain static. Step 4 will sync the preference to profiles.

## First deployment
GitHub CLI was not installed during setup. Install it from https://cli.github.com, then run these commands in this folder:

```sh
gh auth login
gh repo create verselight --private --source=. --remote=origin --push
```

If Git reports dubious ownership after sandbox setup, trust only this project directory: `git config --global --add safe.directory C:/Users/BRENT/verselight`.

Push the repository, import it into Vercel, select the Next.js preset, keep default build settings, and deploy. No environment variables are needed for Step 1. This task has not deployed the app.
