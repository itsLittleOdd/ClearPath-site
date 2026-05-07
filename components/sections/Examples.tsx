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

export function Examples({ className }: ExamplesProps) {
  const { eyebrow, heading } = HOME_COPY.examplesSection;

  return (
    <Section background="cream" size="tight" className={cn(className)}>
      <Container>
        <div className="reveal-on-view flex max-w-3xl flex-col gap-4">
          <Eyebrow>{eyebrow}</Eyebrow>
          <Heading as="h2" level="h2">
            {heading}
          </Heading>
        </div>
        <div className="mt-12 grid gap-6 md:mt-16 md:grid-cols-3">
          {HOME_COPY.examples.map((example) => (
            <Card
              key={example.archetype}
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
                    {example.archetype}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="font-display text-3xl font-semibold leading-tight text-balance text-navy-950 md:text-4xl">
                    {example.timeSaved}
                  </p>
                  <p className="font-display text-eyebrow font-medium uppercase tracking-wider text-graphite-500">
                    Saved
                  </p>
                </div>
                <div
                  aria-hidden="true"
                  className="h-px w-10 bg-navy-800/15 transition-colors group-hover:bg-sage-500/60"
                />
                <p className="text-base leading-relaxed text-pretty text-graphite-600">
                  {example.summary}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
