import type { Metadata } from "next";

import { Container } from "@/components/Container";
import { CtaButton } from "@/components/ui/cta-button";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "ClearPath starts with one workflow, maps how it runs today, marks approval points, and gives the buyer a practical next step before a build is scoped.",
};

const checkSteps = [
  {
    number: "1",
    title: "Pick one workflow.",
    body: "Choose one recurring problem, like customer emails, invoice routing, quote follow-up, intake, approvals, or weekly reporting.",
  },
  {
    number: "2",
    title: "Walk through how it really runs.",
    body: "We look at where the work starts, where details live, who reviews it, what gets repeated, and where the owner gets interrupted.",
  },
  {
    number: "3",
    title: "Get the Workflow Check packet.",
    body: "You receive a workflow map, bottleneck notes, approval points, and a recommended first fix in plain English.",
  },
  {
    number: "4",
    title: "Decide what to do next.",
    body: "Use the packet internally, park the idea, or ask ClearPath to quote the first build. The check stands on its own.",
  },
];

const currentPath = [
  "Request arrives in email",
  "Details get copied by hand",
  "Owner gets pulled into the exception",
  "Follow-up depends on memory",
];

const betterPath = [
  "Intake fields are named",
  "Routine items get sorted",
  "Exceptions wait for approval",
  "Next action is visible",
];

export default function HowItWorksPage() {
  return (
    <main className="overflow-hidden bg-cream-50 text-navy-950">
      <section className="relative isolate bg-navy-950 py-16 text-cream-50 md:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-36 -z-10 h-96 w-96 rounded-full bg-sage-500/20 blur-3xl" />
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="max-w-3xl">
              <p className="font-display text-eyebrow font-semibold uppercase tracking-[0.16em] text-sage-500">How it works</p>
              <h1 className="mt-4 font-display text-[clamp(2.55rem,6vw,4.25rem)] font-semibold leading-[0.96] tracking-[-0.045em] text-balance">
                Let me show you how we can set this up together
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-cream-50/75">
                ClearPath starts with one workflow that is already slowing the team down. We map how it runs today, name the bottlenecks, mark the approval points, and give you a practical next step before any build is scoped.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <CtaButton href="/pricing" variant="inverted" size="lg">Start ClearPath Support</CtaButton>
                <CtaButton href="#check" variant="secondary" size="lg" className="border-cream-50/20 bg-cream-50/10 text-cream-50 hover:bg-cream-50/15">See the process</CtaButton>
              </div>
            </div>
            <aside className="rounded-3xl border border-cream-50/10 bg-cream-50/[0.055] p-6 shadow-2xl shadow-navy-950/30">
              <p className="font-display text-eyebrow font-semibold uppercase tracking-[0.14em] text-sage-500">Workflow Check packet</p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em] text-cream-50">What you leave with</h2>
              <div className="mt-5 grid gap-3">
                <PacketItem title="Workflow map" body="How the work arrives, moves, waits, and gets handed off." />
                <PacketItem title="Bottleneck notes" body="The points slowing the team down, ranked by what is realistic to fix." />
                <PacketItem title="Approval points" body="Where judgment stays with a person before anything important happens." />
                <PacketItem title="Recommended first fix" body="A clear next step and likely build path if the workflow is worth cleaning up." />
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <section id="check" className="bg-sage-500/10 py-14 md:py-18">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-display text-eyebrow font-semibold uppercase tracking-[0.14em] text-sage-600">The $395 check</p>
            <h2 className="mt-3 font-display text-[clamp(2.2rem,5vw,3.5rem)] font-semibold leading-none tracking-[-0.04em] text-navy-950">What happens before a build is quoted</h2>
            <p className="mt-4 text-lg leading-relaxed text-graphite-600">The check is the paid clarity step. It turns a messy workflow into a decision packet.</p>
          </div>
          <ol className="mt-9 grid gap-5 lg:grid-cols-4">
            {checkSteps.map((step) => (
              <li key={step.number} className="flex h-full flex-col items-center rounded-3xl border border-navy-800/12 bg-cream-50/80 p-6 text-center shadow-sm shadow-navy-950/5">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-navy-950 font-display text-xl font-semibold text-sage-500">{step.number}</span>
                <h3 className="mt-5 font-display text-2xl font-semibold tracking-[-0.03em] text-navy-950">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-graphite-600 md:text-base">{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="bg-navy-950 py-16 text-cream-50 md:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="font-display text-eyebrow font-semibold uppercase tracking-[0.14em] text-sage-500">From messy to usable</p>
              <h2 className="mt-3 font-display text-[clamp(2.2rem,5vw,3.5rem)] font-semibold leading-none tracking-[-0.04em] text-balance">The work does not need to be clean before we look at it.</h2>
              <p className="mt-4 text-lg leading-relaxed text-cream-50/72">The rough version is usually the truth. The check shows what should stay human, what can be organized, and what can be built later.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <PathPanel title="Current path" items={currentPath} />
              <PathPanel title="Cleaner path" items={betterPath} positive />
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-cream-50 py-16 md:py-20">
        <Container>
          <div className="grid gap-5 md:grid-cols-2">
            <ApprovalCard title="ClearPath can help with" items={["Reading and summarizing messages", "Pulling out key details", "Drafting routine replies", "Preparing records for Excel, SharePoint, or folders"]} />
            <ApprovalCard title="People approve" items={["Pricing exceptions", "Customer promises", "Payment or vendor decisions", "Anything that needs judgment"]} />
          </div>
        </Container>
      </section>

      <section className="bg-sage-500/10 py-16 text-center md:py-20">
        <Container>
          <h2 className="font-display text-[clamp(2.2rem,5vw,3.5rem)] font-semibold leading-none tracking-[-0.04em] text-navy-950">Ready to clean up the first messy process?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-graphite-600">Bring the email thread, spreadsheet, SOP, or rough explanation. Start monthly support, or use the Workflow Check when you want it mapped first.</p>
          <div className="mt-8 flex justify-center"><CtaButton href="/pricing" variant="primary" size="lg">See pricing options</CtaButton></div>
        </Container>
      </section>
    </main>
  );
}

function PacketItem({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-cream-50/10 bg-cream-50/[0.06] p-4">
      <strong className="block text-cream-50">{title}</strong>
      <p className="mt-1 text-sm leading-relaxed text-cream-50/68">{body}</p>
    </div>
  );
}

function PathPanel({ title, items, positive = false }: { title: string; items: string[]; positive?: boolean }) {
  return (
    <div className="rounded-3xl border border-cream-50/10 bg-cream-50/[0.055] p-5">
      <h3 className="font-display text-2xl font-semibold text-cream-50">{title}</h3>
      <ol className="mt-5 grid gap-3">
        {items.map((item, index) => (
          <li key={item} className="flex items-start gap-3 rounded-2xl border border-cream-50/10 bg-navy-900/50 p-3 text-cream-50/72">
            <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold ${positive ? "bg-sage-500/20 text-sage-500" : "bg-cream-50/10 text-cream-50"}`}>{index + 1}</span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ApprovalCard({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="rounded-3xl border border-navy-800/12 bg-sage-500/10 p-6 md:p-8">
      <h3 className="font-display text-3xl font-semibold tracking-[-0.04em] text-navy-950">{title}</h3>
      <ul className="mt-5 list-disc space-y-2 pl-5 leading-relaxed text-graphite-600">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </article>
  );
}
