import Link from "next/link";

import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { Heading } from "@/components/Heading";
import { Section } from "@/components/Section";
import { Card } from "@/components/ui/card";
import { HOME_COPY } from "@/content/copy";
import { cn } from "@/lib/utils";

type ExamplesProps = {
  className?: string;
};

// Repurposed as the "Concrete examples" homepage block. Renders the
// use-case cards from HOME_COPY.useCasesSection so the homepage and the
// dedicated /use-cases page tell the same story without duplication.
// The full set lives at /use-cases; the homepage shows the first six.

export function Examples({ className }: ExamplesProps) {
  const { eyebrow, heading, intro, cards, cta, ctaHref } =
    HOME_COPY.useCasesSection;

  return (
    <Section background="cream" size="tight" className={cn(className)}>
      <Container>
        <div className="reveal-on-view flex max-w-3xl flex-col gap-4">
          <Eyebrow>{eyebrow}</Eyebrow>
          <Heading as="h2" level="h2">
            {heading}
          </Heading>
          <p className="text-lg leading-relaxed text-pretty text-graphite-600">
            {intro}
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:mt-16 md:grid-cols-3">
          {cards.map((card) => (
            <Card
              key={card.title}
              surface="cream"
              interactive
              className="reveal-on-view group h-full border-l-4 border-l-sage-500/70 hover:border-l-sage-500"
            >
              <div className="flex h-full flex-col gap-4 p-6 md:p-8">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="inline-block h-1.5 w-1.5 rounded-full bg-sage-500"
                  />
                  <p className="font-display text-eyebrow font-medium uppercase tracking-wider text-sage-600">
                    Use case
                  </p>
                </div>
                <h3 className="font-display text-2xl font-semibold leading-tight text-balance text-navy-950">
                  {card.title}
                </h3>
                <div
                  aria-hidden="true"
                  className="h-px w-10 bg-navy-800/15 transition-colors group-hover:bg-sage-500/60"
                />
                <p className="text-base leading-relaxed text-pretty text-graphite-600">
                  {card.body}
                </p>
              </div>
            </Card>
          ))}
        </div>
        <div className="reveal-on-view mt-10 flex justify-center md:mt-12">
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 font-display text-base font-medium text-sage-600 underline-offset-4 transition-colors hover:text-sage-500 hover:underline"
          >
            {cta}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Container>
    </Section>
  );
}
