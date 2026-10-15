# Wheel UI Plan: "Wheel within a Wheel"

Status: PLANNED. Do not start until Steps 1 to 7 are merged to main and the launch checks are verified.

## Concept
A signature interaction layer inspired by Ezekiel 1:16 (wheel within a wheel) with a light theme drawn from Psalm 119:105 and Genesis 1:3. Tone is reverent and calm, never flashy. Imagery is limited to light, stars, and wheels. No faces, angels, figures, or denomination-specific symbols.

## Project context (read first)
- Read AGENTS.md, docs/ARCHITECTURE.md, docs/DESIGN.md, docs/SPEC.md, and docs/PROGRESS.md. Match existing conventions. There is no src/ folder.
- Do not add accounts, login, ads, analytics, tracking, audio, notifications, AI free-text, or any backend. Strictly noncommercial.
- Do not touch the translation provider or NLT API logic.
- Existing emotions and sub-emotions in data/emotions.json are the single source of truth. Do not hardcode a second list.
- Existing browser storage (saved verses, collections, journal, streaks, badges, Export and Import) is the only data store.

## Licensing rules (important)
- Verse text must always be real DOM text from the existing translation layer. Never draw verse text from API sources into canvas or images.
- Any generated image (the sky card, as with the existing share cards) may only contain public-domain translation text (WEB by default, KJV, ASV, or BSB). Never render NLT text into an image. If the user's active translation is NLT, the card uses WEB and says so.
- Short UI copy that quotes scripture (for example the grace day line) uses WEB wording with its reference, not NLT or NIV wording.

## Rules for all phases
- One phase per branch (step-8-wheel-picker, step-9-dawn-reveal, step-10-night-sky, step-11-polish), each with a Vercel preview, and wait for my approval before merging.
- Per phase: build, lint, typecheck, tests, then stop and summarize in under 10 lines, with the 3 to 5 screens I should review.
- Add dependencies only with a one-line reason. Expected: three, @react-three/fiber (if React), and at most one small helper. Lazy-load all 3D code so routes without the wheel keep their current JavaScript size and Lighthouse scores stay at 90 or higher.
- Use instancing so the bar ring is one draw call. Cap devicePixelRatio at 2, keep particle counts small, pause rendering when the tab is hidden, and dispose of GPU resources on unmount.
- Keep the existing emotion picker as the accessible and no-WebGL fallback. Do not delete it. Show it when WebGL is unavailable, the device is slow, or prefers-reduced-motion is set (no spinning, no particles, instant verse display).
- Accessibility: keyboard only use (arrow keys turn, Enter locks in), a screen-reader friendly list of emotions with aria labels, WCAG AA contrast, 44px minimum touch targets, visible focus. Verse text is always selectable and readable immediately. Animation is visual only and never blocks the verse.
- Mobile first, target steady 60fps on mid-range Android.
- Keep the dark minimalist look: restrained palette, one warm accent, generous spacing. Update docs/DESIGN.md with any new tokens at the end of each phase.
- Any change to stored data (for example an intensity field) needs a schema version bump, a migration, validation in Export and Import, backward compatible imports of older backups, and tests.
- Put pure logic (constellation building, quality tier choice, time-of-day blending, milestone rules) in lib/ with unit tests.
- When a decision is ambiguous, choose the simplest option and explain it in the commit message.

## Phase 1 (Step 8): Wheel picker
Replaces the emotion picker UI on the home flow but keeps its data and routes.
- Large dial in a dark scene. The outer ring holds the 8 broad emotions. Rotate by drag, touch, mouse wheel, or arrow keys, with a detent feel and light haptics via navigator.vibrate where supported.
- A ring of thin vertical bars around the dial acts as a radial waveform. Each emotion has its own waveform character (speed, amplitude, smoothness) and light color, defined in one config object. Bars morph smoothly between emotions as the dial turns.
- Press or tap the center to lock in. The outer ring collapses and an inner wheel appears for the sub-emotions (the existing second step), plus an intensity control (low, medium, high).
- Intensity is saved on the mood entry only if the schema change rules above are followed.

## Phase 2 (Step 9): Dawn reveal
- After the final selection the scene is dark, light breaks from the dial center, and the verse writes in word by word at a comfortable reading pace. The full text exists in the DOM from the start (visually revealed, not injected). Add a "Skip animation" control.
- A quiet mood atmosphere behind the verse is tied to the chosen emotion.

## Phase 3 (Step 10): Night sky journal
- Extend the mood heatmap into a night sky. Each check-in is a star colored by mood, streaks connect stars into constellations, and tapping a star opens that day's verse and note.
- The grace day dims the glow instead of breaking the line. Copy: the Lamentations 3:22-23 phrase in WEB wording, with the reference.
- Read from the same browser storage the journal uses. Export and Import must keep working.
- Keep the existing calendar heatmap as the accessible alternative view, with a toggle.

## Phase 4 (Step 11): Polish and delight (one item per commit)
- First visit nudge: on the first ever load, auto-rotate the dial once slowly with a faint "Turn to begin" hint that disappears on interaction. Remember it in browser storage.
- Time-of-day sky: tint the background and light by local time (dawn, day, dusk, night) with smooth blending, keeping AA contrast at every time.
- Growing sky: depth layers, subtle twinkle, and milestones at 7, 30, and 100 check-ins (soft nebula glow, a named constellation). Never show guilt or loss for time away.
- Verse of the day appears as the brightest "morning star" at the top of the sky. Tapping opens it.
- Sky card: a button that renders the constellation plus a verse into a PNG fully client-side (canvas), showing the translation name and reference. Public-domain text only (see licensing rules). Use the Web Share API when available, otherwise download.
- Quality tiers: measure frame time during the first 2 seconds and automatically reduce particles, glow, and DPR, or fall back to the 2D fallback.

## Done criteria for the whole plan
- Build, lint, typecheck, and tests pass. No new environment variables.
- Lighthouse Performance, Accessibility, Best Practices, and SEO stay at 90 or higher on the home page, tested on mobile settings.
- The app is fully usable with keyboard only, with a screen reader, and with reduced motion.
- Do not rename the repo or restructure unrelated files.
