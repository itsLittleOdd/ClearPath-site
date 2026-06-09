import type { Metadata } from "next";

import { Container } from "@/components/Container";
import { CtaButton } from "@/components/ui/cta-button";

export const metadata: Metadata = {
  title: { absolute: "Pricing | ClearPath" },
  description:
    "Start with a $395 Workflow Check or ClearPath Support at $500/month for practical business help, light builds, documentation, and small improvements.",
  alternates: { canonical: "/pricing" },
};

const workflowCheckPaymentUrl = "https://buy.stripe.com/8x2cN54xd1dw2m27dl6Vq00";
const supportPaymentUrl = "https://buy.stripe.com/8x23cv7Jp09s3q6gNV6Vq01";

const included = [
  "A 45-minute walkthrough with the operator and the team closest to the work",
  "A written map of how the process runs today",
  "Bottleneck notes ranked by what is realistic to fix first",
  "A 60-minute opportunity review with room for questions",
  "A clear next step if support or a build makes sense",
];

const paths = [
  {
    name: "Workflow Check",
    price: "$395",
    label: "flat, one-time",
    best: "Best when the work is messy and the next step is not clear yet.",
    desc: "A focused review of one process with two calls, a written opportunity packet, and a practical recommendation.",
    featured: true,
    href: workflowCheckPaymentUrl,
    cta: "Buy the Workflow Check",
  },
  {
    name: "ClearPath Support",
    price: "$500/mo",
    label: "monthly support",
    best: "Best when you want access to ClearPath throughout the month for small fixes and practical help.",
    desc: "Monthly support for stuck tasks, documentation, troubleshooting, light builds, and keeping business work organized and moving.",
    featured: true,
    href: supportPaymentUrl,
    cta: "Start monthly support",
  },
  {
    name: "One Workflow Fix",
    label: "quoted separately",
    best: "Best for one clear bottleneck with a known owner.",
    desc: "One specific process cleaned up, documented, demoed, and handed off to the team.",
  },
  {
    name: "Workflow Build",
    label: "quoted separately",
    best: "Best when the work touches multiple steps, inboxes, folders, or approval owners.",
    desc: "A larger operating workflow with intake, routing, approval, testing, and staff handoff.",
  },
  {
    name: "Done-For-You System",
    label: "quoted separately",
    best: "Best when ClearPath owns most of the cleanup, build, testing, docs, and rollout path.",
    desc: "A deeper operating system build around one high-value process or process family.",
  },
];

