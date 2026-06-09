import type { Metadata } from "next";

import { CalComEmbed } from "@/components/CalComEmbed";
import { Container } from "@/components/Container";
import { TallyEmbed } from "@/components/TallyEmbed";
import { CtaButton } from "@/components/ui/cta-button";

export const metadata: Metadata = {
  title: { absolute: "Contact | ClearPath" },
  description:
    "Start ClearPath Support, book a fit call, or send the messy work that keeps slowing the team down.",
  alternates: { canonical: "/contact" },
};

const heroItems = [
  ["Monthly support", "Start with access for stuck tasks and small fixes."],
  ["Fit call", "Talk through whether support or a Workflow Check makes sense."],
  ["Justin reviews it", "No sales queue. No mystery handoff."],
];

const supportPaymentUrl = "https://buy.stripe.com/8x23cv7Jp09s3q6gNV6Vq01";

const nextSteps = [
  "Start support, buy the Workflow Check, or send the messy work first if you are unsure.",
  "Justin reviews the work and helps choose the right first step.",
  "ClearPath either supports the small fixes monthly or prepares the Workflow Check packet for review.",
];

export default function ContactPage() {
  return (
    <main className="overflow-hidden bg-cream-50 text-navy-950">
      <section className="relative isolate bg-navy-950 py-16 text-cream-50 md:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-36 -z-10 h-96 w-96 rounded-full bg-sage-500/20 blur-3xl" />
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div className="max-w-3xl">
              <p className="font-display text-eyebrow font-semibold uppercase tracking-[0.16em] text-sage-500">Contact</p>
              <h1 className="mt-4 font-display text-[clamp(2.6rem,6vw,4.4rem)] font-semibold leading-[0.96] tracking-[-0.045em] text-balance">Bring the messy work.</h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-cream-50/75">
                Start ClearPath Support when you want monthly help with stuck tasks, small fixes, documentation, and light builds. If you want one process mapped first, the $395 Workflow Check is still available.
              </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <CtaButton href={supportPaymentUrl} external variant="inverted" size="lg">
                  Start $500/mo Support
                </CtaButton>
                <a href="#contact-form" className="inline-flex h-12 items-center justify-center rounded-lg border border-cream-50/20 bg-cream-50/10 px-6 font-medium text-cream-50 transition-colors hover:bg-cream-50/15">
                  Send the messy work first
                </a>
              </div>
            </div>
            <div className="grid gap-3">
              {heroItems.map(([title, body]) => (
                <div key={title} className="rounded-3xl border border-cream-50/12 bg-cream-50/8 p-5">
                  <strong className="block font-display text-xl text-cream-50">{title}</strong>
                  <span className="mt-1 block text-sm leading-relaxed text-cream-50/68">{body}</span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-sage-500/10 py-14 md:py-18">
        <Container>
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
            <div className="flex flex-col gap-4 rounded-3xl border border-navy-800/12 bg-cream-50/85 p-6 shadow-xl shadow-navy-950/5 md:p-8">
              <div className="flex items-center gap-2">
                <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-sage-500" />
                <span className="font-display text-eyebrow font-semibold uppercase tracking-[0.14em] text-sage-600">Book a fit call</span>
              </div>
              <h2 className="font-display text-3xl font-semibold tracking-[-0.04em] text-navy-950">Talk through the work first.</h2>
              <p className="text-base leading-relaxed text-graphite-600">
                Use this if you want to talk through the work before starting support or buying the check. A short conversation is usually enough to decide the right first step.
              </p>
              <CalComEmbed calLink="justin-whalen-xpjqtn/45-min-discovery-call" title="Book a fit call with Justin" />
            </div>

            <div className="flex flex-col gap-4 rounded-3xl border border-navy-800/12 bg-cream-50/85 p-6 shadow-xl shadow-navy-950/5 md:p-8">
              <div className="flex items-center gap-2">
                <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-sage-500" />
                <span className="font-display text-eyebrow font-semibold uppercase tracking-[0.14em] text-sage-600">Send the messy work</span>
              </div>
              <h2 id="contact-form" className="font-display text-3xl font-semibold tracking-[-0.04em] text-navy-950">Tell us what is getting stuck.</h2>
              <p className="text-base leading-relaxed text-graphite-600">
                Tell us what comes in, who touches it, where it gets stuck, and what the team keeps repeating by hand.
              </p>
              <TallyEmbed title="ClearPath Lead Intake" />
              <p className="mt-2 text-sm leading-relaxed text-graphite-500">Read by Justin. Not routed to a sales queue.</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-navy-950 py-16 text-cream-50 md:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="font-display text-eyebrow font-semibold uppercase tracking-[0.14em] text-sage-500">What happens next</p>
              <h2 className="mt-3 font-display text-[clamp(2.2rem,5vw,3.4rem)] font-semibold leading-none tracking-[-0.04em]">No mystery funnel.</h2>
              <p className="mt-4 text-lg leading-relaxed text-cream-50/72">The goal is to find the smallest useful first step. That may be monthly support, a Workflow Check, or a larger project quoted separately later.</p>
            </div>
            <ol className="grid gap-3">
              {nextSteps.map((step, index) => (
                <li key={step} className="flex items-start gap-3 rounded-3xl border border-cream-50/10 bg-cream-50/[0.055] p-5 text-cream-50/75">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sage-500/20 font-display text-sm font-semibold text-sage-500">{index + 1}</span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      <section className="bg-cream-50 py-14 md:py-16">
        <Container>
          <div className="flex flex-col gap-4 rounded-3xl border border-navy-800/12 bg-sage-500/10 p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div className="md:max-w-xl">
              <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] text-navy-950">Prefer email?</h2>
              <p className="mt-2 text-base leading-relaxed text-graphite-600">Send the messy context. A screenshot, email thread, or rough explanation is enough to start.</p>
            </div>
            <a href="mailto:JWhalen@ClearPathWV.com" className="inline-flex w-fit items-center gap-2 rounded-lg border border-sage-500/40 bg-sage-500/10 px-4 py-2 text-sm font-medium text-sage-600 transition-colors hover:bg-sage-500/20">
              <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-sage-500" />
              JWhalen@ClearPathWV.com
            </a>
          </div>
        </Container>
      </section>
    </main>
  );
}
