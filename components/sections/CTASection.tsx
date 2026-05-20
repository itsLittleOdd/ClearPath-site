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

  const trustItems = ["Fixed scope", "One workflow", "$395 to start"];

  return (
    <Section
      background="navyDeep"
      size="tight"
      className={cn("relative isolate overflow-hidden", className)}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -right-24 -z-10 h-[22rem] w-[22rem] rounded-full bg-sage-500/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-24 -z-10 h-[18rem] w-[18rem] rounded-full bg-navy-700/40 blur-3xl"
      />

      <Container>
        <div className="reveal-on-view flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex max-w-2xl flex-col gap-4">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="inline-block h-px w-8 bg-sage-500"
              />
              <span className="font-display text-eyebrow font-medium uppercase tracking-wider text-sage-500">
                Next step
              </span>
            </div>
            <Heading as="h2" level="h2" className="text-cream-50">
              {heading ?? fallback.heading}
            </Heading>
            <p className="text-lg leading-relaxed text-pretty text-cream-50/85">
              {body ?? fallback.body}
            </p>
            <ul className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-cream-50/70">
              {trustItems.map((item, idx) => (
                <li key={item} className="flex items-center gap-3">
                  {idx > 0 ? (
                    <span
                      aria-hidden="true"
                      className="hidden h-1 w-1 rounded-full bg-sage-500/70 sm:inline-block"
                    />
                  ) : null}
                  <span>{item}</span>
                </li>
              ))}
            </ul>
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
