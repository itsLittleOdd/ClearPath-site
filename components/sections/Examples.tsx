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
              className="reveal-on-view h-full border-l-4 border-l-sage-500/70 hover:border-l-sage-500"
            >
              <div className="flex h-full flex-col gap-3 p-6 md:p-8">
                <p className="font-display text-eyebrow font-medium uppercase tracking-wider text-sage-600">
                  {example.archetype}
                </p>
                <p className="font-display text-2xl font-semibold text-balance text-navy-950">
                  {example.timeSaved}
                </p>
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
