"use client";

import Link from "next/link";
import { SiteShell } from "@/components/site-shell";

export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <SiteShell>
      <div className="mx-auto max-w-lg py-10 text-center" role="alert">
        <h1 className="font-serif text-4xl leading-tight">A little pause.</h1>
        <p className="mt-5 leading-7 text-muted-foreground">This page could not open just now. Take a breath, then try again when you are ready.</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
          <button onClick={() => retry()} className="back-link cursor-pointer">Try again</button>
          <Link href="/" className="back-link">Return to all feelings</Link>
        </div>
      </div>
    </SiteShell>
  );
}
