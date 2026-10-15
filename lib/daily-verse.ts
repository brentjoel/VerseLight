// Calendar arithmetic uses local date parts, then UTC only to avoid DST-sized days.
export function localDayOfYear(date: Date): number {
  if (!Number.isFinite(date.getTime())) throw new Error("Invalid local date.");
  return Math.round((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 1)) / 86_400_000) + 1;
}

export function dailyReference(date: Date, references: readonly string[]): string | undefined {
  const day = localDayOfYear(date);
  return references.length ? references[(day - 1) % references.length] : undefined;
}
