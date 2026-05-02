import Link from "next/link";

import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { Section } from "@/components/Section";
import { HOME_COPY } from "@/content/copy";
import { cn } from "@/lib/utils";

type CTASectionProps = {
  className?: string;
  bookingUrl?: string;
  heading?: string;
  body?: string;
  cta?: string;
};

export function CTASection({
  className,
  bookingUrl,
  heading,
  body,
  cta,
}: CTASectionProps) {
  const fallback = HOME_COPY.finalCta;
  const resolvedBookingUrl = bookingUrl ?? "/contact";

  return (
    <Section background="navy" className={cn(className)}>
      <Container>
        <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex max-w-2xl flex-col gap-3">
            <Heading as="h2" level="h2" className="text-cream-50">
              {heading ?? fallback.heading}
            </Heading>
            <p className="text-lg leading-relaxed text-cream-50/85">
              {body ?? fallback.body}
            </p>
          </div>
          <Link
            href={resolvedBookingUrl}
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-sage-500 px-6 py-3 text-base font-medium text-navy-950 shadow-sm transition-colors hover:bg-sage-600 hover:text-cream-50"
          >
            {cta ?? fallback.cta}
          </Link>
        </div>
      </Container>
    </Section>
  );
}
