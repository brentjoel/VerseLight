# Verselight

Emotion-based Scripture, reflection, and prayer. Stack: Next.js App Router, strict TypeScript, Tailwind CSS, shadcn/ui, npm, Vercel. Everyone uses the app as a guest. Personal data stays in the visitor's browser with JSON Export and Import backups. No server persistence for personal data.

Read `docs/SPEC.md` and `docs/PROGRESS.md` at the start of every task.
Read docs/ARCHITECTURE.md before changing structure or data flow. Read docs/DESIGN.md before any UI work and follow its checklist.

## Workflow
- Create a branch named `step-N-short-name`. Do only the next unchecked step, meet every acceptance criterion, and never start the following step.
- Ask one short question if unclear; otherwise choose the simplest option and log it. No new dependencies without a one-line reason. Touch only task files.
- Update `docs/PROGRESS.md`. Run `npx tsc --noEmit`, `npm run lint`, and `npm run build`; all must pass. Use `npm.cmd` and `npx.cmd` when PowerShell blocks script launchers. Use `npm run dev` to try locally.
- Commit small, push the branch so Vercel makes a preview, and wait for the user's approval before merging to main. Do not deploy production independently.
- Explain checks and how to try the result. Summaries under 10 lines, then stop.
- Never commit secrets. Keep values in ignored `.env.local` and hosting secrets; keep `.env.example` current.

## Code and UI
- Strict TypeScript; no `any` without a comment. Server Components by default; `"use client"` only when needed.
- Use `app/`, `components/` (`ui/` for shadcn), `lib/`, and `data/`. Validate external input and browser storage. Keep streak logic in pure `lib/` functions.
- Calm, clean, mobile-first. Dark default with working light mode, semantic HTML, labels, contrast, visible focus, reduced-motion support, and loading, empty, and error states. Warm plain copy, no em dashes.
- Never send user data to any server. The existing translation preference cookie is the sole documented preference exception; never put personal records in cookies, URLs, requests, or logs. Never add analytics or tracking without asking.
- Out of scope: notifications or PWA reminders, memorize mode, AI free-text, and audio.

## Translation licensing
- Strictly noncommercial: no ads, payments, subscriptions, donations, or paid features. Do not introduce ads, payments, or donations without re-checking translation licenses.
- NLT default via official Tyndale API, server-side `NLT_API_KEY` only. Never log credentials or persist NLT verse text in browser storage, backups, files, framework caches, or the repository. Preserve wording and attribution; never invent Bible text.
- KJV, WEB, ASV, BSB use static public-domain files; KJV has special UK rights. WEB is the labeled fallback. Keep providers extensible and the existing disabled NIV Coming soon option pending licensed access. Never scrape or copy NIV text.
- Read `docs/TRANSLATION-LICENSES.md`; re-check publisher terms before changing usage, caching, display, or sharing.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
