import notices from "@/data/translation-notices.json";

export function TranslationCredits() {
  return <ul>
    <li id="nlt"><strong>New Living Translation (NLT).</strong> <a href="https://api.nlt.to/">Official Tyndale API</a>. Licensed text is requested without persistent caching. <p>{notices.nlt}</p></li>
    <li><strong>New International Version (NIV).</strong> Coming soon, pending licensed provider access. <a href="https://www.biblica.com/permissions/">Biblica licensing information</a>. No NIV text is included.</li>
    <li><strong>King James Version (KJV).</strong> Text from <a href="https://bible-api.com/">bible-api.com</a>. <a href="https://ebible.org/eng-kjv/copyright.htm">Public domain outside the United Kingdom</a>. Special rights under letters patent apply in the UK.</li>
    <li><strong>World English Bible (WEB).</strong> Text from <a href="https://bible-api.com/">bible-api.com</a>. <a href="https://ebible.org/engwebp/copyright.htm">Public domain</a>. World English Bible is a trademark of eBible.org. WEB is our labeled fallback when NLT is unavailable.</li>
    <li><strong>American Standard Version (ASV, 1901).</strong> Text from <a href="https://bible-api.com/">bible-api.com</a>. <a href="https://ebible.org/asv/copyright.htm">Public domain</a>.</li>
    <li><strong>Berean Standard Bible (BSB).</strong> Text from the publisher at <a href="https://bereanbible.com/bsb.txt">BereanBible.com</a>. <a href="https://berean.bible/licensing.htm">Dedicated to the public domain on April 30, 2023</a>.</li>
  </ul>;
}
