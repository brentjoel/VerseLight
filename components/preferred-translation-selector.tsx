import { TranslationSelector } from "@/components/translation-selector";
import { getPreferredTranslation } from "@/lib/translation-preference";

export async function PreferredTranslationSelector() {
  return <TranslationSelector initialTranslation={await getPreferredTranslation()} />;
}
