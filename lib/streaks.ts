import type { ActivityDay, StreakState } from "./storage-schema";

export interface LocalClock { localDate: string; instant: string; utcOffsetMinutes: number }
export function localClock(now = new Date()): LocalClock {
  return { localDate: `${now.getFullYear().toString().padStart(4, "0")}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`, instant: now.toISOString(), utcOffsetMinutes: -now.getTimezoneOffset() };
}
// UTC arithmetic represents calendar labels only, never elapsed local-day duration.
export function shiftDate(date: string, days: number): string {
  return new Date(Date.parse(`${date}T00:00:00.000Z`) + days * 86400000).toISOString().slice(0, 10);
}
export function validLocalDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T00:00:00.000Z`)) && shiftDate(value, 0) === value;
}
export function weekOf(date: string): string {
  const day = new Date(`${date}T00:00:00.000Z`).getUTCDay();
  return shiftDate(date, -((day + 6) % 7));
}
export function clockIsBehind(state: StreakState, clock: LocalClock): boolean {
  return Boolean((state.maxObservedAt && clock.instant < state.maxObservedAt) || (state.maxObservedLocalDate && clock.localDate < state.maxObservedLocalDate));
}
export function deriveStreak(days: readonly ActivityDay[], today: string): StreakState {
  const dates = [...new Set(days.map(day => day.localDate))].sort();
  const weeks = new Set<string>();
  const graceDates: string[] = [];
  let currentStreak = 0, longestStreak = 0;
  let previous: string | undefined;
  for (const date of dates) {
    if (!previous || date === shiftDate(previous, 1)) currentStreak++;
    else {
      const missed = shiftDate(previous, 1);
      if (date === shiftDate(previous, 2) && !weeks.has(weekOf(missed))) {
        weeks.add(weekOf(missed)); graceDates.push(missed); currentStreak++;
      } else currentStreak = 1;
    }
    longestStreak = Math.max(longestStreak, currentStreak); previous = date;
  }
  if (previous && today > shiftDate(previous, 1)) {
    const pending = shiftDate(previous, 1);
    if (today > shiftDate(previous, 2) || weeks.has(weekOf(pending))) currentStreak = 0;
  }
  return { currentStreak, longestStreak, graceDates, ...(previous ? { lastActiveDate: previous } : {}) };
}
export function recordActivity(days: ActivityDay[], source: "emotion" | "save", clock: LocalClock): void {
  const day = days.find(day => day.localDate === clock.localDate);
  if (day) { if (!day.sources.includes(source)) day.sources.push(source); }
  else days.push({ localDate: clock.localDate, firstActivityAt: clock.instant, utcOffsetMinutes: clock.utcOffsetMinutes, sources: [source] });
}
