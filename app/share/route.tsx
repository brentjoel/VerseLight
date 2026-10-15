import { ImageResponse } from "next/og";
import web from "@/data/verses/web.json";
import { parseShareReference, shareCardHeight } from "@/lib/share-card";

const verses: Readonly<Record<string, string>> = web;
const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer" };

export async function GET(request: Request) {
  const reference = parseShareReference(new URL(request.url).searchParams, Object.keys(verses));
  if (!reference) return new Response("Choose a known reference and WEB translation. Return to Verselight to try again.", { status: 400, headers });
  try {
    const text = verses[reference];
    if (!text?.trim()) throw new Error("Passage unavailable.");
    const image = new ImageResponse(
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: 64, background: "#12151a", color: "#eeedf2", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", color: "#b4acd5", fontSize: 26 }}>Verselight. • A moment of peace</div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 36, marginBottom: 36 }}>
          <div style={{ display: "flex", fontSize: 36, lineHeight: 1.4, whiteSpace: "pre-wrap" }}>{text}</div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 28, color: "#b4acd5" }}>{reference} · WEB</div>
        </div>
        <div style={{ display: "flex", fontSize: 20, color: "#a2a5af" }}>World English Bible · Public domain · eBible.org</div>
      </div>,
      { width: 1200, height: shareCardHeight(text) },
    );
    // Consume the stream here so rendering errors return a recoverable HTTP response.
    return new Response(await image.arrayBuffer(), { headers: { ...headers, "Content-Type": "image/png" } });
  } catch {
    return new Response("The card could not be prepared. Please return to Verselight and try again.", { status: 503, headers });
  }
}
