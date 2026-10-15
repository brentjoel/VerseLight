import { cookies } from "next/headers";
import { resolveTranslation } from "@/lib/translations";

export async function getPreferredTranslation() {
  // TODO Step 4: sync this cookie preference to profiles.preferred_translation.
  return resolveTranslation((await cookies()).get("translation")?.value);
}
