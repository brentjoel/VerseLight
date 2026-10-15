import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { ContentNotice } from "@/components/content-notice";
import { getAllEmotions } from "@/lib/emotions";
import { DailyVerse } from "@/components/daily-verse";
import web from "@/data/verses/web.json";

export default function Home() {
  const emotions = getAllEmotions();
  return (
    <SiteShell>
      <div className="home-hero">
        <p className="eyebrow"><span className="accent-dot" /> A little space for your soul</p>
        <h1>How are you<br className="sm:hidden" /> feeling today?</h1>
        <p>A quiet moment for Scripture, reflection, and prayer.<br className="hidden sm:block" /> There is room for whatever you are carrying.</p>
      </div>
      <section aria-labelledby="verse-heading" className="featured-section">
        <Card className="featured-card">
          <CardHeader className="featured-header">
            <p className="eyebrow"><Sparkles size={15} strokeWidth={1.25} aria-hidden="true" /> A little light for your day</p>
            <h2 id="verse-heading" className="featured-title">Verse of the day</h2>
          </CardHeader>
          <CardContent className="featured-content"><DailyVerse verses={web} /></CardContent>
          <span className="featured-orbit" aria-hidden="true" />
        </Card>
      </section>
      <section aria-labelledby="emotions-heading" aria-describedby="emotions-status">
        <div className="section-heading">
          <div><p className="eyebrow mb-3">Begin where you are</p><h2 id="emotions-heading">Find the words that fit.</h2></div>
          <p id="emotions-status">Start with a feeling.<br />No account needed.</p>
        </div>
        <ul className="emotion-grid">
          {emotions.map((emotion) => (
            <li key={emotion.id}>
              <Link href={`/emotions/${emotion.id}`} data-emotion={emotion.id} className="emotion-link emotion-tile">
                <Card className="emotion-card">
                  <CardHeader className="emotion-card-header">
                    <span className="flex items-center justify-between"><span aria-hidden="true" className="emotion-icon">{emotion.emoji}</span><ArrowUpRight size={15} className="card-arrow" aria-hidden="true" /></span>
                    <h3 className="emotion-name"><span className="emotion-dot" />{emotion.name}</h3>
                  </CardHeader>
                  <CardContent className="emotion-card-content"><p title={emotion.description}>{emotion.description}</p></CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
        {emotions.length === 0 && <ContentNotice>Our feelings library is resting for a moment. Please visit again soon.</ContentNotice>}
      </section>
      <p className="closing-note">One small moment at a time.</p>
    </SiteShell>
  );
}
