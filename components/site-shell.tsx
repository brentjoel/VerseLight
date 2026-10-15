import Link from "next/link";
import { Sparkle } from "lucide-react";
import { StorageNotice } from "@/components/storage-notice";
import { ThemeToggle } from "@/components/theme-toggle";
import { TranslationSelector } from "@/components/translation-selector";

export function SiteShell({ children, translationControl }: Readonly<{ children: React.ReactNode; translationControl?: React.ReactNode }>) {
  return (
    <div className="site-shell">
      <header className="site-header">
        <Link href="/" aria-label="Verselight home" className="brand">
          <Sparkle size={21} strokeWidth={1.25} aria-hidden="true" />
          <span>Verselight<span className="text-primary">.</span></span>
        </Link>
        <div className="header-controls">{translationControl ?? <TranslationSelector />}<ThemeToggle /></div>
      </header>
      <nav className="site-nav" aria-label="Main navigation"><Link href="/">Choose a feeling</Link><Link href="/my-verses">My Verses</Link><Link href="/journal">Journal</Link></nav>
      <StorageNotice />
      <main id="main-content" className="site-main">{children}</main>
      <footer className="site-footer">
        <span>Come as you are. Take your time.</span>
        <p className="translation-credits">Scripture: NLT via Tyndale. KJV, WEB, ASV via bible-api.com; BSB via BereanBible.com. This is a noncommercial project. <a href="/licenses">Sources and copyright notices</a></p>
      </footer>
    </div>
  );
}
