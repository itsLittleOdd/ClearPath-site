import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { Heading } from "@/components/Heading";
import { Section } from "@/components/Section";
import { HOME_COPY } from "@/content/copy";
import { cn } from "@/lib/utils";

type HowItWorksProps = {
  className?: string;
  id?: string;
};

export function HowItWorks({
  className,
  id = "how-it-works",
}: HowItWorksProps) {
  const { eyebrow, heading, intro, steps } = HOME_COPY.howItWorks;

  return (
    <Section id={id} background="navy" className={cn(className)}>
      <Container>
        <div className="reveal-on-view flex max-w-3xl flex-col gap-4">
          <Eyebrow className="text-sage-500">{eyebrow}</Eyebrow>
          <Heading as="h2" level="h2" className="text-cream-50">
            {heading}
          </Heading>
          <p className="text-lg leading-relaxed text-pretty text-cream-50/80">
            {intro}
          </p>
        </div>

        <ol className="relative mt-12 grid gap-10 md:mt-16 md:grid-cols-3 md:gap-8">
          {/*
           * Connector line — horizontal on md+ across the row, sitting at the
           * vertical center of the numeral. Uses sage-500 at 25% so it reads
           * as a thread, not a divider.
           */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-0 right-0 top-7 hidden h-px bg-sage-500/25 md:block"
          />

          {steps.map((step, idx) => (
            <li
              key={step.title}
              className="reveal-on-view relative flex flex-col gap-4"
            >
              <div className="flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className="font-display text-display-md font-semibold leading-none text-sage-500"
                >
                  {idx + 1}
                </span>
                <span className="font-display text-eyebrow font-medium uppercase tracking-wider text-cream-50/60">
                  Step {idx + 1}
                </span>
              </div>
              <h3 className="font-display text-2xl font-semibold text-balance text-cream-50">
                {step.title}
              </h3>
              <p className="text-base leading-relaxed text-pretty text-cream-50/80">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
