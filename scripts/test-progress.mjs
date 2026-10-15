import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, nextResolve) {
  return nextResolve(specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier) ? `${specifier}.ts` : specifier, context);
} });
const { deriveStreak, localClock, recordActivity, weekOf } = await import('../lib/streaks.ts');
const { awardBadges } = await import('../lib/badges.ts');
const { emptyData, validatePersonalData } = await import('../lib/storage-schema.ts');
const { PersonalStore, readBackup } = await import('../lib/storage.ts');
const { default: emotions } = await import('../data/emotions.json', { with: { type: 'json' } });
const prefs = { theme: 'dark', preferredTranslation: 'web' };
const emotion = emotions[0], feeling = emotion.specifics[0];
const clock = date => ({ localDate: date, instant: `${date}T12:00:00.000Z`, utcOffsetMinutes: 0 });
const days = (...dates) => dates.map(date => ({ localDate: date, firstActivityAt: clock(date).instant, utcOffsetMinutes: 0, sources: ['emotion'] }));
function setup(date = '2026-10-12', raw = null) {
  let now = clock(date);
  const port = { raw, read() { return this.raw; }, write(value) { this.raw = value; } };
  const store = new PersonalStore(port, () => {}, () => now); store.initialize();
  return { store, port, setClock(value) { now = typeof value === 'string' ? clock(value) : value; } };
}

