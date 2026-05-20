import type { Metadata } from "next";

import { Container } from "@/components/Container";
import { CtaButton } from "@/components/ui/cta-button";

export const metadata: Metadata = {
  title: { absolute: "About | ClearPath" },
  description:
    "ClearPath is run by Justin Whalen, an operator in Western New York who builds practical workflow systems around how teams actually work.",
};

const facts = [
  ["Founded by", "Justin Whalen"],
  ["Based in", "Western New York"],
  ["Engagement model", "One workflow at a time"],
  ["Front door", "$395 Workflow Check"],
];

const bio = [
  "Justin spent his first decade on operations: kitchen, bar, lesson programs, scheduling, and the parts of the business that run on tribal knowledge. That is where he learned what operators actually want from a tool, and what they refuse to use even when the idea is good.",
  "The first internal tools came out of that work: a knowledge assistant so a new director could ramp without burning instructors' time, a booking surface that fixed a real bottleneck the official system could not, and an operations dashboard built around how the team actually planned a week.",
  "ClearPath is that same instinct shaped into a service. Sit with the people closest to the work, capture how the workflow really runs, mark where judgment belongs, and build only what the team can use after the handoff.",
];

const values = [
  {
    title: "Workflow first.",
    body: "We map the work before we touch the tools. Most failed AI projects skipped the boring part that actually matters.",
  },
  {
    title: "Human approval stays visible.",
    body: "Where judgment matters, the owner or operator sees the call before anything important moves forward.",
  },
  {
    title: "The team owns the handoff.",
    body: "Every engagement ends with the workflow documented enough that real people can run, change, and explain it.",
  },
];

const operatorNotes = [
  ["What ClearPath looks for", "Repeated questions, owner interruptions, stuck approvals, missing handoffs, and work that depends on one person's memory."],
  ["What ClearPath avoids", "Big vague AI projects, tool-first builds, hidden automation, and workflows nobody on the team can explain."],
  ["Where the check starts", "One real workflow, one working call, one written packet, and one recommendation you can act on."],
];

export default function AboutPage() {
  return (
    <main id="main" className="overflow-hidden bg-cream-50 text-navy-950">
      <section className="relative isolate bg-navy-950 py-16 text-cream-50 md:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-36 -z-10 h-96 w-96 rounded-full bg-sage-500/20 blur-3xl" />
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="max-w-3xl">
              <p className="font-display text-eyebrow font-semibold uppercase tracking-[0.16em] text-sage-500">About</p>
              <h1 className="mt-4 font-display text-[clamp(2.6rem,6vw,4.4rem)] font-semibold leading-[0.96] tracking-[-0.045em] text-balance">
                ClearPath is run by an operator.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-cream-50/75">
                ClearPath was started by Justin Whalen after years inside real operations: resort teams, scheduling pressure, customer handoffs, training gaps, and the daily mess that never shows up cleanly in software.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <CtaButton href="/contact" variant="inverted" size="lg">Request a Workflow Check</CtaButton>
                <CtaButton href="#operator" variant="secondary" size="lg" className="border-cream-50/20 bg-cream-50/10 text-cream-50 hover:bg-cream-50/15">Read the operator story</CtaButton>
              </div>
            </div>
            <aside className="rounded-3xl border border-cream-50/10 bg-cream-50/[0.055] p-6 shadow-2xl shadow-navy-950/30 md:p-8">
              <p className="font-display text-eyebrow font-semibold uppercase tracking-[0.14em] text-sage-500">Quick facts</p>
              <dl className="mt-5 grid gap-4">
                {facts.map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-cream-50/10 bg-cream-50/[0.06] p-4">
                    <dt className="font-display text-xs font-semibold uppercase tracking-[0.13em] text-cream-50/55">{label}</dt>
                    <dd className="mt-1 text-base font-semibold text-cream-50">{value}</dd>
                  </div>
                ))}
              </dl>
            </aside>
          </div>
        </Container>
      </section>

      <section id="operator" className="bg-sage-500/10 py-14 md:py-18">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <div>
              <p className="font-display text-eyebrow font-semibold uppercase tracking-[0.14em] text-sage-600">Operator background</p>
              <h2 className="mt-3 font-display text-[clamp(2.2rem,5vw,3.5rem)] font-semibold leading-none tracking-[-0.04em] text-navy-950">Built from the floor, not from a slide deck.</h2>
            </div>
            <div className="grid gap-4 text-lg leading-relaxed text-graphite-600">
              {bio.map((paragraph) => (
                <p key={paragraph} className="rounded-3xl border border-navy-800/12 bg-cream-50/80 p-5 shadow-sm shadow-navy-950/5">{paragraph}</p>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-navy-950 py-16 text-cream-50 md:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="font-display text-eyebrow font-semibold uppercase tracking-[0.14em] text-sage-500">How ClearPath thinks</p>
              <h2 className="mt-3 font-display text-[clamp(2.2rem,5vw,3.5rem)] font-semibold leading-none tracking-[-0.04em] text-balance">The work has to survive the handoff.</h2>
              <p className="mt-4 text-lg leading-relaxed text-cream-50/72">Pretty demos do not matter if the team routes around the system after a week. ClearPath is built around what people will actually use.</p>
            </div>
            <div className="grid gap-3">
              {operatorNotes.map(([title, body]) => (
                <div key={title} className="rounded-3xl border border-cream-50/10 bg-cream-50/[0.055] p-5">
                  <strong className="block text-cream-50">{title}</strong>
                  <p className="mt-2 text-sm leading-relaxed text-cream-50/70 md:text-base">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-cream-50 py-16 md:py-20">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-display text-eyebrow font-semibold uppercase tracking-[0.14em] text-sage-600">Three rules</p>
            <h2 className="mt-3 font-display text-[clamp(2.2rem,5vw,3.5rem)] font-semibold leading-none tracking-[-0.04em] text-navy-950">The rules are simple on purpose.</h2>
          </div>
          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {values.map((value, index) => (
              <article key={value.title} className="flex h-full flex-col rounded-3xl border border-navy-800/12 bg-sage-500/10 p-6 text-center shadow-sm shadow-navy-950/5">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-navy-950 font-display text-xl font-semibold text-sage-500">{index + 1}</span>
                <h3 className="mt-5 font-display text-2xl font-semibold tracking-[-0.03em] text-navy-950">{value.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-graphite-600">{value.body}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-sage-500/10 py-16 text-center md:py-20">
        <Container>
          <h2 className="font-display text-[clamp(2.2rem,5vw,3.5rem)] font-semibold leading-none tracking-[-0.04em] text-navy-950">Want to bring one workflow?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-graphite-600">A Workflow Check is the front door. We scope tight, name what is worth fixing first, and move from there.</p>
          <div className="mt-8 flex justify-center"><CtaButton href="/contact" variant="primary" size="lg">Request a Workflow Check</CtaButton></div>
        </Container>
      </section>
    </main>
  );
}
