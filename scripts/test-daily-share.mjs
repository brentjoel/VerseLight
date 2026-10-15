import assert from 'node:assert/strict';
import test from 'node:test';
import { localDayOfYear, dailyReference } from '../lib/daily-verse.ts';
import { parseShareReference, shareCardHeight } from '../lib/share-card.ts';
import web from '../data/verses/web.json' with { type: 'json' };

const references = Object.keys(web).sort();

test('every local day including leap day and year end selects a known passage deterministically', () => {
  for (const year of [2024, 2025, 2026, 2000, 2100]) {
    let ordinal = 0;
    for (let date = new Date(year, 0, 1, 12); date.getFullYear() === year; date.setDate(date.getDate() + 1)) {
      ordinal++;
      assert.equal(localDayOfYear(date), ordinal);
      const reference = dailyReference(date, references);
      assert.ok(web[reference]?.trim());
      assert.equal(dailyReference(new Date(year, date.getMonth(), date.getDate(), 23, 59), references), reference);
    }
    assert.equal(ordinal, year === 2024 || year === 2000 ? 366 : 365);
    assert.equal(dailyReference(new Date(year, 0, 1), references), references[0]);
  }
  assert.equal(localDayOfYear(new Date(2024, 1, 29)), 60);
  assert.equal(localDayOfYear(new Date(2024, 2, 1)), 61);
  assert.equal(localDayOfYear(new Date(2025, 2, 1)), 60);
});

test('local midnight and DST do not use UTC dates or elapsed 24-hour days', () => {
  const previous = process.env.TZ;
  try {
    for (const zone of ['America/New_York', 'Pacific/Kiritimati', 'Pacific/Honolulu', 'Asia/Shanghai']) {
      process.env.TZ = zone;
      assert.equal(localDayOfYear(new Date(2026, 0, 1, 0, 1)), 1);
      assert.equal(localDayOfYear(new Date(2026, 11, 31, 23, 59)), 365);
      assert.equal(localDayOfYear(new Date(2026, 2, 9, 0, 1)), 68);
      assert.equal(localDayOfYear(new Date(2026, 10, 2, 0, 1)), 306);
    }
  } finally { if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous; }
  assert.equal(dailyReference(new Date(), []), undefined);
  assert.throws(() => localDayOfYear(new Date('invalid')));
});

test('share requests accept only one known public reference and explicit WEB', () => {
  for (const reference of references) {
    const query = new URLSearchParams({ ref: reference, translation: 'web' });
    assert.equal(parseShareReference(query, references), reference);
    assert.ok(shareCardHeight(web[reference]) >= 630);
    for (const key of ['note', 'text', 'emotion', 'savedId', 'from', '__proto__']) {
      const invalid = new URLSearchParams(query); invalid.append(key, 'TEST_PRIVATE_FIELD');
      assert.equal(parseShareReference(invalid, references), undefined);
    }
  }
  for (const query of ['', 'ref=unknown&translation=web', `ref=${encodeURIComponent(references[0])}`, ...['nlt', 'niv', 'kjv', 'asv', 'bsb', 'WEB'].map(translation => new URLSearchParams({ ref: references[0], translation }).toString())]) {
    assert.equal(parseShareReference(new URLSearchParams(query), references), undefined);
  }
  for (const key of ['ref', 'translation']) {
    const query = new URLSearchParams({ ref: references[0], translation: 'web' }); query.append(key, query.get(key));
    assert.equal(parseShareReference(query, references), undefined);
  }
});
