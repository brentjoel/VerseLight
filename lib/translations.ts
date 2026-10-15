export const translations = [
  { id: "nlt", shortName: "NLT", fullName: "New Living Translation", description: "Natural, contemporary English from Tyndale." },
  { id: "esv", shortName: "ESV", fullName: "English Standard Version", description: "An essentially literal translation from Crossway." },
  { id: "kjv", shortName: "KJV", fullName: "King James Version", description: "Traditional English from the 1769 text." },
  { id: "web", shortName: "WEB", fullName: "World English Bible", description: "Clear modern English, freely shared." },
  { id: "asv", shortName: "ASV", fullName: "American Standard Version", description: "A closely worded translation first published in 1901." },
  { id: "bsb", shortName: "BSB", fullName: "Berean Standard Bible", description: "Modern English for reading, study, and sharing." },
] as const;

export type Translation = (typeof translations)[number];
export type TranslationId = Translation["id"];
export const defaultTranslation: TranslationId = "nlt";
export const fallbackTranslation = "web";
export type StaticTranslationId = "kjv" | "web" | "asv" | "bsb";

export function isStaticTranslation(id: TranslationId): id is StaticTranslationId {
  return id !== "nlt" && id !== "esv";
}

export function isTranslationId(value: unknown): value is TranslationId {
  return translations.some(translation => translation.id === value);
}

export function resolveTranslation(value: unknown): TranslationId {
  return isTranslationId(value) ? value : defaultTranslation;
}
