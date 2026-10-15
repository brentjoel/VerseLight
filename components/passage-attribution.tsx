import type { VersePassage } from "@/lib/verse-passage";

export function PassageAttribution({ passage }: { passage: VersePassage }) {
  return <>
    {passage.note && <p className="passage-note" role="status">{passage.note}</p>}
    {passage.translationId === "nlt" && <p className="passage-credit"><a href="https://api.nlt.to/">NLT © Tyndale House Foundation.</a> <a href="/licenses#nlt">Copyright notice</a></p>}
    {passage.translationId === "esv" && <p className="passage-credit"><a href="https://www.esv.org/">ESV © Crossway.</a> <a href="/licenses#esv">Copyright notice</a></p>}
  </>;
}
