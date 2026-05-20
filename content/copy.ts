/**
 * ClearPath site copy.
 *
 * Single source of truth for marketing copy. Page components import these
 * named blocks and render them.
 *
 * Voice: operator-grade, plain, concrete. We capture how the work actually
 * gets done, clean up repetitive workflows, and build AI-assisted tools the
 * team can use.
 *
 * Hard rules:
 *   - No named clients on the public site. All engagement stories framed as
 *     samples.
 *   - No payment links, no entity/billing language.
 *   - The disclaimer below must appear byte-for-byte in the rendered footer:
 *     "This is AI-assisted analysis + Justin's human review and customization."
 *   - Public prices reflect the 2026-05-11 pricing memo:
 *     Workflow Check $395 / One Workflow Fix from $4,500 /
 *     Workflow Build from $6,500 / Done-For-You System from $12,500 /
 *     Support exists but no public price.
 */

export const SITE_POSITIONING =
  "ClearPath helps business leaders capture how work actually gets done, clean up repetitive workflows, and build AI-assisted tools their teams can use.";

export const HOME_COPY = {
  hero: {
    eyebrow: "ClearPath",
    headline: "Capture how the work actually gets done.",
    // Substring of `headline` to highlight visually. Must be a literal slice of
    // `headline` so the rendered DOM text stays byte-for-byte equal.
    headlineAccent: "actually gets done",
    subhead:
      "ClearPath helps business leaders document expert judgment, clean up repetitive workflows, and build AI-assisted tools the team can use without turning the business upside down.",
    primaryCta: "Request a Workflow Check",
    secondaryCta: "Book a fit call",
    // Trust strip rendered directly under the CTAs.
    trust: [
      "$395 fixed-scope Workflow Check",
      "One workflow at a time, scoped before build",
      "Human approval stays visible where it matters",
    ],
  },
  trustPoints: {
    eyebrow: "Why operators pick ClearPath",
    heading: "Built around the workflow, not the technology.",
    body: "Most AI projects fail because nobody mapped the work first. ClearPath starts where the work lives: invoices stuck in someone's inbox, the survey nobody has time to redo, and the operator knowledge that lives in one person's head. Then we build from there.",
  },
  servicesSection: {
    eyebrow: "What ClearPath builds",
    heading: "Five things, scoped one at a time.",
    intro:
      "Every engagement starts with one workflow. We map it, fix it, and hand it back to the team. Then we look at the next one.",
    cards: [
      {
        title: "Knowledge capture",
        body: "Get the expert's process out of their head and into something the team can read, search, and run on their own.",
      },
      {
        title: "Workflow repair",
        body: "Fix the broken handoff, the inbox bottleneck, the spreadsheet that lives in three places. Built on tools you already pay for where possible.",
      },
      {
        title: "Internal assistant",
        body: "A purpose-built assistant that answers the questions your team keeps asking. Grounded in your docs, your policies, your tone.",
      },
      {
        title: "Owner dashboard / approval queue",
        body: "Surface the calls that need a human. Keep the routine stuff moving. The owner stays in the loop without becoming the bottleneck.",
      },
      {
        title: "Training handoff",
        body: "Everything we build gets documented and demoed for the team. When ClearPath leaves, nothing breaks.",
      },
    ],
    cta: "See the full services list",
    ctaHref: "/services",
  },
  useCasesSection: {
    eyebrow: "Concrete examples",
    heading: "Workflows we build first.",
    intro:
      "The starter list: the bottlenecks operators ask about most. Each one is a fixed-scope first engagement.",
    cards: [
      {
        title: "Quote intake assistant",
        body: "Turn 15 inbound questions a day into structured leads the sales team can act on without re-asking.",
      },
      {
        title: "Onboarding guide",
        body: "A living onboarding doc that updates itself as the team's process changes. New hires ramp without shadowing for three weeks.",
      },
      {
        title: "Invoice routing queue",
        body: "Inbound invoices land in a queue, get matched to a PO and an approver, and route themselves. The CFO sees the exceptions, not the routine.",
      },
      {
        title: "Troubleshooting helper",
        body: "When the field tech hits a problem, they get the answer from your internal knowledge, not a Google search that ends with a competitor's blog.",
      },
      {
        title: "Weekly owner brief",
        body: "Pulled from the systems the business already runs. The owner gets one Monday-morning page instead of seven dashboards.",
      },
      {
        title: "Document retrieval",
        body: "Find the right contract, the right SOP, the right exception note in seconds, not in the file share rabbit hole.",
      },
    ],
    cta: "Browse all use cases",
    ctaHref: "/use-cases",
  },
  sampleEngagement: {
    eyebrow: "Sample engagement",
    heading: "What this looks like in practice.",
    body: "A multi-property operator was losing hours every week because property surveys, invoice routing, and operator knowledge all lived in one person's head. We started with one workflow, the survey backlog, mapped how it actually got done, and built a structured intake plus a routing queue. The owner kept visibility on every approval. The next two workflows used the same pattern.",
    footnote:
      "This is a sample engagement description, written from the pattern we use. Specific results depend on scope, team, and how much expert knowledge needs to be captured first.",
  },
  process: {
    eyebrow: "Process",
    heading: "Five steps. One workflow at a time.",
    steps: [
      {
        title: "Discover",
        body: "We sit with the team and find the bottleneck that's actually costing time. Not the one that's loudest. The one that's expensive.",
      },
      {
        title: "Map",
        body: "Walk the workflow as it really runs, including the workarounds and the tribal knowledge nobody documented.",
      },
      {
        title: "Prioritize",
        body: "Pick the highest-value fix where the scope is clear and the buyer has authority to approve.",
      },
      {
        title: "Build",
        body: "Build with tools the team already uses where possible. New tools only when the workflow genuinely needs them.",
      },
      {
        title: "Handoff",
        body: "Documented, demoed, owned by the team. ClearPath leaves; the workflow keeps running.",
      },
    ],
  },
  finalCta: {
    heading: "Bring one workflow.",
    body: "One workflow that keeps slowing the team down. We'll scope a Workflow Check around it. Fixed price, fixed scope, no surprises.",
    cta: "Request a Workflow Check",
  },
};

