import assert from "node:assert/strict";
import test from "node:test";
import { parseNlt, requestLicensedPassage } from "../lib/bible-api.ts";

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
  assert.ok((await requestLicensedPassage("Philippians 4:6-7", "nlt", "TEST_KEY", mock)).endsWith("(NLT)"));
});

test("network, HTTP, empty, and malformed responses fail for the caller to use WEB", async () => {
  const providers = [
    async () => { throw new Error("TEST_NETWORK_FAILURE"); },
    async () => new Response("", { status: 503 }),
    async () => new Response("{}"),
    async () => new Response("TEST_NOT_JSON"),
    async () => new Response("", { headers: { "content-length": "300000" } }),
  ];
  for (const mock of providers) await assert.rejects(requestLicensedPassage("Philippians 4:6-7", "nlt", "TEST_KEY", mock));
});

test("429 Retry-After blocks subsequent requests instead of retrying the upstream", async () => {
  let calls = 0;
  const mock = async () => { calls++; return new Response("", { status: 429, headers: { "retry-after": "120" } }); };
  await assert.rejects(requestLicensedPassage("Philippians 4:6-7", "nlt", "TEST_KEY", mock));
  await assert.rejects(requestLicensedPassage("Philippians 4:6-7", "nlt", "TEST_KEY", mock));
  assert.equal(calls, 1);
});
