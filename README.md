# Verselight

An emotion-based Bible verse app. Choose a feeling, read Scripture with a reflection and prayer starter, and compare KJV, WEB, ASV, and BSB. Step 3 adds local verse text and a cookie-based translation preference.

## Run locally
Requires Node.js 20.9 or newer and npm.

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
npx tsc --noEmit
npm run lint
npm run build
```

No environment values are needed yet. `.env.example` documents this; `.env.local` is ignored. Never put secrets in tracked files.

Read [the spec](docs/SPEC.md), [progress](docs/PROGRESS.md), and [rules](AGENTS.md) before changing code. Do not begin Step 4 without instruction.

## Verse data and licensing

`npm run fetch:verses` downloads only references used by `data/emotions.json`, stores each translation under `data/verses/`, and resumes by skipping saved nonempty references. Run it when adding references, then commit the downloaded JSON. Normal builds validate the local data and never contact a Bible service. No API keys or additional dependencies are needed.

KJV, WEB, and ASV are downloaded from [bible-api.com](https://bible-api.com/), sequentially at no more than one request every 2.3 seconds, with retries and Retry-After handling. BSB comes from the publisher's [tab-separated text](https://bereanbible.com/bsb.txt). Every member of a range is verified before joining with a space. Only surrounding layout whitespace is removed; source wording and punctuation are preserved.

Licenses: [KJV](https://ebible.org/eng-kjv/copyright.htm) is public domain outside the UK, where special rights under letters patent apply; [WEB](https://ebible.org/engwebp/copyright.htm) and [ASV 1901](https://ebible.org/asv/copyright.htm) are public domain; [BSB](https://berean.bible/licensing.htm) was dedicated to the public domain on April 30, 2023. World English Bible is an eBible.org trademark. The site footer links to the same credits at `/licenses`.

WEB is the default. The `translation` cookie lasts one year, is validated against four allowed ids, and is read by Server Components for results and compare defaults. The selector reads the cookie in the browser on static pages, so the home and feeling pages can remain static. Step 4 will sync the preference to profiles.

## First deployment
GitHub CLI was not installed during setup. Install it from https://cli.github.com, then run these commands in this folder:

```sh
gh auth login
gh repo create verselight --private --source=. --remote=origin --push
```

If Git reports dubious ownership after sandbox setup, trust only this project directory: `git config --global --add safe.directory C:/Users/BRENT/verselight`.

Push the repository, import it into Vercel, select the Next.js preset, keep default build settings, and deploy. No environment variables are needed for Step 1. This task has not deployed the app.
