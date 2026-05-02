/**
 * Site-wide constants for ClearPath AI Audit.
 *
 * Owned by Builder 1 (B1-W1, app shell). Pull from here in metadata, headers,
 * footers, structured data, and anywhere a string is canonical site identity.
 *
 * TBD values are placeholders for items still pending operator input or
 * downstream sprints (domain, email, booking provider, OG image, social).
 * Update in place when the operator provides finals — no schema change needed.
 */

export const SITE = {
  name: "ClearPath AI Audit",
  shortName: "ClearPath",
  tagline: "Reclaim 5-10 hours every week",
  description:
    "Practical AI audits for small businesses in Olean and Western New York. We help owners eliminate 5-10 hours of repetitive work every week — no hype, no buzzwords, no lock-in.",

  // Domain not yet confirmed. clearpathai.com is the working assumption per the brief.
  url: "https://clearpathai.com",

  // Contact + booking — TBD until operator provides finals.
  email: "hello@clearpathai.com", // TBD
  calendly: "TBD", // BLOCKED — booking provider not finalized; Tally.so is primary forms vendor.

  // OG image path — designer asset to land in /public before launch.
  ogImage: "/og-default.png", // TBD

  // Region targeting — used by structured data + local-SEO surfaces.
  locale: "en_US",
  region: "Olean, NY (Western New York)",

  // Justin is intentionally not on social per discovery — keep TBD until that changes.
  twitterHandle: "TBD",
} as const;

export type SiteConfig = typeof SITE;
