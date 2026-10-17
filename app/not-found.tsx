import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { Constellation } from "@/components/constellation";

export const metadata = { title: "Find your way back | Verselight", description: "This page is resting out of sight. Return to Verselight and choose a feeling." };

export default function NotFound() {
  return (
    <SiteShell>
      <div className="state-panel">
        <Constellation />
        <p className="mb-4 text-sm font-semibold tracking-widest text-primary">404</p>
        <h1 className="font-serif text-4xl leading-tight">Let us find your way back.</h1>
        <p className="mt-5 text-base leading-7 text-muted-foreground">We could not find this page or feeling. There is still room for whatever you are carrying today.</p>
        <Link href="/" className="back-link mt-6 inline-flex">Return to all feelings</Link>
      </div>
    </SiteShell>
  );
}
