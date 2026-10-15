"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getPersonalStore, usePersonalStorage } from "@/lib/browser-storage";

export function FeelingLink({ emotionId, specificId, name }: { emotionId: string; specificId: string; name: string }) {
  const snapshot = usePersonalStorage();
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const href = `/emotions/${emotionId}/${specificId}`;
  return <>
    <Link href={href} className="emotion-link specific-link" aria-disabled={busy} onNavigate={event => {
      event.preventDefault();
      if (busy) return;
      if (!snapshot.ready) { setError("Your journal is opening. Try again in a moment, or continue to the verses."); return; }
      setBusy(true); setError("");
      void getPersonalStore().recordMood(emotionId, specificId).then(result => {
        if (result.ok) router.push(href); else setError(result.error);
      }).finally(() => setBusy(false));
    }}>{busy ? "Saving your reflection..." : name}<span aria-hidden="true">&#8594;</span></Link>
    {error && <p className="local-help" role="alert">{error} <Link href={href}>Continue to verses</Link></p>}
  </>;
}
