import type { Metadata } from "next";

import { Container } from "@/components/Container";
import { CtaButton } from "@/components/ui/cta-button";

export const metadata: Metadata = {
  title: { absolute: "Pricing | ClearPath" },
  description:
    "Start with a $395 Workflow Check. Larger ClearPath builds are scoped after one workflow is mapped and the approval points are clear.",
  alternates: { canonical: "/pricing" },
};

const workflowCheckPaymentUrl = "https://buy.stripe.com/8x23cv7Jp09s3q6gNV6Vq01";
const supportPaymentUrl = "https://buy.stripe.com/8x2cN54xd1dw2m27dl6Vq00";

const included = [
  "A 45-minute walkthrough with the operator and the team closest to the work",
  "A written map of how the workflow runs today",
  "Bottleneck notes ranked by what is realistic to fix first",
  "A 60-minute opportunity review with room for questions",
  "A fixed-scope quote if a build makes sense",
];

const paths = [
  {
    name: "Workflow Check",
    price: "$395",
    label: "flat, one-time",
    best: "Best when the workflow is messy and the next step is not clear yet.",
    desc: "A focused review of one workflow with two calls, a written opportunity packet, and a recommendation.",
    featured: true,
    href: workflowCheckPaymentUrl,
    cta: "Buy the Workflow Check",
  },
  {
    name: "One Workflow Fix",
    price: "from $4,500",
    label: "scoped after check",
    best: "Best for one clear bottleneck with a known owner.",
    desc: "One specific workflow rebuilt, documented, demoed, and handed off to the team.",
  },
  {
    name: "Workflow Build",
    price: "from $6,500",
    label: "larger operations build",
    best: "Best when the workflow touches multiple steps, inboxes, folders, or approval owners.",
    desc: "A larger workflow system with intake, routing, approval, testing, and staff handoff.",
  },
  {
    name: "Done-For-You System",
    price: "from $12,500",
    label: "deeper rollout",
    best: "Best when ClearPath owns most of the build, cleanup, testing, docs, and rollout path.",
    desc: "A deeper operating system build around one high-value workflow or workflow family.",
  },
  {
    name: "ClearPath Support",
    price: "$500/mo",
    label: "monthly support",
    best: "Best after a Workflow Check or delivered project when the team wants ongoing help.",
    desc: "Monthly support for workflow improvements, documentation, AI use questions, and light operational guidance.",
    href: supportPaymentUrl,
    cta: "Start monthly support",
  },
];

