"use client";

import { Bookmark } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { getPersonalStore, usePersonalStorage } from "@/lib/browser-storage";
import type { SavedVerse } from "@/lib/storage-schema";

export function SaveVerseButton(props: Omit<SavedVerse, "id" | "createdAt">) {
  const snapshot = usePersonalStorage();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(false);
  const saved = snapshot.envelope.data.savedVerses.some(verse => verse.reference === props.reference && verse.translationId === props.translationId);
  async function save() {
    setBusy(true); setError("");
    const result = await getPersonalStore().save(props);
    if (!result.ok) setError(result.error);
    else setNotice(true);
    setBusy(false);
  }
  return <div className="save-control">
    <button type="button" className="compare-link save-button" data-saved={saved} data-tooltip={saved ? "Saved" : "Save"} disabled={!snapshot.ready || busy || saved || snapshot.mode === "blocked" || snapshot.mode === "conflict"} onClick={save} aria-label={`${saved ? "Saved" : "Save"} ${props.reference} ${props.translationId.toUpperCase()}`}>
      <Bookmark size={17} aria-hidden="true" />{saved ? "Saved" : !snapshot.ready ? "Opening saved verses..." : busy ? "Saving..." : "Save"}
    </button>
    {saved && <Link className="quiet-link" href="/my-verses">View My Verses</Link>}
    <span role="status" aria-live="polite" className="save-toast-region">{notice && <span className="save-toast" onAnimationEnd={() => setNotice(false)}>Saved</span>}</span>
    {error && <p className="local-error" role="alert">{error}</p>}
  </div>;
}
