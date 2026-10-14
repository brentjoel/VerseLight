import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { ContentNotice } from "@/components/content-notice";
import { getAllEmotions } from "@/lib/emotions";

export default function Home() {
  const emotions = getAllEmotions();
  return (
    <SiteShell>
      <div className="mb-10 max-w-xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Pause. Breathe. Be here.</p>
        <h1 className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">Room for whatever<br className="hidden sm:block" /> you are feeling.</h1>
        <p className="mt-5 text-base leading-7 text-muted-foreground">A quiet place to meet your day with Scripture, reflection, and prayer. One small moment at a time.</p>
      </div>
      <div className="grid items-start gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-12">
        <section aria-labelledby="emotions-heading" aria-describedby="emotions-status">
          <div className="mb-5">
            <h2 id="emotions-heading" className="text-xl font-semibold tracking-tight">How are you feeling today?</h2>
            <p id="emotions-status" className="mt-2 text-sm leading-6 text-muted-foreground">Start with a feeling, then find the words that fit. No account needed.</p>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:gap-4">
            {emotions.map((emotion) => (
              <li key={emotion.id}>
                <Link href={`/emotions/${emotion.id}`} data-emotion={emotion.id} className="emotion-link block h-full rounded-2xl">
                  <Card className="h-full gap-3 rounded-2xl border-inherit bg-transparent py-5 shadow-none">
                    <CardHeader className="gap-3 px-4 sm:px-5">
                      <span aria-hidden="true" className="emotion-icon flex size-9 items-center justify-center rounded-full text-xl">{emotion.emoji}</span>
                      <CardTitle className="text-base">{emotion.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-5"><p className="text-xs leading-5 text-muted-foreground">{emotion.description}</p></CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
          {emotions.length === 0 && <ContentNotice>Our feelings library is resting for a moment. Please visit again soon.</ContentNotice>}
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
    </SiteShell>
  );
}
