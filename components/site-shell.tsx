import Link from "next/link";
import { Sparkle } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="site-shell">
      <header className="site-header">
        <Link href="/" aria-label="Verselight home" className="brand">
          <Sparkle size={21} strokeWidth={1.25} aria-hidden="true" />
          <span>Verselight<span className="text-primary">.</span></span>
        </Link>
        <ThemeToggle />
      </header>
      <main id="main-content" className="site-main">{children}</main>
      <footer className="site-footer"><span>Verselight</span><span>Come as you are. Take your time.</span></footer>
    </div>
  );
}
