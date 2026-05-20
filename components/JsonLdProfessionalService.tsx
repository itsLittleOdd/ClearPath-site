import { SITE } from "@/lib/site";

/**
 * ProfessionalService JSON-LD structured data for ClearPath.
 *
 * Renders an inline application/ld+json script at the root of <body>. Google
 * indexes JSON-LD wherever it sits in the HTML. All values pull from
 * lib/site.ts so this stays in sync with metadata + footer + everywhere else.
 *
 * priceRange uses the symbolic "$$" rather than literal dollar amounts: the
 * post-Workflow-Check engagements are intentionally "from" pricing on the
 * public site (operator lock - see /pricing). The Workflow Check itself is
 * exposed as a structured Offer at $395 since that IS the firm public number.
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
      addressRegion: "NY",
      addressCountry: "US",
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: "United States",
    },
    serviceType: [
      "Workflow consulting",
      "Knowledge capture systems",
      "AI-assisted business process implementation",
      "Internal assistant build",
      "Approval workflow design",
    ],
    priceRange: "$$",
    image: `${SITE.url}${SITE.ogImage}`,
    logo: `${SITE.url}${SITE.ogImage}`,
    offers: {
      "@type": "Offer",
      name: "Workflow Check",
      description:
        "Working session, written workflow map, prioritized list of fixes, and a fixed-scope quote for the next engagement.",
      price: "395.00",
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
