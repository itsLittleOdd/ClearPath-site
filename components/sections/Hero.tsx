import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { Heading } from "@/components/Heading";
import { HeroIllustration } from "@/components/HeroIllustration";
import { Section } from "@/components/Section";
import { CtaButton } from "@/components/ui/cta-button";
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
  const {
    eyebrow,
    headline,
    headlineAccent,
    subhead,
    primaryCta,
    secondaryCta,
    trust,
  } = HOME_COPY.hero;
  const resolvedBookingUrl = bookingUrl ?? "/contact";

  // Split the headline around the accent substring so the rendered text stays
  // byte-for-byte equal to `headline` while letting the accent paint behind it.
  const accentIdx = headline.indexOf(headlineAccent);
  const headlineBefore =
    accentIdx >= 0 ? headline.slice(0, accentIdx) : headline;
  const headlineAfter =
    accentIdx >= 0 ? headline.slice(accentIdx + headlineAccent.length) : "";

  return (
    <Section
      background="cream"
      className={cn(
        "relative isolate overflow-hidden pt-24 pb-20 md:pt-32 md:pb-28",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-32 -z-10 h-[28rem] w-[28rem] rounded-full bg-sage-500/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-32 -z-10 h-[24rem] w-[24rem] rounded-full bg-navy-900/[0.06] blur-3xl"
      />

      <Container>
        <div className="grid gap-12 md:grid-cols-12 md:items-center">
          <div className="reveal-on-view flex flex-col gap-6 md:col-span-7">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="inline-block h-px w-8 bg-sage-500"
              />
              <Eyebrow className="m-0">{eyebrow}</Eyebrow>
            </div>

            <Heading as="h1" level="h1">
              {headlineBefore}
              {accentIdx >= 0 ? (
                <span className="relative inline-block">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-1 h-3 bg-sage-500/40 md:bottom-2 md:h-4"
                  />
                  <span className="relative">{headlineAccent}</span>
                </span>
              ) : null}
              {headlineAfter}
            </Heading>

            <p className="max-w-xl text-lg leading-relaxed text-pretty text-graphite-600">
              {subhead}
            </p>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
              <CtaButton href={resolvedBookingUrl} variant="primary" size="lg">
                {primaryCta}
              </CtaButton>
              <CtaButton href={howItWorksHref} variant="secondary" size="lg">
                {secondaryCta}
              </CtaButton>
            </div>

            <ul className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-graphite-600">
              {trust.map((item, idx) => (
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

          <div className="md:col-span-5">
            <HeroIllustration className="w-full" />
          </div>
        </div>
      </Container>
    </Section>
  );
}
