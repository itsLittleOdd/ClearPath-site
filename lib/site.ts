/**
 * Site-wide constants for ClearPath.
 *
 * Pull from here in metadata, headers, footers, structured data, and anywhere
 * a string is canonical site identity.
 *
 * Public values (domain, email, booking URLs) locked in Sprints 3-4. Pricing
 * and positioning refreshed 2026-05-19 per the rebuild sprint.
 */

/**
 * Brand color constants accessible from TypeScript.
 *
 * Values MUST stay in sync with `app/globals.css` (the design-system source of
 * truth per Coord 1's token-lock). Use this object only when you need a literal
 * brand color in a place that can't read CSS variables - e.g. Next.js metadata
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
  name: "ClearPath",
  shortName: "ClearPath",
  tagline: "Capture how the work actually gets done.",
  description:
    "Practical workflow, knowledge capture, and AI-assisted systems for business teams. ClearPath helps operators document expert judgment, clean up repetitive workflows, and build AI-assisted tools the team can use.",

  url: "https://clearpathwv.com",

  email: "JWhalen@ClearPathWV.com",

  // Public Cal.com fit-call link. Naming pairs with SHARED_COPY.contact
  // in content/copy.ts. Public components typically pull from SHARED_COPY;
  // this SITE-scoped value is here for metadata, JSON-LD, and any consumer
  // that already imports SITE.
  bookingDiscoveryUrl: "https://cal.com/justin-whalen-xpjqtn/45-min-discovery-call",

  // OG image - Next 16 file-convention asset at app/opengraph-image.tsx.
  ogImage: "/opengraph-image",

  // Region targeting - used by structured data + local-SEO surfaces.
  locale: "en_US",
  location: "Western New York",
  region: "Western New York",

  // Justin is intentionally not on social per discovery - keep TBD until that changes.
  twitterHandle: "TBD",

  // Canonical primary CTA label used in metadata + structured data.
  primaryCtaLabel: "Request a Workflow Check",
} as const;

export type SiteConfig = typeof SITE;
