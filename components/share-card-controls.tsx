"use client";

import { useRef, useState } from "react";

export function ShareCardControls({ reference }: { reference: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const pending = useRef(false);
  const url = `/share?${new URLSearchParams({ ref: reference, translation: "web" })}`;

  async function download() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true); setMessage(""); setFailed(false);
    try {
      // Only the public reference and fixed translation leave the browser.
      const response = await fetch(url, { credentials: "omit", referrerPolicy: "no-referrer", cache: "no-store", redirect: "error", signal: AbortSignal.timeout(20_000) });
      if (!response.ok || !response.headers.get("content-type")?.startsWith("image/png")) throw new Error("Card unavailable.");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `verselight-${reference.replace(/[^a-z0-9]+/gi, "-")}-web.png`;
      document.body.append(link); link.click(); link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
      setMessage("Your PNG is ready. You can share the downloaded card wherever you like.");
    } catch {
      setFailed(true); setMessage("The card could not download. Try again, or open the card and save the image.");
    } finally {
      pending.current = false; setBusy(false);
    }
  }

  return <div className="share-controls">
    <p className="local-help">Share cards use WEB (World English Bible), with public Scripture only.</p>
    <div className="local-actions">
      <button className="compare-link" type="button" disabled={busy} onClick={() => void download()} aria-label={`Download WEB image card for ${reference}`}>{busy ? "Preparing card..." : "Download WEB card"}</button>
      <a className="quiet-link" href={url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" aria-label={`Open WEB image card for ${reference} in a new tab`}>Open card <span className="sr-only">in a new tab</span></a>
    </div>
    <p className="local-help" role={failed ? "alert" : "status"}>{message}</p>
  </div>;
}
