import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { Heading } from "@/components/Heading";
import { Section } from "@/components/Section";
import { CTASection } from "@/components/sections/CTASection";
import { WHO_ITS_FOR_COPY } from "@/content/copy";

export const metadata: Metadata = {
  title: "Who It's For | ClearPath AI Audit",
  description: WHO_ITS_FOR_COPY.intro,
};

export default function WhoItsForPage() {
  const { eyebrow, heading, intro, tagline, audiences, notForYouIf, cta } =
    WHO_ITS_FOR_COPY;

  return (
    <main>
      <Section background="cream" className="pt-20 md:pt-28">
        <Container>
          <div className="flex max-w-3xl flex-col gap-5">
            <Eyebrow>{eyebrow}</Eyebrow>
            <Heading as="h1" level="h1">
              {heading}
            </Heading>
            <p className="text-lg leading-relaxed text-graphite-600">{intro}</p>
            <p className="text-base leading-relaxed text-graphite-600">
              {tagline}
            </p>
          </div>
        </Container>
      </Section>

      <Section background="cream" className="py-12 md:py-16">
        <Container>
          <ul className="grid gap-6 md:grid-cols-2">
            {audiences.map((audience) => (
              <li
                key={audience.archetype}
                className="flex h-full flex-col gap-3 rounded-2xl border border-navy-800/10 bg-cream-50 p-6 shadow-sm md:p-8"
              >
                <p className="font-display text-sm font-medium uppercase tracking-wider text-sage-600">
                  Sounds like you?
                </p>
                <h2 className="font-display text-2xl font-semibold text-navy-950">
                  {audience.archetype}
                </h2>
                <p className="text-base leading-relaxed text-graphite-600">
                  {audience.example}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section background="cream" className="py-12 md:py-16">
        <Container>
          <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-navy-800/10 bg-navy-900/[0.04] p-8 md:p-10">
            <h2 className="font-display text-xl font-semibold text-navy-950 md:text-2xl">
              {notForYouIf.heading}
            </h2>
            <p className="text-base leading-relaxed text-graphite-600 md:text-lg">
              {notForYouIf.body}
            </p>
            <p className="text-base leading-relaxed text-graphite-600">
              Not sure if you fit?{" "}
              <Link
                href="/contact"
                className="font-medium text-sage-600 underline-offset-4 hover:underline"
              >
                Book a 45-min discovery call
              </Link>{" "}
              — we'll figure it out together.
            </p>
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
