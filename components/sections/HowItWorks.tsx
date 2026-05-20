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
  const { eyebrow, heading, steps } = HOME_COPY.process;
  const intro =
    "Five steps. One workflow at a time. ClearPath maps the work before touching tools.";

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

        <ol className="relative mt-12 grid gap-12 md:mt-16 md:grid-cols-3 md:gap-10">
          {/*
           * Connector line - horizontal on md+ across the row, sitting at the
           * vertical center of the numbered bubble. Uses sage-500 at 25% so it
           * reads as a thread, not a divider.
           */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-8 right-8 top-7 hidden h-px bg-gradient-to-r from-transparent via-sage-500/30 to-transparent md:block"
          />

          {steps.map((step, idx) => (
            <li
              key={step.title}
              className="reveal-on-view relative flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="relative inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-sage-500/40 bg-navy-900/40 font-display text-2xl font-semibold leading-none text-sage-500 shadow-[0_0_0_4px_var(--color-navy-800)]"
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

        <div className="reveal-on-view mt-14 flex flex-col items-start gap-3 border-t border-cream-50/10 pt-8 md:mt-20 md:flex-row md:items-center md:justify-between md:gap-6">
          <p className="text-base leading-relaxed text-pretty text-cream-50/70 md:text-lg">
            Fixed-scope engagements. The workflow goes home with the team.
          </p>
          <div className="flex items-center gap-2 text-sm text-sage-500">
            <span
              aria-hidden="true"
              className="inline-block h-1.5 w-1.5 rounded-full bg-sage-500"
            />
            <span className="font-display uppercase tracking-wider">
              One workflow at a time
            </span>
          </div>
        </div>
      </Container>
    </Section>
  );
}
