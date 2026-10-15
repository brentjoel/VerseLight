import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';

// Node strips TypeScript but needs explicit resolution for bundler-style relative imports.
registerHooks({ resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) return nextResolve(`${specifier}.ts`, context);
  return nextResolve(specifier, context);
} });
const { PersonalStore, readBackup } = await import('../lib/storage.ts');
const { MAX_BYTES, MAX_RECORDS, emptyData, validatePersonalData } = await import('../lib/storage-schema.ts');
const { migrateVersioned } = await import('../lib/storage-migrations.ts');
const preferences = { theme: 'dark', preferredTranslation: 'nlt' };
const saveInput = { reference: 'Philippians 4:6-7', translationId: 'nlt', emotionId: 'anxious', specificEmotionId: 'worried-about-the-future' };
// Derive the fixture feeling from curated data rather than duplicating identifiers.
const { default: emotions } = await import('../data/emotions.json', { with: { type: 'json' } });
const matching = emotions.flatMap(e => e.specifics.map(s => ({ e, s }))).find(({ s }) => s.references.includes(saveInput.reference));
saveInput.emotionId = matching.e.id; saveInput.specificEmotionId = matching.s.id;
function memory(initial = null) {
  return { raw: initial, readFails: false, writeFails: false, writes: 0,
    read() { if (this.readFails) throw new Error('TEST_STORAGE_DISABLED'); return this.raw; },
    write(value) { if (this.writeFails) throw new Error('TEST_QUOTA'); this.raw = value; this.writes++; },
  };
}
function setup(port = memory(), prefs = {}) {
  const applied = [];
  const store = new PersonalStore(port, value => applied.push(value), () => ({ localDate: '2026-10-15', instant: '2026-10-15T12:00:00.000Z', utcOffsetMinutes: 0 }));
  store.initialize(prefs);
  return { store, port, applied };
}
function backup(data = emptyData(preferences)) {
  return { format: 'verselight-backup', schemaVersion: 1, exportedAt: new Date().toISOString(), data };
}
function goodEnvelope() { return JSON.stringify({ schemaVersion: 1, revision: 0, updatedAt: new Date().toISOString(), data: emptyData(preferences) }); }

test('save, reload, collection membership and deletion round trip without verse text', async () => {
  const { store, port } = setup();
  assert.equal((await store.save(saveInput)).ok, true);
  const saved = store.getSnapshot().envelope.data.savedVerses[0];
  assert.equal((await store.save(saveInput)).ok, true);
  assert.equal(store.getSnapshot().envelope.data.savedVerses.length, 1);
  await store.createCollection('  Quiet mornings  ');
  const collection = store.getSnapshot().envelope.data.collections[0];
  assert.equal(collection.name, 'Quiet mornings');
  await store.setMembership(collection.id, saved.id, true);
  await store.setMembership(collection.id, saved.id, true);
  await store.renameCollection(collection.id, 'Hope');
  const reloaded = setup(port).store;
  assert.deepEqual(reloaded.getSnapshot().envelope.data.collections[0].savedVerseIds, [saved.id]);
  assert.equal(reloaded.getSnapshot().envelope.data.collections[0].name, 'Hope');
  assert.equal(Object.hasOwn(JSON.parse(port.raw).data.savedVerses[0], 'text'), false);
  assert.deepEqual(JSON.parse(port.raw).data.activityDays[0].sources, ['save']);
  await reloaded.removeSave(saved.id);
  assert.deepEqual(reloaded.getSnapshot().envelope.data.collections[0].savedVerseIds, []);
  await reloaded.save(saveInput);
  await reloaded.deleteCollection(collection.id);
  assert.equal(reloaded.getSnapshot().envelope.data.savedVerses.length, 1);
});

test('first-use preferences and validated backup replacement restore references and apply preferences', async () => {
  const { store, port } = setup(memory(), { theme: 'light', preferredTranslation: 'kjv' });
  assert.equal(store.getSnapshot().envelope.data.preferences.preferredTranslation, 'kjv');
  await store.save(saveInput);
  const exported = store.exportBackup();
  assert.equal(JSON.parse(exported).format, 'verselight-backup');
  const target = setup();
  const result = await target.store.importBackup(readBackup(exported), target.store.getSnapshot().envelope);
  assert.equal(result.ok, true);
  assert.deepEqual(target.store.getSnapshot().envelope.data, store.getSnapshot().envelope.data);
  assert.deepEqual(target.applied.at(-1), { theme: 'light', preferredTranslation: 'kjv' });
  const reload = setup(port, { theme: 'dark', preferredTranslation: 'web' }).store;
  assert.equal(reload.getSnapshot().envelope.data.preferences.preferredTranslation, 'web');
});

