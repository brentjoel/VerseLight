# Verselight design

Motion polish on merged Step 9, 2026-10-15. This replaces the earlier lavender/card-heavy rules. Calm, minimal, premium: a quiet sky with a single warm light. One primary task per screen. Existing data, routes, storage, providers and features remain intact.

## Tokens

| Role | Night (default) | Morning (`data-theme="light"`) |
| --- | --- | --- |
| Background | `#0A0C10` | `#FAF6EE` |
| Soft surface | `#11151C` with translucent overlays | `#FFFCF6` with translucent overlays |
| Text | `#F2EFE8` | `#28251F` |
| Supporting text | `#B6B3AC` | `#696052` |
| Gold / interactive ink | `#E0B96A` | `#79551F` |
| Decorative gold light | `#E0B96A` | `#E0B96A` |
| Text on accent | `#17140E` | `#FFFCF6` |
| Secondary surface | `#1B2029` | `#F0E9DC` |
| Hairline border | white 9% | ink 12% |
| Active border | gold 35% | dark gold 35% |

All page and scene tokens live in the two root theme blocks in `app/globals.css`. Transparent WebGL reads these same tokens and updates its existing material on theme changes. Dawn animation never retains captured ink after a switch. Saved preferences win, otherwise the system theme applies and live system changes update immediately. Light mode declares `color-scheme: only light` so mobile browser automatic darkening cannot recolor the cream palette into brown. Do not add theme persistence or alter preference logic.

Emotion hues stay in the existing wheel configuration and CSS `data-emotion` tokens. Use them only on the wheel and as a faint glow behind verses. Simple picker, Journal, controls and surfaces use neutral/gold styling.

## Typography and space

Lora/Georgia serif for major headings and Scripture; Geist/Arial sans-serif for UI. Verse text is 26px mobile, 34px desktop, line-height 1.65. Comparison verses may use 24px for narrow columns. UI text is at least 14px. Attribution, metadata and fine print are at least 12px with AA contrast. Preserve exact Scripture wording and whitespace. Required translation name and copyright attribution always sit below each quotation.

Use an 8px spacing rhythm, generous open space, maximum 1040px shell and 760px reading column. Surfaces use 16px radii, low-opacity hairlines and soft light; remove nested cards, heavy outlines and decorative boxes. Large reading panels have no enclosing border or shadow. Form fields retain visible boundaries. Minimum interactive targets are 44px.

## Screens

- Home: brief greeting; centered unboxed wheel dominates the first viewport. A small morning star near the wheel opens the existing daily WEB verse in an accessible dialog with Save, Share and other translations. Simple picker stays available as a small text link and the no-WebGL/reduced-motion fallback. Retain all wheel keyboard, semantic emotion lists, detents, intensity and recovery behavior.
- Results: one large centered verse at a time, with swipe, arrow buttons, keyboard arrows, progress dots and a polite "Verse 2 of 4" announcement. Keep View all verses, and preserve full server-rendered text without JavaScript. Attribution is always visible. Quiet Save, Compare and Share icon/label row. Reflect question and prayer live in a native collapsible section.
- Share: native modal dialog with existing WEB download/open options and an explicit public-domain text only note. Never render NLT into imagery or alter the share route.
- Navigation: mobile fixed bottom tabs Feel, Verses, Journal, minimum 44px targets, active gold underline plus `aria-current`. Desktop uses simple top navigation. Footer links retain About/privacy and licenses.
- Compare, My Verses, Journal, About, Licenses, 404 and simple picker share the same type, spacing, surfaces and both palettes. Preserve loading, empty, error, backup, calendar and form behavior.

## Interaction

All hover rules must be inside `@media (hover: hover) and (pointer: fine)` and mirrored with `:focus-visible` (or `:focus-within` for grouped surfaces). Transitions are 200ms ease-out (range 180 to 240ms). Never change layout on hover. Cards lift 2px with a brighter hairline and soft gold glow; buttons softly fill/glow, icons lift 1px; pressed buttons sink 1px. Links animate an underline; navigation gold underline slides in. Icon controls have hover/focus tooltips as well as accessible names or visible labels.

Wheel uses grab/grabbing cursors, gently brightens bars near the pointer and gives the focused/hovered label a soft glow. Center control pulses with light, without movement. Morning star slowly twinkles and brightens on hover/focus. Verse arrows and progress dots scale slightly. Page arrival fades with an 8px rise over 220ms. Reduced motion removes transforms and pulses, retains color/opacity feedback, uses the original simple picker, and displays Scripture immediately.

## Accessibility and verification checklist

