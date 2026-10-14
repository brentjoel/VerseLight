import Link from "next/link";

export function SiteShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 sm:px-8">
      <header className="flex items-center justify-between gap-4 border-b py-6 sm:py-8">
        <Link href="/" aria-label="Verselight home" className="flex items-center gap-3 rounded-sm text-xl font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
          <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">✦</span>
          Verselight
        </Link>
        <span className="text-xs text-muted-foreground sm:text-sm">A moment of peace</span>
      </header>
      <main id="main-content" className="flex-1 py-12 sm:py-16">{children}</main>
      <footer className="border-t py-6 text-xs leading-6 text-muted-foreground">Verselight <span aria-hidden="true">·</span> Come as you are.</footer>
    </div>
  );
}
