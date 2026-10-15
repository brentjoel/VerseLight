import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { VerseCarousel } from "@/components/verse-carousel";
import { SiteShell } from "@/components/site-shell";
import { ContentNotice } from "@/components/content-notice";
import { getAllEmotions, getEmotionById, getPromptForReference, getSpecificEmotionByIds, type Emotion, type SpecificEmotion } from "@/lib/emotions";
import { getPreferredTranslation } from "@/lib/translation-preference";
import { getVersePassage } from "@/lib/verse-passage";
import { PassageAttribution } from "@/components/passage-attribution";
import { PreferredTranslationSelector } from "@/components/preferred-translation-selector";
import { SaveVerseButton } from "@/components/save-verse-button";
import { TranslationSelector } from "@/components/translation-selector";
import { ShareCardControls } from "@/components/share-card-controls";
import { DawnReveal } from "@/components/dawn-reveal";
import { passageTokens } from "@/lib/dawn";

export function generateStaticParams() {
  return getAllEmotions().flatMap((emotion) => emotion.specifics.map((specific) => ({ emotion: emotion.id, sub: specific.id })));
}

export default async function ResultsPage({ params }: { params: Promise<{ emotion: string; sub: string }> }) {
  const { emotion: emotionId, sub } = await params;
  const emotion = getEmotionById(emotionId);
  const specific = getSpecificEmotionByIds(emotionId, sub);
  if (!emotion || !specific) notFound();
  return <SiteShell translationControl={<Suspense fallback={<TranslationSelector />}><PreferredTranslationSelector /></Suspense>}><Suspense fallback={<ContentNotice>Finding your verses...</ContentNotice>}><ResultsContent emotion={emotion} specific={specific} /></Suspense></SiteShell>;
}

async function ResultsContent({ emotion, specific }: { emotion: Emotion; specific: SpecificEmotion }) {
  const translation = await getPreferredTranslation();
  const passages = await Promise.all(specific.references.map(reference => getVersePassage(reference, translation)));
  const returnTo = `/emotions/${emotion.id}/${specific.id}`;

  return (
    <>
      <Link href={`/emotions/${emotion.id}`} className="back-link">← {emotion.name} feelings</Link>
      <div data-emotion={emotion.id} className="results-wrap">
        <div className="results-heading">
          <p className="eyebrow"><span className="emotion-dot" /> A moment to reflect and pray</p>
          <h1>{specific.name}</h1>
          <p>Take your time with these references. Let a question or a prayer be a place to begin.</p>
        </div>
        <section aria-label={`Verse references for ${specific.name.toLowerCase()}`} className="mt-10">
            <VerseCarousel key={returnTo}>
              {specific.references.map((reference, index) => {
                const prompt = getPromptForReference(reference);
                const passage = passages[index];
                return (
                  <DawnReveal key={reference} path={returnTo + reference + translation}><article className="verse-card reading-verse">
                    <div className="verse-heading-row"><h2 className="verse-reference">{reference}</h2><span className="translation-tag">{passage.translationId.toUpperCase()}</span></div>
                    <p className="verse-text">{passageTokens(passage.text).map((token, tokenIndex) => /^\s+$/u.test(token) ? token : <span key={tokenIndex} data-dawn-word="">{token}</span>)}</p>
                    <PassageAttribution passage={passage} />
                    <div className="verse-actions">
                      <SaveVerseButton reference={reference} translationId={passage.translationId} emotionId={emotion.id} specificEmotionId={specific.id} />
                      <Link className="compare-link" data-tooltip="Compare translations" href={`/compare?${new URLSearchParams({ ref: reference, from: returnTo })}`} aria-label={`Compare translations of ${reference}`}><ArrowUpRight size={17} aria-hidden="true" />Compare</Link>
                      <ShareCardControls reference={reference} />
                    </div>
                    <details className="reflect-section"><summary>Reflect</summary>
                      {prompt ? <>
                        <div><h3 className="prompt-label">A question to sit with</h3><p className="reflect-copy">{prompt.reflect}</p></div>
                        <div className="prayer-block"><h3 className="prompt-label">A prayer to begin</h3><p className="prayer-copy">{prompt.prayer}</p></div>
                      </> : <p className="text-sm leading-7 text-muted-foreground">The reflection for this reference is unavailable right now. You can still bring what is on your heart to God.</p>}
                    </details>
                  </article></DawnReveal>
                );
              })}
            </VerseCarousel>
          {specific.references.length === 0 && <ContentNotice>References for this feeling are being prepared with care. Please visit again soon.</ContentNotice>}
        </section>
      </div>
    </>
  );
}
