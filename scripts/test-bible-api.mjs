import assert from "node:assert/strict";
import test from "node:test";
import { registerHooks } from "node:module";
registerHooks({ resolve(specifier, context, nextResolve) {
  return nextResolve(specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier) ? `${specifier}.ts` : specifier, context);
} });
const { parseNlt, requestLicensedPassage } = await import("../lib/bible-api.ts");
const { createLocalQuota, retryAfterMilliseconds } = await import("../lib/nlt-quota.ts");
const { createOperationalMonitor } = await import("../lib/operational-monitor.ts");
const { resolveSiteUrl } = await import("../lib/site-url.ts");

// Synthetic parser fixtures are deliberately labeled test data, not Scripture.
const nlt = '<h2 class="bk_ch_vs_header">Philippians 4:6-7, NLT</h2><verse_export ch="4" vn="6"><p><span class="vn">6</span>TEST_FIRST &amp; <em>TEST_EMPHASIS</em><span class="tnref">TEST_FOOTNOTE</span></verse_export><verse_export ch="4" vn="7">TEST_SECOND<script>TEST_SCRIPT</script></verse_export>';

test("NLT range parsing preserves text and entities but excludes labels, notes, and executable HTML", () => {
  assert.equal(parseNlt(nlt, "Philippians 4:6-7"), "TEST_FIRST & TEST_EMPHASIS TEST_SECOND (NLT)");
  assert.throws(() => parseNlt(nlt.replace('vn="7"', 'vn="8"'), "Philippians 4:6-7"));
  assert.throws(() => parseNlt(nlt, "John 4:6-7"));
  assert.throws(() => parseNlt(nlt.replace(/<verse_export ch="4" vn="7">[\s\S]*/, ""), "Philippians 4:6-7"));
});

test("NLT requests use the official origin, private credentials, no-store, and a timeout", async () => {
  const mock = async (url, options) => {
    assert.equal(url.origin, "https://api.nlt.to");
    assert.equal(url.searchParams.get("key"), "TEST_KEY");
    assert.equal(url.searchParams.get("version"), "NLT");
    assert.equal(options.cache, "no-store");
    assert.equal(options.redirect, "error");
    assert.ok(options.signal instanceof AbortSignal);
    return new Response(nlt);
  };
  assert.ok((await requestLicensedPassage("Philippians 4:6-7", "nlt", "TEST_KEY", mock, createLocalQuota())).endsWith("(NLT)"));
});

test("network, HTTP, empty, and malformed responses fail for the caller to use WEB", async () => {
  const providers = [
    async () => { throw new Error("TEST_NETWORK_FAILURE"); },
    async () => new Response("", { status: 503 }),
    async () => new Response("{}"),
    async () => new Response("TEST_NOT_JSON"),
    async () => new Response("", { headers: { "content-length": "300000" } }),
  ];
  for (const mock of providers) await assert.rejects(requestLicensedPassage("Philippians 4:6-7", "nlt", "TEST_KEY", mock, createLocalQuota()));
});

test("429 Retry-After blocks subsequent requests instead of retrying the upstream", async () => {
  let calls = 0;
  const quota = createLocalQuota();
  const mock = async () => { calls++; return new Response("", { status: 429, headers: { "retry-after": "120" } }); };
  await assert.rejects(requestLicensedPassage("Philippians 4:6-7", "nlt", "TEST_KEY", mock, quota));
  await assert.rejects(requestLicensedPassage("Philippians 4:6-7", "nlt", "TEST_KEY", mock, quota));
  assert.equal(calls, 1);
});

test("local rolling day, burst boundary, reservations and restart limits", async () => {
  let time = 0;
  const quota = createLocalQuota(() => time);
  for (let i = 0; i < 20; i++) await quota.reserve(500);
  await assert.rejects(quota.reserve(500));
  time = 60_000;
  await quota.reserve(21);
  await assert.rejects(quota.reserve(21));
  time = 86_400_000;
  await quota.reserve(21);
  await quota.block(120_000);
  await quota.block(60_000);
  time += 60_000;
  await assert.rejects(quota.reserve(500));
  // A second process/restart bypasses local state. Protection is best effort across serverless instances.
  await createLocalQuota(() => time).reserve(500);
  time += 60_000;
  await quota.reserve(500);
});

