import assert from "node:assert/strict";
import test from "node:test";
import { parseNlt, parseEsv, requestLicensedPassage } from "../lib/bible-api.ts";

// Synthetic parser fixtures are deliberately labeled test data, not Scripture.
const nlt = '<h2 class="bk_ch_vs_header">Philippians 4:6-7, NLT</h2><verse_export ch="4" vn="6"><p><span class="vn">6</span>TEST_FIRST &amp; <em>TEST_EMPHASIS</em><span class="tnref">TEST_FOOTNOTE</span></verse_export><verse_export ch="4" vn="7">TEST_SECOND<script>TEST_SCRIPT</script></verse_export>';
const esv = { canonical: "Philippians 4:6-7", parsed: [[50004006, 50004007]], passages: ["TEST_ONLY (ESV)"] };

test("NLT range parsing preserves text and entities but excludes labels, notes, and executable HTML", () => {
  assert.equal(parseNlt(nlt, "Philippians 4:6-7"), "TEST_FIRST & TEST_EMPHASIS TEST_SECOND (NLT)");
  assert.throws(() => parseNlt(nlt.replace('vn="7"', 'vn="8"'), "Philippians 4:6-7"));
  assert.throws(() => parseNlt(nlt, "John 4:6-7"));
  assert.throws(() => parseNlt(nlt.replace(/<verse_export ch="4" vn="7">[\s\S]*/, ""), "Philippians 4:6-7"));
});

test("ESV responses must match the requested range, have text, and retain the copyright marker", () => {
  assert.equal(parseEsv(esv, "Philippians 4:6-7"), "TEST_ONLY (ESV)");
  assert.equal(parseEsv({ canonical: "Philemon 4–5", parsed: [[57001004, 57001005]], passages: ["TEST_ONLY (ESV)"] }, "Philemon 1:4-5"), "TEST_ONLY (ESV)");
  for (const invalid of [null, {}, { ...esv, passages: [] }, { ...esv, passages: ["TEST_ONLY"] }, { ...esv, parsed: [[50004006, 50004006]] }, { ...esv, canonical: "John 4:6-7" }]) {
    assert.throws(() => parseEsv(invalid, "Philippians 4:6-7"));
  }
});

test("provider requests use official origins, private credentials, no-store, and a timeout", async () => {
  for (const id of ["nlt", "esv"]) {
    const mock = async (url, options) => {
      assert.equal(url.origin, id === "nlt" ? "https://api.nlt.to" : "https://api.esv.org");
      assert.equal(options.cache, "no-store");
      assert.equal(options.redirect, "error");
      assert.ok(options.signal instanceof AbortSignal);
      if (id === "nlt") assert.equal(url.searchParams.get("key"), "TEST_KEY");
      else { assert.equal(url.searchParams.get("key"), null); assert.equal(options.headers.Authorization, "Token TEST_KEY"); }
      return new Response(id === "nlt" ? nlt : JSON.stringify(esv));
    };
    assert.ok((await requestLicensedPassage("Philippians 4:6-7", id, "TEST_KEY", mock)).endsWith(`(${id.toUpperCase()})`));
  }
});

test("network, HTTP, empty, and malformed responses fail for the caller to use WEB", async () => {
  const providers = [
    async () => { throw new Error("TEST_NETWORK_FAILURE"); },
    async () => new Response("", { status: 503 }),
    async () => new Response("{}"),
    async () => new Response("TEST_NOT_JSON"),
    async () => new Response("", { headers: { "content-length": "300000" } }),
  ];
  for (const mock of providers) await assert.rejects(requestLicensedPassage("Philippians 4:6-7", "esv", "TEST_KEY", mock));
});

test("429 Retry-After blocks subsequent requests instead of retrying the upstream", async () => {
  let calls = 0;
  const mock = async () => { calls++; return new Response("", { status: 429, headers: { "retry-after": "120" } }); };
  await assert.rejects(requestLicensedPassage("Philippians 4:6-7", "nlt", "TEST_KEY", mock));
  await assert.rejects(requestLicensedPassage("Philippians 4:6-7", "nlt", "TEST_KEY", mock));
  assert.equal(calls, 1);
});

test("ESV's local minute limit prevents more than 60 requests", async () => {
  let calls = 0;
  const mock = async () => { calls++; return new Response(JSON.stringify(esv)); };
  for (let count = 0; count < 61; count++) {
    try { await requestLicensedPassage("Philippians 4:6-7", "esv", "TEST_KEY", mock); }
    catch { /* Earlier tests also consume timestamps. */ }
  }
  assert.ok(calls > 0 && calls <= 60);
  const before = calls;
  await assert.rejects(requestLicensedPassage("Philippians 4:6-7", "esv", "TEST_KEY", mock));
  assert.equal(calls, before);
});
