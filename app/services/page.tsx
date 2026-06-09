import type { Metadata } from "next";

import { Container } from "@/components/Container";
import { CtaButton } from "@/components/ui/cta-button";

export const metadata: Metadata = {
  title: { absolute: "Services | ClearPath" },
  description:
    "ClearPath services start with one workflow at a time: Workflow Check, One Workflow Fix, Knowledge Capture, Internal Assistant, Approval Workflow, and Owner Brief.",
  alternates: { canonical: "/services" },
};

const stats = [
  ["$500/mo", "ClearPath Support"],
  ["$395", "Workflow Check"],
  ["People", "approval stays visible"],
];

const included = [
  "One working session with the operator and the team closest to the work",
  "A written process map",
  "Bottleneck notes ranked by practical impact",
  "Approval points marked clearly",
  "A recommendation and build range if a fix makes sense",
];

const services = [
  {
    title: "Workflow Check",
    fit: "You know one process is costing time, but the path is still fuzzy.",
    built: "No build yet. You get the map, bottleneck notes, approval points, and the recommended first fix.",
    start: "Fixed price, fixed scope, one process. $395.",
  },
  {
    title: "One Workflow Fix",
    fit: "The bottleneck is clear: invoice routing, intake triage, quote follow-up, approvals, or another recurring handoff.",
    built: "One process cleaned up, documented, demoed, and handed back to the team.",
    start: "Quoted separately after the scope is clear.",
  },
  {
    title: "Knowledge Capture System",
    fit: "The team keeps interrupting the same expert because the answers live in one person’s head.",
    built: "A searchable knowledge base from your real material, plus a practical pattern for keeping it current.",
    start: "Scoped from the Workflow Check based on how much knowledge needs to be captured.",
  },
  {
    title: "Internal Assistant",
    fit: "The team repeats questions across docs, policies, contracts, SOPs, or customer rules.",
    built: "A purpose-built assistant grounded in your material, with clear limits on what it can answer and when it should escalate.",
    start: "Scoped after a Workflow Check and knowledge readiness review.",
  },
  {
    title: "Approval and Follow-up Support",
    fit: "Work that needs judgment is getting stuck while routine items wait behind it.",
    built: "An approval queue, follow-up board, or routing path that keeps routine work moving and puts exceptions in front of a person.",
    start: "Quoted separately after the scope is clear.",
  },
  {
    title: "Owner Brief",
    fit: "The owner has dashboards, spreadsheets, and updates everywhere but no clear weekly readout.",
    built: "One weekly brief assembled from the systems the business already runs, written for decisions instead of data browsing.",
    start: "Scoped in a Workflow Check, then built when the source systems are clear.",
  },
];

