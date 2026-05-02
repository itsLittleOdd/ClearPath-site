import Link from "next/link";

import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { Heading } from "@/components/Heading";
import { Section } from "@/components/Section";
import { HOME_COPY } from "@/content/copy";
import { cn } from "@/lib/utils";

type HeroProps = {
  className?: string;
  bookingUrl?: string;
  howItWorksHref?: string;
};

export function Hero({
  className,
  bookingUrl,
  howItWorksHref = "/how-it-works",
}: HeroProps) {
  const { eyebrow, headline, subhead, primaryCta, secondaryCta } =
    HOME_COPY.hero;
  const resolvedBookingUrl = bookingUrl ?? "/contact";

  return (
    <Section
      background="cream"
      className={cn("pt-20 md:pt-28", className)}
    >
      <Container>
        <div className="grid gap-12 md:grid-cols-12 md:items-center">
          <div className="flex flex-col gap-6 md:col-span-7">
            <Eyebrow>{eyebrow}</Eyebrow>
            <Heading as="h1" level="h1">
              {headline}
            </Heading>
            <p className="max-w-xl text-lg leading-relaxed text-graphite-600">
              {subhead}
            </p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={resolvedBookingUrl}
                className="inline-flex items-center justify-center rounded-lg bg-sage-600 px-6 py-3 text-base font-medium text-cream-50 shadow-sm transition-colors hover:bg-sage-500"
              >
                {primaryCta}
              </Link>
              <Link
                href={howItWorksHref}
                className="inline-flex items-center justify-center px-2 py-3 text-base font-medium text-navy-800 underline-offset-4 hover:underline"
              >
                {secondaryCta}
              </Link>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="hidden md:col-span-5 md:block"
          >
            {/* TODO(designer): replace with hero illustration or photo asset. */}
            <div className="aspect-[4/3] w-full rounded-2xl border border-navy-800/10 bg-navy-800/[0.04]" />
          </div>
        </div>
      </Container>
    </Section>
  );
}
