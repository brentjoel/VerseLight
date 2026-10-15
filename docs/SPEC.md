# Verselight product specification

## Core flow
Home shows the verse of the day and an emotion grid. A user picks a broad emotion, then a specific feeling, and receives 3 to 5 verses in their chosen translation. Each verse includes a reflection question and prayer starter. Users can save a verse, add it to a collection, or share an image card. Logged-in users also get a mood entry, streak, and badges. Guests can browse; saving, journal, and streaks require login.

## Features
- Two-step emotion picker.
- NLT (default), ESV, KJV, WEB, ASV, and BSB with side-by-side comparison. NIV is disabled, pending a license and provider setup.
- Email and Google login.
- Preferred translation stored in a validated translation cookie; sync to profiles in Step 4.
- Saved verses and collections.
- Mood journal with calendar heatmap.
- Streaks with one grace day per week and badges.
- Reflect and pray prompts.
- Share cards using Next.js ImageResponse.
- Verse of the day chosen by day of year.
- Mobile-first UI and dark mode.

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

## Content rules
Store content selections by reference only, for example Psalm 34:18, and fetch text per translation. `data/emotions.json` holds emotions, sub-emotions, and about four verse references each. `data/prompts.json` holds a reflection question and prayer starter per reference. A verse can appear under several emotions. Never invent verse text.

Verselight is a strictly noncommercial personal and portfolio project: no ads, subscriptions, donations, or paid features. NLT is the default and ESV is supported through the official Tyndale and Crossway APIs, server-side only. Keys belong in .env.local or hosting secrets. Do not persist licensed verse text in the repo, framework caches, databases, or files. Show required copyright notices and publisher links. KJV, WEB, ASV, and BSB remain static local files. If a licensed API fails, reaches quota, or is unconfigured, show WEB with an explicit note and WEB tag. Existing valid translation cookies retain the user's choice. NIV remains disabled as Coming soon until licensed provider access is configured; never scrape or copy it. Re-check licenses before monetization or new caching, display, or sharing behavior. See docs/TRANSLATION-LICENSES.md for source terms and setup.

## Data model
| Table | Fields |
| --- | --- |
| profiles | id, display_name, preferred_translation, current_streak, longest_streak, last_active_date, grace_days_left |
| saved_verses | id, user_id, reference, emotion_id, created_at |
| collections | id, user_id, name, created_at |
| collection_verses | collection_id, saved_verse_id |
| mood_entries | id, user_id, emotion_id, sub_emotion_id, note, created_at |
| activity_days | user_id, date |
| badges | user_id, badge_key, earned_at |

Supabase Auth and Postgres arrive in Step 4. Every table requires RLS with ownership checks, including related collection rows.

## Streaks and badges
A streak day counts when a logged-in user picks an emotion or saves a verse. One grace day per week preserves a streak after one missed day. Badges: 3, 7, 30, and 100 day streaks; first saved verse; 10 saved verses; first collection; first mood entry.

## Delivery
Use Next.js App Router, strict TypeScript, Tailwind CSS, shadcn/ui, and npm. Code lives in top-level `app/`, without `src/`. Deploy on Vercel. Work through the progress checklist one step at a time. Step 1 contains placeholders only, with no content selection, fetching, authentication, or persistence.
