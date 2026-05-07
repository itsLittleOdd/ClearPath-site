import { Container } from "@/components/Container";
import { Section } from "@/components/Section";
import { HOME_COPY } from "@/content/copy";
import { cn } from "@/lib/utils";

type SocialProofProps = {
  className?: string;
};

const STATS = [
  { value: "12+", label: "years in WNY operations" },
  { value: "5-10", label: "hours saved per week" },
  { value: "$197", label: "flat audit, no upsell" },
];

export function SocialProof({ className }: SocialProofProps) {
  return (
    <Section
      background="transparent"
      className={cn("pt-4 pb-16 md:pt-8 md:pb-20", className)}
    >
      <Container>
        <div className="reveal-on-view mx-auto flex max-w-3xl flex-col items-center gap-6">
          <span
            aria-hidden="true"
            className="font-display text-6xl leading-none text-sage-500/40 md:text-7xl"
          >
            &ldquo;
          </span>
          <p className="-mt-6 text-center text-lg leading-relaxed text-pretty text-graphite-600 md:text-xl md:-mt-8">
            {HOME_COPY.socialProof}
          </p>
          <div
            aria-hidden="true"
            className="h-px w-12 bg-sage-500/50"
          />
        </div>

        <dl className="reveal-on-view mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-8 sm:grid-cols-3 md:mt-16">
          {STATS.map((stat) => (
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
