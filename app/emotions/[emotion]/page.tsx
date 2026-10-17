import Link from "next/link";
import { EmotionIcon } from "@/components/emotion-icon";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { ContentNotice } from "@/components/content-notice";
import { FeelingLink } from "@/components/feeling-link";
import { getAllEmotions, getEmotionById } from "@/lib/emotions";

export const ensureStatic = "navigation";

export async function generateMetadata({ params }: { params: Promise<{ emotion: string }> }) {
  const emotion = getEmotionById((await params).emotion);
  return { title: `${emotion?.name ?? "Find a feeling"} | Verselight`, description: `Find a feeling that fits and take a quiet moment with Scripture, reflection, and prayer.` };
}

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
      <div data-emotion={emotion.id} className="detail-wrap">
        <div className="detail-heading">
          <span aria-hidden="true" className="emotion-icon"><EmotionIcon emotionId={emotion.id} /></span>
          <p className="eyebrow">A little closer to how you feel</p>
          <h1>{emotion.name}</h1>
          <p>{emotion.description}.</p>
        </div>
        <section aria-labelledby="specifics-heading">
          <h2 id="specifics-heading" className="text-lg font-medium">What feels closest?</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">There is no perfect label. Choose what speaks to you today.</p>
          <ul className="specific-grid">
            {emotion.specifics.map((specific) => (
              <li key={specific.id}>
                <FeelingLink emotionId={emotion.id} specificId={specific.id} name={specific.name} />
              </li>
            ))}
          </ul>
          {emotion.specifics.length === 0 && <ContentNotice>We are preparing more ways to explore this feeling. Please visit again soon.</ContentNotice>}
        </section>
      </div>
    </SiteShell>
  );
}
