import { SITE } from "@/lib/site";

/**
 * ProfessionalService JSON-LD structured data for ClearPath.
 *
 * Renders an inline application/ld+json script at the root of <body>. Google
 * indexes JSON-LD wherever it sits in the HTML. All values pull from
 * lib/site.ts so this stays in sync with metadata + footer + everywhere else.
 *
 * priceRange uses the symbolic "$$" rather than literal dollar amounts for
 * larger builds because those are quoted separately. Public entry offers are
 * ClearPath Support ($500/month) and the Workflow Check ($395).
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
      "Practical business process support",
      "Internal assistant build",
      "Approval workflow design",
    ],
    priceRange: "$$",
    image: `${SITE.url}${SITE.ogImage}`,
    logo: `${SITE.url}${SITE.ogImage}`,
    offers: [
      {
        "@type": "Offer",
        name: "ClearPath Support",
        description:
          "Monthly support for stuck tasks, documentation, troubleshooting, light builds, and keeping business work organized.",
        price: "500.00",
        priceCurrency: "USD",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "500.00",
          priceCurrency: "USD",
          billingDuration: "P1M",
        },
        url: `${SITE.url}/pricing`,
        availability: "https://schema.org/InStock",
      },
      {
        "@type": "Offer",
        name: "Workflow Check",
        description:
          "Working session, written process map, bottleneck notes, and a clear next step if support or a build makes sense.",
        price: "395.00",
        priceCurrency: "USD",
        url: `${SITE.url}/pricing`,
        availability: "https://schema.org/InStock",
      },
    ],
  };

  const json = JSON.stringify(schema).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
