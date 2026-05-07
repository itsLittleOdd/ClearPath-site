import type { Metadata } from "next";

import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { Heading } from "@/components/Heading";
import { Section } from "@/components/Section";
import { CTASection } from "@/components/sections/CTASection";
import { ABOUT_COPY } from "@/content/copy";

export const metadata: Metadata = {
  title: { absolute: "About Justin | ClearPath AI Audit" },
  description:
    "Justin Whalen. Twelve-plus years on the operations side of a regional ski resort in Western New York. ClearPath is the same idea, scaled.",
};

const QUICK_FACTS = [
  { label: "Based in", value: "Olean, NY" },
  { label: "Before ClearPath", value: "12+ years in WNY hospitality ops" },
  { label: "Travels for the audit", value: "Across Western NY" },
  { label: "The audit", value: "$197 flat, no retainer" },
];

const BEFORE_CLEARPATH = [
  {
    title: "Ski-school chatbot",
    body: "Built so a new ski-school director could ramp without bugging instructors all day. Side project. Saved everyone hours.",
  },
  {
    title: "'Book with Justin' lesson site",
    body: "A small booking site so guests could schedule a private ski lesson with me directly instead of leaving voicemails the resort had to call back.",
  },
];

const VALUES = [
  {
    title: "Plain English",
    body: "No jargon, no 100-page deck. Two-to-three pages, real tools, real numbers.",
  },
  {
    title: "Local first",
    body: "Olean and wider Western New York. Real businesses, long shifts, small margins.",
  },
  {
    title: "Yours to keep",
    body: "No retainer, no monthly upsell. The plan is yours either way.",
  },
];

export default function AboutPage() {
  const [intro1, intro2, why, letMeShowYou] = ABOUT_COPY.bio;

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
              Twelve-plus years running operations at a Western New York
              resort. Now I help small businesses save 5-10 hours a week with
              practical AI.
            </p>
          </div>
        </Container>
      </Section>

      {/* Bio + Quick facts sidebar */}
      <Section background="cream" size="tight" className="!pt-0">
        <Container>
          <div className="grid gap-12 md:grid-cols-12 md:gap-12 lg:gap-16">
            <div className="flex flex-col gap-5 text-lg leading-relaxed text-pretty text-graphite-600 md:col-span-7">
              <p>{intro1}</p>
              <p>{intro2}</p>
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
                  {QUICK_FACTS.map((fact, idx) => (
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

      {/* Before ClearPath */}
      <Section background="cream" size="tight" className="!pt-4 md:!pt-8">
        <Container>
          <div className="flex max-w-3xl flex-col gap-3">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="inline-block h-px w-8 bg-sage-500"
              />
              <Eyebrow className="m-0">Before ClearPath</Eyebrow>
            </div>
            <Heading as="h2" level="h3">
              The small fixes that started it.
            </Heading>
            <p className="text-base leading-relaxed text-pretty text-graphite-600 md:text-lg">
              Side projects I built to save myself time at the resort. Turned
              out the small fixes that save five hours a week add up.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:mt-12 md:grid-cols-2">
            {BEFORE_CLEARPATH.map((item, idx) => (
              <div
                key={item.title}
                className="group flex h-full flex-col gap-4 rounded-2xl border border-navy-800/10 border-l-4 border-l-sage-500/70 bg-cream-50 p-6 shadow-sm transition-shadow hover:border-l-sage-500 hover:shadow-md md:p-8"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="inline-block h-1.5 w-1.5 rounded-full bg-sage-500"
                    />
                    <span className="font-display text-eyebrow font-medium uppercase tracking-wider text-sage-600">
                      Side project
                    </span>
                  </div>
                  <span
                    aria-hidden="true"
                    className="font-display text-sm font-medium tabular-nums text-graphite-500/70"
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="font-display text-2xl font-semibold text-balance text-navy-950">
                  {item.title}
                </h3>
                <div
                  aria-hidden="true"
                  className="h-px w-10 bg-navy-800/15 transition-colors group-hover:bg-sage-500/60"
                />
                <p className="text-base leading-relaxed text-pretty text-graphite-600">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Values strip */}
      <Section background="navy" size="tight">
        <Container>
          <div className="reveal-on-view flex max-w-3xl flex-col gap-3">
            <Eyebrow className="text-sage-500">How I work</Eyebrow>
            <Heading as="h2" level="h2" className="text-cream-50">
              Three rules I keep.
            </Heading>
          </div>
          <ul className="mt-12 grid gap-10 md:mt-16 md:grid-cols-3 md:gap-8">
            {VALUES.map((value, idx) => (
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

      {/* Why I built ClearPath */}
      <Section background="cream" size="tight">
        <Container>
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="inline-block h-px w-8 bg-sage-500"
              />
              <Eyebrow className="m-0">The why</Eyebrow>
            </div>
            <Heading as="h2" level="h2">
              Why I built ClearPath.
            </Heading>
            <div className="flex flex-col gap-5 text-lg leading-relaxed text-pretty text-graphite-600">
              <p>{why}</p>
              <p>{letMeShowYou}</p>
            </div>
          </div>
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
