"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Container } from "@/components/Container";
import { CtaButton } from "@/components/ui/cta-button";

const statusStates = [
  { text: "Inbox received", delay: 0 },
  { text: "Details pulled", delay: 1100 },
  { text: "Draft prepared", delay: 2000 },
  { text: "Approval ready", delay: 2850 },
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
  const [status, setStatus] = useState("Approval ready");

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
      <section className="relative isolate overflow-hidden bg-navy-950 pt-12 pb-12 text-cream-50 md:pt-16 md:pb-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -right-32 -z-10 h-[28rem] w-[28rem] rounded-full bg-sage-500/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 -z-10 h-64 w-full bg-gradient-to-t from-sage-500/10 to-transparent"
        />
        <Container>
          <div className="grid gap-8 md:grid-cols-12 md:items-center md:gap-10">
            <div className="flex flex-col gap-4 md:col-span-7">
              <p className="font-display text-eyebrow font-semibold uppercase tracking-[0.16em] text-sage-500">
                One workflow. One clear next step.
              </p>
              <h1 className="max-w-3xl font-display text-[clamp(2.5rem,6vw,4.25rem)] font-semibold leading-[0.96] tracking-[-0.045em] text-balance text-cream-50">
                Capture how the work actually gets done.
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-pretty text-cream-50/78 md:text-lg">
                ClearPath reviews one messy workflow, shows where time gets stuck, and gives you a practical next step. If a build makes sense later, the team can use it to eliminate 5-10 hours of repetitive work every week.
              </p>
              <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center">
                <CtaButton href="/contact" variant="inverted" size="lg">
                  Start a $395 Workflow Check
                </CtaButton>
                <CtaButton href="#packet" variant="secondary" size="lg" className="border-cream-50/20 bg-cream-50/10 text-cream-50 hover:bg-cream-50/15">
                  See exactly what you get
                </CtaButton>
              </div>
              <div className="grid gap-3 pt-2 sm:grid-cols-3">
                <HeroStat value="$395" label="fixed-scope Workflow Check" />
                <HeroStat value="1" label="workflow reviewed at a time" />
                <HeroStat value="Human" label="approval stays visible" />
              </div>
            </div>

            <aside className="cp-workflow-card md:col-span-5 md:max-w-[420px] md:justify-self-end" aria-label="Workflow Check artifact">
              <div className="relative z-10">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div className="grid gap-1">
                    <span className="font-display text-[0.66rem] uppercase tracking-[0.14em] text-cream-50/60">
                      ClearPath audit
                    </span>
                    <strong className="font-display text-base tracking-[-0.03em] text-cream-50">
                      Your workflow, checked
                    </strong>
                  </div>
                  <div className="min-w-28 rounded-full border border-sage-500/50 bg-sage-500/10 px-3 py-2 text-center text-[0.7rem] text-cream-50">
                    {status}
                  </div>
                </div>

                <div className="grid gap-2.5">
                  <WorkflowRow number="1" title="Outlook request arrives incomplete" body="Key details are spread across a thread." tag="intake" />
                  <WorkflowRow number="2" title="Owner gets pulled into routine calls" body="Normal routing and real judgment are mixed." tag="bottleneck" selected />
                  <WorkflowRow number="3" title="Answer gets typed from memory" body="The team repeats the same judgment by hand." tag="knowledge" />
                </div>

                <div className="cp-diagnosis mt-3 rounded-2xl border border-sage-500/30 bg-sage-500/10 p-3">
                  <span className="mb-1 block font-display text-[0.66rem] uppercase tracking-[0.14em] text-cream-50/65">
                    Bottleneck found
                  </span>
                  <strong className="block text-sm leading-snug text-cream-50">
                    The same email gets read, sorted, answered, and filed by hand.
                  </strong>
                </div>

                <div className="cp-route mt-3 grid gap-2 sm:grid-cols-4">
                  <RouteStep title="Read" body="Pull details." />
                  <RouteStep title="Draft" body="Prepare reply." />
                  <RouteStep title="File" body="Save record." />
                  <RouteStep title="Approve" body="Person checks." approve />
                </div>
              </div>

            </aside>
          </div>
        </Container>
      </section>

      <section id="packet" className="bg-[color-mix(in_oklab,var(--color-cream-50)_88%,var(--color-sage-500)_12%)] py-14 md:py-18">
        <Container>
          <SectionHeader eyebrow="What you get" title="What the $395 Workflow Check includes" body="This is a fixed-scope review of one workflow. You leave with a clear packet you can use, even if you do not build anything with ClearPath afterward." />
          <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_1fr]">
            <article className="rounded-3xl border border-navy-800/15 bg-cream-50/80 p-6 shadow-xl shadow-navy-950/5 md:p-8" aria-label="Sample Workflow Check packet">
              <div className="mx-auto max-w-xl text-center">
                <p className="font-display text-eyebrow font-semibold uppercase tracking-[0.13em] text-sage-600">
                  Sample Workflow Check packet
                </p>
                <h2 className="mt-3 font-display text-3xl font-semibold leading-none tracking-[-0.04em] text-navy-950 md:text-4xl">
                  One workflow, mapped before you spend more
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-graphite-600 md:text-base">
                  The packet is short on purpose. It names the problem, shows the path, and tells you what the first useful fix should be.
                </p>
              </div>
              <div className="mx-auto mt-6 grid max-w-2xl gap-3 sm:grid-cols-2">
                <PacketCard number="01" title="Workflow map" body="How the work comes in, who touches it, where it waits, and what happens next." />
                <PacketCard number="02" title="Bottleneck notes" body="The top friction points ranked by impact and how realistic they are to fix first." />
                <PacketCard number="03" title="Approval points" body="The places where a person should still review the response, routing, or decision." />
                <PacketCard number="04" title="Next step" body="A plain recommendation and likely build range if the workflow is worth cleaning up." />
              </div>
            </article>

            <article id="process" className="rounded-3xl border border-navy-800/15 bg-cream-50/70 p-6 md:p-8">
              <h2 className="font-display text-3xl font-semibold tracking-[-0.04em] text-navy-950">
                How the $395 check works
              </h2>
              <p className="mt-3 text-base leading-relaxed text-graphite-600">
                You are paying for a focused working session and a written decision packet, not a vague audit and not a surprise software build.
              </p>
              <div className="mt-6 grid gap-4">
                <ProcessRow number="1" title="Pick one workflow." body="Choose one recurring problem, like customer emails, invoice routing, quote follow-up, intake, approvals, or weekly reporting." />
                <ProcessRow number="2" title="Walk through it for 45 to 60 minutes." body="We look at how the work arrives, where details live, who reviews it, what gets repeated, and where the owner gets interrupted." />
                <ProcessRow number="3" title="Get the Workflow Check packet." body="You receive the map, bottleneck notes, approval points, and a recommended first fix in plain English." />
                <ProcessRow number="4" title="Decide what to do next." body="Use the packet internally, park the idea, or ask ClearPath to quote the first build. The check stands on its own." />
              </div>
              <div className="mt-5 grid gap-3 rounded-2xl border border-sage-600/20 bg-sage-500/15 p-4 text-sm leading-relaxed text-navy-900">
                <p className="font-semibold">Included: one workflow review, one working call, one written packet, and one clear recommendation.</p>
                <p>Not included: live automation setup, account changes, customer emails, payment actions, or a full software build.</p>
              </div>
            </article>
          </div>
        </Container>
      </section>

      <section id="example" className="bg-navy-950 py-16 text-cream-50 md:py-20">
        <Container>
          <SectionHeader dark eyebrow="Example workflow" title="A Microsoft email comes in. The team gets a cleaner path." body="This is the type of workflow ClearPath can map during the $395 check. The build would happen later only if the scope makes sense." />
          <div className="mt-9 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <article className="rounded-3xl border border-cream-50/10 bg-cream-50/[0.045] p-5 md:p-6">
              <div className="mb-4 flex items-center justify-between gap-4 border-b border-cream-50/10 pb-4">
                <div>
                  <p className="font-display text-sm font-semibold text-cream-50">Microsoft Outlook</p>
                  <p className="text-xs text-cream-50/55">Shared inbox example</p>
                </div>
                <span className="rounded-full bg-sage-500/15 px-3 py-1 text-xs text-sage-500">New request</span>
              </div>
              <div className="grid gap-3">
                <EmailLine from="North Ridge Dental" subject="Need quote for new intake workflow" active />
                <EmailLine from="Vendor AP" subject="Invoice missing approval" />
                <EmailLine from="Operations" subject="Weekly report follow-up" />
              </div>
              <div className="mt-5 rounded-2xl border border-cream-50/10 bg-navy-900/60 p-4">
                <p className="font-display text-xs uppercase tracking-[0.13em] text-sage-500">Email body</p>
                <p className="mt-2 text-sm leading-relaxed text-cream-50/75">
                  We need a better way to handle new quote requests. Details are coming through email, the spreadsheet is behind, and approvals are happening in side conversations.
                </p>
              </div>
            </article>

            <article className="rounded-3xl border border-sage-500/20 bg-cream-50/[0.055] p-5 md:p-6">
              <div className="grid gap-3 md:grid-cols-2">
                <DemoStep number="1" title="AI reads the email" body="Pulls out sender, request type, missing details, deadline, and likely owner." />
                <DemoStep number="2" title="Draft response is prepared" body="Creates a reply for review. Nothing gets sent until a person approves it." />
                <DemoStep number="3" title="Record is filed" body="Adds the item to Excel, a SharePoint list, or the team folder with the right labels." />
                <DemoStep number="4" title="Approval stays visible" body="Exceptions, pricing, promises, and payment-related steps wait for human review." />
              </div>
              <div className="mt-5 rounded-2xl border border-sage-500/20 bg-navy-900/70 p-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <MiniSystem label="Outlook" value="Request captured" />
                  <MiniSystem label="Excel" value="Row prepared" />
                  <MiniSystem label="Folder" value="Files organized" />
                </div>
              </div>
            </article>
          </div>
        </Container>
      </section>

      <section id="approval" className="bg-[color-mix(in_oklab,var(--color-cream-50)_90%,var(--color-navy-800)_10%)] py-16 md:py-20">
        <Container>
          <SectionHeader eyebrow="Where AI fits" title="AI helps with the repeatable parts. People keep the judgment." />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <ApprovalCard title="AI can help" items={["Read and summarize incoming messages", "Pull out key details", "Draft routine replies", "Prepare records for Excel, SharePoint, or folders"]} />
            <ApprovalCard title="Humans approve" items={["Pricing exceptions", "Customer promises", "Vendor or payment decisions", "Anything that needs judgment"]} />
          </div>
        </Container>
      </section>

      <section id="bring" className="bg-cream-50 py-16 md:py-20">
        <Container>
          <SectionHeader eyebrow="What to bring" title="Start with the messy material you already have." body="You do not need a perfect process doc. The rough material is usually where the useful truth lives." />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {bringItems.map((item) => (
              <div key={item.title} className="rounded-3xl border border-navy-800/15 bg-white/45 p-6 text-graphite-600">
                <strong className="mb-2 block font-display text-xl tracking-[-0.03em] text-navy-950">
                  {item.title}
                </strong>
                {item.body}
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[color-mix(in_oklab,var(--color-cream-50)_86%,var(--color-sage-500)_14%)] py-18 text-center md:py-22">
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

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-cream-50/15 bg-cream-50/10 p-4 text-sm leading-snug text-cream-50/72">
      <strong className="mb-1 block font-display text-xl text-cream-50">{value}</strong>
      {label}
    </div>
  );
}

function WorkflowRow({ number, title, body, tag, selected = false }: { number: string; title: string; body: string; tag: string; selected?: boolean }) {
  return (
    <div className={`cp-work-row ${selected ? "cp-work-row-selected" : ""}`}>
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-cream-50/10 text-sm font-bold text-sage-500">
        {number}
      </div>
      <div className="min-w-0">
        <strong className="block text-[0.82rem] leading-snug text-cream-50">{title}</strong>
        <span className="mt-1 block text-[0.72rem] leading-snug text-cream-50/55">{body}</span>
      </div>
      <div className="cp-tag rounded-full border border-sage-500/25 bg-sage-500/15 px-2 py-1 text-[0.66rem] text-cream-50">
        {tag}
      </div>
    </div>
  );
}

function RouteStep({ title, body, approve = false }: { title: string; body: string; approve?: boolean }) {
  return (
    <div className={`relative rounded-2xl border border-sage-500/20 bg-sage-500/10 p-2.5 text-[0.68rem] leading-snug text-cream-50/70 ${approve ? "border-sage-500/55" : ""}`}>
      {approve ? <span className="cp-approve-dot" aria-hidden="true" /> : null}
      <strong className="block text-[0.72rem] text-cream-50">{title}</strong>
      {body}
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
    <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-navy-800/10 bg-white/65 p-5 text-center shadow-sm shadow-navy-950/5">
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

function EmailLine({ from, subject, active = false }: { from: string; subject: string; active?: boolean }) {
  return (
    <div className={`rounded-2xl border p-3 ${active ? "border-sage-500/45 bg-sage-500/12" : "border-cream-50/10 bg-cream-50/[0.04]"}`}>
      <p className="text-sm font-semibold text-cream-50">{from}</p>
      <p className="mt-1 text-xs text-cream-50/62">{subject}</p>
    </div>
  );
}

function DemoStep({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-cream-50/10 bg-cream-50/[0.06] p-4 text-cream-50/75">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-sage-500/20 text-xs font-bold text-sage-500">{number}</span>
      <strong className="mt-3 block text-cream-50">{title}</strong>
      <p className="mt-1 text-sm leading-relaxed">{body}</p>
    </div>
  );
}

function MiniSystem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-cream-50/10 bg-cream-50/[0.055] p-3 text-center">
      <p className="font-display text-xs uppercase tracking-[0.12em] text-sage-500">{label}</p>
      <p className="mt-1 text-sm text-cream-50/78">{value}</p>
    </div>
  );
}

function ApprovalCard({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="rounded-3xl border border-navy-800/15 bg-cream-50/75 p-6 md:p-8">
      <h3 className="font-display text-3xl font-semibold tracking-[-0.04em] text-navy-950">{title}</h3>
      <ul className="mt-5 list-disc space-y-2 pl-5 leading-relaxed text-graphite-600">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </article>
  );
}