export default function ServicesPage() {
  return (
    <main className="overflow-hidden bg-cream-50 text-navy-950">
      <section className="relative isolate bg-navy-950 py-16 text-cream-50 md:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-36 -z-10 h-96 w-96 rounded-full bg-sage-500/20 blur-3xl" />
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="max-w-3xl">
              <p className="font-display text-eyebrow font-semibold uppercase tracking-[0.16em] text-sage-500">Services</p>
              <h1 className="mt-4 font-display text-[clamp(2.6rem,6vw,4.4rem)] font-semibold leading-[0.96] tracking-[-0.045em] text-balance">
                Start with support. Build only what the team will use.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-cream-50/75">
                ClearPath can start with monthly support for practical help, or a $395 Workflow Check when one process needs to be mapped first. Larger builds are quoted only after the scope is clear.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <CtaButton href="/pricing" variant="inverted" size="lg">Start ClearPath Support</CtaButton>
                <CtaButton href="#front-door" variant="secondary" size="lg" className="border-cream-50/20 bg-cream-50/10 text-cream-50 hover:bg-cream-50/15">See the service path</CtaButton>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {stats.map(([value, label]) => (
                <div key={value} className="rounded-3xl border border-cream-50/12 bg-cream-50/8 p-5">
                  <strong className="block font-display text-3xl text-cream-50">{value}</strong>
                  <span className="mt-1 block text-sm leading-relaxed text-cream-50/68">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section id="front-door" className="bg-sage-500/10 py-14 md:py-18">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
            <article className="rounded-3xl border border-navy-800/12 bg-cream-50/80 p-6 shadow-xl shadow-navy-950/5 md:p-8">
              <p className="font-display text-eyebrow font-semibold uppercase tracking-[0.14em] text-sage-600">Front door</p>
              <h2 className="mt-3 font-display text-4xl font-semibold leading-none tracking-[-0.04em] text-navy-950">Start with support or a Workflow Check.</h2>
              <p className="mt-4 text-base leading-relaxed text-graphite-600 md:text-lg">
                Monthly support gives business owners access to ClearPath throughout the month for stuck tasks, documentation, light builds, and small improvements. A Workflow Check is the one-time mapping step when the process is still unclear.
              </p>
              <div className="mt-6">
                <CtaButton href="/pricing" variant="primary" size="lg">See pricing options</CtaButton>
              </div>
            </article>
            <div className="grid gap-3 sm:grid-cols-2">
              {included.map((item, index) => (
                <div key={item} className="rounded-3xl border border-navy-800/12 bg-cream-50/70 p-5 shadow-sm shadow-navy-950/5">
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
            <p className="font-display text-eyebrow font-semibold uppercase tracking-[0.14em] text-sage-600">After the first step</p>
            <h2 className="mt-3 font-display text-[clamp(2.2rem,5vw,3.5rem)] font-semibold leading-none tracking-[-0.04em] text-navy-950">The service menu depends on the work.</h2>
            <p className="mt-4 text-lg leading-relaxed text-graphite-600">ClearPath does not sell a giant system first. Support and checks reveal which service fits the work, the team, and the risk.</p>
          </div>
          <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <article key={service.title} className="rounded-3xl border border-navy-800/12 bg-white/55 p-6 shadow-sm shadow-navy-950/5">
                <h3 className="font-display text-2xl font-semibold tracking-[-0.03em] text-navy-950">{service.title}</h3>
                <ServiceLine label="When this fits" text={service.fit} />
                <ServiceLine label="What gets built" text={service.built} />
                <ServiceLine label="How it starts" text={service.start} />
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-navy-950 py-16 text-cream-50 md:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="font-display text-eyebrow font-semibold uppercase tracking-[0.14em] text-sage-500">Support after launch</p>
              <h2 className="mt-3 font-display text-[clamp(2.1rem,5vw,3.25rem)] font-semibold leading-none tracking-[-0.04em]">The handoff matters as much as the build.</h2>
            </div>
            <div className="rounded-3xl border border-cream-50/10 bg-cream-50/[0.055] p-6 md:p-8">
              <p className="text-lg leading-relaxed text-cream-50/75">
                ClearPath support keeps the work useful after it goes live: adoption checks, small fixes, documentation updates, and monthly help so the team does not quietly route around the new process.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-sage-500/10 py-16 text-center md:py-20">
        <Container>
          <h2 className="font-display text-[clamp(2.2rem,5vw,3.5rem)] font-semibold leading-none tracking-[-0.04em] text-navy-950">Not sure which service fits?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-graphite-600">Bring the tedious work that is slowing the team down. Start monthly support, or use the Workflow Check when you want the process mapped first.</p>
          <div className="mt-8 flex justify-center"><CtaButton href="/pricing" variant="primary" size="lg">See pricing options</CtaButton></div>
        </Container>
      </section>
    </main>
  );
}

function ServiceLine({ label, text }: { label: string; text: string }) {
  return (
    <div className="mt-5 border-t border-navy-800/10 pt-4">
      <p className="font-display text-xs font-semibold uppercase tracking-[0.13em] text-sage-600">{label}</p>
      <p className="mt-2 text-sm leading-relaxed text-graphite-600 md:text-base">{text}</p>
    </div>
  );
}
