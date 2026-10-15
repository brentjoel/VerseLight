"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { dailyReference } from "@/lib/daily-verse";
import { ShareCardControls } from "@/components/share-card-controls";
import { SaveVerseButton } from "@/components/save-verse-button";

function localDateSnapshot() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, 30_000);
  window.addEventListener("focus", onChange);
  document.addEventListener("visibilitychange", onChange);
  return () => { window.clearInterval(timer); window.removeEventListener("focus", onChange); document.removeEventListener("visibilitychange", onChange); };
}

export function DailyVerse({ verses }: { verses: Readonly<Record<string, string>> }) {
  const date = useSyncExternalStore(subscribe, localDateSnapshot, () => "");
  if (!date) return <div><p role="status">Finding today&apos;s verse on your device...</p><noscript><p>Today&apos;s local verse needs JavaScript. <Link className="quiet-link" href="/emotions/hopeful" prefetch={false}>Find a hopeful passage</Link></p></noscript></div>;
  const [year, month, day] = date.split("-").map(Number);
  const reference = dailyReference(new Date(year, month - 1, day), Object.keys(verses).sort());
  if (!reference || !verses[reference]?.trim()) return <p>Today&apos;s verse is resting for a moment. <Link className="quiet-link" href="/emotions/hopeful">Find a hopeful passage</Link></p>;
  return <div className="daily-verse" key={reference}>
    <div className="verse-heading-row"><h3 className="verse-reference">{reference}</h3><span className="translation-tag">WEB</span></div>
    <p className="verse-text">{verses[reference]}</p>
    <p className="local-help">World English Bible, public domain. A new passage each local day. <Link href={`/compare?${new URLSearchParams({ ref: reference })}`} className="quiet-link" prefetch={false}>Read in other translations</Link></p>
    <SaveVerseButton reference={reference} translationId="web" />
    <ShareCardControls reference={reference} />
  </div>;
}
