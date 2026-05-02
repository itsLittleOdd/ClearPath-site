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
    <Section id={id} background="cream" className={cn(className)}>
      <Container>
        <div className="flex max-w-3xl flex-col gap-4">
          <Eyebrow>{eyebrow}</Eyebrow>
          <Heading as="h2" level="h2">
            {heading}
          </Heading>
          <p className="text-lg leading-relaxed text-graphite-600">{intro}</p>
        </div>
        <ol className="mt-12 grid gap-8 md:mt-16 md:grid-cols-3 md:gap-10">
          {steps.map((step, idx) => (
            <li key={step.title} className="flex flex-col gap-3">
              <span
                aria-hidden="true"
                className="font-display text-sm font-medium uppercase tracking-wider text-sage-600"
              >
                Step {idx + 1}
              </span>
              <h3 className="font-display text-xl font-semibold text-navy-950">
                {step.title}
              </h3>
              <p className="text-base leading-relaxed text-graphite-600">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