test('empty ledger, daily retries and merged activity sources never invent days', () => {
  assert.equal(deriveStreak([], '2026-10-12').currentStreak, 0);
  const ledger = []; recordActivity(ledger, 'save', clock('2026-10-12')); recordActivity(ledger, 'save', clock('2026-10-12')); recordActivity(ledger, 'emotion', clock('2026-10-12'));
  assert.equal(ledger.length, 1); assert.deepEqual(ledger[0].sources, ['save', 'emotion']);
  assert.equal(deriveStreak(ledger, '2026-10-12').currentStreak, 1);
});
test('one missed date bridges once, used weekly grace and larger gaps break continuity', () => {
  const ledger = days('2026-10-12', '2026-10-14', '2026-10-16');
  const state = deriveStreak(ledger, '2026-10-16');
  assert.deepEqual(state.graceDates, ['2026-10-13']); assert.equal(state.longestStreak, 2); assert.equal(state.currentStreak, 1);
  assert.deepEqual(deriveStreak(ledger, '2026-10-16'), state);
  assert.equal(deriveStreak(days('2026-10-12', '2026-10-15'), '2026-10-15').currentStreak, 1);
});
test('pending grace stays visible without being consumed and expires without return', () => {
  const ledger = days('2026-10-12');
  assert.equal(deriveStreak(ledger, '2026-10-14').currentStreak, 1);
  assert.deepEqual(deriveStreak(ledger, '2026-10-14').graceDates, []);
  assert.equal(deriveStreak(ledger, '2026-10-15').currentStreak, 0);
  assert.equal(deriveStreak(days('2026-10-12', '2026-10-14'), '2026-10-16').currentStreak, 0);
});
test('Sunday grace belongs to prior week; Monday grace belongs to new week', () => {
  assert.equal(weekOf('2026-10-18'), '2026-10-12'); assert.equal(weekOf('2026-10-19'), '2026-10-19');
  const state = deriveStreak(days('2026-10-17', '2026-10-19', '2026-10-21'), '2026-10-21');
  assert.equal(state.currentStreak, 3); assert.deepEqual(state.graceDates, ['2026-10-18', '2026-10-20']);
  const exhausted = deriveStreak(days('2026-10-12', '2026-10-14', '2026-10-17', '2026-10-19'), '2026-10-19');
  assert.equal(exhausted.currentStreak, 1); assert.deepEqual(exhausted.graceDates, ['2026-10-13']);
});
test('leap day and year boundaries use calendar dates', () => {
  assert.equal(deriveStreak(days('2024-02-28', '2024-02-29', '2024-03-01'), '2024-03-01').currentStreak, 3);
  const state = deriveStreak(days('2025-12-31', '2026-01-02'), '2026-01-02');
  assert.equal(state.currentStreak, 2); assert.deepEqual(state.graceDates, ['2026-01-01']);
});
test('device dates and offsets across 23-hour and 25-hour DST days', () => {
  const previous = process.env.TZ;
  try {
    process.env.TZ = 'America/New_York';
    const spring = [new Date(2026, 2, 7, 12), new Date(2026, 2, 8, 12)];
    assert.equal(spring[1] - spring[0], 23 * 3600000);
    const fall = [new Date(2026, 9, 31, 12), new Date(2026, 10, 1, 12)];
    assert.equal(fall[1] - fall[0], 25 * 3600000);
    for (const pair of [spring, fall]) {
      const ledger = []; pair.forEach(now => recordActivity(ledger, 'emotion', localClock(now)));
      assert.equal(deriveStreak(ledger, localClock(pair[1]).localDate).currentStreak, 2);
      assert.notEqual(ledger[0].utcOffsetMinutes, ledger[1].utcOffsetMinutes);
    }
    assert.equal(localClock(new Date('2026-10-15T01:00:00.000Z')).localDate, '2026-10-14');
  } finally { if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous; }
});
test('backward timestamps and local dates freeze accrual until both catch up', async () => {
  const context = setup(); const { store } = context;
  await store.recordMood(emotion.id, feeling.id);
  const before = structuredClone(store.getSnapshot().envelope.data);
  for (const value of ['2026-10-11', { ...clock('2026-10-12'), instant: '2026-10-12T11:59:00.000Z' }]) {
    context.setClock(value); store.refreshProgress();
    assert.equal(store.getSnapshot().clockNotice, true);
    assert.equal((await store.recordMood(emotion.id, feeling.id)).ok, false);
    await store.createCollection('Quiet');
    assert.deepEqual(store.getSnapshot().envelope.data.activityDays, before.activityDays);
    assert.deepEqual(store.getSnapshot().envelope.data.badges, before.badges);
    assert.deepEqual(store.getSnapshot().envelope.data.streakState, before.streakState);
  }
  context.setClock('2026-10-13'); await store.recordMood(emotion.id, feeling.id);
  assert.equal(store.getSnapshot().clockNotice, false);
  assert.equal(store.getSnapshot().envelope.data.streakState.currentStreak, 2);
});
test('forward travel records the real gap, backward timezone travel preserves history', async () => {
  const context = setup(); await context.store.recordMood(emotion.id, feeling.id);
  const original = structuredClone(context.store.getSnapshot().envelope.data.activityDays[0]);
  context.setClock({ localDate: '2026-10-11', instant: '2026-10-12T13:00:00.000Z', utcOffsetMinutes: -840 });
  assert.equal((await context.store.recordMood(emotion.id, feeling.id)).ok, false);
  context.setClock({ localDate: '2026-11-01', instant: '2026-11-01T00:30:00.000Z', utcOffsetMinutes: 840 });
  await context.store.recordMood(emotion.id, feeling.id);
  assert.equal(context.store.getSnapshot().envelope.data.streakState.currentStreak, 1);
  assert.equal(context.store.getSnapshot().envelope.data.activityDays.length, 2);
  assert.deepEqual(context.store.getSnapshot().envelope.data.activityDays[0], original);
});
test('badges award once, all streak thresholds count active days, removal retains milestones', async () => {
  const data = emptyData(prefs); data.streakState.longestStreak = 100;
  data.badges = awardBadges(data, clock('2026-10-12').instant);
  assert.deepEqual(data.badges.map(b => b.key), ['streak-3', 'streak-7', 'streak-30', 'streak-100']);
  assert.deepEqual(awardBadges(data, clock('2026-10-13').instant), data.badges);
  const { store } = setup(); await store.recordMood(emotion.id, feeling.id);
  const mood = store.getSnapshot().envelope.data.moodEntries[0];
  await store.removeMood(mood.id);
  assert.equal(store.getSnapshot().envelope.data.badges[0].key, 'first-mood');
  assert.equal(store.getSnapshot().envelope.data.activityDays.length, 1);
});
test('journal notes and all progress round trip; imports recompute forged derived totals/grace', async () => {
  const context = setup(); const { store } = context;
  await store.recordMood(emotion.id, feeling.id);
  await store.editMood(store.getSnapshot().envelope.data.moodEntries[0].id, 'TEST_PRIVATE_NOTE');
  context.setClock('2026-10-14'); await store.recordMood(emotion.id, feeling.id);
  const incoming = readBackup(store.exportBackup());
  const target = setup('2026-10-14');
  assert.equal((await target.store.importBackup(incoming, target.store.getSnapshot().envelope)).ok, true);
  assert.deepEqual(target.store.getSnapshot().envelope.data, store.getSnapshot().envelope.data);
  incoming.data.streakState.currentStreak = 999; incoming.data.streakState.longestStreak = 999; incoming.data.streakState.graceDates = ['2026-10-01'];
  const normalized = readBackup(JSON.stringify(incoming));
  assert.equal(normalized.data.streakState.longestStreak, 2); assert.deepEqual(normalized.data.streakState.graceDates, ['2026-10-13']);
  assert.equal((await store.editMood(store.getSnapshot().envelope.data.moodEntries[0].id, 'x'.repeat(2001))).ok, false);
});
test('invalid dates, sources, notes, feelings, offsets, clock metadata and duplicate badges reject imports intact', async () => {
  const { store, port } = setup(); await store.recordMood(emotion.id, feeling.id);
  const source = store.getSnapshot().envelope.data, original = port.raw;
  for (const edit of [
    d => { d.moodEntries[0].localDate = '2026-02-30'; }, d => { d.moodEntries[0].note = 'x'.repeat(2001); },
    d => { d.moodEntries[0].specificEmotionId = 'unknown'; }, d => { d.activityDays[0].sources = ['unknown']; },
    d => { d.activityDays.push(d.activityDays[0]); }, d => { d.activityDays[0].utcOffsetMinutes = 9999; },
    d => { d.activityDays[0].localDate = '2026-10-13'; }, d => { d.badges.push(d.badges[0]); },
    d => { d.badges[0].key = 'unknown'; }, d => { d.streakState.maxObservedAt = 'not-a-date'; },
    d => { delete d.streakState.maxObservedLocalDate; },
  ]) {
    const data = structuredClone(source); edit(data); assert.throws(() => validatePersonalData(data));
    assert.equal((await store.importBackup({ format: 'verselight-backup', schemaVersion: 1, exportedAt: clock('2026-10-12').instant, data }, store.getSnapshot().envelope)).ok, false);
    assert.equal(port.raw, original);
  }
});
test('Step 4 empty progress schema remains compatible without synthesizing past activity', () => {
  const old = { format: 'verselight-backup', schemaVersion: 1, exportedAt: clock('2026-10-12').instant, data: emptyData(prefs) };
  const loaded = readBackup(JSON.stringify(old)); assert.deepEqual(loaded, old);
});
test('note edits add no days; reload expires stale streaks and keeps historical longest', async () => {
  const context = setup(); await context.store.recordMood(emotion.id, feeling.id);
  const mood = context.store.getSnapshot().envelope.data.moodEntries[0];
  context.setClock('2026-10-13'); await context.store.editMood(mood.id, 'TEST_NOTE_EDIT');
  assert.equal(context.store.getSnapshot().envelope.data.activityDays.length, 1);
  const reloaded = setup('2026-10-16', context.port.raw).store;
  assert.equal(reloaded.getSnapshot().envelope.data.streakState.currentStreak, 0);
  assert.equal(reloaded.getSnapshot().envelope.data.streakState.longestStreak, 1);
});
test('save/collection badges and mixed daily activity are unique and survive removals', async () => {
  const { store } = setup(); await store.recordMood(emotion.id, feeling.id);
  const references = [...new Set(emotions.flatMap(e => e.specifics.flatMap(s => s.references)))].slice(0, 10);
  for (const reference of references) await store.save({ reference, translationId: 'web' });
  await store.createCollection('Hope');
  const data = store.getSnapshot().envelope.data;
  assert.equal(data.activityDays.length, 1); assert.deepEqual(data.activityDays[0].sources, ['emotion', 'save']);
  assert.deepEqual(new Set(data.badges.map(b => b.key)), new Set(['first-mood', 'first-save', 'saved-10', 'first-collection']));
  await store.removeSave(data.savedVerses[0].id); await store.deleteCollection(data.collections[0].id);
  assert.deepEqual(store.getSnapshot().envelope.data.badges, data.badges);
});
test('future-clock import freezes accrual, while all imported records remain intact', async () => {
  const source = setup('2026-10-20'); await source.store.recordMood(emotion.id, feeling.id);
  const target = setup('2026-10-12');
  const backup = readBackup(source.store.exportBackup());
  assert.equal((await target.store.importBackup(backup, target.store.getSnapshot().envelope)).ok, true);
  assert.equal(target.store.getSnapshot().clockNotice, true);
  assert.equal((await target.store.recordMood(emotion.id, feeling.id)).ok, false);
  assert.deepEqual(target.store.getSnapshot().envelope.data, backup.data);
});
