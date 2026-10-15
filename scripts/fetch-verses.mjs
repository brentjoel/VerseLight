import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";

const root = new URL("../", import.meta.url);
const emotions = JSON.parse(await readFile(new URL("data/emotions.json", root), "utf8"));
const references = [...new Set(emotions.flatMap(e => e.specifics.flatMap(s => s.references)))].sort();
await mkdir(new URL("data/verses/", root), { recursive: true });

// bible-api.com permits 15 requests / 30 seconds. All requests, including retries,
// are sequential and spaced out. No Bible service is contacted at runtime.
let lastRequest = 0;
async function download(url) {
  for (let attempt = 0; attempt < 5; attempt++) {
    await delay(Math.max(0, 2300 - (Date.now() - lastRequest)));
    lastRequest = Date.now();
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!response.ok) {
        if (response.status === 429) {
          const retry = response.headers.get("retry-after");
          const wait = retry && /^\d+$/.test(retry) ? Number(retry) * 1000 : Date.parse(retry ?? "") - Date.now();
          await delay(Math.max(30000, Number.isFinite(wait) ? wait : 30000));
        }
        throw new Error(`HTTP ${response.status}: ${url}`);
      }
      return await response.text();
    } catch (error) {
      if (attempt === 4) throw error;
      console.warn(`Download failed, retry ${attempt + 1}/4: ${url}`);
      await delay(2000 * 2 ** attempt);
    }
  }
}

function parts(reference) {
  const match = reference.match(/^(.+) (\d+):(\d+)(?:-(\d+))?$/);
  if (!match) throw new Error(`Invalid reference: ${reference}`);
  return { book: match[1], chapter: Number(match[2]), first: Number(match[3]), last: Number(match[4] ?? match[3]) };
}

try {
  for (const id of ["kjv", "web", "asv", "bsb"]) {
    const file = new URL(`data/verses/${id}.json`, root);
    let saved = {};
    try { saved = JSON.parse(await readFile(file, "utf8")); }
    catch (error) { if (error.code !== "ENOENT") throw error; }
    const missing = references.filter(ref => typeof saved[ref] !== "string" || !saved[ref].trim());
    let bsb;
    if (id === "bsb" && missing.length) {
      const source = await download("https://bereanbible.com/bsb.txt");
      bsb = new Map(source.split(/\r?\n/).map(line => {
        const tab = line.indexOf("\t");
        return [line.slice(0, tab), line.slice(tab + 1).trim()];
      }));
    }
    for (const reference of missing) {
      const { book, chapter, first, last } = parts(reference);
      const texts = [];
      if (bsb) {
        for (let verse = first; verse <= last; verse++) {
          const key = `${book} ${chapter}:${verse}`;
          const text = bsb.get(key);
          if (!text) throw new Error(`BSB source is missing ${key}`);
          texts.push(text);
        }
      } else {
        const payload = JSON.parse(await download(`https://bible-api.com/${encodeURIComponent(reference)}?translation=${id}`));
        if (payload.translation_id !== id || !Array.isArray(payload.verses) || payload.verses.length !== last - first + 1) {
          throw new Error(`Unexpected ${id} response for ${reference}`);
        }
        for (let verse = first; verse <= last; verse++) {
          const item = payload.verses[verse - first];
          const sourceBook = item.book_name === "Psalms" ? "Psalm" : item.book_name;
          if (sourceBook !== book || item.chapter !== chapter || item.verse !== verse || typeof item.text !== "string" || !item.text.trim()) {
            throw new Error(`Invalid or missing ${id} verse: ${reference}, verse ${verse}`);
          }
          // Only surrounding layout whitespace is removed. Words and punctuation
          // are preserved exactly, including punctuation present in the source.
          texts.push(item.text.trim());
        }
      }
      saved[reference] = texts.join(" ");
      const ordered = Object.fromEntries(Object.entries(saved).sort(([a], [b]) => a.localeCompare(b)));
      await writeFile(new URL(`${file.href}.tmp`), JSON.stringify(ordered, null, 2) + "\n");
      await rename(new URL(`${file.href}.tmp`), file);
      console.log(`${id.toUpperCase()}: ${reference}`);
    }
    console.log(`${id.toUpperCase()}: ${references.length} references ready (${references.length - missing.length} already saved).`);
  }
} catch (error) {
  console.error("Verse download stopped. Saved references are retained; rerun npm run fetch:verses to resume.");
  console.error(error);
  process.exitCode = 1;
}
