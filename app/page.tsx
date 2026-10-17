import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { EmotionIcon } from "@/components/emotion-icon";
import { ArrowUpRight } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { ContentNotice } from "@/components/content-notice";
import { getAllEmotions } from "@/lib/emotions";
import { DailyVerse } from "@/components/daily-verse";
import web from "@/data/verses/web.json";
import { WheelPicker } from "@/components/wheel-picker";

export const metadata = {
  title: "Verselight | A moment of peace",
  description: "Choose a feeling and find a quiet moment with Scripture, reflection, and prayer.",
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    siteName: "Verselight",
    title: "Verselight | A moment of peace",
    description: "A quiet place for Scripture, reflection, and prayer.",
    type: "website",
  },
};

export default function Home() {
  const emotions = getAllEmotions();
  return (
    <SiteShell>
      <div className="home-hero">
        <p className="eyebrow"><span className="accent-dot" /> A little space for your soul</p>
        <h1>How is your heart today?</h1>
        <p>A quiet moment. A little light. Room for all you carry.</p>
      </div>
      <div className="morning-star-wrap"><DailyVerse verses={web} /></div>
      <section aria-labelledby="emotions-heading" aria-describedby="emotions-status">
        <h2 id="emotions-heading" className="sr-only">Find the words that fit</h2>
        <p id="emotions-status" className="sr-only">Start with a feeling. No account needed.</p>
        <WheelPicker emotions={emotions}>
        <ul className="emotion-grid">
          {emotions.map((emotion) => (
            <li key={emotion.id}>
              <Link href={`/emotions/${emotion.id}`} data-emotion={emotion.id} className="emotion-link emotion-tile">
                <Card className="emotion-card">
                  <CardHeader className="emotion-card-header">
                    <span className="flex items-center justify-between"><span aria-hidden="true" className="emotion-icon"><EmotionIcon emotionId={emotion.id} /></span><ArrowUpRight size={15} className="card-arrow" aria-hidden="true" /></span>
                    <h3 className="emotion-name"><span className="emotion-dot" />{emotion.name}</h3>
                  </CardHeader>
                  <CardContent className="emotion-card-content"><p title={emotion.description}>{emotion.description}</p></CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
        </WheelPicker>
        {emotions.length === 0 && <ContentNotice>Our feelings library is resting for a moment. Please visit again soon.</ContentNotice>}
      </section>
      <p className="closing-note">One small moment at a time.</p>
    </SiteShell>
  );
}
