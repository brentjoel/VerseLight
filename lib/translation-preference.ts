import { cookies } from "next/headers";
import { resolveTranslation } from "@/lib/translations";

export async function getPreferredTranslation() {
  return resolveTranslation((await cookies()).get("translation")?.value);
}
