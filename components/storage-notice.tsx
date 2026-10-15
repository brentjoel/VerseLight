"use client";

import Link from "next/link";
import { usePersonalStorage } from "@/lib/browser-storage";

export function StorageNotice() {
  const snapshot = usePersonalStorage();
  if (!snapshot.ready || (!snapshot.message && !snapshot.clockNotice)) return null;
  return <aside className="storage-notice" aria-label="Browser storage notice" role="status">
    <p>{snapshot.message} <Link href="/my-verses#backups">Backup and recovery</Link></p>
    {snapshot.clockNotice && <p>Your device clock or local date moved back. Your history is safe. New activity and milestones will resume when time catches up.</p>}
  </aside>;
}
