// PRICING TBD — pricing tiers are blocked pending operator confirmation.
// See docs/PRICING_DECISION_LOG.md for the open question and source ladders.
// When the operator answers, Builder 5 updates PRICING_COPY.tiers in
// content/copy.ts; this page renders the populated tier grid automatically.
// Until then, render the graceful "Email me for a quote" fallback below.

import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { Heading } from "@/components/Heading";
import { Section } from "@/components/Section";
import { CTASection } from "@/components/sections/CTASection";
import { PRICING_COPY } from "@/content/copy";

export const metadata: Metadata = {
  title: { absolute: "Pricing | ClearPath AI Audit" },
  description:
    "Two ways to start with ClearPath AI Audit. Practical pricing, no hype.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  const hasTiers = PRICING_COPY.tiers.length > 0;

  return (
    <main className="flex flex-1 flex-col">
      <Section background="cream">
        <Container>
          <div className="flex max-w-3xl flex-col gap-4">
            <Eyebrow>{PRICING_COPY.eyebrow}</Eyebrow>
            <Heading as="h1" level="h1">
              Pricing is straightforward.
            </Heading>
            <p className="text-lg leading-relaxed text-graphite-600">
              {PRICING_COPY.intro}
            </p>
          </div>

          <div className="mt-12 md:mt-16">
            {hasTiers ? (
              // Populated state — render once Builder 5 fills PRICING_COPY.tiers.
              // Card layout intentionally minimal until the lane structure lands.
              <ul className="grid gap-6 md:grid-cols-2">
                {/* Pricing-tier rendering will land in the same PR as the operator
                    confirmation. Until then this branch is unreachable. */}
              </ul>
            ) : (
              <BlockedStateCard />
            )}
          </div>
        </Container>
      </Section>

      <CTASection
        heading={PRICING_COPY.cta.heading}
        body={PRICING_COPY.cta.body}
        cta={PRICING_COPY.cta.button}
      />
    </main>
  );
}

function BlockedStateCard() {
  return (
    <div className="rounded-xl border border-navy-900/10 bg-cream-50 p-8 shadow-sm md:p-12">
      <Eyebrow>While we finalize the page</Eyebrow>
      <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-navy-950 md:text-3xl">
        Email me and I'll quote you a flat fee.
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-graphite-600 md:text-lg">
        Two paths most folks pick: walk you through what to do yourself,
        or build it with you. Once we're on a 45-minute call I can put a
        number on it that fits your business — not a one-size-fits-all
        package. No guesswork on either side.
      </p>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-graphite-600 md:text-lg">
        I&apos;m updating this page with the two new options shortly. In
        the meantime the easiest path is the call.
      </p>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-lg bg-sage-500 px-6 py-3 text-base font-medium text-navy-950 shadow-sm transition-colors hover:bg-sage-600 hover:text-cream-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500 focus-visible:ring-offset-2"
        >
          Book a 45-min discovery call
        </Link>
        <Link
          href="/how-it-works"
          className="inline-flex items-center justify-center rounded-lg border border-navy-900/15 bg-transparent px-6 py-3 text-base font-medium text-navy-950 transition-colors hover:border-navy-900/30 hover:bg-navy-900/5"
        >
          See how it works first
        </Link>
      </div>
    </div>
  );
}
