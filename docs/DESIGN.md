# Verselight design

Step 9 redesign, 2026-10-15. This replaces the earlier lavender/card-heavy rules. Calm, minimal, premium: a quiet sky with a single warm light. One primary task per screen. Existing data, routes, storage, providers and features remain intact.

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

All page and scene tokens live in the two root theme blocks in `app/globals.css`. Transparent WebGL reads these same tokens and updates its existing material on theme changes. Dawn animation never retains captured ink after a switch. Saved preferences win, otherwise the system theme applies and live system changes update immediately. Do not add theme persistence or alter preference logic.

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
