import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { Section } from "@/components/Section";
import { CtaButton } from "@/components/ui/cta-button";
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
    <Section background="navyDeep" className={cn(className)}>
      <Container>
        <div className="reveal-on-view flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex max-w-2xl flex-col gap-3">
            <Heading as="h2" level="h2" className="text-cream-50">
              {heading ?? fallback.heading}
            </Heading>
            <p className="text-lg leading-relaxed text-pretty text-cream-50/85">
              {body ?? fallback.body}
            </p>
          </div>
          <CtaButton
            href={resolvedBookingUrl}
            variant="inverted"
            size="lg"
            className="shrink-0"
          >
            {cta ?? fallback.cta}
          </CtaButton>
        </div>
      </Container>
    </Section>
  );
}
