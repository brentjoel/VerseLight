# Verselight

An emotion-based Bible verse app. Step 1 only: responsive placeholder home, eight emotion cards, empty daily verse card, and system light/dark styling.

## Run locally
Requires Node.js 20.9 or newer and npm.

```sh
npm install
npm run dev
```

Open http://localhost:3000. Resize to check the mobile grid and change the operating system color preference for dark mode. Emotion cards are static placeholders.

On PowerShell with blocked script launchers, use `npm.cmd` and `npx.cmd`.

## Verify
```sh
npx tsc --noEmit
npm run lint
npm run build
```

No environment values are needed yet. `.env.example` documents this; `.env.local` is ignored. Never put secrets in tracked files.

Read [the spec](docs/SPEC.md), [progress](docs/PROGRESS.md), and [rules](AGENTS.md) before changing code. Do not begin Step 2 without instruction.

## First deployment
GitHub CLI was not installed during setup. Install it from https://cli.github.com, then run these commands in this folder:

```sh
gh auth login
gh repo create verselight --private --source=. --remote=origin --push
```

If Git reports dubious ownership after sandbox setup, trust only this project directory: `git config --global --add safe.directory C:/Users/BRENT/verselight`.

Push the repository, import it into Vercel, select the Next.js preset, keep default build settings, and deploy. No environment variables are needed for Step 1. This task has not deployed the app.
