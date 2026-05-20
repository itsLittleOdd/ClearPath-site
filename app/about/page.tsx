import type { Metadata } from "next";

import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { Heading } from "@/components/Heading";
import { Section } from "@/components/Section";
import { CTASection } from "@/components/sections/CTASection";
import { ABOUT_COPY } from "@/content/copy";

export const metadata: Metadata = {
  title: { absolute: "About | ClearPath" },
  description:
    "ClearPath is run by an operator. Founded by Justin Whalen — twelve-plus years on the operations side of a regional resort, then a stretch building internal tools that solved real workflow problems.",
};

export default function AboutPage() {
  const [bio1, bio2, bio3] = ABOUT_COPY.bio;

  return (
    <main id="main">
      {/* Hero */}
      <Section
        background="cream"
        className="relative isolate overflow-hidden pt-20 pb-12 md:pt-28 md:pb-16"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -right-32 -z-10 h-[28rem] w-[28rem] rounded-full bg-sage-500/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -left-32 -z-10 h-[24rem] w-[24rem] rounded-full bg-navy-900/[0.05] blur-3xl"
        />
        <Container>
          <div className="flex max-w-3xl flex-col gap-5">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="inline-block h-px w-8 bg-sage-500"
              />
              <Eyebrow className="m-0">{ABOUT_COPY.eyebrow}</Eyebrow>
            </div>
            <Heading as="h1" level="h1">
              {ABOUT_COPY.heading}
            </Heading>
            <p className="text-lg leading-relaxed text-pretty text-graphite-600 md:text-xl">
              {ABOUT_COPY.intro}
            </p>
          </div>
        </Container>
      </Section>

      {/* Bio + Quick facts sidebar */}
      <Section background="cream" size="tight" className="!pt-0">
        <Container>
          <div className="grid gap-12 md:grid-cols-12 md:gap-12 lg:gap-16">
            <div className="flex flex-col gap-5 text-lg leading-relaxed text-pretty text-graphite-600 md:col-span-7">
              <p>{bio1}</p>
              <p>{bio2}</p>
              <p>{bio3}</p>
            </div>

            <aside className="md:col-span-5">
              <div className="flex flex-col gap-5 rounded-2xl border border-navy-800/10 bg-cream-50 p-6 shadow-sm md:p-8">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="inline-block h-1.5 w-1.5 rounded-full bg-sage-500"
                  />
                  <span className="font-display text-eyebrow font-medium uppercase tracking-wider text-sage-600">
                    Quick facts
                  </span>
                </div>
                <dl className="flex flex-col gap-4">
                  {ABOUT_COPY.facts.map((fact, idx) => (
                    <div
                      key={fact.label}
                      className={
                        idx > 0
                          ? "flex flex-col gap-1 border-t border-navy-800/10 pt-4"
                          : "flex flex-col gap-1"
                      }
                    >
                      <dt className="font-display text-eyebrow font-medium uppercase tracking-wider text-graphite-500">
                        {fact.label}
                      </dt>
                      <dd className="text-base font-medium text-pretty text-navy-950">
                        {fact.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      {/* Values strip */}
      <Section background="navy" size="tight">
        <Container>
          <div className="reveal-on-view flex max-w-3xl flex-col gap-3">
            <Eyebrow className="text-sage-500">How ClearPath works</Eyebrow>
            <Heading as="h2" level="h2" className="text-cream-50">
              Three rules we hold.
            </Heading>
          </div>
          <ul className="mt-12 grid gap-10 md:mt-16 md:grid-cols-3 md:gap-8">
            {ABOUT_COPY.values.map((value, idx) => (
              <li key={value.title} className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="relative inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-sage-500/40 bg-navy-900/40 font-display text-xl font-semibold leading-none text-sage-500 shadow-[0_0_0_4px_var(--color-navy-800)]"
                  >
                    {idx + 1}
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold text-balance text-cream-50">
                  {value.title}
                </h3>
                <p className="text-base leading-relaxed text-pretty text-cream-50/80">
                  {value.body}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <CTASection
        heading={ABOUT_COPY.cta.heading}
        body={ABOUT_COPY.cta.body}
        cta={ABOUT_COPY.cta.button}
      />
    </main>
  );
}
