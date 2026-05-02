import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";

const fontBody = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// `--font-display` is intentionally aliased to the body face for Sprint 1.
// Builder 2 may add a separate display family in the design-system pass; the
// CSS token name stays stable so consumers don't break.

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [{ url: SITE.ogImage, alt: SITE.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport = {
  themeColor: "#FAF7F2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fontBody.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-graphite font-body">
        {children}
      </body>
    </html>
  );
}
