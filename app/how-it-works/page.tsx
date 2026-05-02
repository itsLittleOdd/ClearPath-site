import type { Metadata } from "next";

import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { Heading } from "@/components/Heading";
import { Section } from "@/components/Section";
import { CTASection } from "@/components/sections/CTASection";
import { HOW_IT_WORKS_COPY } from "@/content/copy";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Three steps from a 45-minute discovery call to a plain-English audit you can run yourself or build alongside me. No slide deck, no jargon, no high-pressure sale.",
};

export default function HowItWorksPage() {
  const { eyebrow, heading, intro, steps, whatThisIsnt, cta } =
    HOW_IT_WORKS_COPY;

  return (
    <main>
      <Section background="cream">
        <Container>
          <div className="flex max-w-3xl flex-col gap-4">
            <Eyebrow>{eyebrow}</Eyebrow>
            <Heading as="h1" level="h1">
              {heading}
            </Heading>
            <p className="text-lg leading-relaxed text-graphite-600 md:text-xl">
              {intro}
            </p>
          </div>

          <ol className="mt-12 grid gap-10 md:mt-20 md:grid-cols-3 md:gap-12">
            {steps.map((step) => (
              <li key={step.number} className="flex flex-col gap-4">
                <span
                  aria-hidden="true"
                  className="font-display text-sm font-medium uppercase tracking-wider text-sage-600"
                >
                  Step {step.number}
                </span>
                <h2 className="font-display text-2xl font-semibold text-navy-950">
                  {step.title}
                </h2>
                <p className="text-base leading-relaxed text-graphite-600">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>

          <aside className="mt-16 max-w-3xl border-l-4 border-sage-500 pl-6 md:mt-24 md:pl-8">
            <Heading as="h2" level="h3">
              {whatThisIsnt.heading}
            </Heading>
            <p className="mt-3 text-base leading-relaxed text-graphite-600 md:text-lg">
              {whatThisIsnt.body}
            </p>
          </aside>
        </Container>
      </Section>

      <CTASection heading={cta.heading} body={cta.body} cta={cta.button} />
    </main>
  );
}
