export const translations = [
  { id: "kjv", shortName: "KJV", fullName: "King James Version", description: "Traditional English from the 1769 text." },
  { id: "web", shortName: "WEB", fullName: "World English Bible", description: "Clear modern English, freely shared." },
  { id: "asv", shortName: "ASV", fullName: "American Standard Version", description: "A closely worded translation first published in 1901." },
  { id: "bsb", shortName: "BSB", fullName: "Berean Standard Bible", description: "Modern English for reading, study, and sharing." },
] as const;

export type Translation = (typeof translations)[number];
export type TranslationId = Translation["id"];
export const defaultTranslation: TranslationId = "web";

export function isTranslationId(value: unknown): value is TranslationId {
  return translations.some(translation => translation.id === value);
}

export function resolveTranslation(value: unknown): TranslationId {
  return isTranslationId(value) ? value : defaultTranslation;
}
