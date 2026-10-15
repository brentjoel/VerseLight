import type { Metadata, Viewport } from "next";
import { Geist, Lora } from "next/font/google";
import "./globals.css";
import { siteUrl } from "@/lib/site-url";
import { themeScript } from "@/lib/theme";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora", display: "swap" });

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: "Verselight | A moment of peace",
  description: "A quiet place for Scripture, reflection, and prayer, wherever your day finds you.",
  openGraph: {
    siteName: "Verselight",
    title: "Verselight | A moment of peace",
    description: "A quiet place for Scripture, reflection, and prayer.",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Verselight | A moment of peace", description: "A little light for wherever you are." },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0c10" },
    { media: "(prefers-color-scheme: light)", color: "#faf6ee" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${lora.variable} h-full antialiased`}>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body className="min-h-full">
        <a href="#main-content" className="sr-only rounded-md bg-background p-3 text-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
