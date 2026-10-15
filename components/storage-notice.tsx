"use client";

import Link from "next/link";
import { usePersonalStorage } from "@/lib/browser-storage";

export function StorageNotice() {
  const snapshot = usePersonalStorage();
  if (!snapshot.ready || !snapshot.message) return null;
  return <aside className="storage-notice" aria-label="Browser storage notice" role="status">
    <p>{snapshot.message} <Link href="/my-verses#backups">Backup and recovery</Link></p>
  </aside>;
}
