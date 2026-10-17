import { Suspense, ViewTransition } from "react";
import { SiteNav } from "@/components/site-nav";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { StorageNotice } from "@/components/storage-notice";
import { ThemeToggle } from "@/components/theme-toggle";
import { TranslationSelector } from "@/components/translation-selector";

export function SiteShell({ children, translationControl }: Readonly<{ children: React.ReactNode; translationControl?: React.ReactNode }>) {
  return (
    <div className="site-shell">
      <header className="site-header">
        <Link href="/" aria-label="Verselight home" className="brand">
          <BrandMark />
          <span>Verselight<span className="text-primary">.</span></span>
        </Link>
        <div className="header-controls">{translationControl ?? <TranslationSelector />}<ThemeToggle /></div>
      </header>
      <Suspense><SiteNav /></Suspense>
      <StorageNotice />
      <ViewTransition default="none" enter="page-arrival" exit="page-arrival"><main id="main-content" className="site-main">{children}</main></ViewTransition>
      <footer className="site-footer">
        <span>Come as you are. Take your time.</span>
        <p className="translation-credits">Scripture: NLT via Tyndale. KJV, WEB, ASV via bible-api.com; BSB via BereanBible.com. This is a noncommercial project. <Link href="/about">About and privacy</Link>. <a href="/licenses">Sources and copyright notices</a></p>
      </footer>
    </div>
  );
}