export default function PricingPage() {
  return (
    <main className="overflow-hidden bg-cream-50 text-navy-950">
      <section className="relative isolate bg-navy-950 py-16 text-cream-50 md:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-36 -z-10 h-96 w-96 rounded-full bg-sage-500/20 blur-3xl" />
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div className="max-w-3xl">
              <p className="font-display text-eyebrow font-semibold uppercase tracking-[0.16em] text-sage-500">Pricing</p>
              <h1 className="mt-4 font-display text-[clamp(2.6rem,6vw,4.4rem)] font-semibold leading-[0.96] tracking-[-0.045em] text-balance">Start with a $395 Workflow Check.</h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-cream-50/75">
                Before ClearPath quotes a build, we review one real workflow across two calls and give you a written packet: the current path, the bottlenecks, the approval points, and the first fix worth pricing.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <CtaButton href={workflowCheckPaymentUrl} external variant="inverted" size="lg">Buy the $395 Workflow Check</CtaButton>
                <CtaButton href="#included" variant="secondary" size="lg" className="border-cream-50/20 bg-cream-50/10 text-cream-50 hover:bg-cream-50/15">See what is included</CtaButton>
              </div>
            </div>
            <aside className="rounded-3xl border border-sage-500/25 bg-cream-50/[0.065] p-6 shadow-2xl shadow-navy-950/30 md:p-8">
              <p className="font-display text-eyebrow font-semibold uppercase tracking-[0.14em] text-sage-500">Front door</p>
              <strong className="mt-3 block font-display text-[clamp(4rem,9vw,6rem)] font-semibold leading-none tracking-[-0.06em] text-cream-50">$395</strong>
              <p className="mt-2 font-display text-lg text-cream-50">Workflow Check</p>
              <div className="mt-6 grid gap-3">
                <PriceProof value="Fixed scope" />
                <PriceProof value="One workflow" />
                <PriceProof value="Written packet" />
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <section id="included" className="bg-sage-500/10 py-14 md:py-18">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <p className="font-display text-eyebrow font-semibold uppercase tracking-[0.14em] text-sage-600">What the check includes</p>
              <h2 className="mt-3 font-display text-[clamp(2.2rem,5vw,3.4rem)] font-semibold leading-none tracking-[-0.04em] text-navy-950">You are buying clarity before build cost.</h2>
              <p className="mt-4 text-lg leading-relaxed text-graphite-600">The Workflow Check is not a surprise build. It is a paid walkthrough, a prepared opportunity packet, and a review call.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {included.map((item, index) => (
                <div key={item} className="rounded-3xl border border-navy-800/12 bg-cream-50/80 p-5 shadow-sm shadow-navy-950/5">
                  <span className="font-display text-xs font-semibold uppercase tracking-[0.13em] text-sage-600">Included {String(index + 1).padStart(2, "0")}</span>
                  <p className="mt-3 text-base leading-relaxed text-graphite-600">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-cream-50 py-14 md:py-20">
        <Container>
          <div className="max-w-3xl">
            <p className="font-display text-eyebrow font-semibold uppercase tracking-[0.14em] text-sage-600">After the check</p>
            <h2 className="mt-3 font-display text-[clamp(2.2rem,5vw,3.5rem)] font-semibold leading-none tracking-[-0.04em] text-navy-950">The Workflow Check tells us which path fits.</h2>
            <p className="mt-4 text-lg leading-relaxed text-graphite-600">You are not committing to a build when you buy the check. If the work is worth building, the next price is scoped from the packet.</p>
          </div>
          <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {paths.map((path) => (
              <article key={path.name} className={`flex h-full flex-col rounded-3xl border p-6 shadow-sm shadow-navy-950/5 ${path.featured ? "border-sage-500/50 bg-sage-500/12" : "border-navy-800/12 bg-white/55"}`}>
                <p className="font-display text-xs font-semibold uppercase tracking-[0.13em] text-sage-600">{path.label}</p>
                <h3 className="mt-3 font-display text-2xl font-semibold tracking-[-0.03em] text-navy-950">{path.name}</h3>
                <strong className="mt-4 block font-display text-3xl font-semibold tracking-[-0.04em] text-navy-950">{path.price}</strong>
                <p className="mt-4 text-sm leading-relaxed text-graphite-600">{path.desc}</p>
                <p className="mt-auto border-t border-navy-800/10 pt-4 text-sm leading-relaxed text-graphite-600"><b className="text-navy-900">Best for:</b> {path.best}</p>
                {path.href ? (
                  <div className="mt-5">
                    <CtaButton href={path.href} external variant={path.featured ? "primary" : "secondary"} size="sm">
                      {path.cta}
                    </CtaButton>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-navy-950 py-16 text-cream-50 md:py-20">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-display text-eyebrow font-semibold uppercase tracking-[0.14em] text-sage-500">Pricing note</p>
            <h2 className="mt-3 font-display text-[clamp(2.1rem,5vw,3.25rem)] font-semibold leading-none tracking-[-0.04em]">We quote the build after the workflow is mapped.</h2>
            <p className="mt-4 text-lg leading-relaxed text-cream-50/72">That protects both sides. The business gets a useful packet first, and ClearPath prices the fix based on real workflow shape instead of guessing from a sales call.</p>
            <div className="mt-8"><CtaButton href={workflowCheckPaymentUrl} external variant="inverted" size="lg">Buy the Workflow Check</CtaButton></div>
          </div>
        </Container>
      </section>
    </main>
  );
}

function PriceProof({ value }: { value: string }) {
  return (
    <div className="rounded-2xl border border-cream-50/10 bg-cream-50/[0.06] px-4 py-3 text-sm text-cream-50/75">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-sage-500" aria-hidden="true" /> <span className="ml-2">{value}</span>
    </div>
  );
}
