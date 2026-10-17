import { SiteShell } from "@/components/site-shell";
import { Journal } from "@/components/journal";

export const metadata = { title: "Journal | Verselight", description: "A quiet place for your reflections, calendar and small milestones. Your journal stays in this browser." };
export default function JournalPage() {
  return <SiteShell><div className="library-wrap">
    <div className="results-heading"><p className="eyebrow">One small moment at a time</p><h1>Your journal</h1><p>A quiet place to notice how you feel. Reflections and notes stay in this browser.</p></div>
    <Journal />
  </div></SiteShell>;
}
