import type { Metadata } from "next";

import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { Heading } from "@/components/Heading";
import { Section } from "@/components/Section";
import { Card } from "@/components/ui/card";
import { CTASection } from "@/components/sections/CTASection";
import { USE_CASES_COPY } from "@/content/copy";

export const metadata: Metadata = {
  title: { absolute: "Use Cases | ClearPath" },
  description:
    "Workflows ClearPath builds first: quote intake, onboarding guides, invoice routing, troubleshooting helpers, weekly owner briefs, document retrieval, intake triage, follow-up boards.",
  alternates: { canonical: "/use-cases" },
};

export default function UseCasesPage() {
  const { eyebrow, heading, intro, cases, cta } = USE_CASES_COPY;

  return (
    <main>
      <Section
        background="cream"
        className="relative isolate overflow-hidden pt-20 pb-12 md:pt-28 md:pb-16"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -right-32 -z-10 h-[26rem] w-[26rem] rounded-full bg-sage-500/15 blur-3xl"
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

      <Section background="cream" className="py-8 md:py-12">
        <Container>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cases.map((useCase) => (
              <Card
                key={useCase.title}
                surface="cream"
                interactive
                className="group h-full border-l-4 border-l-sage-500/70 hover:border-l-sage-500"
              >
                <div className="flex h-full flex-col gap-4 p-6 md:p-8">
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="inline-block h-1.5 w-1.5 rounded-full bg-sage-500"
                    />
                    <p className="font-display text-eyebrow font-medium uppercase tracking-wider text-sage-600">
                      Use case
                    </p>
                  </div>
                  <h2 className="font-display text-xl font-semibold leading-tight text-balance text-navy-950 md:text-2xl">
                    {useCase.title}
                  </h2>
                  <div
                    aria-hidden="true"
                    className="h-px w-10 bg-navy-800/15 transition-colors group-hover:bg-sage-500/60"
                  />
                  <p className="text-base leading-relaxed text-pretty text-graphite-600">
                    {useCase.body}
                  </p>
                  <div className="mt-auto border-t border-navy-800/10 pt-3">
                    <p className="font-display text-eyebrow font-medium uppercase tracking-wider text-graphite-500">
                      Deliverable
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-pretty text-graphite-600">
                      {useCase.deliverable}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <CTASection
        heading={cta.heading}
        body={cta.body}
        cta={cta.button}
      />
    </main>
  );
}
