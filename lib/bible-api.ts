import { parse, parseFragment, type DefaultTreeAdapterMap } from "parse5";

type Node = DefaultTreeAdapterMap["node"];
type Element = DefaultTreeAdapterMap["element"];
export type LicensedTranslationId = "nlt" | "esv";

function elements(node: Node, tag: string): Element[] {
  return [ ...("tagName" in node && node.tagName === tag ? [node] : []),
    ...("childNodes" in node ? node.childNodes.flatMap(child => elements(child, tag)) : []),
  ];
}

function attr(node: Element, name: string) {
  return node.attrs.find(attribute => attribute.name === name)?.value;
}

function text(node: Node): string {
  if ("value" in node && node.nodeName === "#text") return node.value;
  if ("tagName" in node && (["script", "style", "sup", "h2", "h3"].includes(node.tagName) || (attr(node, "class") ?? "").split(/\s+/).some(name => ["vn", "tn", "fn", "footnote", "footnotes", "tnref", "snref"].includes(name)))) return "";
  return "childNodes" in node ? node.childNodes.map(text).join("") : "";
}

export function referenceParts(reference: string) {
  const match = reference.match(/^(.+) ([1-9]\d*):([1-9]\d*)(?:-([1-9]\d*))?$/);
  if (!match) throw new Error("Invalid passage reference.");
  const first = Number(match[3]);
  const last = Number(match[4] ?? match[3]);
  // This app only requests its curated short passages, never chapters or books.
  if (last < first || last - first + 1 > 50) throw new Error("Passage exceeds display limits.");
  return { book: match[1], chapter: Number(match[2]), first, last };
}

export function parseNlt(html: string, reference: string): string {
  const { chapter, first, last } = referenceParts(reference);
  const document = parse(html);
  const headers = elements(document, "h2").filter(node => attr(node, "class") === "bk_ch_vs_header");
  const headerText = headers.map(node => node.childNodes.map(child => text(child)).join("").trim());
  if (headerText.length !== 1 || headerText[0] !== `${reference}, NLT`) throw new Error("Unexpected NLT passage.");
  // NLT emits custom verse_export elements with paragraph markup that is not
  // always nested correctly. Parse each source-delimited verse independently.
  const blocks = [...html.matchAll(/<verse_export\b([^>]*)>([\s\S]*?)<\/verse_export>/gi)];
  if (blocks.length !== last - first + 1) throw new Error("Incomplete NLT passage.");
  const passages = blocks.map((block, index) => {
    const fragment = parseFragment(`<verse_export${block[1]}></verse_export>`);
    const node = elements(fragment, "verse_export")[0];
    if (!node || attr(node, "ch") !== String(chapter) || attr(node, "vn") !== String(first + index)) throw new Error("Unexpected NLT verse.");
    const verse = text(parseFragment(block[2])).trim();
    if (!verse) throw new Error("Empty NLT verse.");
    return verse;
  });
  return passages.join(" ") + " (NLT)";
}

export function parseEsv(payload: unknown, reference: string): string {
  const { chapter, first, last } = referenceParts(reference);
  if (!payload || typeof payload !== "object" || !("canonical" in payload) || !("passages" in payload) || !("parsed" in payload)) throw new Error("Invalid ESV response.");
  const normalize = (value: string) => value.replace(/^Psalms /, "Psalm ").replaceAll("–", "-").replace(/^(Obadiah|Philemon|2 John|3 John|Jude) (\d+(?:-\d+)?)$/, "$1 1:$2");
  if (typeof payload.canonical !== "string" || normalize(payload.canonical) !== reference || !Array.isArray(payload.passages) || payload.passages.length !== 1 || typeof payload.passages[0] !== "string" || !Array.isArray(payload.parsed) || payload.parsed.length !== 1) throw new Error("Unexpected ESV passage.");
  const range: unknown = payload.parsed[0];
  if (!Array.isArray(range) || range.length !== 2 || !range.every(Number.isInteger) || range[1] - range[0] !== last - first || range[0] % 1000 !== first || range[1] % 1000 !== last || Math.floor(range[0] / 1000) % 1000 !== chapter) throw new Error("Incomplete ESV passage.");
  const passage = payload.passages[0].trim();
  if (!passage.endsWith("(ESV)") || passage === "(ESV)") throw new Error("Missing ESV text or attribution.");
  return passage;
}

// Store only request timestamps and cooldowns, never licensed passage text.
// These guards are per process; provider quotas remain authoritative on Vercel.
const usage: Record<LicensedTranslationId, { times: number[]; blockedUntil: number }> = {
  nlt: { times: [], blockedUntil: 0 }, esv: { times: [], blockedUntil: 0 },
};

export async function requestLicensedPassage(reference: string, id: LicensedTranslationId, key: string, fetcher: typeof fetch = fetch): Promise<string> {
  referenceParts(reference);
  const now = Date.now();
  const state = usage[id];
  state.times = state.times.filter(time => now - time < 86400000);
  const limit = id === "nlt" && key === "TEST" ? 500 : 5000;
  if (now < state.blockedUntil || state.times.length >= limit || (id === "esv" && (state.times.filter(time => now - time < 60000).length >= 60 || state.times.filter(time => now - time < 3600000).length >= 1000))) throw new Error("Bible provider quota reached.");
  state.times.push(now);
  const url = new URL(id === "nlt" ? "https://api.nlt.to/api/passages" : "https://api.esv.org/v3/passage/text/");
  if (id === "nlt") {
    url.search = new URLSearchParams({ ref: reference, version: "NLT", key }).toString();
  } else {
    url.search = new URLSearchParams({ q: reference, "include-passage-references": "false", "include-verse-numbers": "false", "include-first-verse-numbers": "false", "include-footnotes": "false", "include-footnote-body": "false", "include-headings": "false", "include-short-copyright": "true", "include-copyright": "false" }).toString();
  }
  const response = await fetcher(url, {
    cache: "no-store", redirect: "error", signal: AbortSignal.timeout(8000),
    headers: id === "esv" ? { Authorization: `Token ${key}` } : {},
  });
  if (response.status === 429) {
    const retry = response.headers.get("retry-after");
    const duration = retry && /^\d+$/.test(retry) ? Number(retry) * 1000 : Date.parse(retry ?? "") - Date.now();
    state.blockedUntil = Date.now() + Math.max(60000, Number.isFinite(duration) ? duration : 60000);
  }
  if (!response.ok) throw new Error("Bible provider is unavailable.");
  if (Number(response.headers.get("content-length")) > 200000) throw new Error("Unexpected response size.");
  const body = await response.text();
  if (body.length > 200000) throw new Error("Unexpected response size.");
  return id === "nlt" ? parseNlt(body, reference) : parseEsv(JSON.parse(body), reference);
}
