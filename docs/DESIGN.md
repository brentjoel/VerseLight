# Verselight design

Inspected 2026-10-15 from `app/globals.css`, `app/layout.tsx`, current routes, and shared components. This records the implemented look, not a redesign. CSS and component sources are authoritative. A fresh visual browser review remains a manual check.

## Color tokens

| Role / CSS variable | Dark default | Light (`data-theme="light"`) |
| --- | --- | --- |
| Background / `--background` | `#0B0D10` | `#F7F7FA` |
| Surface / `--card` | `#12151A` | `#FFFFFF` |
| Text / `--foreground` | `#EEEDF2` | `#272833` |
| Muted text / `--muted-foreground` | `#A2A5AF` | `#666875` |
| Accent / `--primary` | `#B4ACD5` | `#6D5B96` |
| Text on primary / `--primary-foreground` | `#17141F` | `#FFFFFF` |
| Secondary surface / `--secondary` | `#1B1E25` | `#EEEDF4` |
| Border / `--border` | white at 8% | `rgb(30 25 50 / 10%)` |
| Hover border / `--hover-border` | white at 19% | `rgb(70 50 100 / 25%)` |
| Emotion wash / `--emotion-opacity` | 0.07 | 0.09 |

Tailwind background, foreground, card, popover, primary, secondary, muted, accent, border, input, and ring map onto these CSS variables. Tailwind `accent` and `muted` surfaces map to secondary; the visual lavender accent is primary. Destructive is `#D59A9F`. Selection uses primary at 30%.

### Per-emotion accents

`data-emotion` sets `--emotion-rgb`. These RGB values are identical in both themes; the wash opacity changes above. Main text retains the shared readable foreground.

| Emotion | RGB | Hex |
| --- | --- | --- |
| Anxious | 136 168 161 | `#88A8A1` |
| Sad | 138 160 190 | `#8AA0BE` |
| Angry | 190 144 135 | `#BE9087` |
| Tired | 165 150 187 | `#A596BB` |
| Guilty | 137 172 179 | `#89ACB3` |
| Grateful | 172 179 143 | `#ACB38F` |
| Hopeful | 196 179 137 | `#C4B389` |
| Doubtful | 179 147 170 | `#B393AA` |

Emotion cards use an ellipse wash from bottom left fading to transparent at 85%. Icons use a 6% fill and 13% border; emotion dots are 4px. Hover border is 32%, with a 5% colored shadow.

## Fonts and type scale

Geist is the UI sans face with Arial/sans-serif fallback. Lora is the editorial serif with Georgia/serif fallback. Both come through `next/font/google`, Latin subset, display swap, and are served by the app. `--font-heading` maps to Geist in the UI foundation; page headings explicitly use Lora.

| Use | Size and treatment |
| --- | --- |
| Body | inherited browser base, line-height 1.7 |
| Home h1 | Lora 400, `clamp(36px, 5vw, 54px)`, line-height 1.25, tracking -0.045em |
| Detail/results h1 | Lora 400, `clamp(34px, 5vw, 48px)`, line-height 1.3, tracking -0.04em |
| State h1 | Lora 400, `clamp(30px, 4vw, 40px)`, line-height 1.4, tracking -0.035em |
| Licenses h1 | Lora 34px |
| Section / featured title | Lora 27px; section tracking -0.035em, featured line-height 1.5 |
| Brand | Geist 20px, 500, tracking -0.7px |
| Verse text | Lora 19px, line-height 1.9, foreground, source newlines preserved |
| Specific feeling | Geist 16px, 400 |
| Compare heading | Geist 15px, 500 |
| Intro / reflection / notice | Geist 14px, usually line-height 1.9 |
| Prayer | Lora italic 14px, line-height 1.9, muted |
| Supporting copy | 13px; controls/descriptions 12px; credits/footer/reference 11px |
| Eyebrow / prompt / pill / tag | 10px; uppercase eyebrow and prompt, 500, tracking 0.15-0.16em; tag 0.1em |

Headings balance text. Verse text wraps long words. Emotion summaries truncate to one line and retain a title tooltip. The legacy `.verse-placeholder` is Lora italic 17px with 1.8 line-height; live Scripture uses `.verse-text`.

## Spacing, radius, and depth

There is no bespoke global spacing token scale. Tailwind uses its standard 4px spacing unit alongside exact CSS values. Reuse the implemented rhythm: 4/8/12/16/20/24/28/30/32/36/40/48/60/64/78/80px. Small optical gaps include 5/7/9/10/11/14/15/18/22/23/25/26px. Do not round existing values during unrelated work.

Radius tokens: sm 8px, md 12px, lg 16px, xl 20px, 2xl 24px. Emotion and verse cards use 16px; featured/state panels 20px; comparison form 12px; translation select 10px; compare control 8px; tag 6px; status pill 99px; theme control and decorative rings 50%. Prayer blocks use `0 12px 12px 0`.

