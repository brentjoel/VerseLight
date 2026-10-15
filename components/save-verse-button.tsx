"use client";

import { useState } from "react";
import Link from "next/link";
import { getPersonalStore, usePersonalStorage } from "@/lib/browser-storage";
import type { SavedVerse } from "@/lib/storage-schema";

export function SaveVerseButton(props: Omit<SavedVerse, "id" | "createdAt">) {
  const snapshot = usePersonalStorage();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const saved = snapshot.envelope.data.savedVerses.some(verse => verse.reference === props.reference && verse.translationId === props.translationId);
  async function save() {
    setBusy(true); setError("");
    const result = await getPersonalStore().save(props);
    if (!result.ok) setError(result.error);
    setBusy(false);
  }
  return <div className="save-control">
    <button type="button" className="compare-link" disabled={!snapshot.ready || busy || saved || snapshot.mode === "blocked" || snapshot.mode === "conflict"} onClick={save} aria-label={`${saved ? "Saved" : "Save"} ${props.reference} ${props.translationId.toUpperCase()}`}>
      {saved ? "Saved to My Verses" : !snapshot.ready ? "Opening saved verses..." : busy ? "Saving..." : "Save verse"}
    </button>
    {saved && <Link className="quiet-link" href="/my-verses">View My Verses</Link>}
    {error && <p className="local-error" role="alert">{error}</p>}
  </div>;
}
