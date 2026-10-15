import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { TranslationCredits } from "@/components/translation-credits";
import { siteUrl } from "@/lib/site-url";

export const metadata = {
  title: "About and privacy | Verselight",
  alternates: { canonical: new URL("/about", siteUrl).href },
  openGraph: { title: "About and privacy | Verselight", url: new URL("/about", siteUrl).href },
};

export default function AboutPage() {
  return <SiteShell>
    <div className="results-wrap license-copy">
      <Link href="/" className="back-link">← Home</Link>
      <h1>About Verselight</h1>
      <p>A quiet place to meet a feeling with Scripture, a reflection question, and a prayer starter. Everyone is welcome as a guest. This is a strictly noncommercial personal and portfolio project, with no ads, payments, subscriptions, donations, or paid features.</p>
      <p>Visit <a href={siteUrl.href}>Verselight</a>.</p>
      <section aria-labelledby="privacy">
        <h2 id="privacy" className="mt-10 font-serif text-2xl">Your privacy</h2>
        <p>Your saved references, collections, journal notes, activity, streaks, and badges stay in this browser on this site. Verselight does not upload them or sync them between devices. They are not encrypted by the app; someone with access to your browser or device may read them.</p>
        <p>Remove saved references and collections in <Link href="/my-verses">My Verses</Link>, and reflections in <Link href="/journal">Journal</Link>. Removing a reflection keeps its activity day and earned milestones. To erase everything, clear this site&apos;s data in your browser settings. This also resets preferences. Delete any downloaded backups separately.</p>
        <p>Browser cleanup, storage eviction, private browsing, or device loss can erase your records. When storage is unavailable, changes may last only in the current tab. Export regularly from My Verses. Backups are unencrypted JSON files that can contain private notes. Keep them somewhere safe. Import reads the file locally, previews its contents, and asks before replacing current records. Nothing is uploaded. Each preview URL and the production site have separate storage.</p>
        <p>The translation preference is the exception: a validated cookie is sent to this site&apos;s server to choose passages and expires after one year. Theme preferences stay in browser storage. Normal page requests expose network information, such as your IP address and public page URL, to the hosting provider. Reading a feeling page can reveal that public choice in hosting access logs; your journal records and notes are never included.</p>
        <p>For NLT, our server sends a public Scripture reference and its server credential to Tyndale. Best-effort quota protection keeps only operational request timestamps and cooldowns in each server instance&apos;s memory, never visitor identifiers or personal records. Server warnings use fixed codes without request details. There is no app analytics, tracking, or browser error upload. Hosting providers may keep their own operational logs.</p>
      </section>
      <section aria-labelledby="credits">
        <h2 id="credits" className="mt-10 font-serif text-2xl">Translation credits</h2>
        <p>NLT is the default. Source wording and punctuation are preserved. <Link href="/licenses">Scripture sources and copyright notices</Link> are also available separately.</p>
        <TranslationCredits />
      </section>
    </div>
  </SiteShell>;
}
