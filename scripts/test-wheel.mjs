import assert from 'node:assert/strict';
import test from 'node:test';
import { wrapIndex, waveCharacters, waveHeight, needsSimplePicker, isSlowWheel } from '../lib/wheel.ts';
import emotions from '../data/emotions.json' with { type: 'json' };

test('detents wrap backwards and forwards across both wheel levels', () => {
  for (const count of [emotions.length, ...emotions.map(emotion => emotion.specifics.length)]) {
    assert.equal(wrapIndex(-1, count), count - 1);
    assert.equal(wrapIndex(count, count), 0);
    assert.equal(wrapIndex(count * 3 + 1, count), 1);
  }
  assert.equal(wrapIndex(5, 0), 0);
});
test('each source emotion has a distinct bounded waveform character', () => {
  assert.deepEqual(Object.keys(waveCharacters).sort(), emotions.map(emotion => emotion.id).sort());
  assert.equal(new Set(Object.values(waveCharacters).map(JSON.stringify)).size, emotions.length);
  for (const character of Object.values(waveCharacters)) {
    assert.match(character.color, /^#[\da-f]{6}$/i);
    for (let i = 0; i < 128; i++) {
      const height = waveHeight(i / 128 * Math.PI * 2, i * .3, character);
      assert.ok(Number.isFinite(height) && height >= .08 && height <= .08 + character.amplitude);
    }
  }
});
test('reduced motion and low capability use simple picker; missing hints allow rendering probe', () => {
  assert.equal(needsSimplePicker(true, 8), true);
  assert.equal(needsSimplePicker(false, 2), true);
  assert.equal(needsSimplePicker(false, undefined), false);
  assert.equal(needsSimplePicker(false, 8), false);
  assert.equal(isSlowWheel(40, 2100), true);
  assert.equal(isSlowWheel(120, 2100), false);
  assert.equal(isSlowWheel(10, 1000), false);
});
