import { Hero } from "@/components/sections/Hero";
import { SocialProof } from "@/components/sections/SocialProof";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Examples } from "@/components/sections/Examples";
import { CTASection } from "@/components/sections/CTASection";

// Section ordering per the brief (B1-W2): Hero → SocialProof → HowItWorks →
// Examples → CTASection. Each section is self-contained and pulls its copy
// from HOME_COPY internally. Booking CTAs default to /contact.

export default function HomePage() {
  return (
    <>
      <Hero />
      <SocialProof />
      <HowItWorks />
      <Examples />
      <CTASection />
    </>
  );
}
