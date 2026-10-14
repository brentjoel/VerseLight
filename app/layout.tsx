import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Verselight | A moment of peace",
  description: "A quiet place for Scripture, reflection, and prayer, wherever your day finds you.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <a href="#main-content" className="sr-only rounded-md bg-background p-3 text-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
