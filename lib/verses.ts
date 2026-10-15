import kjv from "@/data/verses/kjv.json";
import web from "@/data/verses/web.json";
import asv from "@/data/verses/asv.json";
import bsb from "@/data/verses/bsb.json";
import { defaultTranslation, resolveTranslation, type TranslationId } from "@/lib/translations";

const texts: Record<TranslationId, Readonly<Record<string, string>>> = { kjv, web, asv, bsb };

export function hasVerseReference(reference: string): boolean {
  return Object.hasOwn(texts[defaultTranslation], reference);
}

export function getVerseText(reference: string, translationId: string = defaultTranslation): string {
  const id = resolveTranslation(translationId);
  const selected = Object.hasOwn(texts[id], reference) ? texts[id][reference] : undefined;
  const fallback = Object.hasOwn(texts[defaultTranslation], reference) ? texts[defaultTranslation][reference] : undefined;
  const text = selected?.trim() ? selected : fallback;
  if (!text?.trim()) throw new Error(`Verse text is missing for ${reference} in ${id.toUpperCase()} and the default WEB translation.`);
  return text;
}
