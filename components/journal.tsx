"use client";

import Link from "next/link";
import { RemovalButton } from "@/components/removal-button";
import { Constellation } from "@/components/constellation";
import { useState } from "react";
import emotions from "@/data/emotions.json";
import { BADGES } from "@/lib/badges";
import { getPersonalStore, usePersonalStorage } from "@/lib/browser-storage";
import { localClock, shiftDate } from "@/lib/streaks";
import { MAX_NOTE_LENGTH, type MoodEntry } from "@/lib/storage-schema";
import type { StorageResult } from "@/lib/storage";

function Reflection({ mood, disabled, run }: { mood: MoodEntry; disabled: boolean; run: (work: () => Promise<StorageResult>) => Promise<void> }) {
  const [note, setNote] = useState(mood.note ?? "");
  const [confirm, setConfirm] = useState(false);
  const emotion = emotions.find(emotion => emotion.id === mood.emotionId)!;
  return <li className="verse-card" data-emotion={emotion.id}>
    <h3>{emotion.name}: {emotion.specifics.find(s => s.id === mood.specificEmotionId)?.name}</h3>
    <p className="local-help"><time dateTime={mood.localDate}>{mood.localDate}</time></p>
    <form className="local-form" onSubmit={event => { event.preventDefault(); void run(() => getPersonalStore().editMood(mood.id, note)); }}>
      <label htmlFor={`note-${mood.id}`}>A note for yourself (optional)</label>
      <textarea id={`note-${mood.id}`} rows={3} maxLength={MAX_NOTE_LENGTH} value={note} onChange={event => setNote(event.target.value)} disabled={disabled} aria-describedby={`limit-${mood.id}`} />
      <p id={`limit-${mood.id}`} className="local-help">{note.length} of {MAX_NOTE_LENGTH} characters. Included in local backups.</p>
      <button className="compare-link" disabled={disabled || note === (mood.note ?? "")}>Save note</button>
    </form>
    {confirm ? <div className="inline-confirm"><p>Remove this reflection and its note? Your activity day and earned milestones will stay.</p><RemovalButton className="compare-link" disabled={disabled} onRemove={() => void run(() => getPersonalStore().removeMood(mood.id))}>Remove reflection</RemovalButton><button className="compare-link" onClick={() => setConfirm(false)}>Keep reflection</button></div> : <button className="quiet-link" disabled={disabled} onClick={() => setConfirm(true)}>Remove reflection</button>}
  </li>;
}

