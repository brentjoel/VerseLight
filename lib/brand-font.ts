import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Public, OFL-licensed font only. Image rendering never caches passage text.
export async function brandFont() {
  return { name: "Lora", data: await readFile(join(process.cwd(), "public/fonts/Lora.ttf")), weight: 400 as const, style: "normal" as const };
}