test('malformed, oversized, unknown and unsafe backups are rejected without writes', () => {
  const { port } = setup();
  const cases = ['not json', '{}', JSON.stringify({ ...backup(), schemaVersion: 99 }), JSON.stringify({ ...backup(), schemaVersion: 0 }), '{"__proto__":{}}', '{"data":{"constructor":{}}}', ' '.repeat(MAX_BYTES + 1)];
  for (const text of cases) assert.throws(() => readBackup(text));
  assert.equal(port.raw, null);
  assert.throws(() => readBackup('"' + 'é'.repeat(MAX_BYTES / 2) + '"'), /too large/);
});

test('validation rejects extra text, invalid timestamps, ids, translation, context, duplicates and dangling memberships', async () => {
  const { store } = setup(); await store.save(saveInput); await store.createCollection('Hope');
  const source = store.getSnapshot().envelope.data;
  const changes = [
    data => { data.savedVerses[0].text = 'TEST_FORBIDDEN_TEXT'; },
    data => { data.savedVerses[0].reference = 'NOT_A_REFERENCE'; },
    data => { data.savedVerses[0].translationId = 'niv'; },
    data => { data.savedVerses[0].id = 'not-an-id'; },
    data => { data.savedVerses[0].createdAt = '2026-02-30T00:00:00.000Z'; },
    data => { data.savedVerses[0].emotionId = 'sad'; },
    data => { delete data.savedVerses[0].specificEmotionId; },
    data => { data.savedVerses.push(structuredClone(data.savedVerses[0])); },
    data => { data.collections[0].savedVerseIds.push(crypto.randomUUID()); },
    data => { data.collections[0].savedVerseIds = [data.savedVerses[0].id, data.savedVerses[0].id]; },
    data => { data.collections[0].name = ' '; },
    data => { data.collections[0].name = 'x'.repeat(81); },
    data => { data.savedVerses = Array(MAX_RECORDS + 1).fill(data.savedVerses[0]); },
    data => { data.moodEntries = [{}]; },
    data => { data.streakState.currentStreak = -1; },
  ];
  for (const change of changes) { const copy = structuredClone(source); change(copy); assert.throws(() => validatePersonalData(copy)); }
});

test('migrations run sequentially on copies and reject missing, future or non-advancing steps', () => {
  const original = { schemaVersion: 0, data: {} };
  const steps = {
    0: value => { value.data.first = true; return { ...value, schemaVersion: 1 }; },
    1: value => ({ ...value, schemaVersion: 2, data: { ...value.data, second: true } }),
  };
  assert.deepEqual(migrateVersioned(original, steps, 2), { schemaVersion: 2, data: { first: true, second: true } });
  assert.deepEqual(original, { schemaVersion: 0, data: {} });
  assert.throws(() => migrateVersioned(original));
  assert.throws(() => migrateVersioned({ schemaVersion: 99 }));
  assert.throws(() => migrateVersioned(original, { 0: value => value }));
});

test('unavailable and quota-limited storage keeps session edits exportable without replacing persisted data', async () => {
  const disabled = memory(); disabled.readFails = true;
  const session = setup(disabled).store;
  assert.equal(session.getSnapshot().mode, 'memory');
  assert.equal((await session.save(saveInput)).ok, true);
  assert.equal(readBackup(session.exportBackup()).data.savedVerses.length, 1);
  assert.equal(disabled.raw, null);
  const full = memory(goodEnvelope()); const before = full.raw;
  const limited = setup(full).store; full.writeFails = true;
  await limited.save(saveInput);
  assert.equal(limited.getSnapshot().mode, 'memory');
  assert.equal(limited.getSnapshot().envelope.data.savedVerses.length, 1);
  assert.equal(full.raw, before);
});

test('failed import, stale preview and invalid mutations leave persisted and visible records intact', async () => {
  const { store, port, applied } = setup(memory(goodEnvelope()));
  const original = port.raw; const baseline = store.getSnapshot().envelope;
  port.writeFails = true;
  const incoming = backup(); incoming.data.preferences.theme = 'light';
  assert.equal((await store.importBackup(incoming, baseline)).ok, false);
  assert.equal(port.raw, original);
  assert.equal(store.getSnapshot().envelope, baseline);
  assert.equal(applied.length, 0);
  port.writeFails = false;
  await store.createCollection('Hope');
  const changed = port.raw;
  assert.equal((await store.importBackup(incoming, baseline)).ok, false);
  assert.equal((await store.createCollection('   ')).ok, false);
  assert.equal(port.raw, changed);
});

