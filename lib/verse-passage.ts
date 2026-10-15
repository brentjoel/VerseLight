import "server-only";
import { getVerseText, hasVerseReference } from "@/lib/verses";
import { fallbackTranslation, isStaticTranslation, resolveTranslation, type TranslationId } from "@/lib/translations";
import { requestLicensedPassage } from "@/lib/bible-api";

export interface VersePassage {
  text: string;
  translationId: TranslationId;
  note?: string;
}

export async function getVersePassage(reference: string, translationId: TranslationId): Promise<VersePassage> {
  if (!hasVerseReference(reference)) throw new Error("Unknown verse reference.");
  const id = resolveTranslation(translationId);
  if (isStaticTranslation(id)) return { text: getVerseText(reference, id), translationId: id };
  try {
    const key = id === "nlt" ? process.env.NLT_API_KEY : process.env.ESV_API_KEY;
    if (!key?.trim()) throw new Error("Bible provider is not configured.");
    return { text: await requestLicensedPassage(reference, id, key.trim()), translationId: id };
  } catch {
    // Do not log fetch errors: the NLT request URL contains the secret key.
    return { text: getVerseText(reference, fallbackTranslation), translationId: fallbackTranslation, note: `${id.toUpperCase()} is unavailable right now. Showing WEB.` };
  }
}
