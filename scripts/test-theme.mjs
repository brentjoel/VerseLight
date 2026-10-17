import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { resolveTheme, themeScript } from '../lib/theme.ts';

const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
const tokens = selector => Object.fromEntries([...css.match(selector)[1].matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(m => [m[1], m[2].trim()]));
const palettes = [tokens(/:root \{([^}]+)\}/), tokens(/:root\[data-theme="light"\] \{([^}]+)\}/)];
const rgb = hex => hex.slice(1).match(/../g).map(v => parseInt(v, 16));
const mix = (a, b, amount) => a.map((v, i) => v * (1 - amount) + b[i] * amount);
const luminance = color => color.map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
const contrast = (a, b) => (Math.max(luminance(a), luminance(b)) + .05) / (Math.min(luminance(a), luminance(b)) + .05);
const aa = (a, b, minimum = 4.5) => assert.ok(contrast(a, b) >= minimum, `Contrast ${contrast(a, b).toFixed(2)} < ${minimum}`);

test('explicit theme wins; absent or invalid preference follows system', () => {
  for (const system of [true, false]) {
    assert.equal(resolveTheme('dark', system), 'dark');
    assert.equal(resolveTheme('light', system), 'light');
    for (const preference of [null, undefined, 'invalid']) assert.equal(resolveTheme(preference, system), system ? 'light' : 'dark');
  }
});

test('actual pre-paint script selects root theme and handles blocked storage', () => {
  for (const preference of [null, 'dark', 'light', 'invalid']) for (const system of [true, false]) for (const blocked of [true, false]) {
    const dataset = {};
    vm.runInNewContext(themeScript, {
      localStorage: { getItem() { if (blocked) throw Error('blocked'); return preference; } },
      document: { documentElement: { dataset } }, matchMedia: () => ({ matches: system }),
    });
    assert.equal(dataset.theme, resolveTheme(blocked ? null : preference, system));
    assert.equal(dataset.themeSource, !blocked && ['dark', 'light'].includes(preference) ? 'stored' : 'system');
  }
});

test('both palettes define matching scene tokens with distinct light colors', () => {
  const keys = Object.keys(palettes[0]).filter(key => key.startsWith('--scene-'));
  assert.deepEqual(keys, Object.keys(palettes[1]).filter(key => key.startsWith('--scene-')));
  assert.equal(palettes[0]['--scene-sky'], palettes[0]['--background']);
  assert.equal(palettes[1]['--scene-sky'], palettes[1]['--background']);
  assert.notEqual(palettes[0]['--scene-sky'], palettes[1]['--scene-sky']);
  assert.equal(palettes[0]['--scene-bar-shade'], '1');
  assert.ok(Number(palettes[1]['--scene-bar-shade']) < 1);
});

test('explicit light palette opts out of browser automatic darkening', () => {
  const light = css.match(/:root\[data-theme="light"\] \{([^}]+)\}/)[1];
  assert.match(light, /color-scheme:\s*only light\s*;/);
  assert.equal(palettes[1]['--background'], '#faf6ee');
});

test('scene text, selected controls, borders and focus meet AA across the sky gradient', () => {
  for (const p of palettes) {
    for (let i = 0; i <= 100; i++) {
      const sky = mix(rgb(p['--scene-sky']), rgb(p['--scene-sky-end']), i / 100);
      for (const key of ['--scene-text', '--scene-muted', '--scene-accent', '--scene-selected']) aa(rgb(p[key]), sky);
      aa(rgb(p['--scene-control-border']), sky, 3);
      aa(rgb(p['--scene-accent']), sky, 3);
    }
    aa(rgb(p['--scene-on-accent']), rgb(p['--scene-accent']));
    for (const key of ['--scene-control', '--scene-control-hover']) {
      aa(rgb(p['--scene-text']), rgb(p[key]));
      aa(rgb(p['--scene-control-border']), rgb(p[key]), 3);
    }
  }
});

test('verse ink and all result controls meet AA through every dawn color stage and emotion wash', () => {
  const emotions = [...css.matchAll(/--emotion-rgb:\s*(\d+) (\d+) (\d+)/g)].map(m => m.slice(1).map(Number));
  assert.equal(emotions.length, 8);
  for (const p of palettes) for (const surface of ['--card', '--background']) for (const emotion of emotions) for (let wash = 0; wash <= 9; wash++) {
    const card = mix(rgb(p[surface]), emotion, wash / 100);
    for (let i = 0; i <= 100; i++) aa(mix(rgb(p['--muted-foreground']), rgb(p['--foreground']), i / 100), card);
    for (const key of ['--foreground', '--muted-foreground', '--primary']) aa(rgb(p[key]), card);
    // Reflection/prayer overlay and Journal's strongest heatmap cell.
    aa(rgb(p['--muted-foreground']), mix(card, rgb(p['--primary']), .04));
    aa(rgb(p['--foreground']), mix(rgb(p['--card']), rgb(p['--primary']), .38));
    aa(rgb(p['--scene-selected']), mix(rgb(p['--background']), rgb(p['--primary']), .10));
  }
});
