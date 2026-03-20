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

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: "SQL Vision Coders | SQL Playground & Learning Game",
    template: "%s | SQL Vision Coders",
  },
  description:
    "SQL Vision Coders is an interactive SQL playground where you learn SQL step by step: CREATE TABLE, INSERT, SELECT, WHERE, JOIN, GROUP BY, and advanced query missions.",
  keywords: [
    "sql vision coders",
    "sql playground",
    "learn sql",
    "sql practice",
    "sql game",
    "sql tutorial",
    "sql exercises",
    "sql join practice",
    "sql where clause",
    "sql beginner to advanced",
    "database schema practice",
    "interactive sql editor",
  ],
  applicationName: "SQL Vision Coders",
  category: "education",
  creator: "SQL Vision Coders",
  publisher: "SQL Vision Coders",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "SQL Vision Coders",
    title: "SQL Vision Coders | SQL Playground & Learning Game",
    description:
      "Practice SQL with guided levels from beginner to advanced in an interactive SQL playground.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SQL Vision Coders | SQL Playground",
    description:
      "Practice SQL with level-based missions: SELECT, WHERE, JOIN, and advanced analytics.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SQL Vision Coders",
    url: baseUrl,
    description:
      "Interactive SQL playground and level-based SQL learning platform.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
      </body>
    </html>
  );
}
