import { migrateVersioned } from "./storage-migrations";
import { clockIsBehind, deriveStreak, localClock, recordActivity, type LocalClock } from "./streaks";
import { awardBadges } from "./badges";
import { checkSize, emptyData, parseJson, requireValid, SCHEMA_VERSION, validateBackup, validateEnvelope, validatePersonalData, type Backup, type PersonalData, type Preferences, type SavedVerse, type StorageEnvelope } from "./storage-schema";

export interface StoragePort {
  read(): string | null;
  write(value: string): void;
  exclusive?<T>(work: () => T): Promise<T>;
}
export type StorageMode = "persistent" | "memory" | "blocked" | "conflict";
export interface StorageSnapshot { ready: boolean; mode: StorageMode; envelope: StorageEnvelope; message?: string; clockNotice?: boolean }
export type StorageResult = { ok: true } | { ok: false; error: string };
const defaults: Preferences = { theme: "dark", preferredTranslation: "nlt" };
function envelope(data: PersonalData, revision = 0): StorageEnvelope {
  return { schemaVersion: SCHEMA_VERSION, revision, updatedAt: new Date().toISOString(), data };
}
export const serverStorageSnapshot: StorageSnapshot = { ready: false, mode: "persistent", envelope: envelope(emptyData(defaults)) };
function freeze<T>(value: T): T {
  if (value && typeof value === "object") { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
function message(error: unknown) { return error instanceof Error ? error.message : "Something could not be saved. Please try again."; }
export function readBackup(text: string): Backup { return validateBackup(migrateVersioned(parseJson(text))); }
function serializeBackup(data: PersonalData) {
  const backup: Backup = { format: "verselight-backup", schemaVersion: SCHEMA_VERSION, exportedAt: new Date().toISOString(), data };
  const text = JSON.stringify(backup, null, 2); checkSize(text); return text;
}

/** No browser globals or I/O during construction. Injected storage makes failure paths testable. */
export class PersonalStore {
  private state: StorageSnapshot = serverStorageSnapshot;
  private raw: string | null = null;
  private listeners = new Set<() => void>();
  private port: StoragePort;
  private applyPreferences: (preferences: Preferences) => void;
  private clock: () => LocalClock;
  constructor(port: StoragePort, applyPreferences: (preferences: Preferences) => void = () => {}, clock = localClock) {
    this.port = port; this.applyPreferences = applyPreferences; this.clock = clock;
  }
  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  private publish(next: StorageSnapshot) { this.state = freeze(next); this.listeners.forEach(listener => listener()); }
  initialize(preferences: Partial<Preferences> = {}) {
    if (this.state.ready) return;
    this.load(preferences);
  }
  reload(preferences: Partial<Preferences> = {}) { this.load(preferences); }
  private load(preferences: Partial<Preferences>) {
    let raw: string | null;
    try { raw = this.port.read(); }
    catch {
      this.raw = null;
      this.publish({ ready: true, mode: "memory", envelope: envelope(emptyData({ ...defaults, ...preferences })), message: "Browser storage is unavailable. Changes last only this session. Export a backup before leaving." });
      return;
    }
    this.raw = raw;
    try {
      const saved = raw === null ? envelope(emptyData(defaults)) : validateEnvelope(migrateVersioned(parseJson(raw)));
      const data = validatePersonalData({ ...saved.data, preferences: { ...saved.data.preferences, ...preferences } });
      const clock = this.clock();
      const clockNotice = clockIsBehind(data.streakState, clock);
      data.streakState = { ...data.streakState, ...deriveStreak(data.activityDays, clockNotice ? data.streakState.maxObservedLocalDate! : clock.localDate) };
      this.publish({ ready: true, mode: "persistent", envelope: { ...saved, data }, clockNotice });
    } catch {
      this.publish({ ready: true, mode: "blocked", envelope: envelope(emptyData({ ...defaults, ...preferences })), message: "Your saved data could not be opened safely. It has not been changed. Download the recovery file before choosing a fresh start." });
    }
  }
  checkExternal = () => {
    if (!this.state.ready || this.state.mode === "blocked" || this.state.mode === "conflict") return;
    try {
      if (this.port.read() !== this.raw) this.conflict();
    } catch {
      if (this.state.mode === "persistent") this.publish({ ...this.state, mode: "memory", message: "Browser storage is unavailable. Changes last only this session. Export a backup before leaving." });
    }
  };
  private conflict() {
    this.publish({ ...this.state, mode: "conflict", message: "Your saved data changed in another tab. Export this tab's copy if needed, then reload saved data before editing." });
  }
  private async transaction(work: () => StorageResult): Promise<StorageResult> {
    try { return this.state.mode !== "memory" && this.port.exclusive ? await this.port.exclusive(work) : work(); }
    catch { return { ok: false, error: "We could not safely access browser storage. Your saved data has not been replaced." }; }
  }
  private change(edit: (data: PersonalData, clock: LocalClock) => void, options: { replace?: boolean; expected?: StorageEnvelope; reset?: boolean } = {}): Promise<StorageResult> {
    return this.transaction(() => {
      if (!this.state.ready) return { ok: false, error: "Your saved data is still opening. Please try again." };
      if (this.state.mode === "conflict" || (this.state.mode === "blocked" && !options.reset)) return { ok: false, error: "Please resolve the storage notice before editing." };
      if (options.expected && options.expected !== this.state.envelope) return { ok: false, error: "Your data changed after the preview. Choose the backup again to review it." };
      if (this.state.mode !== "memory") {
        try {
          if (this.port.read() !== this.raw) { this.conflict(); return { ok: false, error: "Another tab changed your data. Reload saved data before editing." }; }
        } catch {
          this.publish({ ...this.state, mode: "memory", message: "Browser storage is unavailable. Changes last only this session. Export a backup before leaving." });
          if (options.replace || options.reset) return { ok: false, error: "Import or reset was not applied because storage became unavailable. Existing data is unchanged." };
        }
      }
      try {
        const data = structuredClone(this.state.envelope.data);
        const clock = this.clock();
        edit(data, clock);
        const clockNotice = clockIsBehind(data.streakState, clock);
        if (!clockNotice) {
          data.streakState = { ...data.streakState, ...deriveStreak(data.activityDays, clock.localDate), maxObservedAt: clock.instant, maxObservedLocalDate: clock.localDate };
          data.badges = awardBadges(data, clock.instant);
        }
        const next = validateEnvelope(envelope(validatePersonalData(data), this.state.envelope.revision + 1));
        const serialized = JSON.stringify(next); checkSize(serialized);
        serializeBackup(next.data); // Every accepted edit must remain exportable within the file limit.
        if (this.state.mode !== "memory") {
          try { this.port.write(serialized); this.raw = serialized; }
          catch {
            if (options.replace || options.reset) {
              this.publish({ ...this.state, message: "The replacement could not be saved. Your current data is unchanged. Free browser space or export a backup and try again." });
              return { ok: false, error: "The replacement could not be saved. Your current data is unchanged." };
            }
            this.publish({ ready: true, mode: "memory", envelope: next, clockNotice, message: "Your browser could not save these changes. They last only this session. Export a backup before leaving." });
            this.applyPreferences(next.data.preferences);
            return { ok: true };
          }
        }
        const mode = this.state.mode === "memory" ? "memory" : "persistent";
        this.publish({ ready: true, mode, envelope: next, clockNotice, ...(mode === "memory" ? { message: "Changes last only this session. Export a backup before leaving." } : {}) });
        this.applyPreferences(next.data.preferences);
        return { ok: true };
      } catch (error) { return { ok: false, error: message(error) }; }
    });
  }
  save(input: Omit<SavedVerse, "id" | "createdAt">) {
    return this.change((data, clock) => {
      if (!data.savedVerses.some(save => save.reference === input.reference && save.translationId === input.translationId)) data.savedVerses.push({ ...input, id: crypto.randomUUID(), createdAt: clock.instant });
      if (!clockIsBehind(data.streakState, clock)) recordActivity(data.activityDays, "save", clock);
    });
  }
  recordMood(emotionId: string, specificEmotionId: string) {
    return this.change((data, clock) => {
      requireValid(!clockIsBehind(data.streakState, clock), "Your device clock moved back. Your history is safe. New reflections can be recorded when time catches up.");
      data.moodEntries.push({ id: crypto.randomUUID(), emotionId, specificEmotionId, localDate: clock.localDate, createdAt: clock.instant });
      recordActivity(data.activityDays, "emotion", clock);
    });
  }
  editMood(id: string, note: string) {
    return this.change(data => { const mood = data.moodEntries.find(mood => mood.id === id); requireValid(mood, "This reflection is no longer here."); mood.note = note.trim(); });
  }
  removeMood(id: string) { return this.change(data => { data.moodEntries = data.moodEntries.filter(mood => mood.id !== id); }); }
  refreshProgress() {
    const snapshot = this.state;
    if (!snapshot.ready || snapshot.mode === "blocked" || snapshot.mode === "conflict") return;
    const clock = this.clock();
    const behind = clockIsBehind(snapshot.envelope.data.streakState, clock);
    if (behind) { if (!snapshot.clockNotice) this.publish({ ...snapshot, clockNotice: true }); return; }
    if (snapshot.clockNotice || snapshot.envelope.data.streakState.maxObservedAt !== clock.instant) void this.change(() => {});
  }
  removeSave(id: string) {
    return this.change(data => {
      requireValid(data.savedVerses.some(s => s.id === id), "This saved verse is no longer here.");
      data.savedVerses = data.savedVerses.filter(save => save.id !== id);
      data.collections.forEach(collection => { if (collection.savedVerseIds.includes(id)) { collection.savedVerseIds = collection.savedVerseIds.filter(member => member !== id); collection.updatedAt = new Date().toISOString(); } });
    });
  }
  createCollection(name: string) {
    return this.change(data => { const now = new Date().toISOString(); data.collections.push({ id: crypto.randomUUID(), name: name.trim(), savedVerseIds: [], createdAt: now, updatedAt: now }); });
  }
  renameCollection(id: string, name: string) {
    return this.change(data => { const collection = data.collections.find(c => c.id === id); requireValid(collection, "This collection is no longer here."); collection.name = name.trim(); collection.updatedAt = new Date().toISOString(); });
  }
  deleteCollection(id: string) { return this.change(data => { data.collections = data.collections.filter(c => c.id !== id); }); }
  setMembership(collectionId: string, savedVerseId: string, included: boolean) {
    return this.change(data => {
      const collection = data.collections.find(c => c.id === collectionId); requireValid(collection, "This collection is no longer here.");
      collection.savedVerseIds = collection.savedVerseIds.filter(id => id !== savedVerseId);
      if (included) collection.savedVerseIds.push(savedVerseId);
      collection.updatedAt = new Date().toISOString();
    });
  }
  setPreferences(preferences: Partial<Preferences>) { return this.change(data => { data.preferences = { ...data.preferences, ...preferences }; }); }
  exportBackup() {
    requireValid(this.state.ready && this.state.mode !== "blocked", "Please use the recovery download for unreadable data.");
    return serializeBackup(validatePersonalData(this.state.envelope.data));
  }
  importBackup(backup: Backup, expected: StorageEnvelope) {
    return this.change(data => { const validated = validateBackup(backup); Object.assign(data, validated.data); }, { replace: true, expected });
  }
  recoveryText() { return this.raw; }
  reset() { return this.change(data => { Object.assign(data, emptyData(data.preferences)); }, { reset: true }); }
}
