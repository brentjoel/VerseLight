import { ImageResponse } from "next/og";
import { cacheLife } from "next/cache";
import web from "@/data/verses/web.json";
import { parseShareReference, shareCardHeight } from "@/lib/share-card";
import { BrandMark } from "@/components/brand-mark";
import { brandFont } from "@/lib/brand-font";

const verses: Readonly<Record<string, string>> = web;
const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer" };

// Only a validated canonical reference enters this cache, never request metadata.
// WEB is public domain. Never import a licensed provider here.
async function renderCard(reference: string) {
  "use cache";
  cacheLife("max");
  const text = verses[reference];
  if (!text?.trim()) throw new Error("Passage unavailable.");
  const image = new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: 64, background: "radial-gradient(ellipse at 50% 0%, #29251c, #0a0c10 65%)", color: "#f2efe8", fontFamily: "Lora" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, color: "#e0b96a", fontSize: 26, fontFamily: "sans-serif" }}><BrandMark size={40} />Verselight · A moment of peace</div>
      <div style={{ display: "flex", flexDirection: "column", marginTop: 36, marginBottom: 36 }}>
        <div style={{ display: "flex", fontSize: 36, lineHeight: 1.4, whiteSpace: "pre-wrap" }}>{text}</div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 28, color: "#e0b96a", fontFamily: "sans-serif" }}>{reference} · WEB</div>
      </div>
      <div style={{ display: "flex", fontSize: 20, color: "#b6b3ac", fontFamily: "sans-serif" }}>World English Bible · Public domain · eBible.org</div>
    </div>,
    { width: 1200, height: shareCardHeight(text), fonts: [await brandFont()] },
  );
  // Cache bytes after rendering completes, so failures reach GET's safe error.
  return new Uint8Array(await image.arrayBuffer());
}

export async function GET(request: Request) {
  const reference = parseShareReference(new URL(request.url).searchParams, Object.keys(verses));
  if (!reference) return new Response("Choose a known reference and WEB translation. Return to Verselight to try again.", { status: 400, headers });
  try {
    return new Response(await renderCard(reference), { headers: {
      ...headers, "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400",
    } });
  } catch {
    return new Response("The card could not be prepared. Please return to Verselight and try again.", { status: 503, headers });
  }
}
