import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cacheLife } from "next/cache";

// Public, OFL-licensed font only. No licensed Scripture enters this cache.
export async function brandFont() {
  "use cache";
  cacheLife("max");
  return { name: "Lora", data: new Uint8Array(await readFile(join(process.cwd(), "public/fonts/Lora.ttf"))).buffer, weight: 400 as const, style: "normal" as const };
}