Surface shadow is `0 12px 40px rgb(0 0 0 / 12%)` in dark and `0 12px 40px rgb(40 30 70 / 4%)` in light. Emotion hover uses `0 8px 30px rgb(var(--emotion-rgb) / 5%)`. Card foundation also supplies a 1px foreground/10 ring. Avoid heavy glow. The featured panel uses a 115-degree gradient with primary at 5% into card, plus a decorative 310px circular outline at primary 9%, positioned right 7%, top -95px, and a second ring inset 35px.

## Shell, cards, and grids

- Shared shell is `min(100% - 40px, 1040px)`, centered, minimum 100svh. At 640px it becomes `min(100% - 80px, 1040px)`. Header is at least 104px with a bottom border. Brand sits left; translation and theme controls right with a 12px gap.
- Main padding is 64px top / 32px bottom, then 78px / 36px at 640px. Footer has a top border and 26px block padding. At 420px and below it stacks with 4px gap; section helper copy hides and featured content stacks.
- Home hero is centered, with a 48px bottom margin (55px at 640px). Featured section precedes the emotion grid with a 60px bottom margin. Featured card has 30px padding (36px 40px at 640px), 18px gap, eyebrow/title above the daily WEB reference, text and actions. Step 6 replaces the placeholder.
- Emotion tiles form two columns with 12px gap, then four at 900px with 16px gap. A full-card link contains emoji and arrow, emotion dot/name, and muted summary. Padding is 23px 18px (24px at 900px). Icon is 39px square with 12px radius.
- Specific feelings sit in an 820px detail column with 36px top / 48px bottom margin. Grid is one column, two at 640px, gap 16px. Links have 28px padding, minimum height 145px, title and arrow. Detail icon is 52px square with 16px radius.
- Results use a 700px column with 36px top / 48px bottom margin, heading bottom gap 40px, and verse-list gap 24px. Verse cards have 30px padding (36px at 640px), 24px internal gap, border and shadow. Anatomy: reference and actual-translation tag, Scripture, attribution/fallback note, Compare link, Reflect label/question, then prayer panel. Prayer panel has 24px top margin, 22px 24px padding, primary 35% left border and primary 4% wash.
- Comparison spans the shell. Form has 24px padding, 28px block margin; choices wrap with 12px 24px gaps. Grid stacks with 20px gap until 900px, then uses `repeat(auto-fit, minmax(220px, 1fr))`. Cards align at the top and use 24px padding at that breakpoint.
- Shared state panel is at most 580px, margin 40px auto 80px, padding 36px 24px. Content notices use 28px padding, 16px radius, muted 14px copy. Reuse these for new states.

## My Verses and local storage UI (Step 4)

The shared shell now has a wrapping 12px navigation row below the header, with 44px-tall Choose a feeling and My Verses links. A storage notice uses the existing card surface, border and muted text, 18px 22px padding and 12px radius.

The library stays within 820px. Sections are separated by 40px. Collections use a single-column 16px-gap grid with 22px 24px padded, 16px-radius cards. Local forms use an 8px gap, 44px inputs with 10px radius and labeled fields; input/action rows stack on small screens and align horizontally from 640px. Saved references use Lora 22px with the existing translation tag and card treatment. Native labeled collection checkboxes have 44px rows. Backup panels use 28px padding and 20px radius; import previews/confirmations use secondary surface, 20px padding and 12px radius. Status copy uses primary and errors use foreground with explicit alert semantics. Disabled actions retain their labels with 0.6 opacity.

Loading says "Opening your saved verses...". Empty collections and saved lists have a warm next action. Storage problems show a shared notice and local recovery controls; import has a counts preview, explicit replacement and cancellation, and an Export-first action. No new motion was added; existing focus, theme variables and reduced-motion rules apply. Visual and keyboard review is still a preview handoff while no browser is connected.

## Interaction and motion

Step 5 Journal reuses the 820px library column, section spacing, card surfaces and local controls. Its monthly heatmap is a semantic Monday-first table with a caption, weekday headers and 44px-tall date buttons. Four theme-derived intensity levels show activity/reflection counts; text accessibility labels describe each date, reflection count, activity or grace, so color is not the only signal. Pressed states mark the selected date and filter the reflection list. Month navigation and Show all reflections use existing controls. Badges wrap in bordered cards. Labeled, resizable note textareas include character counts, a 2,000-character bound and explicit focus outlines. Reflection removal asks for confirmation and explains retained activity. Loading, empty, action errors and shared recovery/conflict/clock notices cover local states. No new motion. Narrow/wide, light/dark and keyboard review still require the preview because the browser inventory is empty.

Visible keyboard focus is a 2px primary outline offset 5px on links, buttons, selects and inputs. A Skip to content link appears on focus. Back links, selectors, theme control and compare actions have 44px minimum targets. Native labeled selects and fieldset/legend checkboxes retain keyboard behavior. Credits underline links with 3px offset.

