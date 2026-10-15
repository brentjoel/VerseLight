import { getAllEmotions } from "@/lib/emotions";
import { isTranslationId, type TranslationId } from "@/lib/translations";

export function validResultsPath(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  return getAllEmotions().flatMap(emotion => emotion.specifics.map(specific => `/emotions/${emotion.id}/${specific.id}`)).find(path => path === value);
}

export function parseCompareTranslations(value: string | string[] | undefined, preferred: TranslationId): { ids: TranslationId[]; error?: string } {
  if (value === undefined) return { ids: [preferred, preferred === "web" ? "bsb" : "web"] };
  const raw = (Array.isArray(value) ? value : [value]).flatMap(item => item.split(","));
  const ids = [...new Set(raw.filter(isTranslationId))];
  if (raw.some(id => !isTranslationId(id)) || ids.length < 2 || ids.length > 4) {
    return { ids: [], error: "Choose between two and four available translations: NLT, KJV, WEB, ASV, and BSB. NIV is coming soon." };
  }
  return { ids };
}
