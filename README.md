# Verselight

Emotion-based Scripture, reflection, and prayer for the feeling you bring today.

**Live site:** <PASTE YOUR PRODUCTION DOMAIN HERE>

## Features

- Two-step emotion wheel with an accessible simple-picker fallback.
- Dawn verse reveal with Skip and reduced-motion support.
- NLT, KJV, WEB, ASV and BSB, with side-by-side translation comparison.
- Saved verses and collections, a mood journal, streaks and badges.
- Daily WEB passages and downloadable WEB share cards.
- Responsive dark and light themes, plus local JSON Export and Import backups.

## Screenshots

Place the five PNG images directly in [`docs/screenshots/`](docs/screenshots/), using these exact filenames. These are placeholders until images are added.

| View | Image path |
| --- | --- |
| Emotion wheel, dark theme | [wheel-dark.png](docs/screenshots/wheel-dark.png) |
| Dawn verse reveal | [dawn.png](docs/screenshots/dawn.png) |
| Mood journal | [journal.png](docs/screenshots/journal.png) |
| Light theme | [light.png](docs/screenshots/light.png) |
| Mobile layout | [mobile.png](docs/screenshots/mobile.png) |

Use public WEB passages and disposable records for screenshots. Exclude NLT text and personal notes.

## Tech stack

Next.js App Router, React, strict TypeScript, Tailwind CSS, shadcn/ui, Three.js, npm and Vercel.

## Privacy and licensing

Everyone is a guest. Saved references, collections, journal notes and progress stay in the visitor's browser with unencrypted local JSON backups. There are no accounts, analytics or tracking. The translation preference cookie is the sole documented preference exception; hosting requests expose public page URLs and network metadata.

Strictly noncommercial, with no ads, payments, subscriptions, donations or paid features. NLT uses the official server-side Tyndale API with attribution and labeled WEB fallback, without persistent NLT text or NLT artwork. KJV, WEB, ASV and BSB use static public-domain sources, subject to KJV's special UK rights. NIV remains disabled pending licensed access.

See [translation terms](docs/TRANSLATION-LICENSES.md) and the [security audit](docs/SECURITY.md) for evidence and limitations.

## Run locally

Use Node.js 24 and npm:

```sh
npm ci
# Copy .env.example to .env.local and fill in values privately.
npm run dev
```

Open http://localhost:3000. On PowerShell, use `npm.cmd` and `npx.cmd` if script launchers are blocked. Keep `NLT_API_KEY` server-only. Set `NEXT_PUBLIC_SITE_URL` to `<PASTE YOUR PRODUCTION DOMAIN HERE>` as a stable HTTPS origin, then rebuild; do not hardcode the domain in application code. Never commit `.env.local`.

## Project documentation

- [Operations](docs/OPERATIONS.md): setup, checks, backups, NLT resilience, monitoring, Vercel verification and delivery workflow.
- [Product specification](docs/SPEC.md), [architecture](docs/ARCHITECTURE.md) and [design](docs/DESIGN.md).
- [Progress](docs/PROGRESS.md): completed work and optional future steps.
