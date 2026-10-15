# Verselight product specification

## Core flow

Everyone is a guest. Choose a broad emotion, then a specific feeling, and read four curated passages in a preferred translation, each with a reflection question and prayer starter. This flow, translation selection, comparison and credits are DONE. All eventual features work for every visitor. Personal records stay in the visitor's browser with local JSON Export and Import backups, with no server persistence.

DONE: Save a verse by reference, organize collections on My Verses, Export/Import local JSON backups, record moods with optional notes, view a calendar heatmap, grow streaks with a weekly grace day, and earn badges. PLANNED: Share image cards and a real verse of the day; Home's current panel is a placeholder. No personal data leaves the device. The existing non-sensitive translation preference cookie is the narrow exception used for server passage rendering.

## Features and status

- DONE: Two-step emotion picker, four passages per feeling, reflection and prayer prompts.
- DONE: NLT default, KJV, WEB, ASV, BSB, and side-by-side comparison of two to four translations. Existing NIV stays disabled as Coming soon pending licensed access. Keep the provider list extensible.
- DONE: Validated translation cookie and remembered theme. Dark default with working light mode and mobile-first UI.
- DONE Step 4: Typed browser storage, saved verses, collections, My Verses, and validated JSON Export and Import.
- DONE Step 5: Mood journal with calendar heatmap, local-date streaks with one grace day per week, and badges. Preview visual/keyboard review remains pending.
- PLANNED Step 6: Share cards using Next.js ImageResponse, verse of the day by local day of year, polish and accessibility pass.
- IMPLEMENTED Step 7 code: About/privacy with complete translation credits, best-effort per-instance NLT burst/quota/cooldown handling, fixed operational warning codes, configurable site origin and README launch checks. Owner explicitly declined a shared quota store and accepted the serverless limitation. Hosting and preview/accessibility verification remain pending. Step 6 is untouched.

## Emotions
| Broad emotion | Specific feelings |
| --- | --- |
| Anxious | Worried about the future; Can't sleep; Overwhelmed; Afraid |
| Sad | Grieving; Lonely; Disappointed; Feeling empty |
| Angry | Frustrated; Betrayed; Resentful; Need patience |
| Tired | Burned out; Discouraged; Need strength; Wanting to quit |
| Guilty | Ashamed; Need forgiveness; Made a mistake; Struggling with sin |
| Grateful | Blessed; Celebrating; Thankful for people; Answered prayer |
| Hopeful | Starting something new; Waiting on God; Facing a big decision; Need direction |
| Doubtful | Questioning faith; Feeling far from God; Unanswered prayer; Seeking peace |


## Content and privacy rules

`data/emotions.json` holds curated reference selections; `data/prompts.json` holds questions and prayer starters by reference. A verse can appear under several feelings. Never invent Scripture text. All personal records, including saved verses, contain references and metadata only, never NLT text. Never send notes, backups, activity, or other personal records to any server. No tracking or analytics without asking.

Strictly noncommercial personal and portfolio project: no ads, payments, subscriptions, donations, or paid features. NLT uses the official Tyndale API, server-side only with `NLT_API_KEY` in ignored local environment or hosting secrets. No persistent NLT text in browser storage, backups, files, framework caches, or the repository. Preserve wording, required notices and publisher links. KJV, WEB, ASV and BSB use static public-domain files; KJV has special UK rights. Missing key, provider error or quota exhaustion shows WEB with a WEB tag and explicit note. Valid translation cookies retain the chosen preference. Do not scrape or copy NIV. Re-check publisher terms before changing display, sharing, caching, usage, or introducing ads, payments or donations. See [translation terms](TRANSLATION-LICENSES.md).

## Local data model

Envelope, preferences, saves, collections, mood/activity/badge fields and streak calculations are DONE. Schema 1 accepts validated progress records and remains compatible with Step 4's empty fields. Notes are bounded to 2,000 characters. Import recomputes streak/grace totals from the activity ledger. See [architecture](ARCHITECTURE.md) for validation, migrations, write behavior and backup format. Use a small typed localStorage layer in `lib/`, a versioned envelope and an in-memory fallback when storage is unavailable. No server data service is used.

| Shape | Fields |
| --- | --- |
| Envelope | `schemaVersion: 1`, `revision`, `updatedAt`, `data: PersonalData` |
| Preferences | `theme`, `preferredTranslation` |
| SavedVerse | `id`, `reference`, `translationId`, optional valid pair `emotionId`/`specificEmotionId`, `createdAt` |
| Collection | `id`, `name`, unique valid `savedVerseIds`, `createdAt`, `updatedAt` |
| MoodEntry | `id`, `emotionId`, `specificEmotionId`, optional `note`, `localDate`, `createdAt` |
| ActivityDay | unique `localDate`, `firstActivityAt`, `utcOffsetMinutes`, unique `sources` (emotion/save) |
| StreakState | `currentStreak`, `longestStreak`, optional `lastActiveDate`, `graceDates`, optional `maxObservedLocalDate`/`maxObservedAt` |
| Badge | unique supported `key`, `earnedAt` |
| PersonalData | `preferences`, `savedVerses`, `collections`, `moodEntries`, `activityDays`, `streakState`, `badges` |

DONE: Stable browser-generated ids, validated canonical references/translation ids, local YYYY-MM-DD dates and ISO instants. Save uniqueness is reference plus translation. Collection membership points to saved ids. Deleting a save removes its memberships; deleting a collection keeps its verses. Backups have a format marker, schema version, export timestamp and validated personal data; import previews counts and requires confirmation before full replacement. Validate size, fields, relationships and migrations before writes; invalid files leave data intact. Existing theme storage and translation cookie remain working with preference adoption. Schema 1 is the initial local format; unknown versions or missing migrations are rejected without altering the original.

## Streaks and badges (DONE Step 5)

Step 5 uses pure `lib/` functions. Selecting a specific feeling or saving a verse counts once per device local calendar date, regardless of repeated actions. Local dates use device year/month/day, not a fixed timezone or UTC day. Preserve historical dates across timezone changes. Backward clock/date changes freeze new accrual and show a notice until time catches up; forward changes use the real gap without inventing activity. Local-only clock checks cannot establish trusted time.

One non-accumulating grace day per Monday-through-Sunday local week can bridge exactly one missed date. Assign grace to that missed date's week, including across week boundaries; retry never consumes it twice. It preserves continuity without adding an active day. Larger gaps or used grace start a new streak. The ledger is authoritative; derived totals are recomputed. Full rules and test cases are in architecture.

Badge keys: streak-3, streak-7, streak-30, streak-100, first-save, saved-10, first-collection, first-mood. Award each once and retain earned milestones when ordinary content is removed. Repeated feeling choices create separate reflections but one activity day. Removing a reflection keeps the historical activity ledger. Schema-1 backups include notes, ledger, clock metadata and earned badges.

## Delivery

Next.js App Router, strict TypeScript, Tailwind CSS, shadcn/ui and npm, with top-level `app/`. Vercel target, one unchecked progress step per branch. Read [design](DESIGN.md) before UI work. Meet acceptance criteria, typecheck, lint and build, update progress, commit small, push a preview branch and wait for approval before merging to main. Notifications/PWA reminders, memorize mode, AI free-text and audio are out of scope.
