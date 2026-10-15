import Link from "next/link";
import { Sparkle } from "lucide-react";
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
      <main id="main-content" className="site-main">{children}</main>
      <footer className="site-footer">
        <span>Come as you are. Take your time.</span>
        <p className="translation-credits">Scripture: <a href="https://bible-api.com/">KJV, WEB, ASV via bible-api.com</a>; <a href="https://berean.bible/licensing.htm">BSB via BereanBible.com</a>. Public domain (KJV outside the UK). <a href="/licenses">Sources and licenses</a></p>
      </footer>
    </div>
  );
}
