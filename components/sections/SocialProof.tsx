import { Container } from "@/components/Container";
import { Section } from "@/components/Section";
import { HOME_COPY } from "@/content/copy";
import { cn } from "@/lib/utils";

type SocialProofProps = {
  className?: string;
};

export function SocialProof({ className }: SocialProofProps) {
  return (
    <Section
      background="transparent"
      className={cn("py-12 md:py-16", className)}
    >
      <Container>
        <p className="mx-auto max-w-3xl text-center text-base leading-relaxed text-graphite-600 md:text-lg">
          {HOME_COPY.socialProof}
        </p>
      </Container>
    </Section>
  );
}
