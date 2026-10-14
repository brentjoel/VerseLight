import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SiteShell } from "@/components/site-shell";
import { ContentNotice } from "@/components/content-notice";
import { getAllEmotions, getEmotionById, getPromptForReference, getSpecificEmotionByIds } from "@/lib/emotions";

export const ensureStatic = "navigation";

export function generateStaticParams() {
  return getAllEmotions().flatMap((emotion) => emotion.specifics.map((specific) => ({ emotion: emotion.id, sub: specific.id })));
}

export default async function ResultsPage({ params }: { params: Promise<{ emotion: string; sub: string }> }) {
  const { emotion: emotionId, sub } = await params;
  const emotion = getEmotionById(emotionId);
  const specific = getSpecificEmotionByIds(emotionId, sub);
  if (!emotion || !specific) notFound();

  return (
    <SiteShell>
      <Link href={`/emotions/${emotion.id}`} className="back-link">← {emotion.name} feelings</Link>
      <div data-emotion={emotion.id} className="mt-8">
        <div className="max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">A moment to reflect and pray</p>
          <h1 className="font-serif text-4xl leading-tight sm:text-5xl">{specific.name}</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">Take your time with these references. Let a question or a prayer be a place to begin.</p>
        </div>
        <section aria-label={`Verse references for ${specific.name.toLowerCase()}`} className="mt-10">
          <ul className="grid gap-5 md:grid-cols-2">
            {specific.references.map((reference) => {
              const prompt = getPromptForReference(reference);
              return (
                <li key={reference}>
                  <article className="h-full">
                    <Card className="verse-card h-full gap-5 rounded-2xl py-6 shadow-none sm:py-7">
                      <CardHeader className="px-6 sm:px-7">
                        <h2 className="font-serif text-2xl font-normal">{reference}</h2>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">Verse text arrives in the next update.</p>
                      </CardHeader>
                      <CardContent className="space-y-5 px-6 sm:px-7">
                        {prompt ? (
                          <>
                            <div><h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">Reflect</h3><p className="text-sm leading-7">{prompt.reflect}</p></div>
                            <div className="border-t pt-5"><h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">A prayer to begin</h3><p className="text-sm leading-7 text-muted-foreground">{prompt.prayer}</p></div>
                          </>
                        ) : <p className="text-sm leading-7 text-muted-foreground">The reflection for this reference is unavailable right now. You can still bring what is on your heart to God.</p>}
                      </CardContent>
                    </Card>
                  </article>
                </li>
              );
            })}
          </ul>
          {specific.references.length === 0 && <ContentNotice>References for this feeling are being prepared with care. Please visit again soon.</ContentNotice>}
        </section>
      </div>
    </SiteShell>
  );
}
