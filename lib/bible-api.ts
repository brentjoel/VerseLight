import { parse, parseFragment, type DefaultTreeAdapterMap } from "parse5";
import { instanceQuota, retryAfterMilliseconds, type NltQuota } from "./nlt-quota";

type Node = DefaultTreeAdapterMap["node"];
type Element = DefaultTreeAdapterMap["element"];
export type LicensedTranslationId = "nlt";

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

export async function requestLicensedPassage(reference: string, id: LicensedTranslationId, key: string, fetcher: typeof fetch = fetch, quota?: NltQuota): Promise<string> {
  referenceParts(reference);
  if (id !== "nlt" || !key.trim()) throw new Error("Invalid Bible provider configuration.");
  const guard = quota ?? instanceQuota;
  await guard.reserve(key === "TEST" ? 500 : 5000);
  const url = new URL("https://api.nlt.to/api/passages");
  url.search = new URLSearchParams({ ref: reference, version: "NLT", key }).toString();
  try {
    const response = await fetcher(url, {
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(8000),
    });
    if (response.status === 429 || response.status === 503 || response.status === 401 || response.status === 403) {
      const duration = response.status === 401 || response.status === 403 ? 86400000 : retryAfterMilliseconds(response.headers.get("retry-after"));
      await guard.block(duration);
    }
    if (!response.ok) throw new Error("Bible provider is unavailable.");
    if (Number(response.headers.get("content-length")) > 200000 || !response.body) throw new Error("Unexpected response size.");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let bytes = 0;
    let body = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > 200000) {
          await reader.cancel();
          throw new Error("Unexpected response size.");
        }
        body += decoder.decode(value, { stream: true });
      }
      body += decoder.decode();
    } finally { reader.releaseLock(); }
    return parseNlt(body, reference);
  } catch {
    // Never propagate fetch errors, causes or URLs containing the provider key.
    throw new Error("Bible provider is unavailable.");
  }
}