export function Journal() {
  const snapshot = usePersonalStorage();
  const [month, setMonth] = useState("");
  const [selected, setSelected] = useState("");
  const [limit, setLimit] = useState(20);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  async function run(work: () => Promise<StorageResult>) {
    setBusy(true); setError(""); setStatus("");
    try { const result = await work(); if (result.ok) setStatus("Your journal is saved."); else setError(result.error); }
    catch { setError("We could not save that change. Please try again."); }
    finally { setBusy(false); }
  }
  if (!snapshot.ready) return <p className="content-notice skeleton" role="status">Opening your journal...</p>;
  if (snapshot.mode === "blocked") return <p className="content-notice">Your saved data needs care. <Link href="/my-verses#backups">Open backup and recovery</Link> to keep a copy and choose your next step.</p>;
  const { moodEntries, activityDays, streakState, badges } = snapshot.envelope.data;
  const disabled = busy || snapshot.mode === "conflict";
  const first = `${month || (streakState.maxObservedLocalDate ?? localClock().localDate).slice(0, 7)}-01`;
  const next = shiftDate(first, 32).slice(0, 7) + "-01";
  const last = shiftDate(next, -1);
  const start = (new Date(`${first}T00:00:00Z`).getUTCDay() + 6) % 7;
  const cells: (string | null)[] = [...Array(start).fill(null)];
  for (let date = first; date <= last; date = shiftDate(date, 1)) cells.push(date);
  while (cells.length % 7) cells.push(null);
  const entries = [...moodEntries].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).filter(mood => !selected || mood.localDate === selected);
  return <>
    <p role="status" aria-live="polite">{busy ? "Saving..." : status}</p>
    {error && <p className="content-notice" role="alert">{error}</p>}
    <section className="library-section" aria-labelledby="progress-heading">
      <div className="section-heading"><h2 id="progress-heading">Small moments add up</h2></div>
      <p>{streakState.currentStreak} active {streakState.currentStreak === 1 ? "day" : "days"} in your current streak. Longest: {streakState.longestStreak}.</p>
      <p className="local-help">Choosing a feeling or saving a verse counts once each local day. One missed day per Monday to Sunday week can preserve continuity when you return. Grace never adds an active day. Device time cannot establish trusted time; travel may pause accrual until your local date catches up.</p>
      <h3 className="mt-6">Your milestones</h3>
      {badges.length ? <ul className="badge-list">{badges.map(badge => <li key={badge.key}>{BADGES[badge.key]} <span className="local-help">earned <time dateTime={badge.earnedAt}>{badge.earnedAt.slice(0, 10)}</time></span></li>)}</ul> : <p className="local-help">Your first reflection, saved verse or collection begins a milestone. Take your time.</p>}
    </section>
    <section className="library-section" aria-labelledby="calendar-heading">
      <div className="section-heading"><h2 id="calendar-heading">Your calendar</h2></div>
      <div className="local-actions"><button className="compare-link" onClick={() => setMonth(shiftDate(first, -1).slice(0, 7))} disabled={first <= "0001-02-01"}>Previous month</button><button className="compare-link" onClick={() => setMonth(next.slice(0, 7))} disabled={first >= "9999-11-01"}>Next month</button></div>
      <p id="calendar-key" className="local-help">Empty: no activity. A dot marks activity without a reflection; r shows the reflection count. Deeper color means more reflections. G marks a used grace day. Choose a date to read its reflections.</p>
      <div className="calendar-scroll"><table className="journal-calendar" aria-describedby="calendar-key"><caption>{first.slice(0, 7)}</caption><thead><tr>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => <th scope="col" key={day}>{day}</th>)}</tr></thead><tbody>{Array.from({ length: cells.length / 7 }, (_, week) => <tr key={week}>{cells.slice(week * 7, week * 7 + 7).map((date, index) => {
        if (!date) return <td key={`blank-${index}`} />;
        const count = moodEntries.filter(mood => mood.localDate === date).length;
        const active = activityDays.some(day => day.localDate === date);
        const grace = streakState.graceDates.includes(date);
        const description = `${date}: ${count} reflections, ${active ? "active day" : grace ? "grace day" : "no activity"}`;
        return <td key={date}><button className="calendar-day" data-tooltip={description} data-level={count > 1 ? 3 : count ? 2 : active ? 1 : 0} aria-pressed={selected === date} aria-label={description} onClick={() => { setSelected(date); setLimit(20); }}>{Number(date.slice(8))}<span className="calendar-mark" aria-hidden="true">{count ? `${count}r` : active ? "•" : grace ? "G" : "\u00a0"}</span></button></td>;
      })}</tr>)}</tbody></table></div>
      {selected && <p className="local-help" role="status">{selected}: {moodEntries.filter(mood => mood.localDate === selected).length} reflections, {activityDays.some(day => day.localDate === selected) ? "active day" : streakState.graceDates.includes(selected) ? "grace day" : "no activity"}.</p>}
    </section>
    <section className="library-section" aria-labelledby="reflections-heading"><div className="section-heading"><h2 id="reflections-heading">{selected ? `Reflections on ${selected}` : "Your reflections"}</h2></div>
      {selected && <button className="compare-link" onClick={() => setSelected("")}>Show all reflections</button>}
      <p className="local-help">Choose a specific feeling to add a reflection. Notes are optional. Removing a reflection keeps its historical activity day.</p>
      {entries.length ? <ul className="verse-list">{entries.slice(0, limit).map(mood => <Reflection key={`${mood.id}:${mood.note ?? ""}`} mood={mood} disabled={disabled} run={run} />)}</ul> : <div className="content-notice"><Constellation /><p>No reflections here yet. <Link href="/">Choose a feeling</Link> when you are ready.</p></div>}
      {entries.length > limit && <button className="compare-link" onClick={() => setLimit(limit + 20)}>Show more reflections</button>}
      <p className="local-help"><Link href="/my-verses#backups">Export or import your journal with a local backup.</Link> Backups include notes and are unencrypted.</p>
    </section>
  </>;
}
