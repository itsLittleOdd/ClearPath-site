import type { Metadata } from "next";

import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { Heading } from "@/components/Heading";
import { Section } from "@/components/Section";
import { CTASection } from "@/components/sections/CTASection";
import { SERVICES_COPY } from "@/content/copy";

export const metadata: Metadata = {
  title: { absolute: "Services | ClearPath" },
  description:
    "Six ClearPath services, all scoped one workflow at a time: Workflow Check, One Workflow Fix, Knowledge Capture, Internal Assistant, Approval Workflow, Owner Brief.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  const { eyebrow, heading, intro, services, supportNote, cta } =
    SERVICES_COPY;

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
          <ul className="grid gap-6 md:grid-cols-2">
            {services.map((service, idx) => (
              <li
                key={service.title}
                className="group flex h-full flex-col gap-5 rounded-2xl border border-navy-800/10 border-l-4 border-l-sage-500/70 bg-cream-50 p-6 shadow-sm transition-shadow hover:border-l-sage-500 hover:shadow-md md:p-8"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="inline-block h-1.5 w-1.5 rounded-full bg-sage-500"
                    />
                    <p className="font-display text-eyebrow font-medium uppercase tracking-wider text-sage-600">
                      Service
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    className="font-display text-sm font-medium tabular-nums text-graphite-500/70"
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                </div>
                <h2 className="font-display text-2xl font-semibold text-balance text-navy-950">
                  {service.title}
                </h2>
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="font-display text-eyebrow font-medium uppercase tracking-wider text-graphite-500">
                      Problem
                    </p>
                    <p className="mt-1 text-base leading-relaxed text-pretty text-graphite-600">
                      {service.problem}
                    </p>
                  </div>
                  <div>
                    <p className="font-display text-eyebrow font-medium uppercase tracking-wider text-graphite-500">
                      What you get
                    </p>
                    <p className="mt-1 text-base leading-relaxed text-pretty text-graphite-600">
                      {service.buyerGets}
                    </p>
                  </div>
                  <div>
                    <p className="font-display text-eyebrow font-medium uppercase tracking-wider text-graphite-500">
                      First step
                    </p>
                    <p className="mt-1 text-base leading-relaxed text-pretty text-graphite-600">
                      {service.firstStep}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section background="cream" className="py-12 md:py-16">
        <Container>
          <aside className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-navy-800/10 bg-navy-900/[0.04] p-8 md:p-10">
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-block h-1.5 w-1.5 rounded-full bg-sage-500"
              />
              <span className="font-display text-eyebrow font-medium uppercase tracking-wider text-sage-600">
                Support
              </span>
            </div>
            <h2 className="font-display text-xl font-semibold text-balance text-navy-950 md:text-2xl">
              {supportNote.heading}
            </h2>
            <p className="text-base leading-relaxed text-pretty text-graphite-600 md:text-lg">
              {supportNote.body}
            </p>
          </aside>
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
