// Default OG image for ClearPath. Auto-served at /opengraph-image and used
// by social platforms when the homepage URL is shared.
//
// Per Next 16 file-convention metadata routes (see Scout 1's STACK_NOTES.md
// section 6): rendered with `ImageResponse` from `next/og` (Satori under
// the hood). `ImageResponse` does NOT compile Tailwind classes | it accepts
// a JSX subset styled via inline `style={{ ... }}` only. The brand palette
// is sourced from `BRAND` in `@/lib/site` (Builder 1's canonical export for
// non-CSS hex contexts), so values stay in sync with globals.css through a
// single source of truth.

import { ImageResponse } from "next/og";

import { BRAND, SITE } from "@/lib/site";

// No `runtime = "edge"` | keeping Node.js (the Next 16 default) so this image
// is generated at build time per Scout 1's STACK_NOTES.md ("Static at build
// time = best perf"). Edge runtime would force per-request generation.

export const alt = `${SITE.name} | ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// `cream50` at 70% opacity | used for footer-row text on the navy gradient.
// Computed inline because BRAND only exposes solid tokens.
const CREAM_ON_NAVY_70 = `${BRAND.cream50}b3`; // 0xb3 = 70% alpha

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: `linear-gradient(135deg, ${BRAND.navy950} 0%, ${BRAND.navy800} 60%, ${BRAND.navy700} 100%)`,
          color: BRAND.cream50,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "9999px",
              background: BRAND.sage500,
            }}
          />
          <p
            style={{
              fontSize: 28,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: BRAND.sage500,
              margin: 0,
              fontWeight: 500,
            }}
          >
            {SITE.shortName}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <h1
            style={{
              fontSize: 124,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 1.02,
              margin: 0,
              color: BRAND.cream50,
            }}
          >
            {SITE.name}
          </h1>
          <p
            style={{
              fontSize: 44,
              fontWeight: 400,
              letterSpacing: "-0.01em",
              lineHeight: 1.2,
              margin: 0,
              color: BRAND.cream50,
              maxWidth: "900px",
            }}
          >
            {SITE.tagline}.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            color: CREAM_ON_NAVY_70,
            fontSize: 24,
          }}
        >
          <p style={{ margin: 0 }}>{SITE.region}</p>
          <p style={{ margin: 0 }}>clearpathai.com</p>
        </div>
      </div>
    ),
    { ...size },
  );
}