// Stats strip. Pulled from copy.ts so the source of truth stays here, not in
// the SocialProof component. Order matters: visual hierarchy left-to-right.
export const HOME_STATS = [
  { value: "$395", label: "fixed-scope Workflow Check" },
  { value: "1", label: "workflow at a time" },
  { value: "5", label: "step process, owner-led" },
] as const;

export const HOW_IT_WORKS_COPY = {
  eyebrow: "How it works",
  heading: "We map one workflow before we touch the tools.",
  intro:
    "ClearPath engagements start with the work, not the software. Here's the path from first call to handoff.",
  steps: [
    {
      number: "1",
      title: "Discover one bottleneck.",
      body: "A working session with the operator and the team closest to the work. We surface where time goes, where exceptions pile up, and where the expert keeps getting interrupted to answer the same question.",
    },
    {
      number: "2",
      title: "Map the current path.",
      body: "Walk the workflow as it really runs, including the workarounds. The point isn't to design the perfect process. The point is to see the one we have, honestly, before we change anything.",
    },
    {
      number: "3",
      title: "Pick the highest-value fix.",
      body: "Where the scope is clear, the buyer has authority to approve, and the win is visible inside one engagement. ClearPath says no to ambiguous scope.",
    },
    {
      number: "4",
      title: "Build with approved tools first.",
      body: "We build inside the tools the team already pays for whenever the workflow allows. New tools only when the use case genuinely calls for them.",
    },
    {
      number: "5",
      title: "Handoff, train, and review.",
      body: "Documented in plain language, demoed to the team, owned internally. ClearPath leaves with a clear note on what to watch and when the next workflow is worth touching.",
    },
  ],
  humanApprovalNote: {
    heading: "Human approval stays visible.",
    body: "We don't build workflows that quietly make decisions a human should be making. Where judgment matters, like pricing exceptions, customer escalations, approvals over a threshold. The owner or operator sees the call before it goes out.",
  },
  cta: {
    heading: "Ready to map one workflow?",
    body: "Start with a Workflow Check. Fixed scope, fixed price, no commitment to anything past it.",
    button: "Request a Workflow Check",
  },
};

