/**
 * Site-wide constants for ClearPath AI Audit.
 *
 * Owned by Builder 1 (B1-W1, app shell). Pull from here in metadata, headers,
 * footers, structured data, and anywhere a string is canonical site identity.
 *
 * All operator-confirmed values (domain, email, booking URLs) landed in
 * Sprints 3-4 and are locked.
 */

/**
 * Brand color constants accessible from TypeScript.
 *
 * Values MUST stay in sync with `app/globals.css` (the design-system source of
 * truth per Coord 1's token-lock). Use this object only when you need a literal
 * brand color in a place that can't read CSS variables — e.g. Next.js metadata
 * `themeColor`, OG image generation, structured data, third-party SDK config.
 *
 * Components must continue to use Tailwind class names (bg-navy-800, etc.).
 */
export const BRAND = {
  navy700: "#1f4663",
  navy800: "#16334a",
  navy900: "#122b40",
  navy950: "#0b1f2f",
  sage500: "#5e9170",
  sage600: "#487458",
  cream50: "#faf7f1",
  graphite500: "#62686f",
  graphite600: "#4e555f",
} as const;

export type BrandColor = keyof typeof BRAND;

export const SITE = {
  name: "ClearPath AI Audit",
  shortName: "ClearPath",
  tagline: "Reclaim 5 to 10 hours every week.",
  description:
    "Practical AI audits for small businesses in Olean and Western New York. We help owners eliminate 5-10 hours of repetitive work every week — no hype, no buzzwords, no lock-in.",

  url: "https://clearpathwv.com",

  email: "JWhalen@ClearPathWV.com",

  // Public Cal.com discovery-call link. Naming pairs with SHARED_COPY.contact
  // in content/copy.ts (Builder 5) and with INTERNAL_LINKS.reviewBookingUrl
  // in lib/internal.ts (Coord 2's Sprint 5 Tier 1.4 split). Public components
  // typically pull the discovery URL from SHARED_COPY.contact directly; this
  // SITE-scoped copy is here for metadata, JSON-LD, and any consumer that
  // already imports SITE.
  bookingDiscoveryUrl: "https://cal.com/justin-whalen-xpjqtn/45-min-discovery-call",

  // OG image — Next 16 file-convention asset at app/opengraph-image.tsx.
  ogImage: "/opengraph-image",

  // Region targeting — used by structured data + local-SEO surfaces.
  locale: "en_US",
  location: "Olean, NY",
  region: "Olean, NY (Western New York)",

  // Justin is intentionally not on social per discovery — keep TBD until that changes.
  twitterHandle: "TBD",
} as const;

export type SiteConfig = typeof SITE;
