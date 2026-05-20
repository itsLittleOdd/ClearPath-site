import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { Heading } from "@/components/Heading";
import { Section } from "@/components/Section";
import { HOME_COPY, HOME_STATS } from "@/content/copy";
import { cn } from "@/lib/utils";

type SocialProofProps = {
  className?: string;
};

// Replaces the old "client quote + Olean stats" strip with the new
// operator-positioning block. Stats are sourced from HOME_STATS in
// content/copy.ts so price/scope edits live in one place.

export function SocialProof({ className }: SocialProofProps) {
  const { eyebrow, heading, body } = HOME_COPY.trustPoints;

  return (
    <Section
      background="transparent"
      className={cn("pt-4 pb-16 md:pt-8 md:pb-20", className)}
    >
      <Container>
        <div className="reveal-on-view mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
          <Eyebrow>{eyebrow}</Eyebrow>
          <Heading as="h2" level="h2">
            {heading}
          </Heading>
          <p className="text-lg leading-relaxed text-pretty text-graphite-600 md:text-xl">
            {body}
          </p>
          <div
            aria-hidden="true"
            className="h-px w-12 bg-sage-500/50"
          />
        </div>

        <dl className="reveal-on-view mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-8 sm:grid-cols-3 md:mt-16">
          {HOME_STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 text-center"
            >
              <dt className="font-display text-4xl font-semibold text-navy-950 md:text-5xl">
                {stat.value}
              </dt>
              <dd className="text-sm leading-snug text-graphite-500">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </Section>
  );
}
