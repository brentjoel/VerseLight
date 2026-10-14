import emotionData from "@/data/emotions.json";
import promptData from "@/data/prompts.json";

export interface SpecificEmotion {
  readonly id: string;
  readonly name: string;
  readonly references: readonly string[];
}

export interface Emotion {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly emoji: string;
  readonly specifics: readonly SpecificEmotion[];
}

export interface VersePrompt {
  readonly reflect: string;
  readonly prayer: string;
}

const emotions: readonly Emotion[] = emotionData;
const prompts: Readonly<Record<string, VersePrompt | undefined>> = promptData;

export function getAllEmotions(): readonly Emotion[] {
  return emotions;
}

export function getEmotionById(id: string): Emotion | undefined {
  return emotions.find((emotion) => emotion.id === id);
}

export function getSpecificEmotionByIds(emotionId: string, subId: string): SpecificEmotion | undefined {
  return getEmotionById(emotionId)?.specifics.find((specific) => specific.id === subId);
}

export function getPromptForReference(reference: string): VersePrompt | undefined {
  return Object.hasOwn(prompts, reference) ? prompts[reference] : undefined;
}
