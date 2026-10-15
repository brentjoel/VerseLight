import { ImageResponse } from "next/og";
import { BrandMark } from "@/components/brand-mark";
import { brandFont } from "@/lib/brand-font";

export async function socialImage() {
  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", flexDirection: "column", background: "radial-gradient(ellipse at 50% 40%, #29251c, #0a0c10 70%)", color: "#f2efe8", fontFamily: "Lora" }}>
      <div style={{ display: "flex", color: "#e0b96a", marginBottom: 32 }}><BrandMark size={112} /></div>
      <div style={{ display: "flex", fontSize: 88, letterSpacing: -3 }}>Verselight</div>
      <div style={{ display: "flex", fontSize: 30, color: "#b6b3ac", marginTop: 24, fontFamily: "sans-serif" }}>A little light for wherever you are.</div>
    </div>,
    { width: 1200, height: 630, fonts: [await brandFont()] },
  );
}
