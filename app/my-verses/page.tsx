import { SiteShell } from "@/components/site-shell";
import { MyVerses } from "@/components/my-verses";

export const metadata = { title: "My Verses | Verselight", description: "Keep saved Scripture references and collections in this browser, with local Export and Import backups." };
export default function MyVersesPage() {
  return <SiteShell><div className="library-wrap">
    <div className="results-heading"><p className="eyebrow">Keep a little light close</p><h1>My Verses</h1><p>A place for the words you want to return to. Your saved references and collections stay in this browser.</p></div>
    <MyVerses />
  </div></SiteShell>;
}
