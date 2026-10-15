import type { VersePassage } from "@/lib/verse-passage";
import { translations } from "@/lib/translations";
import notices from "@/data/translation-notices.json";

export function PassageAttribution({ passage }: { passage: VersePassage }) {
  return <>
    {passage.note && <p className="passage-note" role="status">{passage.note}</p>}
    <p className="passage-credit">{translations.find(item => item.id === passage.translationId)?.fullName}.
      {passage.translationId === "nlt" ? <> {notices.nlt} <a href="https://api.nlt.to/">Tyndale</a></> : <>
        {passage.translationId === "kjv" ? " Public domain outside the UK; special UK rights apply." : " Public domain."}
        <a href="/licenses"> Sources and copyright notices</a>
      </>}
    </p>
  </>;
}