export const WHO_ITS_FOR_COPY = {
  eyebrow: "Who it's for",
  heading: "Built for operators who run real businesses.",
  intro:
    "Owners, general managers, department heads, office leads. The line isn't industry. It's whether your week has repetitive work that the right person could stop doing.",
  tagline:
    "ClearPath fits where one workflow is clearly costing time, the buyer has authority to scope and approve, and the team is willing to be honest about how the work actually runs.",
  audiences: [
    {
      archetype: "Owners and founders.",
      example:
        "You started the business, you still hold the operator knowledge, and you're the bottleneck nobody talks about. ClearPath captures what's in your head so the team can run more of it without you.",
    },
    {
      archetype: "General managers and operators.",
      example:
        "You run the day-to-day. You know exactly which workflow is leaking time. You need a partner who'll scope it tight, build it, and leave it documented, not pitch a platform.",
    },
    {
      archetype: "Department heads.",
      example:
        "Finance, ops, customer service, field service. One workflow inside your department is eating disproportionate time. You want it fixed without rebuilding the whole tech stack.",
    },
    {
      archetype: "Office managers and team leads.",
      example:
        "You're the person everyone asks. ClearPath is built for the workflows you keep doing twice: intake, routing, scheduling, follow-up, the recurring document grind.",
    },
    {
      archetype: "Healthcare and professional services leadership.",
      example:
        "Where process risk matters and audit trails aren't optional. ClearPath keeps human approval visible on the calls that need it and documents the workflow the way a regulator would actually want to read it.",
    },
  ],
  notForYouIf: {
    heading: "Where ClearPath is not the fit.",
    body: "ClearPath is not the right partner for AI experiments without a defined business workflow, six-month custom platform builds, or shops looking for a chatbot to bolt onto a website. We start with the workflow, scope tight, and ship one engagement at a time. If you need a vendor to write a strategy deck and disappear, that isn't us.",
  },
  cta: {
    heading: "Sounds like your situation?",
    body: "Bring one workflow. We'll scope a Workflow Check around it.",
    button: "Request a Workflow Check",
  },
};

export const SERVICES_COPY = {
  eyebrow: "Services",
  heading: "What ClearPath builds.",
  intro:
    "Six services, all scoped one workflow at a time. Every engagement answers the same three questions: what problem does it solve, what does the buyer get, and how scoped is the first step?",
  services: [
    {
      title: "Workflow Check",
      problem:
        "You suspect a workflow is costing more time than it should, but nobody has time to map it.",
      buyerGets:
        "A working session, a written workflow map, a prioritized list of fixes, and a fixed-scope quote for the next step. Two to three pages, plain language.",
      firstStep: "Fixed price, fixed scope, one workflow. $395.",
    },
    {
      title: "One Workflow Fix",
      problem:
        "One specific bottleneck, like invoice routing, intake triage, follow-up, has a clear shape and a willing owner.",
      buyerGets:
        "The workflow rebuilt end-to-end. Documented, demoed, handed off. Human approval kept visible where it matters.",
      firstStep: "Scoped on the Workflow Check. Engagements typically start from $4,500.",
    },
    {
      title: "Knowledge Capture System",
      problem:
        "Expert judgment lives in one or two people's heads and the team keeps interrupting them to ask the same questions.",
      buyerGets:
        "A searchable knowledge base built on your real material. An assistant grounded in it. A pattern for keeping it current.",
      firstStep: "Starts as a One Workflow Fix sized to your knowledge surface area.",
    },
    {
      title: "Internal Assistant",
      problem:
        "Your team keeps re-asking the same questions across docs, policies, contracts, and SOPs.",
      buyerGets:
        "A purpose-built assistant grounded in your material. Tuned for your tone and what the team is actually allowed to do without escalating.",
      firstStep: "Scoped after a Workflow Check and a knowledge readiness review.",
    },
    {
      title: "Approval / Follow-up Workflow",
      problem:
        "Things that need a human approval are stuck. Things that don't are getting one anyway.",
      buyerGets:
        "An approval queue that surfaces the calls that need judgment, automates the ones that don't, and gives the owner a visible audit trail.",
      firstStep: "Sized as a Workflow Build. Engagements typically start from $6,500.",
    },
    {
      title: "Reporting / Owner Brief",
      problem:
        "The owner has seven dashboards and reads none of them.",
      buyerGets:
        "A single weekly brief assembled from the systems the business already runs. Designed to be read in three minutes.",
      firstStep: "Scoped on a Workflow Check; built as a One Workflow Fix.",
    },
  ],
  supportNote: {
    heading: "After the build.",
    body: "Ongoing support is available for clients with a delivered ClearPath workflow. Scoped to fit. Pricing is set on the call so it matches actual support load. Mention it if you want it included in the engagement quote.",
  },
  cta: {
    heading: "Not sure which one fits?",
    body: "Bring the workflow that's slowing you down. We'll name the right service on the Workflow Check.",
    button: "Request a Workflow Check",
  },
};

