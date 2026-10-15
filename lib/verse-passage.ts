import "server-only";
import { connection } from "next/server";
import { getVerseText, hasVerseReference } from "@/lib/verses";
import { fallbackTranslation, isStaticTranslation, resolveTranslation, type TranslationId } from "@/lib/translations";
import { requestLicensedPassage } from "@/lib/bible-api";
import { reportOperationalEvent } from "@/lib/operational-monitor";

export interface VersePassage {
  text: string;
  translationId: TranslationId;
  note?: string;
}

export async function getVersePassage(reference: string, translationId: TranslationId): Promise<VersePassage> {
  if (!hasVerseReference(reference)) throw new Error("Unknown verse reference.");
  const id = resolveTranslation(translationId);
  if (isStaticTranslation(id)) return { text: getVerseText(reference, id), translationId: id };
  // Licensed requests and quota clocks must run only for real incoming requests.
  await connection();
  try {
    const key = process.env.NLT_API_KEY;
    if (!key?.trim()) throw new Error("Bible provider is not configured.");
    return { text: await requestLicensedPassage(reference, id, key.trim()), translationId: id };
  } catch {
    reportOperationalEvent("nlt_fallback");
    // Do not log fetch errors: the NLT request URL contains the secret key.
    return { text: getVerseText(reference, fallbackTranslation), translationId: fallbackTranslation, note: `${id.toUpperCase()} is unavailable right now. Showing WEB.` };
  }
}
