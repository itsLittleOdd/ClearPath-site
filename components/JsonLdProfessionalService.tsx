import { SITE } from "@/lib/site";

/**
 * ProfessionalService JSON-LD structured data for ClearPath.
 *
 * Renders an inline application/ld+json script at the root of <body>. Google
 * indexes JSON-LD wherever it sits in the HTML. All values pull from
 * lib/site.ts so this stays in sync with metadata + footer + everywhere else.
 *
 * priceRange uses the symbolic "$$" rather than literal dollar amounts: the
 * after-audit paths are intentionally "from" pricing on the public site
 * (operator lock — see /pricing). The audit itself is exposed as a structured
 * Offer at $197 since that IS the firm public number.
 */
export function JsonLdProfessionalService() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE.url}#organization`,
    name: SITE.name,
    alternateName: SITE.shortName,
    url: SITE.url,
    description: SITE.description,
    founder: {
      "@type": "Person",
      name: "Justin Whalen",
    },
    email: SITE.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Olean",
      addressRegion: "NY",
      addressCountry: "US",
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Western New York",
    },
    serviceType: [
      "AI consulting",
      "Workflow automation audit",
      "Small business AI implementation",
    ],
    priceRange: "$$",
    image: `${SITE.url}${SITE.ogImage}`,
    logo: `${SITE.url}${SITE.ogImage}`,
    offers: {
      "@type": "Offer",
      name: "ClearPath AI Audit",
      description:
        "60-minute discovery call plus a plain-English audit report sent within 5 business days.",
      price: "197.00",
      priceCurrency: "USD",
      url: `${SITE.url}/pricing`,
      availability: "https://schema.org/InStock",
    },
  };

  const json = JSON.stringify(schema).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