test('unreadable or unsupported persisted data stays intact until explicit recovery reset', async () => {
  for (const raw of ['{broken', JSON.stringify({ ...JSON.parse(goodEnvelope()), schemaVersion: 99 })]) {
    const { store, port } = setup(memory(raw));
    assert.equal(store.getSnapshot().mode, 'blocked');
    assert.equal(store.recoveryText(), raw);
    assert.equal((await store.save(saveInput)).ok, false);
    assert.equal(port.raw, raw);
    assert.throws(() => store.exportBackup());
    port.writeFails = true; assert.equal((await store.reset()).ok, false); assert.equal(port.raw, raw);
    port.writeFails = false; assert.equal((await store.reset()).ok, true);
    assert.equal(store.getSnapshot().mode, 'persistent');
  }
});

test('cross-tab changes, equal-revision differences and external clearing block overwrites', async () => {
  const port = memory(goodEnvelope());
  const first = setup(port).store; const second = setup(port).store;
  await first.save(saveInput);
  assert.equal((await second.createCollection('Would overwrite')).ok, false);
  assert.equal(second.getSnapshot().mode, 'conflict');
  second.reload(); assert.equal(second.getSnapshot().envelope.data.savedVerses.length, 1);
  const changed = JSON.parse(port.raw); changed.data.preferences.theme = 'light'; port.raw = JSON.stringify(changed);
  second.checkExternal(); assert.equal(second.getSnapshot().mode, 'conflict');
  second.reload(); port.raw = null; second.checkExternal();
  assert.equal(second.getSnapshot().mode, 'conflict');
  assert.equal((await second.save(saveInput)).ok, false);
  assert.equal(port.raw, null);
});

test('cooperating tab lock serializes edits and rejects the stale writer', async () => {
  const port = memory(goodEnvelope()); let tail = Promise.resolve();
  port.exclusive = work => { const current = tail.then(work); tail = current.then(() => {}, () => {}); return current; };
  const first = setup(port).store; const second = setup(port).store;
  const outcomes = await Promise.all([first.save(saveInput), second.createCollection('Hope')]);
  assert.deepEqual(outcomes.map(value => value.ok), [true, false]);
  assert.equal(JSON.parse(port.raw).data.savedVerses.length, 1);
});


test('session fallback does not require browser locks and invalid import content cannot replace data', async () => {
  const port = memory(); port.readFails = true;
  port.exclusive = async () => { throw new Error('TEST_LOCKS_DISABLED'); };
  const { store } = setup(port);
  assert.equal((await store.save(saveInput)).ok, true);
  const original = store.getSnapshot().envelope;
  const invalid = backup(); invalid.data.savedVerses = [{ text: 'TEST_FORBIDDEN_TEXT' }];
  assert.equal((await store.importBackup(invalid, original)).ok, false);
  assert.equal(store.getSnapshot().envelope, original);
  assert.equal(port.raw, null);
});


test('browser bridge reads only after initialization and mirrors only theme and translation', async () => {
  const names = ['document', 'window', 'localStorage', 'location'];
  const descriptors = names.map(name => Object.getOwnPropertyDescriptor(globalThis, name));
  const writes = []; const events = []; let reads = 0;
  try {
    Object.defineProperty(globalThis, 'document', { configurable: true, value: { cookie: 'translation=web', documentElement: { dataset: { theme: 'light' } } } });
    Object.defineProperty(globalThis, 'window', { configurable: true, value: { dispatchEvent(event) { events.push(event.type); } } });
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem() { reads++; return null; }, setItem(key, value) { writes.push([key, value]); } } });
    Object.defineProperty(globalThis, 'location', { configurable: true, value: { protocol: 'https:' } });
    const bridge = await import('../lib/browser-storage.ts');
    const store = bridge.getPersonalStore(); store.getSnapshot();
    assert.equal(reads, 0);
    assert.deepEqual(bridge.readBrowserPreferences(), { theme: 'light', preferredTranslation: 'web' });
    store.initialize(bridge.readBrowserPreferences()); assert.equal(reads, 1);
    bridge.applyBrowserPreferences({ theme: 'dark', preferredTranslation: 'bsb' });
    assert.equal(document.documentElement.dataset.theme, 'dark');
    assert.deepEqual(writes, [['verselight-theme', 'dark']]);
    assert.equal(document.cookie, 'translation=bsb; Path=/; Max-Age=31536000; SameSite=Lax; Secure');
    assert.deepEqual(events, ['translation-change']);
    document.cookie = 'translation=not-active';
    assert.equal(bridge.readBrowserPreferences().preferredTranslation, 'nlt');
  } finally {
    names.forEach((name, index) => { if (descriptors[index]) Object.defineProperty(globalThis, name, descriptors[index]); else delete globalThis[name]; });
  }
});