export const USE_CASES_COPY = {
  eyebrow: "Use cases",
  heading: "Workflows ClearPath builds first.",
  intro:
    "The bottlenecks operators ask about most. Each one is a fixed-scope first engagement with buyer-facing language, concrete deliverable.",
  cases: [
    {
      title: "Quote intake assistant",
      body: "Inbound questions from prospects get structured into qualified leads. Sales stops re-asking the basics.",
      deliverable: "Structured intake + lead routing. Built on your CRM where possible.",
    },
    {
      title: "Onboarding guide",
      body: "A living onboarding doc that stays current as the team's process changes.",
      deliverable: "Editable guide + role-specific quickstart paths.",
    },
    {
      title: "Invoice routing queue",
      body: "Invoices land, get matched to a PO and an approver, and route themselves. Exceptions surface to the CFO.",
      deliverable: "Routing queue + approval workflow + audit log.",
    },
    {
      title: "Troubleshooting helper",
      body: "Field tech or support rep hits a question, gets the answer from your internal knowledge, not the open web.",
      deliverable: "Grounded assistant + escalation path when the answer isn't covered.",
    },
    {
      title: "Weekly owner brief",
      body: "One Monday-morning page assembled from the systems the business already runs.",
      deliverable: "Weekly auto-generated brief + a quarterly tune-up.",
    },
    {
      title: "Document retrieval",
      body: "Find the right contract, SOP, or exception note in seconds.",
      deliverable: "Search across your real document corpus + permissioned access.",
    },
    {
      title: "Intake triage",
      body: "First touch on inbound, including customer service, applications, work orders, sorted, tagged, and routed.",
      deliverable: "Triage rules + routing queue + clean dashboard for the operator.",
    },
    {
      title: "Follow-up board",
      body: "The follow-ups that quietly slip through, including proposals, repairs, scheduled check-ins, surfaced before they age out.",
      deliverable: "Follow-up board + recurring nudges + owner visibility.",
    },
  ],
  cta: {
    heading: "See one that fits a real bottleneck?",
    body: "We'll scope a Workflow Check around it. Fixed price, fixed scope, no commitment past it.",
    button: "Request a Workflow Check",
  },
};

export const ABOUT_COPY = {
  eyebrow: "About",
  heading: "ClearPath is run by an operator.",
  intro:
    "ClearPath was started by Justin Whalen after twelve-plus years on the operations side of a regional resort in Western New York, then a stretch building internal tools that solved real workflow problems for the team he worked with.",
  bio: [
    "Justin spent his first decade on operations: kitchen, bar, lesson programs, scheduling, the parts of the business that run on tribal knowledge and recovery from yesterday's mistakes. He learned what an operator actually wants from a tool, and what they refuse to use even when it's well-built.",
    "The first internal tools came out of that work: a knowledge assistant so a new director could ramp without burning instructors' time, a booking surface that fixed a real bottleneck the official system couldn't, an operations dashboard built around how the team actually planned a week. None of them looked like enterprise software. All of them got used.",
    "ClearPath is the same instinct, scoped as a service. Sit with operators, capture how the work actually gets done, build AI-assisted tools the team will use, and leave the workflow documented enough that it keeps running after the engagement closes.",
  ],
  values: [
    {
      title: "Workflow first.",
      body: "We map the work before we touch the tools. Most AI projects fail because they skipped this part.",
    },
    {
      title: "Human approval stays visible.",
      body: "Where judgment matters, the owner or operator sees the call before it goes out. We don't quietly automate the decisions that need a person.",
    },
    {
      title: "Documented and owned by the team.",
      body: "Every engagement ends with the workflow handed off to people who can run, change, and explain it. ClearPath leaves; the work keeps running.",
    },
  ],
  facts: [
    { label: "Founded by", value: "Justin Whalen" },
    { label: "Based in", value: "Western New York" },
    { label: "Engagement model", value: "One workflow at a time" },
    { label: "Front door", value: "$395 Workflow Check" },
  ],
  cta: {
    heading: "Want to bring one workflow?",
    body: "A Workflow Check is the front door. We scope tight, name what's worth fixing first, and move from there.",
    button: "Request a Workflow Check",
  },
};

