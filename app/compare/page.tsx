import Link from "next/link";
import { Suspense } from "react";
import { SiteShell } from "@/components/site-shell";
import { ContentNotice } from "@/components/content-notice";
import { getPreferredTranslation } from "@/lib/translation-preference";
import { translations } from "@/lib/translations";
import { hasVerseReference } from "@/lib/verses";
import { getVersePassage } from "@/lib/verse-passage";
import { PassageAttribution } from "@/components/passage-attribution";
import { parseCompareTranslations, validResultsPath } from "@/lib/compare";
import { PreferredTranslationSelector } from "@/components/preferred-translation-selector";
import { TranslationSelector } from "@/components/translation-selector";
import { ShareCardControls } from "@/components/share-card-controls";

type Query = Record<string, string | string[] | undefined>;

export default function ComparePage({ searchParams }: { searchParams: Promise<Query> }) {
  return <SiteShell translationControl={<Suspense fallback={<TranslationSelector />}><PreferredTranslationSelector /></Suspense>}><Suspense fallback={<ContentNotice>Preparing your comparison...</ContentNotice>}><Comparison searchParams={searchParams} /></Suspense></SiteShell>;
}

async function Comparison({ searchParams }: { searchParams: Promise<Query> }) {
  const query = await searchParams;
  const preferred = await getPreferredTranslation();
  const from = validResultsPath(query.from);
  const reference = typeof query.ref === "string" && hasVerseReference(query.ref) ? query.ref : undefined;
  const { ids, error } = parseCompareTranslations(query.translations ?? (query.submitted ? [] : undefined), preferred);
  const passages = reference && !error ? await Promise.all(ids.map(id => getVersePassage(reference, id))) : [];
  return <div className="compare-wrap">
    <Link className="back-link" href={from ?? "/"}>← {from ? "Back to your verses" : "Choose a feeling"}</Link>
    <div className="results-heading"><p className="eyebrow">Read side by side</p><h1>{reference ?? "Compare Scripture"}</h1><p>Take a little time with the words. Notice what speaks to you.</p></div>
    {!reference ? <ContentNotice>This reference is not in our collection yet. Choose a feeling to find a verse to compare.</ContentNotice> : <>
      {query.from !== undefined && !from && <p className="comparison-notice" role="status">We could not find the results page in this link. You can choose a feeling to begin again.</p>}
      <form key={`${reference}:${ids.join(",")}`} action="/compare" method="get" className="compare-form">
        <input type="hidden" name="submitted" value="1" />
        <input type="hidden" name="ref" value={reference} />
        {from && <input type="hidden" name="from" value={from} />}
        <fieldset><legend>Choose two to four translations</legend>
          <div className="translation-options">{translations.map(translation => <label key={translation.id} title={translation.description}>
            <input type="checkbox" name="translations" value={translation.id} defaultChecked={ids.includes(translation.id)} />
            <span>{translation.shortName}</span>
          </label>)}</div>
          <p className="passage-credit">NIV · Coming soon</p>
        </fieldset>
        <button type="submit" className="compare-link">Update comparison</button>
      </form>
      <ShareCardControls reference={reference} />
      {error ? <ContentNotice>{error} <Link href={`/compare?${new URLSearchParams({ ref: reference, ...(from ? { from } : {}) })}`}>Reset comparison</Link></ContentNotice> : <section className="compare-grid" aria-label={`Translations of ${reference}`}>
        {ids.map((id, index) => {
          const translation = translations.find(item => item.id === id)!;
          const passage = passages[index];
          return <article key={id} className="verse-card compare-card">
            <p className="translation-tag">{passage.translationId.toUpperCase()}</p><h2>{translation.fullName}</h2>
            <p className="translation-description">{translation.description}</p>
            <p className="verse-text">{passage.text}</p>
            <PassageAttribution passage={passage} />
          </article>;
        })}
      </section>}
    </>}
  </div>;
}
