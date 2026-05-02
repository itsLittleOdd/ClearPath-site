// Default OG image for ClearPath. Auto-served at /opengraph-image and used
// by social platforms when the homepage URL is shared.
//
// Per Next 16 file-convention metadata routes (see Scout 1's STACK_NOTES.md
// section 6 + node_modules/next/dist/docs/01-app/02-getting-started/...):
// rendered with `ImageResponse` from `next/og` (Satori under the hood).
//
// TOKEN-LOCK EXCEPTION (raw hex):
// `ImageResponse` does NOT compile Tailwind classes — it accepts a JSX subset
// styled via inline `style={{ ... }}` only. The brand palette therefore lives
// here as a literal-hex const block, with each value pinned to its source-of-
// truth in `app/globals.css`. If a token changes in globals.css, mirror it
// here. Reviewer 1 can grep for `OG_TOKENS` to confirm parity.

import { ImageResponse } from "next/og";

import { SITE } from "@/lib/site";

// No `runtime = "edge"` — keeping Node.js (the Next 16 default) so this image
// is generated at build time per Scout 1's STACK_NOTES.md ("Static at build
// time = best perf"). Edge runtime would force per-request generation.

export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Mirrored from app/globals.css :root block. Keep in sync.
const OG_TOKENS = {
  navy950: "#0b1f2f",
  navy800: "#16334a",
  navy700: "#1f4663",
  sage500: "#5e9170",
  cream50: "#faf7f1",
  graphiteOnNavy: "rgba(250, 247, 241, 0.7)",
} as const;

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
          background: `linear-gradient(135deg, ${OG_TOKENS.navy950} 0%, ${OG_TOKENS.navy800} 60%, ${OG_TOKENS.navy700} 100%)`,
          color: OG_TOKENS.cream50,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "9999px",
              background: OG_TOKENS.sage500,
            }}
          />
          <p
            style={{
              fontSize: 28,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: OG_TOKENS.sage500,
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
              color: OG_TOKENS.cream50,
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
              color: OG_TOKENS.cream50,
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
            color: OG_TOKENS.graphiteOnNavy,
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
