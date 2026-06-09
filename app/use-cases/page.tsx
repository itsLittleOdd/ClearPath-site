import type { Metadata } from "next";

import { Container } from "@/components/Container";
import { CtaButton } from "@/components/ui/cta-button";

export const metadata: Metadata = {
  title: { absolute: "Use Cases | ClearPath" },
  description:
    "Use cases ClearPath maps first: intake, routing, approvals, follow-up, knowledge lookup, owner briefs, and Microsoft 365 workflows.",
  alternates: { canonical: "/use-cases" },
};

const groups = [
  {
    label: "Intake and routing",
    cases: [
      {
        title: "Quote intake assistant",
        hurt: "Prospects send partial details, sales re-asks the basics, and good leads sit too long.",
        built: "Structured intake, lead routing, and a clean handoff into your CRM where possible.",
        checkpoint: "Pricing, promises, and unusual requests wait for review.",
      },
      {
        title: "Invoice routing queue",
        hurt: "Invoices arrive in different inboxes, approvals happen in side conversations, and exceptions are hard to trace.",
        built: "A routing queue, approval workflow, and audit trail tied to the tools you already use where possible.",
        checkpoint: "Payment decisions and exceptions stay with the right approver.",
      },
      {
        title: "Intake triage",
        hurt: "Customer requests, applications, work orders, or internal asks arrive messy and need sorting before anyone can act.",
        built: "Triage rules, tags, routing, and a clean operator view.",
        checkpoint: "Escalations, exceptions, and sensitive requests stay visible.",
      },
    ],
  },
  {
    label: "Knowledge and support",
    cases: [
      {
        title: "Troubleshooting helper",
        hurt: "Field techs or support reps keep asking the same questions because the answer is buried in internal knowledge.",
        built: "A grounded helper that answers from your docs, SOPs, and known fixes, with a clear escalation path.",
        checkpoint: "Uncovered issues route to the right person instead of guessing.",
      },
      {
        title: "Document retrieval",
        hurt: "Contracts, SOPs, exception notes, and policies are in the file share, but nobody can find the right one fast.",
        built: "Permission-aware search across the documents your team actually uses.",
        checkpoint: "Access rules and sensitive documents are reviewed before rollout.",
      },
      {
        title: "Onboarding guide",
        hurt: "New hires shadow too long because the real process is scattered across people, docs, and side notes.",
        built: "An editable onboarding guide with role-specific quickstart paths and the source material behind it.",
        checkpoint: "Managers approve process changes before the guide becomes the new standard.",
      },
    ],
  },
  {
    label: "Owner visibility",
    cases: [
      {
        title: "Weekly owner brief",
        hurt: "The owner has dashboards and updates everywhere, but no single weekly view of what needs attention.",
        built: "A weekly brief assembled from the systems the business already runs, written for quick review.",
        checkpoint: "Justin and the owner define what matters before the brief becomes routine.",
      },
      {
        title: "Follow-up board",
        hurt: "Proposals, repairs, check-ins, and customer promises slip because the next step lives in someone’s memory.",
        built: "A follow-up board with recurring nudges and owner visibility on aging items.",
        checkpoint: "Anything customer-facing gets reviewed before it goes out.",
      },
    ],
  },
];

const exampleSteps = [
  ["Request arrives incomplete", "The team can see what is missing before chasing the work."],
  ["Details become a record", "The useful parts are pulled into a list, spreadsheet, or folder path."],
  ["Routine next step is prepared", "A reply, routing note, or task can be drafted for review."],
  ["Exception waits for approval", "Judgment stays with a person instead of disappearing into automation."],
];

export default function UseCasesPage() {
  return (
    <main className="overflow-hidden bg-cream-50 text-navy-950">
      <section className="relative isolate bg-navy-950 py-16 text-cream-50 md:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-36 -z-10 h-96 w-96 rounded-full bg-sage-500/20 blur-3xl" />
        <Container>
          <div className="max-w-4xl">
            <p className="font-display text-eyebrow font-semibold uppercase tracking-[0.16em] text-sage-500">Use cases</p>
            <h1 className="mt-4 font-display text-[clamp(2.6rem,6vw,4.4rem)] font-semibold leading-[0.96] tracking-[-0.045em] text-balance">
              Find the tedious work that keeps pulling an owner back in.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-cream-50/75">
              These are the bottlenecks ClearPath usually cleans up first: intake, routing, approvals, follow-up, knowledge lookup, and owner reporting. Pick the closest match, then start support or use a Workflow Check to map it first.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <CtaButton href="/pricing" variant="inverted" size="lg">Start ClearPath Support</CtaButton>
              <CtaButton href="#example" variant="secondary" size="lg" className="border-cream-50/20 bg-cream-50/10 text-cream-50 hover:bg-cream-50/15">See an example</CtaButton>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-sage-500/10 py-14 md:py-18">
        <Container>
          <div className="grid gap-10">
            {groups.map((group) => (
              <div key={group.label}>
                <div className="mb-5 flex items-center gap-3">
                  <span aria-hidden="true" className="h-px w-8 bg-sage-500" />
                  <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-sage-600">{group.label}</h2>
                </div>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {group.cases.map((item) => (
                    <article key={item.title} className="rounded-3xl border border-navy-800/12 bg-cream-50/80 p-6 shadow-sm shadow-navy-950/5">
                      <h3 className="font-display text-2xl font-semibold tracking-[-0.03em] text-navy-950">{item.title}</h3>
                      <UseCaseLine label="When this hurts" text={item.hurt} />
                      <UseCaseLine label="What gets built" text={item.built} />
                      <UseCaseLine label="Human checkpoint" text={item.checkpoint} />
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section id="example" className="bg-navy-950 py-16 text-cream-50 md:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="font-display text-eyebrow font-semibold uppercase tracking-[0.14em] text-sage-500">Example workflow</p>
              <h2 className="mt-3 font-display text-[clamp(2.2rem,5vw,3.55rem)] font-semibold leading-none tracking-[-0.04em] text-balance">A request comes in messy. The team gets a cleaner path.</h2>
              <p className="mt-4 text-lg leading-relaxed text-cream-50/72">
                During the Workflow Check, ClearPath maps how the request arrives, where the details live, who reviews it, and what gets repeated by hand. If a build makes sense, the fix starts from that map.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {exampleSteps.map(([title, body], index) => (
                <div key={title} className="rounded-3xl border border-cream-50/10 bg-cream-50/[0.055] p-5">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-sage-500/20 font-display text-sm font-semibold text-sage-500">{index + 1}</span>
                  <strong className="mt-4 block text-cream-50">{title}</strong>
                  <p className="mt-2 text-sm leading-relaxed text-cream-50/70">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-cream-50 py-16 text-center md:py-20">
        <Container>
          <h2 className="font-display text-[clamp(2.2rem,5vw,3.5rem)] font-semibold leading-none tracking-[-0.04em] text-navy-950">See a stuck process that sounds familiar?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-graphite-600">Pick the closest match and bring the messy version. Start monthly support, or use a Workflow Check when you want the process mapped first.</p>
          <div className="mt-8 flex justify-center"><CtaButton href="/pricing" variant="primary" size="lg">See pricing options</CtaButton></div>
        </Container>
      </section>
    </main>
  );
}

function UseCaseLine({ label, text }: { label: string; text: string }) {
  return (
    <div className="mt-5 border-t border-navy-800/10 pt-4">
      <p className="font-display text-xs font-semibold uppercase tracking-[0.13em] text-sage-600">{label}</p>
      <p className="mt-2 text-sm leading-relaxed text-graphite-600 md:text-base">{text}</p>
    </div>
  );
}