export const PRICING_COPY = {
  eyebrow: "Pricing",
  heading: "Fixed-scope, one workflow at a time.",
  intro:
    "Every engagement starts with a Workflow Check. Everything after is scoped from what we found together, not from a menu.",
  // The Workflow Check is the only firm public number. Everything else is "from."
  audit: {
    eyebrow: "The front door",
    name: "Workflow Check",
    price: 395,
    priceLabel: "$395",
    bullets: [
      "Working session with the operator + team closest to the work",
      "Written workflow map + prioritized list of fixes",
      "Fixed-scope quote for the next engagement",
      "Two to three pages, plain language, yours to keep",
    ],
    cta: "Request a Workflow Check",
  },
  // "After the Workflow Check" grid. VISUAL ORDER MATTERS.
  // One Workflow Fix is FEATURED (most operators start here).
  pathsHeading: "After the Workflow Check",
  pathsSubhead: "Sized to the workflow we mapped together.",
  paths: [
    {
      id: "fix",
      name: "One Workflow Fix",
      priceLabel: "$4,500",
      qualifier: "from",
      description: "One specific workflow rebuilt end-to-end. Documented, demoed, handed off.",
      featured: true,
      featuredEyebrow: "Most engagements start here",
    },
    {
      id: "build",
      name: "Workflow Build",
      priceLabel: "$6,500",
      qualifier: "from",
      description: "Bigger build, typically invoice routing, approval queues, or a knowledge capture system.",
    },
    {
      id: "dfy",
      name: "Done-For-You System",
      priceLabel: "$12,500",
      qualifier: "from",
      description: "Multi-workflow build for operators who need a system, not a single fix.",
    },
    {
      id: "support",
      name: "Ongoing support",
      priceLabel: "Quoted",
      qualifier: null,
      description: "Available after delivery. Sized to actual support load. Ask on the call.",
    },
  ],
  closingNote:
    "Final price depends on workflow scope and how much knowledge needs to be captured first. We quote on the Workflow Check, not before.",
  cta: {
    heading: "Bring the workflow that's slowing you down.",
    body: "We'll scope a Workflow Check around it. Fixed price, fixed scope, no commitment past it.",
    button: "Request a Workflow Check",
  },
};

export const CONTACT_COPY = {
  eyebrow: "Get in touch",
  heading: "Bring one workflow.",
  intro:
    "Tell us about the workflow that's slowing the team down. We'll come back with a scoped Workflow Check and a time to talk.",
  calendar: {
    placeholderHeading: "Or pick a time",
    placeholderBody:
      "A short fit call, fifteen to thirty minutes. We figure out whether a Workflow Check is the right next step.",
  },
  form: {
    heading: "Send a note.",
    intro:
      "Tell us about the team, the workflow, and what's eating time right now. We'll get back within one business day.",
    fields: {
      name: { label: "Name", placeholder: "First and last" },
      business: { label: "Business name", placeholder: "Where you work" },
      email: { label: "Email", placeholder: "you@yourbusiness.com" },
      phone: { label: "Phone (optional)", placeholder: "(555) 555-5555" },
      question: {
        label: "What's one workflow slowing the team down right now?",
        placeholder:
          "One or two sentences is fine. The more concrete the better. For example, 'invoice approvals stuck in three different inboxes.'",
      },
    },
    submit: "Send",
    confirmation:
      "Got it. We'll get back within one business day.",
    privacyNote: "Your info stays private. Read by Justin, not a queue.",
  },
  fallbackContact: {
    heading: "Email works too.",
    body: "If the form's giving you trouble, email is the fastest way.",
  },
};

/**
 * Shared strings used across pages. Footer disclaimer is required on every
 * page. Content owns the canonical text; layout owns the rendering.
 */
export const SHARED_COPY = {
  primaryCta: "Request a Workflow Check",
  secondaryCta: "Book a fit call",
  contact: {
    email: "JWhalen@ClearPathWV.com",
    bookingDiscoveryUrl:
      "https://cal.com/justin-whalen-xpjqtn/45-min-discovery-call",
  },
  footer: {
    tagline:
      "Practical workflow, knowledge capture, and AI-assisted systems for business teams.",
    disclaimer:
      "This is AI-assisted analysis + Justin's human review and customization.",
    locationLine: "Based in Western New York. Engagements across the US.",
    rightsLine:
      "© ClearPath, a Whalen Ventures company. All rights reserved.",
  },
  nav: {
    home: "Home",
    services: "Services",
    useCases: "Use Cases",
    howItWorks: "How It Works",
    pricing: "Pricing",
    about: "About",
    contact: "Contact",
  },
};
