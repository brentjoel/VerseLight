"use client";

import Link from "next/link";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getPersonalStore, reloadPersonalStorage, usePersonalStorage } from "@/lib/browser-storage";
import { readBackup, type StorageResult } from "@/lib/storage";
import { MAX_BYTES, type Backup, type Collection, type StorageEnvelope } from "@/lib/storage-schema";

function download(text: string, filename: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const link = document.createElement("a"); link.href = url; link.download = filename;
  document.body.append(link); link.click(); link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function CollectionEditor({ collection, disabled, run }: { collection: Collection; disabled: boolean; run: (work: () => Promise<StorageResult>, success: string) => Promise<void> }) {
  const [name, setName] = useState(collection.name);
  const [confirm, setConfirm] = useState(false);
  return <div className="collection-editor">
    <form onSubmit={event => { event.preventDefault(); void run(() => getPersonalStore().renameCollection(collection.id, name), "Collection renamed."); }} className="local-form">
      <label htmlFor={`rename-${collection.id}`}>Collection name</label>
      <div className="local-input-row"><input id={`rename-${collection.id}`} value={name} required maxLength={80} onChange={event => setName(event.target.value)} disabled={disabled} /><button className="compare-link" disabled={disabled || !name.trim()}>Rename</button></div>
    </form>
    <p className="local-help">{collection.savedVerseIds.length} saved {collection.savedVerseIds.length === 1 ? "reference" : "references"}</p>
    {confirm ? <div className="inline-confirm"><p>Delete this collection? Your saved verses will stay.</p><button type="button" className="compare-link" disabled={disabled} onClick={() => void run(() => getPersonalStore().deleteCollection(collection.id), "Collection deleted. Your saved verses are still here.")}>Delete collection</button><button type="button" className="compare-link" onClick={() => setConfirm(false)}>Keep collection</button></div> : <button type="button" className="quiet-link" disabled={disabled} onClick={() => setConfirm(true)}>Delete collection</button>}
  </div>;
}

export function MyVerses() {
  const snapshot = usePersonalStorage();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [collectionName, setCollectionName] = useState("");
  const [filter, setFilter] = useState("");
  const [staged, setStaged] = useState<{ backup: Backup; base: StorageEnvelope } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmReload, setConfirmReload] = useState(false);
  const readToken = useRef(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const locked = busy || snapshot.mode === "blocked" || snapshot.mode === "conflict";
  const { savedVerses, collections } = snapshot.envelope.data;
  const selectedCollection = collections.find(collection => collection.id === filter);
  const visibleVerses = selectedCollection ? savedVerses.filter(verse => selectedCollection.savedVerseIds.includes(verse.id)) : savedVerses;

  async function run(work: () => Promise<StorageResult>, success: string) {
    setBusy(true); setError(""); setStatus("");
    try { const result = await work(); if (!result.ok) setError(result.error); else setStatus(success); }
    catch { setError("We could not finish that change. Please try again."); }
    finally { setBusy(false); }
  }
  function exportBackup() {
    setError("");
    try { download(getPersonalStore().exportBackup(), `verselight-backup-${new Date().toISOString().slice(0, 10)}.json`); setStatus("Backup downloaded. Keep it somewhere safe."); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "The backup could not be downloaded."); }
  }
  async function chooseBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = "";
    const token = ++readToken.current;
    setStaged(null); setError(""); setStatus("");
    if (!file) return;
    if (file.size > MAX_BYTES) { setError("This file is too large. The limit is 5 MiB."); return; }
    setBusy(true);
    try {
      const base = getPersonalStore().getSnapshot().envelope;
      const backup = readBackup(await file.text());
      if (token === readToken.current) setStaged({ backup, base });
    } catch (failure) { if (token === readToken.current) setError(failure instanceof Error ? failure.message : "This backup could not be opened. Your current data is unchanged."); }
    finally { if (token === readToken.current) setBusy(false); }
  }
  function createCollection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void run(async () => { const result = await getPersonalStore().createCollection(collectionName); if (result.ok) setCollectionName(""); return result; }, "Collection created.");
  }
  if (!snapshot.ready) return <p className="content-notice" role="status">Opening your saved verses...</p>;
  return <>
    <div className="local-feedback" aria-live="polite"><p role="status">{busy ? "Taking care of that..." : status}</p></div>
    {error && <p className="content-notice local-error" role="alert">{error}</p>}
    {snapshot.mode === "blocked" ? <div className="content-notice"><h2>Your saved data needs care</h2><p>It has not been replaced. Use backup and recovery below to download the original file or choose a fresh start.</p></div> : <>
      <section aria-labelledby="collections-heading" className="library-section">
        <div className="section-heading"><h2 id="collections-heading">Your collections</h2></div>
        <form className="local-form" onSubmit={createCollection}>
          <label htmlFor="new-collection">New collection name</label><div className="local-input-row"><input id="new-collection" value={collectionName} onChange={event => setCollectionName(event.target.value)} maxLength={80} required placeholder="A little hope" disabled={locked} /><button className="compare-link" disabled={locked || !collectionName.trim()}>Create collection</button></div>
        </form>
        {collections.length === 0 ? <p className="local-help">No collections yet. Gather a few references around what matters to you.</p> : <div className="collection-grid">{collections.map(collection => <CollectionEditor key={`${collection.id}:${collection.name}`} collection={collection} disabled={locked} run={run} />)}</div>}
      </section>
      <section aria-labelledby="saved-heading" className="library-section">
        <div className="section-heading"><h2 id="saved-heading">Saved verses</h2></div>
        {collections.length > 0 && <div className="local-form"><label htmlFor="collection-filter">Show collection</label><select id="collection-filter" value={selectedCollection?.id ?? ""} onChange={event => setFilter(event.target.value)}><option value="">All saved verses</option>{collections.map(collection => <option key={collection.id} value={collection.id}>{collection.name}</option>)}</select></div>}
        {visibleVerses.length === 0 ? <div className="content-notice"><p>{savedVerses.length === 0 ? "Your first saved verse is waiting to find you. Choose a feeling, then use Save verse beside a passage." : "This collection has room for a little light. Choose All saved verses to add references here."}</p><Link href="/" className="back-link">Choose a feeling</Link></div> : <ul className="verse-list saved-list">{visibleVerses.map(verse => {
          const other = verse.translationId === "web" ? "bsb" : "web";
          const query = new URLSearchParams({ ref: verse.reference }); query.append("translations", verse.translationId); query.append("translations", other);
          return <li key={verse.id} className="verse-card saved-card"><div className="verse-heading-row"><h3 className="saved-reference">{verse.reference}</h3><span className="translation-tag">{verse.translationId.toUpperCase()}</span></div>
            <p className="local-help">Saved as a reference. Scripture is loaded only when you open the reading view.</p>
            <Link href={`/compare?${query}`} prefetch={false} className="back-link">Read and compare <span aria-hidden="true">&#8599;</span></Link>
            {collections.length > 0 && <fieldset className="membership"><legend>Add to collections</legend>{collections.map(collection => <label key={collection.id}><input type="checkbox" checked={collection.savedVerseIds.includes(verse.id)} disabled={locked} onChange={event => { const checked = event.target.checked; void run(() => getPersonalStore().setMembership(collection.id, verse.id, checked), checked ? "Added to collection." : "Removed from collection."); }} />{collection.name}</label>)}</fieldset>}
            <button type="button" className="quiet-link" disabled={locked} onClick={() => void run(() => getPersonalStore().removeSave(verse.id), "Saved verse removed, including its collection memberships.")}>Remove saved verse</button>
          </li>;
        })}</ul>}
      </section>
    </>}
    <section id="backups" aria-labelledby="backups-heading" className="library-section backup-panel">
      <div className="section-heading"><h2 id="backups-heading">Backup and recovery</h2></div>
      <p>Your data stays in this browser. Clearing browser data, using a private window, or losing this device can remove it. Export a JSON backup to keep a copy or move it to another browser. Nothing is uploaded.</p>
      <p className="local-help">Backups are unencrypted files with your saved references, collections, journal notes, activity, milestones and preferences, never Scripture text. Keep them somewhere safe.</p>
      <div className="local-actions"><button type="button" className="compare-link" onClick={exportBackup} disabled={busy || snapshot.mode === "blocked"}>Export backup</button><button type="button" className="compare-link" onClick={() => fileInput.current?.click()} disabled={locked}>Choose JSON to import</button></div>
      <input ref={fileInput} className="sr-only" type="file" accept=".json,application/json" aria-label="Choose a Verselight JSON backup" disabled={locked} onChange={event => void chooseBackup(event)} />
      {staged && <div className="import-preview" role="region" aria-labelledby="import-heading">
        <h3 id="import-heading">Review this backup</h3><p>{staged.backup.data.savedVerses.length} saved references, {staged.backup.data.collections.length} collections, {staged.backup.data.moodEntries.length} reflections, {staged.backup.data.activityDays.length} active days and {staged.backup.data.badges.length} milestones. Exported {new Date(staged.backup.exportedAt).toLocaleString()}.</p>
        <p>This will replace all current saved references, collections, journal notes, activity, milestones and preferences. It will also apply the backup&apos;s theme and translation. Export your current data first if you want to keep it.</p>
        {snapshot.mode === "memory" && <p>Storage is unavailable. This import will last only this session.</p>}
        <div className="local-actions"><button type="button" className="compare-link" disabled={locked} onClick={exportBackup}>Export current data first</button><button type="button" className="compare-link" disabled={locked} onClick={() => void run(async () => { const result = await getPersonalStore().importBackup(staged.backup, staged.base); if (result.ok) { setStaged(null); setFilter(""); router.refresh(); } return result; }, "Backup imported. Your references and preferences are ready.")}>Replace with this backup</button><button type="button" className="compare-link" disabled={busy} onClick={() => { readToken.current++; setStaged(null); }}>Cancel import</button></div>
      </div>}
      {snapshot.mode === "blocked" && <div className="local-actions"><button type="button" className="compare-link" onClick={() => { try { const raw = getPersonalStore().recoveryText(); if (raw !== null) download(raw, "verselight-raw-recovery.json"); } catch { setError("The recovery download could not be created. Your original data is unchanged."); } }}>Download raw recovery file</button><p className="local-help">This is the original unreadable data, not a validated backup. Keep it for recovery.</p><button type="button" className="compare-link" onClick={() => setConfirmReset(true)}>Choose a fresh start</button></div>}
      {confirmReset && <div className="inline-confirm"><p>A fresh start replaces unreadable browser data with empty records. Download its raw recovery file first.</p><button type="button" className="compare-link" disabled={busy} onClick={() => void run(async () => { const result = await getPersonalStore().reset(); if (result.ok) setConfirmReset(false); return result; }, "A fresh start is ready.")}>Replace unreadable data</button><button type="button" className="compare-link" onClick={() => setConfirmReset(false)}>Keep original data</button></div>}
      <div className="local-actions"><button type="button" className="compare-link" disabled={busy} onClick={() => setConfirmReload(true)}>Reload saved data</button></div>
      {confirmReload && <div className="inline-confirm"><p>Reload from this browser&apos;s storage? Changes kept only in this tab will be lost. Export this tab&apos;s data first if you need it.</p><button type="button" className="compare-link" onClick={() => { reloadPersonalStorage(); setConfirmReload(false); setStaged(null); setStatus("Saved data reloaded."); setError(""); }}>Reload now</button><button type="button" className="compare-link" onClick={() => setConfirmReload(false)}>Keep this tab&apos;s data</button></div>}
    </section>
  </>;
}
