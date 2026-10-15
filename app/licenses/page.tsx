import Link from "next/link";
import { SiteShell } from "@/components/site-shell";

export default function LicensesPage() {
  return <SiteShell>
    <div className="results-wrap license-copy">
      <Link href="/" className="back-link">← Home</Link>
      <h1>Scripture sources</h1>
      <p>Verse text is downloaded during development and served from local files. Verselight preserves the source wording and punctuation.</p>
      <ul>
        <li><strong>King James Version (KJV).</strong> Text from <a href="https://bible-api.com/">bible-api.com</a>. <a href="https://ebible.org/eng-kjv/copyright.htm">Public domain outside the United Kingdom</a>. Special rights under letters patent apply in the UK.</li>
        <li><strong>World English Bible (WEB).</strong> Text from <a href="https://bible-api.com/">bible-api.com</a>. <a href="https://ebible.org/engwebp/copyright.htm">Public domain</a>. World English Bible is a trademark of eBible.org.</li>
        <li><strong>American Standard Version (ASV, 1901).</strong> Text from <a href="https://bible-api.com/">bible-api.com</a>. <a href="https://ebible.org/asv/copyright.htm">Public domain</a>.</li>
        <li><strong>Berean Standard Bible (BSB).</strong> Text from the publisher at <a href="https://bereanbible.com/bsb.txt">BereanBible.com</a>. <a href="https://berean.bible/licensing.htm">Dedicated to the public domain on April 30, 2023</a>.</li>
      </ul>
    </div>
  </SiteShell>;
}
