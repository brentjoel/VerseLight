import emotions from "../data/emotions.json" with { type: "json" };
import { isTranslationId, type TranslationId } from "./translations";

export const STORAGE_KEY = "verselight-data";
export const SCHEMA_VERSION = 1;
export const MAX_BYTES = 5 * 1024 * 1024;
export const MAX_RECORDS = 10000;
export interface Preferences { theme: "dark" | "light"; preferredTranslation: TranslationId }
export interface SavedVerse {
  id: string; reference: string; translationId: TranslationId;
  emotionId?: string; specificEmotionId?: string; createdAt: string;
}
export interface Collection { id: string; name: string; savedVerseIds: string[]; createdAt: string; updatedAt: string }
// Reserved Step 5 slots are deliberately empty in schema 1. No activity is recorded yet.
export interface PersonalData {
  preferences: Preferences; savedVerses: SavedVerse[]; collections: Collection[];
  moodEntries: never[]; activityDays: never[]; badges: never[];
  streakState: { currentStreak: 0; longestStreak: 0; graceDates: never[] };
}
export interface StorageEnvelope { schemaVersion: 1; revision: number; updatedAt: string; data: PersonalData }
export interface Backup { format: "verselight-backup"; schemaVersion: 1; exportedAt: string; data: PersonalData }

const references = new Set(emotions.flatMap(e => e.specifics.flatMap(s => s.references)));
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function requireValid(condition: unknown, message = "This data is not a supported Verselight backup."): asserts condition {
  if (!condition) throw new Error(message);
}
export function object(value: unknown, required: string[], optional: string[] = []): Record<string, unknown> {
  requireValid(typeof value === "object" && value !== null && !Array.isArray(value));
  const record = value as Record<string, unknown>;
  requireValid(required.every(key => Object.hasOwn(record, key)));
  requireValid(Object.keys(record).every(key => [...required, ...optional].includes(key)));
  return record;
}
function list(value: unknown): unknown[] {
  requireValid(Array.isArray(value) && value.length <= MAX_RECORDS, "A list is too large or unreadable.");
  return value;
}
function timestamp(value: unknown) {
  requireValid(typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value, "A saved date is invalid.");
}
function id(value: unknown) { requireValid(typeof value === "string" && uuid.test(value), "A record has an invalid id."); }
function unique(values: unknown[]) { requireValid(new Set(values).size === values.length, "Some records are duplicated."); }
function empty(value: unknown) {
  requireValid(list(value).length === 0, "This file contains journal or progress features that this version cannot import yet.");
}
export function validatePersonalData(input: unknown): PersonalData {
  const data = object(input, ["preferences", "savedVerses", "collections", "moodEntries", "activityDays", "streakState", "badges"]);
  const prefs = object(data.preferences, ["theme", "preferredTranslation"]);
  requireValid((prefs.theme === "dark" || prefs.theme === "light") && isTranslationId(prefs.preferredTranslation), "A preference is invalid.");
  const saves = list(data.savedVerses);
  for (const value of saves) {
    const save = object(value, ["id", "reference", "translationId", "createdAt"], ["emotionId", "specificEmotionId"]);
    id(save.id); timestamp(save.createdAt);
    requireValid(typeof save.reference === "string" && references.has(save.reference) && isTranslationId(save.translationId), "A saved reference or translation is unavailable.");
    if (Object.hasOwn(save, "emotionId") || Object.hasOwn(save, "specificEmotionId")) {
      const specific = emotions.find(e => e.id === save.emotionId)?.specifics.find(s => s.id === save.specificEmotionId);
      requireValid(specific && specific.references.some(ref => ref === save.reference), "A saved feeling does not match its reference.");
    }
  }
  const typedSaves = saves as SavedVerse[];
  unique(typedSaves.map(s => s.id));
  unique(typedSaves.map(s => `${s.reference}:${s.translationId}`));
  const saveIds = new Set(typedSaves.map(s => s.id));
  const collections = list(data.collections);
  for (const value of collections) {
    const collection = object(value, ["id", "name", "savedVerseIds", "createdAt", "updatedAt"]);
    id(collection.id); timestamp(collection.createdAt); timestamp(collection.updatedAt);
    requireValid(typeof collection.name === "string" && collection.name === collection.name.trim() && collection.name.length > 0 && collection.name.length <= 80, "Collection names need 1 to 80 characters.");
    const members = list(collection.savedVerseIds);
    requireValid(members.every(member => typeof member === "string" && saveIds.has(member)), "A collection points to a missing saved verse.");
    unique(members);
  }
  unique((collections as Collection[]).map(c => c.id));
  empty(data.moodEntries); empty(data.activityDays); empty(data.badges);
  const streak = object(data.streakState, ["currentStreak", "longestStreak", "graceDates"]);
  requireValid(streak.currentStreak === 0 && streak.longestStreak === 0, "Progress records are not supported in this version yet.");
  empty(streak.graceDates);
  // All nested values have been validated, including the intentionally empty future slots.
  return structuredClone(data) as unknown as PersonalData;
}
export function emptyData(preferences: Preferences): PersonalData {
  return { preferences: { ...preferences }, savedVerses: [], collections: [], moodEntries: [], activityDays: [], badges: [], streakState: { currentStreak: 0, longestStreak: 0, graceDates: [] } };
}
export function checkSize(text: string) {
  requireValid(new TextEncoder().encode(text).byteLength <= MAX_BYTES, "This file is too large. The limit is 5 MiB.");
}
export function parseJson(text: string): unknown {
  checkSize(text);
  try {
    return JSON.parse(text, (key: string, value: unknown) => {
      requireValid(!["__proto__", "prototype", "constructor"].includes(key), "This file contains an unsafe field.");
      return value;
    }) as unknown;
  } catch (error) {
    if (error instanceof SyntaxError) throw new Error("This file is not readable JSON.");
    throw error;
  }
}
export function validateEnvelope(input: unknown): StorageEnvelope {
  const value = object(input, ["schemaVersion", "revision", "updatedAt", "data"]);
  requireValid(value.schemaVersion === SCHEMA_VERSION, "This data version is not supported. Keep the original file for a compatible version.");
  requireValid(Number.isSafeInteger(value.revision) && Number(value.revision) >= 0, "The saved revision is invalid.");
  timestamp(value.updatedAt);
  return { schemaVersion: SCHEMA_VERSION, revision: value.revision as number, updatedAt: value.updatedAt as string, data: validatePersonalData(value.data) };
}
export function validateBackup(input: unknown): Backup {
  const value = object(input, ["format", "schemaVersion", "exportedAt", "data"]);
  requireValid(value.format === "verselight-backup" && value.schemaVersion === SCHEMA_VERSION, "This backup format or version is not supported.");
  timestamp(value.exportedAt);
  return { format: "verselight-backup", schemaVersion: SCHEMA_VERSION, exportedAt: value.exportedAt as string, data: validatePersonalData(value.data) };
}
