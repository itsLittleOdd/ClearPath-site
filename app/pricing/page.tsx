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
  title: { absolute: "Pricing | ClearPath" },
  description:
    "Fixed-scope, one workflow at a time. $395 Workflow Check is the front door; One Workflow Fix, Workflow Build, and Done-For-You System engagements are scoped from there.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  const { audit, pathsHeading, pathsSubhead, paths, closingNote, cta } =
    PRICING_COPY;

  return (
    <main className="flex flex-1 flex-col">
      <Section
        background="cream"
        className="relative isolate overflow-hidden pt-16 pb-12 md:pt-20 md:pb-16"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -right-32 -z-10 h-[28rem] w-[28rem] rounded-full bg-sage-500/15 blur-3xl"
        />
        <Container>
          <div className="grid gap-12 md:grid-cols-[1.1fr_1fr] md:items-center md:gap-16">
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="inline-block h-px w-8 bg-sage-500"
                />
                <Eyebrow className="m-0">{audit.eyebrow}</Eyebrow>
              </div>
              <Heading as="h1" level="h1">
                {audit.name}
              </Heading>
              <div className="flex items-baseline gap-3">
                <p className="font-display text-display-xl font-semibold text-navy-950">
                  {audit.priceLabel}
                </p>
                <span className="font-display text-eyebrow font-medium uppercase tracking-wider text-graphite-500">
                  flat, one-time
                </span>
              </div>
              <Link
                href="/contact"
                className="mt-2 inline-flex w-fit items-center justify-center rounded-lg bg-sage-500 px-6 py-3 text-base font-medium text-navy-950 shadow-sm transition-colors hover:bg-sage-600 hover:text-cream-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500 focus-visible:ring-offset-2"
              >
                {audit.cta}
              </Link>
            </div>
            <ul className="flex flex-col gap-4 rounded-2xl border-l-4 border-sage-500 bg-cream-50 p-6 shadow-sm md:p-8">
              {audit.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex items-start gap-3 text-base leading-relaxed text-pretty text-graphite-600 md:text-lg"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-sage-500"
                  />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      <Section background="cream" className="!pt-0">
        <Container>
          <div className="flex max-w-3xl flex-col gap-3">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="inline-block h-px w-8 bg-sage-500"
              />
              <Eyebrow className="m-0">After the audit</Eyebrow>
            </div>
            <Heading as="h2" level="h2">
              {pathsHeading}
            </Heading>
            <p className="text-lg leading-relaxed text-pretty text-graphite-600">
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
                      "relative flex w-full flex-col items-center gap-3 overflow-hidden rounded-xl bg-cream-50 p-8 text-center transition-all hover:-translate-y-0.5",
                      isFeatured
                        ? "shadow-md ring-2 ring-sage-500 md:relative md:z-10"
                        : "border border-navy-900/10 shadow-sm hover:shadow-md",
                    )}
                  >
                    {isFeatured ? (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-sage-500"
                      />
                    ) : null}
                    <div className="flex min-h-[1.75rem] items-center justify-center">
                      {isFeatured && path.featuredEyebrow ? (
                        <Eyebrow>{path.featuredEyebrow}</Eyebrow>
                      ) : null}
                    </div>
                    <h3 className="font-display text-2xl font-semibold text-balance text-navy-950">
                      {path.name}
                    </h3>
                    <div className="min-h-[1.25rem] text-sm font-medium uppercase tracking-wider text-graphite-500">
                      {path.qualifier ?? ""}
                    </div>
                    <div className="flex items-baseline justify-center gap-1.5">
                      <span className="font-display text-3xl font-semibold text-navy-950">
                        {path.priceLabel}
                      </span>
                    </div>
                    <div
                      aria-hidden="true"
                      className={cn(
                        "h-px w-10",
                        isFeatured ? "bg-sage-500/60" : "bg-navy-800/15",
                      )}
                    />
                    <p className="text-base leading-relaxed text-pretty text-graphite-600">
                      {path.description}
                    </p>
                  </article>
                </li>
              );
            })}
          </ul>

          <p className="mt-10 max-w-3xl border-l-2 border-sage-500/40 pl-4 text-base leading-relaxed text-pretty text-graphite-500 md:mt-12 md:text-lg">
            {closingNote}
          </p>
        </Container>
      </Section>

      <CTASection heading={cta.heading} body={cta.body} cta={cta.button} />
    </main>
  );
}