- [ ] Both themes update page, wheel and dawn instantly through toggle and system preference.
- [ ] WCAG AA text and controls across theme surfaces and every dawn text stage; decorative light never overlays text.
- [ ] Mobile/desktop, no overflow, comfortable targets, visible focus, labels and semantic headings.
- [ ] Keyboard wheel, carousel arrows, dialogs with Escape/focus return, Reflect disclosure and list alternative.
- [ ] Full selectable Scripture, exact wording, actual translation, visible attribution and labeled fallback.
- [ ] Loading, empty and error states with useful next actions; local features preserved.
- [ ] Hover gated for fine pointers, matching focus feedback, reduced motion without movement or pulses.
- [ ] No data/provider/storage/route changes, new dependencies, analytics or production deployment.

Warm, plain copy. No em dashes in app-authored text. Rendered/device/screen-reader and Lighthouse review must be reported honestly separately from source and automated checks.

## Motion

Shared CSS tokens: `--motion-fast: 150ms`, `--motion-base: 220ms`, `--motion-slow: 400ms`, `--motion-scene: 700ms`; `--ease-enter: ease-out`, `--ease-move: ease-in-out`, `--ease-press: cubic-bezier(.2,.8,.25,1.15)`. Theme colors cross-fade in 300ms. Animate transform and opacity, with cheap color, border and shadow feedback. No animated layout, filters or background geometry. Use CSS and the existing Web Animations API, without new dependencies. Full dawn cadence is separate and never shortened.

Fine-pointer hover lives inside `(hover: hover) and (pointer: fine)` and is mirrored on focus-visible/focus-within. Wheel uses grab/grabbing, pointer/focus bar highlights, soft label glow, a breathing light and an active-dot ring. Surfaces lift 2px with gold borders/shadows. Buttons softly fill/glow and lift icons 1px; presses sink 1px and scale .98. Links draw a left-origin underline; nav underlines move between active tabs. Arrows/dots scale; the active dot stretches by transform into a pill. Calendar cells glow/scale with the same date/activity description on hover, focus and touch selection. Tooltips appear after a short delay, with visible labels or accessible names on touch. Focus uses a smoothly appearing gold outline.

Route arrivals fade and rise 8px. Use native View Transitions as progressive enhancement with CSS arrival fallback. Verse travel follows next/previous direction with outgoing drift and incoming opposite drift, then the full dawn emphasis. Rapid input cancels previous decorative effects immediately. Wheel orbit contracts/expands by transform. Native Reflect disclosure keeps its semantics and animates its content by opacity/transform with a rotating chevron, avoiding animated height/layout. Dialogs fade/scale and their backdrops fade with static soft blur. Theme cross-fades include the scene. Saved bookmark fills/pops with a tiny gold sparkle and polite transient Saved feedback; existing removal remains in My Verses. Compare columns and library/journal lists arrive with a bounded short stagger; deleted items fade/drift before removal. Loading uses subtle skeleton shimmer; empty states fade in. Home greeting, wheel and morning star enter with a short stagger; the star slowly twinkles.

Reduced motion removes translation, scaling, parallax, pulses and shimmer, keeps short opacity/color feedback and instant Scripture. Never block interaction or text, announce words, retain stale effects/timers, or add hover-only information. Keep AA contrast, 44px targets, keyboard focus, native dialog/disclosure behavior and screen-reader announcements. Mid-range phone 60fps and mobile Lighthouse >=90 in all four categories require measured review.

## Finishing details

Use a low-cost layered night sky in dark mode: soft vignette, near-invisible CSS grain and only five opacity-twinkling stars, all behind content. Light mode uses a warm morning haze with dark readable ink. Emotion tints stay faint behind the wheel and verse; keep personal content out of artwork. Pause decorative motion when hidden and remove it for reduced motion. No heavy raster backgrounds.

Headings and verse text use balanced wrapping, optical serif sizing and comfortable reading measures. Preserve source Scripture punctuation exactly; use curly quotes only in authored UI copy. Dates/counts use tabular numbers. Each verse reference has a small decorative star-and-line divider. The brand is a simple inline SVG star within a double wheel; use this geometry for favicon sizes, Apple touch and manifest icons. UI icons use Lucide at a consistent 1.5 stroke with accessible names. Decorative artwork is hidden from assistive technology.

Open Graph and Twitter cards use Next.js ImageResponse: Verselight, a short plain tagline and a warm wheel glow, never Scripture. Metadata uses the existing validated NEXT_PUBLIC_SITE_URL through metadataBase; give every page a title and description. Share cards retain exact WEB text, translation/source credit, current public input validation and public WEB-only caching described in SECURITY.md, restyled with night/gold, serif type and the same wheel mark. Do not expand supported translations or request behavior.

Empty states and 404 use a small SVG constellation, warm copy and an existing clear route home. Gold selection, subtle scrollbars, 4/8-based spacing and radius tokens, dual theme-color metadata and consistent visible gold focus finish the shell. Check both themes at 360, 768, 1024, 1440 and 1920px, including long comparison text, populated local lists, native dialogs, selected calendar cells and the simple picker. Keep AA text contrast and mobile Lighthouse Performance, Accessibility, Best Practices and SEO >=90; report measured results and any unavailable checks honestly.
