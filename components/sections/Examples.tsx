import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { Heading } from "@/components/Heading";
import { Section } from "@/components/Section";
import { HOME_COPY } from "@/content/copy";
import { cn } from "@/lib/utils";

type ExamplesProps = {
  className?: string;
};

export function Examples({ className }: ExamplesProps) {
  const { eyebrow, heading } = HOME_COPY.examplesSection;

  return (
    <Section background="cream" className={cn(className)}>
      <Container>
        <div className="flex max-w-3xl flex-col gap-4">
          <Eyebrow>{eyebrow}</Eyebrow>
          <Heading as="h2" level="h2">
            {heading}
          </Heading>
        </div>
        <div className="mt-12 grid gap-6 md:mt-16 md:grid-cols-3">
          {HOME_COPY.examples.map((example) => (
            <article
              key={example.archetype}
              className="flex h-full flex-col gap-3 rounded-2xl border border-navy-800/10 bg-cream-50 p-6 shadow-sm md:p-8"
            >
              <p className="font-display text-sm font-medium uppercase tracking-wider text-sage-600">
                {example.archetype}
              </p>
              <p className="font-display text-2xl font-semibold text-navy-950">
                {example.timeSaved}
              </p>
              <p className="text-base leading-relaxed text-graphite-600">
                {example.summary}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
