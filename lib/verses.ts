import kjv from "@/data/verses/kjv.json";
import web from "@/data/verses/web.json";
import asv from "@/data/verses/asv.json";
import bsb from "@/data/verses/bsb.json";
import { fallbackTranslation, type StaticTranslationId } from "@/lib/translations";

const texts: Record<StaticTranslationId, Readonly<Record<string, string>>> = { kjv, web, asv, bsb };

export function hasVerseReference(reference: string): boolean {
  return Object.hasOwn(texts[fallbackTranslation], reference);
}

// Local files only. getVersePassage handles licensed APIs and labeled fallbacks.
export function getVerseText(reference: string, translationId: string = fallbackTranslation): string {
  const id = Object.hasOwn(texts, translationId) ? translationId as StaticTranslationId : fallbackTranslation;
  const selected = Object.hasOwn(texts[id], reference) ? texts[id][reference] : undefined;
  const fallback = Object.hasOwn(texts[fallbackTranslation], reference) ? texts[fallbackTranslation][reference] : undefined;
  const text = selected?.trim() ? selected : fallback;
  if (!text?.trim()) throw new Error(`Verse text is missing for ${reference} in ${id.toUpperCase()} and the fallback WEB translation.`);
  return text;
}
