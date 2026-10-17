# Verselight

Emotion-based Scripture, reflection, and prayer for the feeling you bring today.

**Live site:** [verselight-app.vercel.app](https://verselight-app.vercel.app)

## Features

- Two-step wheel picker with an accessible simple-picker fallback.
- Dawn reveal on every verse, with Skip and instant reduced-motion reading.
- NLT default with KJV, WEB, ASV and BSB, plus side-by-side Compare.
- Saved verses and collections, mood journal, streaks and badges.
- Daily verse in WEB and downloadable WEB share cards.
- Motion and design polish, responsive layouts, and dark and light themes.
- Privacy-first local storage with validated JSON Export and Import backups.

## Tech stack

Next.js App Router, React, strict TypeScript, Tailwind CSS, shadcn/ui, Three.js/WebGL, npm and Vercel.

## Privacy and licensing

Everyone is a guest. Personal records stay in the browser with unencrypted local backups. No accounts, analytics or tracking. A translation preference cookie is the documented exception; hosting requests expose public page URLs and network metadata.

Strictly noncommercial: no ads, payments, subscriptions, donations or paid features. NLT uses the official server-side Tyndale API with attribution and labeled WEB fallback. NLT text is never persisted in browser records, backups, artwork or framework caches. Other translations use static public-domain sources, subject to KJV's special UK rights. See [translation terms](docs/TRANSLATION-LICENSES.md) and [security](docs/SECURITY.md).

**NOTICE:** Code is [MIT licensed](LICENSE). Scripture text keeps its own licenses and notices: see [/licenses](https://verselight-app.vercel.app/licenses). The code license does not grant rights to Scripture or third-party assets.

## Screenshots

[Capture sizes and instructions](docs/screenshots/README.md).

![Emotion wheel in dark theme](docs/screenshots/wheel-dark.png)
![Dawn verse reveal](docs/screenshots/dawn.png)
![Mood journal](docs/screenshots/journal.png)
![Light theme](docs/screenshots/light.png)
![Mobile layout](docs/screenshots/mobile.png)

## Local setup

Use Node.js 24 and npm:

```sh
npm ci
# Copy .env.example to .env.local and fill in values privately.
npm run dev
```

Open http://localhost:3000. Keep `NLT_API_KEY` server-only. Set `NEXT_PUBLIC_SITE_URL` to `https://verselight-app.vercel.app` for production metadata and About links, then rebuild. Never commit `.env.local`. On PowerShell, use `npm.cmd` and `npx.cmd` if script launchers are blocked.

## Documentation

- [Operations](docs/OPERATIONS.md): setup, checks, NLT resilience, monitoring, Vercel verification and delivery workflow.
- [Specification](docs/SPEC.md), [architecture](docs/ARCHITECTURE.md), [design](docs/DESIGN.md) and [progress](docs/PROGRESS.md).
- [v1.0.0 release notes](docs/RELEASE-NOTES-v1.0.0.md) and [GitHub About text](docs/REPO-ABOUT.md).
