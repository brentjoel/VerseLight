# Verselight

Verselight is an emotion-based Bible verse app: people choose a feeling and receive verses in their preferred translation, a reflection question, and a prayer starter. Later steps add accounts, saved verses, collections, a mood journal, streaks with a grace day, badges, share cards, and a verse of the day. Stack: Next.js App Router, strict TypeScript, Tailwind CSS, shadcn/ui, npm, and later Supabase Auth, Postgres, and row-level security. Deploy to Vercel.

Read `docs/SPEC.md` and `docs/PROGRESS.md` at the start of every task.

## Commands
- `npm run dev`
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`

On Windows PowerShell with blocked script launchers, use `npm.cmd` and `npx.cmd`.

## Definition of done
Type checking, lint, and build all pass. The feature works locally and the summary explains how to try it. Update `docs/PROGRESS.md`. Summarize in under 10 lines, then stop.

## Workflow
- Work on ONE unchecked step at a time and never start the next.
- Ask one short question if unclear; otherwise choose the simplest option and log it.
- No new dependencies without a one-line reason. Do not touch files outside the task.
- Never commit secrets: use `.env.local` and keep `.env.example` updated.
- Never invent Bible verse text.

## Code conventions
- TypeScript strict; no `any` without a comment.
- Server Components by default; `"use client"` only when needed.
- Use `app/`, `components/` (`ui/` is shadcn), `lib/`, `data/` (`emotions.json`, `prompts.json`), and `supabase/migrations/`.
- Validate all external input. Every Supabase table has RLS so users only access their own rows.
- Keep logic such as streaks in pure functions in `lib/`.

## UI
Calm, clean, mobile-first. Light and dark mode via CSS variables. Use semantic HTML, focus states, sufficient contrast, and input labels. Write warm plain copy with no em dashes. Every data view has loading, empty, and error states.

## Git
Small commits with clear messages. Do not push or deploy unless asked.

## Out of scope
Notifications or PWA reminders, memorize mode, AI free-text, audio, and copyrighted translations (NIV, ESV, NLT).

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
