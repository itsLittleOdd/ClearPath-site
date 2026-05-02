import type { MetadataRoute } from "next";

import { SITE } from "@/lib/site";

// Auto-served at /robots.txt. Allow all crawlers, disallow API routes
// (form-handlers etc. should not be indexed), point at the sitemap.
// Pattern follows Scout 1's STACK_NOTES.md SEO checklist for Next 16.

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    // No `host` directive — that's a Yandex-specific convention; Google
    // Search Console actively recommends omitting it. Per Reviewer 1.
  };
}
