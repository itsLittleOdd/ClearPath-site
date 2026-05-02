import type { Metadata, Viewport } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { BRAND, SITE } from "@/lib/site";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { JsonLdProfessionalService } from "@/components/JsonLdProfessionalService";

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const fontDisplay = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

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
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: BRAND.cream50,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontDisplay.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-cream-50 text-graphite-600 font-sans">
        <Nav />
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer />
        {/*
          Vercel Analytics — auto-enables on Vercel deploys; in local dev
          and non-Vercel environments it no-ops. No env var required.
          Operator picked Vercel Analytics over Plausible for Phase 1.
        */}
        <Analytics />
        <JsonLdProfessionalService />
      </body>
    </html>
  );
}
