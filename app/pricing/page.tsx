import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { Heading } from "@/components/Heading";
import { Section } from "@/components/Section";
import { CTASection } from "@/components/sections/CTASection";
import { PRICING_COPY } from "@/content/copy";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: { absolute: "Pricing | ClearPath AI Audit" },
  description:
    "$197 for a plain-English ClearPath AI Audit. After that, four paths — run it yourself, Co-build, Done-for-you, or ongoing support. No subscription pressure, no surprise quotes.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  const { audit, pathsHeading, pathsSubhead, paths, closingNote, cta } =
    PRICING_COPY;

  return (
    <main className="flex flex-1 flex-col">
      <Section background="cream">
        <Container>
          <div className="grid gap-12 md:grid-cols-[1.1fr_1fr] md:items-center md:gap-16">
            <div className="flex flex-col gap-5">
              <Eyebrow>{audit.eyebrow}</Eyebrow>
              <Heading as="h1" level="h1">
                {audit.name}
              </Heading>
              <p className="font-display text-display-xl font-semibold text-navy-950">
                {audit.priceLabel}
              </p>
              <Link
                href="/contact"
                className="mt-2 inline-flex w-fit items-center justify-center rounded-lg bg-sage-500 px-6 py-3 text-base font-medium text-navy-950 shadow-sm transition-colors hover:bg-sage-600 hover:text-cream-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500 focus-visible:ring-offset-2"
              >
                {audit.cta}
              </Link>
            </div>
            <ul className="flex flex-col gap-3 border-l-4 border-sage-500 pl-6 md:pl-8">
              {audit.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="text-base leading-relaxed text-graphite-600 md:text-lg"
                >
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      <Section background="cream" className="!pt-0">
        <Container>
          <div className="flex max-w-3xl flex-col gap-3">
            <Eyebrow>After the audit</Eyebrow>
            <Heading as="h2" level="h2">
              {pathsHeading}
            </Heading>
            <p className="text-lg leading-relaxed text-graphite-600">
              {pathsSubhead}
            </p>
          </div>

          <ul
            role="list"
            className="mt-12 grid gap-6 md:mt-16 md:grid-cols-2 lg:grid-cols-4 lg:items-stretch"
          >
            {paths.map((path) => {
              const isFeatured = path.featured === true;
              return (
                <li key={path.id} className="flex">
                  <article
                    className={cn(
                      "flex w-full flex-col items-center gap-3 rounded-xl bg-cream-50 p-8 text-center transition-shadow",
                      isFeatured
                        ? "shadow-md ring-2 ring-sage-500 md:relative md:z-10"
                        : "border border-navy-900/10 shadow-sm",
                    )}
                  >
                    <div className="flex min-h-[1.75rem] items-center justify-center">
                      {isFeatured && path.featuredEyebrow ? (
                        <Eyebrow>{path.featuredEyebrow}</Eyebrow>
                      ) : null}
                    </div>
                    <h3 className="font-display text-2xl font-semibold text-navy-950">
                      {path.name}
                    </h3>
                    <div className="min-h-[1.25rem] text-sm font-medium uppercase tracking-wider text-graphite-500">
                      {path.qualifier ?? ""}
                    </div>
                    <div className="flex items-baseline justify-center gap-1.5">
                      <span className="font-display text-3xl font-semibold text-navy-950">
                        {path.priceLabel}
                      </span>
                      {path.priceSuffix ? (
                        <span className="text-base text-graphite-500">
                          {path.priceSuffix}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-base leading-relaxed text-graphite-600">
                      {path.description}
                    </p>
                  </article>
                </li>
              );
            })}
          </ul>

          <p className="mt-10 max-w-3xl text-base leading-relaxed text-graphite-500 md:mt-12 md:text-lg">
            {closingNote}
          </p>
        </Container>
      </Section>

      <CTASection heading={cta.heading} body={cta.body} cta={cta.button} />
    </main>
  );
}
