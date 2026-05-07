import type { Metadata } from "next";

import { CalComEmbed } from "@/components/CalComEmbed";
import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { Heading } from "@/components/Heading";
import { Section } from "@/components/Section";
import { TallyEmbed } from "@/components/TallyEmbed";
import { CONTACT_COPY } from "@/content/copy";

export const metadata: Metadata = {
  title: { absolute: "Contact | ClearPath AI Audit" },
  description: CONTACT_COPY.intro,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const { eyebrow, heading, intro, calendar, form, fallbackContact } =
    CONTACT_COPY;

  return (
    <main className="flex flex-1 flex-col">
      <Section
        background="cream"
        className="relative isolate overflow-hidden pt-20 pb-8 md:pt-28 md:pb-12"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -right-32 -z-10 h-[26rem] w-[26rem] rounded-full bg-sage-500/15 blur-3xl"
        />
        <Container>
          <div className="flex max-w-3xl flex-col gap-6">
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

      <Section background="cream" className="pt-0 md:pt-0">
        <Container>
          <div className="grid gap-10 md:grid-cols-2 md:gap-12">
            {/* Cal.com inline embed — booking column */}
            <div className="flex flex-col gap-4 rounded-2xl border border-navy-800/10 bg-cream-50 p-6 shadow-sm md:p-8">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="inline-block h-1.5 w-1.5 rounded-full bg-sage-500"
                />
                <span className="font-display text-eyebrow font-medium uppercase tracking-wider text-sage-600">
                  Option 1
                </span>
              </div>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-balance text-navy-950">
                {calendar.placeholderHeading}
              </h2>
              <p className="text-base leading-relaxed text-pretty text-graphite-600">
                {calendar.placeholderBody}
              </p>
              <CalComEmbed
                calLink="justin-whalen-xpjqtn/45-min-discovery-call"
                title="Book a 45-min discovery call with Justin"
              />
              {/*
                The 45-min review call URL is INTERNAL ONLY per Coord 1's
                Sprint-3 directive — Justin sends it to clients in the
                audit-delivery email. Do not surface it on the public
                contact page. The value lives in INTERNAL_LINKS.reviewBookingUrl
                (lib/internal.ts), intentionally excluded from the public
                SITE namespace so an autocomplete on `SITE.review...`
                cannot land here.
              */}
            </div>

            {/* Tally lead-intake — note column */}
            <div className="flex flex-col gap-4 rounded-2xl border border-navy-800/10 bg-cream-50 p-6 shadow-sm md:p-8">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="inline-block h-1.5 w-1.5 rounded-full bg-sage-500"
                />
                <span className="font-display text-eyebrow font-medium uppercase tracking-wider text-sage-600">
                  Option 2
                </span>
              </div>
              <h2
                id="contact-form"
                className="font-display text-2xl font-semibold tracking-tight text-balance text-navy-950"
              >
                {form.heading}
              </h2>
              <p className="text-base leading-relaxed text-pretty text-graphite-600">
                {form.intro}
              </p>
              <TallyEmbed title="ClearPath Lead Intake" />
              <p className="mt-2 text-sm leading-relaxed text-pretty text-graphite-500">
                {form.privacyNote}
              </p>
            </div>
          </div>

          <div className="mt-16 flex flex-col gap-3 border-t border-navy-800/10 pt-8 md:flex-row md:items-start md:justify-between md:gap-6">
            <div className="flex flex-col gap-2 md:max-w-xl">
              <h2 className="font-display text-xl font-semibold tracking-tight text-balance text-navy-950">
                {fallbackContact.heading}
              </h2>
              <p className="text-base leading-relaxed text-pretty text-graphite-600">
                {fallbackContact.body}
              </p>
            </div>
            <a
              href="mailto:JWhalen@ClearPathWV.com"
              className="inline-flex w-fit items-center gap-2 self-start rounded-lg border border-sage-500/40 bg-sage-500/10 px-4 py-2 text-sm font-medium text-sage-600 transition-colors hover:bg-sage-500/20"
            >
              <span
                aria-hidden="true"
                className="inline-block h-1.5 w-1.5 rounded-full bg-sage-500"
              />
              JWhalen@ClearPathWV.com
            </a>
          </div>
        </Container>
      </Section>
    </main>
  );
}
