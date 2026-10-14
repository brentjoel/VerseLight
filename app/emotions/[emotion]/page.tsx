import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { ContentNotice } from "@/components/content-notice";
import { getAllEmotions, getEmotionById } from "@/lib/emotions";

export const ensureStatic = "navigation";

export function generateStaticParams() {
  return getAllEmotions().map((emotion) => ({ emotion: emotion.id }));
}

export default async function EmotionPage({ params }: { params: Promise<{ emotion: string }> }) {
  const { emotion: emotionId } = await params;
  const emotion = getEmotionById(emotionId);
  if (!emotion) notFound();

  return (
    <SiteShell>
      <Link href="/" className="back-link">← All feelings</Link>
      <div data-emotion={emotion.id} className="mt-8 max-w-3xl">
        <span aria-hidden="true" className="emotion-icon mb-5 flex size-14 items-center justify-center rounded-2xl text-3xl">{emotion.emoji}</span>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">A little closer to how you feel</p>
        <h1 className="font-serif text-4xl leading-tight sm:text-5xl">{emotion.name}</h1>
        <p className="mt-4 text-lg leading-7 text-muted-foreground">{emotion.description}.</p>
        <section aria-labelledby="specifics-heading" className="mt-10">
          <h2 id="specifics-heading" className="text-xl font-semibold">What feels closest?</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">There is no perfect label. Choose what speaks to you today.</p>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {emotion.specifics.map((specific) => (
              <li key={specific.id}>
                <Link href={`/emotions/${emotion.id}/${specific.id}`} className="emotion-link flex h-full min-h-28 items-center justify-between gap-5 rounded-2xl border p-6 text-lg font-semibold">
                  {specific.name}<span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
          {emotion.specifics.length === 0 && <ContentNotice>We are preparing more ways to explore this feeling. Please visit again soon.</ContentNotice>}
        </section>
      </div>
    </SiteShell>
  );
}
