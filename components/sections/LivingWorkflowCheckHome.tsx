"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Container } from "@/components/Container";
import { CtaButton } from "@/components/ui/cta-button";

const statusStates = [
  { text: "Messy intake", delay: 0 },
  { text: "Bottleneck found", delay: 1250 },
  { text: "Approval marked", delay: 2150 },
  { text: "Packet ready", delay: 2850 },
];

const bringItems = [
  {
    title: "A recurring email thread",
    body: "The request pattern your team keeps cleaning up by hand.",
  },
  {
    title: "A spreadsheet or SOP",
    body: "The document everyone uses but nobody fully trusts.",
  },
  {
    title: "A quick walkthrough call",
    body: "The fastest way to show where the work actually gets stuck.",
  },
];

export function LivingWorkflowCheckHome() {
  const [status, setStatus] = useState("Packet ready");

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      return;
    }

    const timers = statusStates.map((state) =>
      window.setTimeout(() => setStatus(state.text), state.delay),
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  return (
    <main className="overflow-hidden bg-cream-50 text-navy-950">
      <section className="relative isolate pt-16 pb-14 md:pt-20 md:pb-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -right-32 -z-10 h-[28rem] w-[28rem] rounded-full bg-sage-500/20 blur-3xl"
        />
        <Container>
          <div className="grid gap-12 md:grid-cols-12 md:items-center md:gap-14">
            <div className="flex flex-col gap-5 md:col-span-7">
              <p className="font-display text-eyebrow font-semibold uppercase tracking-[0.16em] text-sage-600">
                One workflow. One clear next step.
              </p>
              <h1 className="font-display text-[clamp(2.75rem,7vw,4.875rem)] font-semibold leading-[0.94] tracking-[-0.05em] text-balance text-navy-950">
                Capture how the work actually gets done.
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-pretty text-graphite-600 md:text-xl">
                ClearPath helps business leaders document expert judgment, clean up repeated workflows, and build AI-assisted tools the team can use to eliminate 5-10 hours of repetitive work every week.
              </p>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                <CtaButton href="/contact" variant="primary" size="lg">
                  Start a $395 Workflow Check
                </CtaButton>
                <CtaButton href="#packet" variant="secondary" size="lg">
                  See what you get
                </CtaButton>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-navy-800/15 bg-white/35 p-4 text-sm leading-snug text-graphite-600">
                  <strong className="mb-1 block font-display text-xl text-navy-950">$395</strong>
                  fixed-scope Workflow Check
                </div>
                <div className="rounded-2xl border border-navy-800/15 bg-white/35 p-4 text-sm leading-snug text-graphite-600">
                  <strong className="mb-1 block font-display text-xl text-navy-950">1</strong>
                  workflow at a time
                </div>
                <div className="rounded-2xl border border-navy-800/15 bg-white/35 p-4 text-sm leading-snug text-graphite-600">
                  <strong className="mb-1 block font-display text-xl text-navy-950">Human</strong>
                  approval stays visible
                </div>
              </div>
            </div>

            <aside className="cp-workflow-card md:col-span-5" aria-label="Workflow Check artifact">
              <div className="relative z-10">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div className="grid gap-1">
                    <span className="font-display text-[0.7rem] uppercase tracking-[0.14em] text-cream-50/60">
                      ClearPath audit
                    </span>
                    <strong className="font-display text-lg tracking-[-0.03em] text-cream-50">
                      Your week, checked
                    </strong>
                  </div>
                  <div className="min-w-32 rounded-full border border-sage-500/50 bg-sage-500/10 px-3 py-2 text-center text-xs text-cream-50">
                    {status}
                  </div>
                </div>

                <div className="grid gap-3">
                  <WorkflowRow number="1" title="Quote requests arrive half complete" body="Sales repeats the same intake questions." tag="repeatable" />
                  <WorkflowRow number="2" title="Owner gets pulled into exceptions" body="Pricing judgment is mixed with routine routing." tag="bottleneck" selected />
                  <WorkflowRow number="3" title="Answers live in one team member" body="New staff have to ask before they move." tag="knowledge" />
                  <WorkflowRow number="4" title="Follow-up depends on memory" body="Good leads age out quietly." tag="handoff" />
                </div>

                <div className="cp-diagnosis mt-4 rounded-2xl border border-sage-500/30 bg-sage-500/10 p-4">
                  <span className="mb-1 block font-display text-[0.7rem] uppercase tracking-[0.14em] text-cream-50/65">
                    Bottleneck found
                  </span>
                  <strong className="block text-sm leading-snug text-cream-50">
                    Routine intake and owner judgment are mixed together.
                  </strong>
                </div>

                <div className="cp-route mt-3 grid gap-2 sm:grid-cols-4">
                  <RouteStep title="Intake" body="Collect details." />
                  <RouteStep title="Triage" body="Split routine work." />
                  <RouteStep title="Approve" body="Keep judgment human." approve />
                  <RouteStep title="Handoff" body="Show next action." />
                </div>

                <div className="cp-bridge mt-3 flex items-center justify-between gap-3 rounded-2xl border border-sage-500/25 bg-sage-500/10 px-3 py-2 text-xs text-cream-50/75">
                  <b className="text-cream-50">Findings become packet</b>
                  <span aria-hidden="true" className="font-bold text-sage-500">→</span>
                  <span>Map, bottleneck, approval, next step</span>
                </div>
              </div>

              <div className="cp-packet relative z-10 mt-4 rounded-3xl bg-cream-50 p-5 text-navy-950 shadow-2xl shadow-navy-950/25">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="font-display text-[0.7rem] uppercase tracking-[0.14em] text-graphite-500">
                      Workflow Check packet
                    </span>
                    <strong className="mt-1 block font-display text-lg tracking-[-0.03em]">
                      Scoped before anyone spends more
                    </strong>
                  </div>
                  <span className="rounded-full border border-sage-600/25 bg-sage-500/15 px-3 py-1 text-xs font-semibold text-sage-600">
                    Packet ready
                  </span>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-graphite-600">
                  <PacketLine label="Map" width="82%" />
                  <PacketLine label="Bottleneck" width="64%" />
                  <PacketLine label="Approval" width="48%" />
                  <PacketLine label="Next step" width="74%" />
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <section id="packet" className="py-16 md:py-20">
        <Container>
          <SectionHeader eyebrow="What you get" title="The $395 check becomes a packet, not a vague opinion." body="You get a clear picture of one workflow, where it breaks down, what needs human approval, and what a practical build would look like." />
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <article className="relative overflow-hidden rounded-3xl border border-navy-800/15 bg-white/55 p-6 shadow-xl shadow-navy-950/5 md:p-8" aria-label="Sample Workflow Check packet">
              <div className="absolute top-8 right-8 h-9 w-24 rotate-[-3deg] rounded-2xl border border-sage-600/25 bg-sage-500/10" aria-hidden="true" />
              <p className="font-display text-eyebrow font-semibold uppercase tracking-[0.13em] text-sage-600">
                Sample Workflow Check packet
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold leading-none tracking-[-0.04em] text-navy-950 md:text-4xl">
                Quote intake and approval
              </h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <PacketCard number="01" title="Workflow map" body="The current path from request to follow-up, including workarounds." />
                <PacketCard number="02" title="Bottleneck note" body="Routine intake and owner judgment are slowing each other down." />
                <PacketCard number="03" title="Approval checklist" body="Pricing exceptions, customer promises, and risky handoffs stay human." />
                <PacketCard number="04" title="Next recommendation" body="A fixed-scope build path if the workflow is worth cleaning up." />
              </div>
            </article>

            <article id="process" className="rounded-3xl border border-navy-800/15 bg-white/35 p-6 md:p-8">
              <h2 className="font-display text-3xl font-semibold tracking-[-0.04em] text-navy-950">
                How the $395 check works
              </h2>
              <div className="mt-6 grid gap-4">
                <ProcessRow number="1" title="Pick one workflow." body="Start with the thing your team keeps explaining twice." />
                <ProcessRow number="2" title="Walk through today." body="Use a call, screenshots, a spreadsheet, an email thread, or an SOP." />
                <ProcessRow number="3" title="Receive the packet." body="You get the map, bottleneck note, approval points, and next-step recommendation." />
                <ProcessRow number="4" title="Decide what makes sense." body="Build the fix, park it, or use the packet internally." />
              </div>
              <p className="mt-5 rounded-2xl border border-sage-600/20 bg-sage-500/15 p-4 font-semibold leading-relaxed text-navy-900">
                You keep the packet whether or not you build with ClearPath.
              </p>
            </article>
          </div>
        </Container>
      </section>

      <section id="example" className="bg-navy-950 py-20 text-cream-50 md:py-24">
        <Container>
          <SectionHeader dark eyebrow="Example workflow" title="Messy work becomes a path the team can follow." body="Quote intake is a good starting point because the mess is familiar: incomplete requests, repeated questions, owner interruptions, and follow-up that depends on memory." />
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <article className="rounded-3xl border border-cream-50/10 bg-cream-50/[0.045] p-6 md:p-8">
              <h3 className="font-display text-3xl font-semibold tracking-[-0.04em]">Before ClearPath</h3>
              <div className="mt-6 grid gap-3">
                <DarkRow title="Email thread" body="Customer asks for a quote, but half the intake is missing." />
                <DarkRow title="Side question" body="Sales asks the owner if this exception is okay." />
                <DarkRow title="Loose note" body="Someone remembers the customer wanted a call by Friday." />
                <DarkRow title="No trail" body="The team cannot see what was approved or why." />
              </div>
            </article>
            <article className="rounded-3xl border border-sage-500/20 bg-cream-50/[0.045] p-6 md:p-8">
              <h3 className="font-display text-3xl font-semibold tracking-[-0.04em]">After the check</h3>
              <div className="mt-6 grid gap-3">
                <PathRow number="1" title="Intake named" body="Missing fields are clear before the team chases the work." />
                <PathRow number="2" title="Routine route" body="Normal requests move without owner interruption." />
                <PathRow number="3" title="Approval marked" body="Pricing judgment stays with a person." />
                <PathRow number="4" title="Next step scoped" body="The build path is clear before more money gets spent." />
              </div>
            </article>
          </div>
        </Container>
      </section>

      <section id="approval" className="py-16 md:py-20">
        <Container>
          <SectionHeader eyebrow="Where AI fits" title="AI helps with the repeatable parts. People keep the judgment." />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <ApprovalCard title="AI can help" items={["Draft routine replies", "Summarize intake", "Route work to the right owner", "Prepare a weekly brief"]} />
            <ApprovalCard title="Humans approve" items={["Pricing exceptions", "Customer escalations", "Vendor or payment decisions", "Anything that needs judgment"]} />
          </div>
        </Container>
      </section>

      <section id="bring" className="py-16 md:py-20">
        <Container>
          <SectionHeader eyebrow="What to bring" title="Start with the messy material you already have." body="You do not need a perfect process doc. The rough material is usually where the useful truth lives." />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {bringItems.map((item) => (
              <div key={item.title} className="rounded-3xl border border-navy-800/15 bg-white/35 p-6 text-graphite-600">
                <strong className="mb-2 block font-display text-xl tracking-[-0.03em] text-navy-950">
                  {item.title}
                </strong>
                {item.body}
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20 text-center md:py-24">
        <Container>
          <p className="font-display text-eyebrow font-semibold uppercase tracking-[0.16em] text-sage-600">
            Start small
          </p>
          <h2 className="mt-3 font-display text-[clamp(2.25rem,5vw,3.5rem)] font-semibold leading-none tracking-[-0.04em] text-navy-950">
            Bring one workflow.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-graphite-600">
            Best if you already know the workflow slowing the team down. If you are not sure, book a fit call first and talk it through.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <CtaButton href="/contact" variant="primary" size="lg">
              Start a $395 Workflow Check
            </CtaButton>
            <CtaButton href="/contact" variant="secondary" size="lg">
              Talk through the right workflow
            </CtaButton>
          </div>
          <div className="mt-10">
            <Link href="/how-it-works" className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-sage-600 underline-offset-4 hover:underline">
              Let me show you how we can set this up together
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}

function WorkflowRow({ number, title, body, tag, selected = false }: { number: string; title: string; body: string; tag: string; selected?: boolean }) {
  return (
    <div className={`cp-work-row ${selected ? "cp-work-row-selected" : ""}`}>
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cream-50/10 font-bold text-sage-500">
        {number}
      </div>
      <div className="min-w-0">
        <strong className="block text-sm leading-snug text-cream-50">{title}</strong>
        <span className="mt-1 block text-xs leading-snug text-cream-50/55">{body}</span>
      </div>
      <div className="cp-tag rounded-full border border-sage-500/25 bg-sage-500/15 px-2 py-1 text-[0.68rem] text-cream-50">
        {tag}
      </div>
    </div>
  );
}

function RouteStep({ title, body, approve = false }: { title: string; body: string; approve?: boolean }) {
  return (
    <div className={`relative rounded-2xl border border-sage-500/20 bg-sage-500/10 p-3 text-[0.7rem] leading-snug text-cream-50/70 ${approve ? "border-sage-500/55" : ""}`}>
      {approve ? <span className="cp-approve-dot" aria-hidden="true" /> : null}
      <strong className="block text-xs text-cream-50">{title}</strong>
      {body}
    </div>
  );
}

function PacketLine({ label, width }: { label: string; width: string }) {
  return (
    <div className="grid items-center gap-2 sm:grid-cols-[5.5rem_1fr]">
      <b className="text-navy-900">{label}</b>
      <span className="h-2 overflow-hidden rounded-full bg-navy-800/10">
        <i className="block h-full rounded-full bg-sage-500/50" style={{ width }} />
      </span>
    </div>
  );
}

function SectionHeader({ eyebrow, title, body, dark = false }: { eyebrow: string; title: string; body?: string; dark?: boolean }) {
  return (
    <div className="max-w-3xl">
      <p className={`font-display text-eyebrow font-semibold uppercase tracking-[0.13em] ${dark ? "text-sage-500" : "text-sage-600"}`}>{eyebrow}</p>
      <h2 className={`mt-3 font-display text-[clamp(2.125rem,5vw,3.5rem)] font-semibold leading-none tracking-[-0.04em] text-balance ${dark ? "text-cream-50" : "text-navy-950"}`}>{title}</h2>
      {body ? <p className={`mt-4 text-lg leading-relaxed text-pretty ${dark ? "text-cream-50/70" : "text-graphite-600"}`}>{body}</p> : null}
    </div>
  );
}

function PacketCard({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-navy-800/10 bg-white/65 p-4">
      <span className="font-display text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-sage-600">{number}</span>
      <strong className="mt-2 block text-navy-950">{title}</strong>
      <p className="mt-2 text-sm leading-relaxed text-graphite-600">{body}</p>
    </div>
  );
}

function ProcessRow({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <div className="grid grid-cols-[2.25rem_1fr] gap-3 text-graphite-600">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy-900 font-bold text-cream-50">{number}</span>
      <p className="leading-relaxed"><b className="text-navy-900">{title}</b><br />{body}</p>
    </div>
  );
}

function DarkRow({ title, body }: { title: string; body: string }) {
  return <div className="rounded-2xl border border-cream-50/10 bg-cream-50/[0.06] p-4 text-cream-50/75"><strong className="mb-1 block text-cream-50">{title}</strong>{body}</div>;
}

function PathRow({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <div className="grid grid-cols-[1.5rem_1fr] gap-3 rounded-2xl border border-sage-500/20 bg-cream-50/[0.06] p-4 text-cream-50/75">
      <span className="grid h-6 w-6 place-items-center rounded-full border-2 border-sage-500 text-xs text-sage-500">{number}</span>
      <p><strong className="mb-1 block text-cream-50">{title}</strong>{body}</p>
    </div>
  );
}

function ApprovalCard({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="rounded-3xl border border-navy-800/15 bg-white/55 p-6 md:p-8">
      <h3 className="font-display text-3xl font-semibold tracking-[-0.04em] text-navy-950">{title}</h3>
      <ul className="mt-5 list-disc space-y-2 pl-5 leading-relaxed text-graphite-600">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </article>
  );
}
