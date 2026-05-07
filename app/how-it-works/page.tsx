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
      <Section
        background="cream"
        className="relative isolate overflow-hidden pt-16 pb-12 md:pt-20 md:pb-16"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -right-24 -z-10 h-[24rem] w-[24rem] rounded-full bg-sage-500/15 blur-3xl"
        />
        <Container>
          <div className="flex max-w-3xl flex-col gap-5">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="inline-block h-px w-8 bg-sage-500"
              />
              <Eyebrow className="m-0">{eyebrow}</Eyebrow>
            </div>
            <Heading as="h1" level="h1">
              {heading}
            </Heading>
            <p className="text-lg leading-relaxed text-pretty text-graphite-600 md:text-xl">
              {intro}
            </p>
          </div>
        </Container>
      </Section>

      <Section background="navy" size="default">
        <Container>
          <ol className="relative grid gap-12 md:grid-cols-3 md:gap-10">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-8 right-8 top-7 hidden h-px bg-gradient-to-r from-transparent via-sage-500/30 to-transparent md:block"
            />
            {steps.map((step) => (
              <li
                key={step.number}
                className="relative flex flex-col gap-4"
              >
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="relative inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-sage-500/40 bg-navy-900/40 font-display text-2xl font-semibold leading-none text-sage-500 shadow-[0_0_0_4px_var(--color-navy-800)]"
                  >
                    {step.number}
                  </span>
                  <span className="font-display text-eyebrow font-medium uppercase tracking-wider text-cream-50/60">
                    Step {step.number}
                  </span>
                </div>
                <h2 className="font-display text-2xl font-semibold text-balance text-cream-50">
                  {step.title}
                </h2>
                <p className="text-base leading-relaxed text-pretty text-cream-50/80">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section background="cream" size="tight">
        <Container>
          <aside className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border-l-4 border-sage-500 bg-cream-50 p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-block h-1.5 w-1.5 rounded-full bg-sage-500"
              />
              <span className="font-display text-eyebrow font-medium uppercase tracking-wider text-sage-600">
                Honest scope
              </span>
            </div>
            <Heading as="h2" level="h3">
              {whatThisIsnt.heading}
            </Heading>
            <p className="text-base leading-relaxed text-pretty text-graphite-600 md:text-lg">
              {whatThisIsnt.body}
            </p>
          </aside>
        </Container>
      </Section>

      <CTASection heading={cta.heading} body={cta.body} cta={cta.button} />
    </main>
  );
}
