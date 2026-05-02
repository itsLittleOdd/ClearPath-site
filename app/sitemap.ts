import type { MetadataRoute } from "next";

import { SITE } from "@/lib/site";

// Auto-served at /sitemap.xml. Lists every public Phase-1 page with priority
// per Scout 1's STACK_NOTES.md SEO checklist:
//   - / : priority 1.0
//   - /contact : priority 0.9
//   - everything else : priority 0.8
//
// `lastModified: new Date()` rebuilds with each deploy so search engines
// re-crawl on copy updates. Keep priorities monotonic relative to traffic
// intent (home > contact > content pages).

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE.url;
  const lastModified = new Date();

  return [
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/who-its-for`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
