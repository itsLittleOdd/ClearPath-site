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
      <Section background="cream" className="pt-20 md:pt-28">
        <Container>
          <div className="flex max-w-3xl flex-col gap-6">
            <Eyebrow>{eyebrow}</Eyebrow>
            <Heading as="h1" level="h1">
              {heading}
            </Heading>
            <p className="text-lg leading-relaxed text-graphite-600">{intro}</p>
          </div>
        </Container>
      </Section>

      <Section background="cream" className="pt-0 md:pt-0">
        <Container>
          <div className="grid gap-10 md:grid-cols-2 md:gap-12">
            {/* Cal.com inline embed — booking column */}
            <div className="flex flex-col gap-4">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-navy-950">
                {calendar.placeholderHeading}
              </h2>
              <p className="text-base leading-relaxed text-graphite-600">
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
            <div className="flex flex-col gap-4">
              <h2
                id="contact-form"
                className="font-display text-2xl font-semibold tracking-tight text-navy-950"
              >
                {form.heading}
              </h2>
              <p className="text-base leading-relaxed text-graphite-600">
                {form.intro}
              </p>
              <TallyEmbed title="ClearPath Lead Intake" />
              <p className="mt-2 text-sm leading-relaxed text-graphite-500">
                {form.privacyNote}
              </p>
            </div>
          </div>

          <div className="mt-16 border-t border-navy-800/10 pt-8">
            <h2 className="font-display text-xl font-semibold tracking-tight text-navy-950">
              {fallbackContact.heading}
            </h2>
            <p className="mt-2 max-w-xl text-base leading-relaxed text-graphite-600">
              {fallbackContact.body}
            </p>
          </div>
        </Container>
      </Section>
    </main>
  );
}
