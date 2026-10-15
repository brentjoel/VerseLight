"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { defaultTranslation, isTranslationId, resolveTranslation, translations, type TranslationId } from "@/lib/translations";

function readPreference() {
  const value = document.cookie.split("; ").find(cookie => cookie.startsWith("translation="))?.slice("translation=".length);
  return resolveTranslation(value);
}

function subscribe(onChange: () => void) {
  window.addEventListener("translation-change", onChange);
  window.addEventListener("focus", onChange);
  window.addEventListener("pageshow", onChange);
  return () => {
    window.removeEventListener("translation-change", onChange);
    window.removeEventListener("focus", onChange);
    window.removeEventListener("pageshow", onChange);
  };
}

export function TranslationSelector({ initialTranslation = defaultTranslation }: { initialTranslation?: TranslationId }) {
  const router = useRouter();
  const selected = useSyncExternalStore(subscribe, readPreference, () => initialTranslation);
  return (
    <label className="translation-selector">
      <span className="sr-only">Bible translation</span>
      <select aria-label="Bible translation" value={selected} onChange={event => {
        const id = event.target.value;
        if (!isTranslationId(id)) return;
        document.cookie = `translation=${id}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
        window.dispatchEvent(new Event("translation-change"));
        router.refresh();
      }}>
        {translations.map(translation => <option key={translation.id} value={translation.id}>{translation.shortName}</option>)}
        <option value="niv" disabled>NIV · Coming soon</option>
      </select>
    </label>
  );
}
