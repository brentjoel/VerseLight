import type { Metadata } from "next";
import { Geist, Lora } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora", display: "swap" });

// Set the stored theme before paint. Dark is the default, including without JavaScript.
const themeScript = `try{var t=localStorage.getItem('verselight-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch{}`;

export const metadata: Metadata = {
  title: "Verselight | A moment of peace",
  description: "A quiet place for Scripture, reflection, and prayer, wherever your day finds you.",
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
