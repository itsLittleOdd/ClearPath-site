import { CTASection } from "@/components/sections/CTASection";
import { Examples } from "@/components/sections/Examples";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { SocialProof } from "@/components/sections/SocialProof";

// Temporary route. Renders Builder 3's Sprint-1 section primitives in isolation
// for visual / TypeScript / a11y verification. Delete once Builder 1 wires the
// real homepage in app/page.tsx (Sprint 2). Owned by Builder 3 (B3-W1).
export default function B3SectionsSandbox() {
  return (
    <main>
      <Hero />
      <SocialProof />
      <HowItWorks />
      <Examples />
      <CTASection />
    </main>
  );
}
