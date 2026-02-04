import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://www.football-games.ai"),
  title: "Football Games – World Cup Games & Content",
  description:
    "Play World Cup games, solve lineups, guess scorers and follow FIFA World Cup 2026 news and fixtures.",
  openGraph: {
    title: "Football Games – World Cup 2026 Hub",
    description:
      "Play interactive World Cup games and follow FIFA World Cup 2026 fixtures & news.",
    url: "https://www.football-games.ai",
    siteName: "Football Games",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Football Games – World Cup 2026 Hub",
    description:
      "Interactive World Cup games, fixtures and news.",
    images: ["/og.png"],
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