Emotion hover lifts 3px with 220ms ease transitions on transform, border and shadow; arrow moves 2px right and 2px up and increases opacity from 0.45 to 1 over 180ms. Theme hover rotates 8 degrees over 180ms and brightens text/border. Other controls use 180ms color/border transitions. Main content arrives once over 650ms ease-out from opacity 0 and translateY(7px). No looping animation.

`prefers-reduced-motion: reduce` disables all animation and transitions, resets smooth scrolling, and removes hover transforms. New motion must remain subtle and honor the same rule.

## Step 8 Home wheel

Home progressively replaces the original picker with a 540px maximum square dial in a 24px-radius dark panel. The scene remains dark in light mode, with explicit foreground `#EEEDF2`, supporting text `#B9BAC4`, control borders `#777780` and warm selected/focus accent `#D5BD8B` (selected text `#17141F`). Existing per-emotion colors tint decorative bars only. No new global theme tokens.

Panel padding is 24px/16px on mobile, 28px/32px from 640px. A thin orbit and 128 instanced bars frame a DOM center control. Broad labels sit on the outer ring; a semantic wrapping button list below provides full labels, 44px targets and pressed states at both levels. Inner selection contracts the orbit over 500ms; bar characters interpolate with time-based easing. Arrows and Enter work on the center; previous/next buttons support other input. Focus moves to the inner reading link after locking. Intensity uses native labeled radios and explicitly says it is not saved. Loading, scene failure, low capability, context loss and reduced motion preserve the original grid. Verse rendering remains immediate. Reduced motion skips the scene entirely; global reduced-motion CSS also disables transitions. Source checklist reviewed; rendered narrow/wide, dark/light, keyboard, touch, screen-reader and contrast-tool checks remain for preview review.

## Copy tone

Warm, plain, patient, and brief. Existing examples: "Come as you are. Take your time.", "One small moment at a time.", and "Finding your verses...". Avoid pressure, promises of outcomes, and em dashes in app-authored copy. Preserve all publisher Scripture wording and punctuation exactly. Say which translation is actually displayed on fallback.

## Design checklist for every new page

Step 6 source review covers every route below. New controls reuse theme variables, 44px action heights, semantic buttons/links, visible focus and live loading/error/status copy. The daily passage uses established verse typography and an h3 reference beneath the panel h2. Loading waits for the device date; missing content and no-JavaScript states offer a reading link. Cards retain full text and credits with a fixed dark palette independent of page theme. Text remains available as HTML on the originating page. Card links announce new-tab behavior. Download errors offer retry and open-image recovery.

| Route | Source checklist review | Remaining rendered review |
| --- | --- | --- |
| Home | Daily loading/empty/recovery, heading hierarchy, WEB label, Save/card controls | Narrow/wide, both themes, midnight, keyboard |
| Broad emotions (all 8) | Shared shell, h1, descriptive full-card links, focus, static empty state | Narrow/wide, both themes, keyboard |
| Results (all 32) | Passage loading, attribution/fallback, headings, labeled Save/Compare/card controls | Narrow/wide, both themes, keyboard |
| Compare | Native labeled fieldset, invalid-input recovery/reset, loading, actual translation/fallback, card controls | Narrow/wide, both themes, keyboard |
| My Verses | Labeled forms, loading/empty/errors, recovery, explicit replacement/removal | Narrow/wide, both themes, keyboard/file picker |
| Journal | Labeled notes/calendar, non-color descriptions, loading/empty/errors, recovery link | Narrow/wide, both themes, keyboard |
| About and licenses | Shared shell, semantic headings, linked attribution, daily WEB/share privacy copy, static content | Narrow/wide, both themes, keyboard |
| 404 and error | Shared shell, h1, return link and error retry | Narrow/wide, both themes, keyboard/retry |
| Share PNG | Strict inputs, exact WEB text/credits, variable height, 400/503 recovery | Shortest/longest PNG inspected; browser save pending |

The existing reduced-motion rule disables animation/transitions and hover transforms across routes; Step 6 adds no motion. Computed foreground/muted/primary contrast against background/card has a minimum 7.44:1 dark and 5.17:1 light. Focus uses primary. Header wrapping below 381px prevents potential brand/control overlap. These are source and numeric checks, not a rendered audit. The implementation session had no connected browser. Step 6 is now merged per owner confirmation; remaining rendered-review checks are retained in the Step 7 launch checklist.

- [ ] Dark default with working light mode through existing variables and theme control.
- [ ] Mobile-first layout, no horizontal overflow, consistent shell, cards, typography and spacing.
- [ ] Sufficient text/control contrast, visible focus, semantic headings, labels, keyboard access and comfortable targets.
- [ ] Loading, empty, and error states appropriate to the data source, with a useful next action.
- [ ] Consistent shared components, attribution, actual translation tags and fallback messaging.
- [ ] Subtle motion that respects prefers-reduced-motion.
- [ ] Warm plain copy with no em dashes; preserve source Scripture exactly.
- [ ] Check narrow and wide layouts in both themes and keyboard navigation before approval.
