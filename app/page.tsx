import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const emotions = [
  ["Anxious", "When your thoughts feel restless", "≈"],
  ["Sad", "When your heart feels heavy", "☂"],
  ["Angry", "When you need room to breathe", "≋"],
  ["Tired", "When you need a little rest", "☾"],
  ["Guilty", "When you long for a fresh start", "↺"],
  ["Grateful", "When you notice the good", "♡"],
  ["Hopeful", "When you look toward tomorrow", "☀"],
  ["Doubtful", "When you are holding questions", "?"],
] as const;

export default function Home() {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 sm:px-8">
      <header className="flex items-center justify-between border-b py-6 sm:py-8">
        <Link href="/" aria-label="Verselight home" className="flex items-center gap-3 rounded-sm text-xl font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
          <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">✦</span>
          Verselight
        </Link>
        <span className="text-xs text-muted-foreground sm:text-sm">A moment of peace</span>
      </header>
      <main id="main-content" className="flex-1 py-12 sm:py-16">
        <div className="mb-10 max-w-xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Pause. Breathe. Be here.</p>
          <h1 className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">Room for whatever<br className="hidden sm:block" /> you are feeling.</h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground">A quiet place to meet your day with Scripture, reflection, and prayer. One small moment at a time.</p>
        </div>
        <div className="grid items-start gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-12">
          <section aria-labelledby="emotions-heading" aria-describedby="emotions-status">
            <div className="mb-5">
              <h2 id="emotions-heading" className="text-xl font-semibold tracking-tight">How are you feeling today?</h2>
              <p id="emotions-status" className="mt-2 text-sm leading-6 text-muted-foreground">A preview of the feelings you can explore. Verse browsing is coming soon.</p>
            </div>
            <ul className="grid grid-cols-2 gap-3 sm:gap-4">
              {emotions.map(([name, hint, symbol]) => (
                <li key={name}>
                  <Card className="h-full gap-3 rounded-2xl py-5 shadow-none">
                    <CardHeader className="gap-3 px-4 sm:px-5">
                      <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-full bg-secondary text-xl text-primary">{symbol}</span>
                      <CardTitle className="text-base">{name}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-5"><p className="text-xs leading-5 text-muted-foreground">{hint}</p></CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="verse-heading" className="lg:pt-1">
            <Card className="gap-6 rounded-2xl border-primary/15 bg-secondary/60 py-7 shadow-none sm:py-8">
              <CardHeader className="px-6 sm:px-7">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-primary">A little light for your day</p>
                <span aria-hidden="true" className="mb-4 text-3xl text-primary">✧</span>
                <CardTitle id="verse-heading" className="font-serif text-2xl font-normal">Verse of the day</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 px-6 sm:px-7">
                <p className="text-sm leading-7 text-muted-foreground">Your daily verse will appear here. This space is being prepared with care.</p>
                <div className="border-t border-primary/15 pt-5"><span className="rounded-full border border-primary/20 px-3 py-1 text-xs text-primary">Coming soon</span></div>
              </CardContent>
            </Card>
            <p className="mt-5 px-2 text-center font-serif text-sm italic text-muted-foreground">Come as you are. Take your time.</p>
          </section>
        </div>
      </main>
      <footer className="border-t py-6 text-xs leading-6 text-muted-foreground">Verselight <span aria-hidden="true">·</span> A quiet beginning.</footer>
    </div>
  );
}