export default function PricingPage() {
  return (
    <main className="overflow-hidden bg-cream-50 text-navy-950">
      <section className="relative isolate bg-navy-950 py-16 text-cream-50 md:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-36 -z-10 h-96 w-96 rounded-full bg-sage-500/20 blur-3xl" />
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div className="max-w-3xl">
              <p className="font-display text-eyebrow font-semibold uppercase tracking-[0.16em] text-sage-500">Pricing</p>
              <h1 className="mt-4 font-display text-[clamp(2.6rem,6vw,4.4rem)] font-semibold leading-[0.96] tracking-[-0.045em] text-balance">Start with the support path that fits.</h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-cream-50/75">
                Choose a $395 Workflow Check when you want one process mapped first, or start ClearPath Support when you already want monthly help with tedious work, small fixes, documentation, and light builds.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <CtaButton href={supportPaymentUrl} external variant="inverted" size="lg">Start $500/mo Support</CtaButton>
                <CtaButton href={workflowCheckPaymentUrl} external variant="secondary" size="lg" className="border-cream-50/20 bg-cream-50/10 text-cream-50 hover:bg-cream-50/15">Buy the $395 Check</CtaButton>
              </div>
            </div>
            <aside className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <PriceHeroCard eyebrow="Monthly support" value="$500/mo" title="ClearPath Support" points={["Access through the month", "Small fixes and light builds", "Bigger projects quoted separately"]} href={supportPaymentUrl} cta="Start support" />
              <PriceHeroCard eyebrow="One-time clarity" value="$395" title="Workflow Check" points={["Fixed scope", "One process", "Written packet"]} href={workflowCheckPaymentUrl} cta="Buy check" />
            </aside>
          </div>
        </Container>
      </section>

      <section id="included" className="bg-sage-500/10 py-14 md:py-18">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <p className="font-display text-eyebrow font-semibold uppercase tracking-[0.14em] text-sage-600">What the check includes</p>
              <h2 className="mt-3 font-display text-[clamp(2.2rem,5vw,3.4rem)] font-semibold leading-none tracking-[-0.04em] text-navy-950">Clarity before build cost.</h2>
              <p className="mt-4 text-lg leading-relaxed text-graphite-600">The Workflow Check is not a surprise build. It is a paid walkthrough, a prepared opportunity packet, and a review call. For early support clients, Justin may choose to do this discovery inside the monthly support relationship.</p>
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
            <p className="font-display text-eyebrow font-semibold uppercase tracking-[0.14em] text-sage-600">Ways to work together</p>
            <h2 className="mt-3 font-display text-[clamp(2.2rem,5vw,3.5rem)] font-semibold leading-none tracking-[-0.04em] text-navy-950">Start small. Quote bigger work only when it is clear.</h2>
            <p className="mt-4 text-lg leading-relaxed text-graphite-600">Support and checks are easy entry points. Larger builds stay visible on the page, but they are priced after we understand the work and the value.</p>
          </div>
          <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {paths.map((path) => (
              <article key={path.name} className={`flex h-full flex-col rounded-3xl border p-6 shadow-sm shadow-navy-950/5 ${path.featured ? "border-sage-500/50 bg-sage-500/12" : "border-navy-800/12 bg-white/55"}`}>
                <p className="font-display text-xs font-semibold uppercase tracking-[0.13em] text-sage-600">{path.label}</p>
                <h3 className="mt-3 font-display text-2xl font-semibold tracking-[-0.03em] text-navy-950">{path.name}</h3>
                {path.price ? <strong className="mt-4 block font-display text-3xl font-semibold tracking-[-0.04em] text-navy-950">{path.price}</strong> : null}
                <p className="mt-4 text-sm leading-relaxed text-graphite-600">{path.desc}</p>
                <p className="mt-auto border-t border-navy-800/10 pt-4 text-sm leading-relaxed text-graphite-600"><b className="text-navy-900">Best for:</b> {path.best}</p>
                {path.href ? (
                  <div className="mt-5">
                    <CtaButton href={path.href} external variant={path.name === "Workflow Check" ? "primary" : "secondary"} size="sm">
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
            <h2 className="mt-3 font-display text-[clamp(2.1rem,5vw,3.25rem)] font-semibold leading-none tracking-[-0.04em]">Monthly support keeps the relationship moving.</h2>
            <p className="mt-4 text-lg leading-relaxed text-cream-50/72">ClearPath Support covers practical help, small fixes, documentation, and light builds during the month. If something turns into a larger custom project, we quote it separately before work begins.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><CtaButton href={supportPaymentUrl} external variant="inverted" size="lg">Start ClearPath Support</CtaButton><CtaButton href={workflowCheckPaymentUrl} external variant="secondary" size="lg" className="border-cream-50/20 bg-cream-50/10 text-cream-50 hover:bg-cream-50/15">Buy the Workflow Check</CtaButton></div>
          </div>
        </Container>
      </section>
    </main>
  );
}

function PriceHeroCard({ eyebrow, value, title, points, href, cta }: { eyebrow: string; value: string; title: string; points: string[]; href: string; cta: string }) {
  return (
    <div className="rounded-3xl border border-sage-500/25 bg-cream-50/[0.065] p-6 shadow-2xl shadow-navy-950/30 md:p-7">
      <p className="font-display text-eyebrow font-semibold uppercase tracking-[0.14em] text-sage-500">{eyebrow}</p>
      <strong className="mt-3 block font-display text-[clamp(2.6rem,4vw,3.7rem)] font-semibold leading-none tracking-[-0.06em] text-cream-50">{value}</strong>
      <p className="mt-2 font-display text-lg text-cream-50">{title}</p>
      <div className="mt-6 grid gap-3">
        {points.map((point) => <PriceProof key={point} value={point} />)}
      </div>
      <div className="mt-6"><CtaButton href={href} external variant="inverted" size="sm">{cta}</CtaButton></div>
    </div>
  );
}

function PriceProof({ value }: { value: string }) {
  return (
    <div className="rounded-2xl border border-cream-50/10 bg-cream-50/[0.06] px-4 py-3 text-sm text-cream-50/75">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-sage-500" aria-hidden="true" /> <span className="ml-2">{value}</span>
    </div>
  );
}