test("Retry-After supports seconds, HTTP dates, past and invalid values", () => {
  const now = Date.parse('2026-10-15T00:00:00Z');
  assert.equal(retryAfterMilliseconds('120', now), 120_000);
  assert.equal(retryAfterMilliseconds('Thu, 15 Oct 2026 00:03:00 GMT', now), 180_000);
  for (const value of [null, 'bad', '-1', '0', '9999999999999999999999999', 'Thu, 01 Jan 1970 00:00:00 GMT']) assert.equal(retryAfterMilliseconds(value, now), 60_000);
});

test("quota denial prevents upstream; failed requests remain reserved; timeout errors are sanitized", async () => {
  let calls = 0;
  const mock = async () => { calls++; throw new DOMException('https://TEST_SECRET', 'TimeoutError'); };
  const quota = createLocalQuota();
  for (let i = 0; i < 20; i++) await assert.rejects(requestLicensedPassage('Philippians 4:6-7', 'nlt', 'TEST_KEY', mock, quota), { message: 'Bible provider is unavailable.' });
  await assert.rejects(requestLicensedPassage('Philippians 4:6-7', 'nlt', 'TEST_KEY', mock, quota));
  assert.equal(calls, 20);
});

test("provider cooldowns for unavailable and rejected credentials are applied before fallback", async () => {
  for (const status of [429, 503, 401, 403]) {
    let duration;
    const quota = { async reserve(limit) { assert.equal(limit, 500); }, async block(value) { duration = value; } };
    await assert.rejects(requestLicensedPassage('Philippians 4:6-7', 'nlt', 'TEST', async () => new Response('', { status, headers: { 'retry-after': '180' } }), quota));
    assert.equal(duration, [401, 403].includes(status) ? 86_400_000 : 180_000);
  }
});

test("operational warnings accept only fixed codes and throttle independently without error payloads", () => {
  let now = 0;
  const output = [];
  const report = createOperationalMonitor(code => output.push(code), () => now);
  report('nlt_fallback'); report('nlt_fallback'); report('server_error');
  report('https://TEST_SECRET'); report({ note: 'TEST_PRIVATE' });
  now = 60_000; report('nlt_fallback');
  assert.deepEqual(output, ['nlt_fallback', 'server_error', 'nlt_fallback']);
});

test("site origin is configurable and rejects secret-bearing or unsafe URLs", () => {
  assert.equal(resolveSiteUrl(undefined).href, 'http://localhost:3000/');
  assert.equal(resolveSiteUrl('https://example.com/').href, 'https://example.com/');
  for (const value of ['javascript:alert(1)', 'http://example.com', 'https://user:secret@example.com', 'https://example.com/?note=private', 'https://example.com/#private', 'https://example.com/path', 'invalid']) assert.throws(() => resolveSiteUrl(value));
});

test("streamed oversized bodies are cancelled even without Content-Length", async () => {
  let cancelled = false;
  const stream = new ReadableStream({
    pull(controller) { controller.enqueue(new Uint8Array(100001)); },
    cancel() { cancelled = true; },
  });
  await assert.rejects(requestLicensedPassage('Philippians 4:6-7', 'nlt', 'TEST_KEY', async () => new Response(stream), createLocalQuota()));
  assert.equal(cancelled, true);
});

test("concurrent admissions cannot overspend a single instance burst budget", async () => {
  const quota = createLocalQuota();
  const results = await Promise.allSettled(Array.from({ length: 40 }, () => quota.reserve(5000)));
  assert.equal(results.filter(value => value.status === 'fulfilled').length, 20);
});

test("both published daily budgets stop the next attempt and expire on rolling boundaries", async () => {
  for (const limit of [500, 5000]) {
    let now = 0;
    const quota = createLocalQuota(() => now);
    for (let i = 0; i < limit; i++) {
      if (i && i % 20 === 0) now += 60_000;
      await quota.reserve(limit);
    }
    now += 60_000;
    await assert.rejects(quota.reserve(limit));
    now = 86_400_000;
    await quota.reserve(limit);
  }
});
