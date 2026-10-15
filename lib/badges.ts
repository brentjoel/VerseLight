import type { Badge, PersonalData } from "./storage-schema";

export const BADGES = {
  "streak-3": "3 active days together", "streak-7": "7 active days together",
  "streak-30": "30 active days together", "streak-100": "100 active days together",
  "first-save": "First saved verse", "saved-10": "10 saved verses",
  "first-collection": "First collection", "first-mood": "First reflection",
} as const;
export function awardBadges(data: PersonalData, earnedAt: string): Badge[] {
  const keys = new Set(data.badges.map(badge => badge.key));
  const badges = [...data.badges];
  const award = (key: keyof typeof BADGES, qualifies: boolean) => {
    if (qualifies && !keys.has(key)) { badges.push({ key, earnedAt }); keys.add(key); }
  };
  for (const count of [3, 7, 30, 100] as const) award(`streak-${count}`, data.streakState.longestStreak >= count);
  award("first-save", data.savedVerses.length > 0); award("saved-10", data.savedVerses.length >= 10);
  award("first-collection", data.collections.length > 0); award("first-mood", data.moodEntries.length > 0);
  return badges;
}
