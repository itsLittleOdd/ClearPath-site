/**
 * ClearPath AI Audit — site copy.
 *
 * Single source of truth for marketing copy. Page components import these
 * objects and render them. Voice rules live in the project AGENTS.md /
 * Justin's INSTRUCTIONS.md — see those before editing strings here.
 *
 * Mandatory phrases that must appear byte-for-byte somewhere in this module:
 *   1. "Let me show you how we can set this up together"
 *   2. "eliminate 5-10 hours of repetitive work every week"
 *   3. "This is AI-assisted analysis + Justin's human review and customization."
 */

export const HOME_COPY = {
  hero: {
    eyebrow: "ClearPath AI Audit",
    headline: "Reclaim 5-10 hours a week.",
    // Substring of `headline` to highlight visually. Must be a literal slice of
    // `headline` so the rendered DOM text stays byte-for-byte equal.
    headlineAccent: "5-10 hours",
    subhead:
      "I find where practical AI can eliminate 5-10 hours of repetitive work every week for small businesses in Western New York.",
    primaryCta: "Book a 45-min discovery call",
    secondaryCta: "See how it works",
    // Trust strip rendered directly under the CTAs. Each item echoes claims
    // that already appear elsewhere in copy (footer location, pricing bullets,
    // how-it-works step copy) — kept short so the rhythm reads as signal,
    // not marketing.
    trust: [
      "Based in Olean, NY",
      "No subscription, no upsell pressure",
      "Plain English, no jargon",
    ],
  },
  socialProof:
    "Twelve-plus years running operations at a Western New York resort. I know what a real local business looks like — long shifts, small margins, real people. ClearPath is built on that.",
  howItWorks: {
    eyebrow: "How it works",
    heading: "Let me show you how we can set this up together",
    intro: "Three steps. About a week, start to finish.",
    steps: [
      {
        title: "We talk for 45 minutes.",
        body: "A discovery call where you walk me through how a typical week runs. No prep, no slide deck — just talk. I take notes.",
      },
      {
        title: "You get a plain-English audit.",
        body: "Two to three pages, no jargon. I name the two or three places where simple AI saves you real time, and exactly which tools to use.",
      },
      {
        title: "We set it up together — or you take it and run it yourself.",
        body: "If you want help, I do the setup with you on a screen-share. If you'd rather take the report and go, the plan is yours to keep.",
      },
    ],
  },
  examplesSection: {
    eyebrow: "Real results",
    heading: "What this looks like in practice.",
  },
  examples: [
    {
      archetype: "Cafe owner",
      timeSaved: "4-6 hours a week",
      summary:
        "A 6-person cafe in downtown Olean was drowning in catering emails — every booking touched five threads before the food got out. We set up Gmail labels, a Calendly link for tasting calls, and a one-button reply template. The owner still reads every confirmation; she just doesn't write them from scratch anymore.",
    },
    {
      archetype: "Auto-shop owner",
      timeSaved: "5-7 hours a week",
      summary:
        "A small auto shop near Bradford was losing customers who drifted to chain places when their NY State inspection sticker expired. We built a 3-text-and-1-email reminder cadence on top of the data already in their shop-management system. First inspection cycle, they pulled back a chunk of the regulars they'd been letting slip.",
    },
    {
      archetype: "CPA office",
      timeSaved: "8-10 hours a week (April rush)",
      summary:
        "A 5-person CPA office in Cattaraugus County was rewriting the same 'we received your documents' email thirty times a day during tax season. We set up an Outlook + Microsoft Copilot draft that pulls the client name and timeline automatically. Same intake assistant, less burnout, faster client experience.",
    },
  ],
  finalCta: {
    heading: "Ready to see what fits?",
    body: "Forty-five minutes on the phone or a video call. No pitch. If nothing here fits your business, I'll say so.",
    cta: "Book a 45-min discovery call",
  },
};

export const HOW_IT_WORKS_COPY = {
  eyebrow: "How it works",
  heading: "Let me show you how we can set this up together",
  intro:
    "Three steps. About a week from start to finish, depending on how busy you are.",
  steps: [
    {
      number: "1",
      title: "The discovery call.",
      body: "Forty-five minutes on the phone or a video call — whichever works better for you. No slide deck. Walk me through how a typical week runs at your business — staffing, scheduling, the customer questions you answer five times a day, the paperwork that piles up. I take notes.",
    },
    {
      number: "2",
      title: "The audit report.",
      body: "A few days later, I send you a two-to-three-page report in plain English. It names the two or three places where a simple AI tool would save you real time, the exact tools I'd use, and what each one would cost (often free, usually under $30 a month). No jargon. No 100-page deck.",
    },
    {
      number: "3",
      title: "We pick the path that fits.",
      body: "If you want help setting it up, I do the work with you on a screen-share — you'll know how to run and modify everything by the time we're done. If you'd rather take the report and run it yourself, it's yours and we shake hands. No high-pressure sale, no monthly retainer you didn't ask for.",
    },
  ],
  whatThisIsnt: {
    heading: "What this isn't.",
    body: "Not a CRM overhaul. Not a custom platform. Not a chatbot that takes calls instead of your team. The audits I run start with what you already pay for and end with a written plan you actually own.",
  },
  cta: {
    heading: "Ready?",
    body: "Forty-five minutes. No pitch.",
    button: "Book a 45-min discovery call",
  },
};

export const WHO_ITS_FOR_COPY = {
  eyebrow: "Who it's for",
  heading: "Built for small businesses that run lean.",
  intro:
    "Two-person shop or fifty-person operation. Hospitality, trades, retail, professional services, nonprofits, solo operators — the line isn't industry, it's whether your week has work that repeats. I'm based in Olean. The audit travels.",
  tagline:
    "What they all have in common: places where simple AI can eliminate 5-10 hours of repetitive work every week without changing how you run the business.",
  audiences: [
    {
      archetype: "You answer the same email thirty times a week.",
      example:
        "Catering replies, estimate requests, \"did you get my documents?\", appointment confirmations. A 6-person cafe in downtown Olean was rewriting the same five paragraphs every morning before we templated it.",
    },
    {
      archetype: "Your scheduling is a phone-tag nightmare.",
      example:
        "Inspection reminders, follow-up calls, recurring service windows. A 4-bay shop near Bradford was losing customers to chain places because nobody had time to call them back.",
    },
    {
      archetype: "Paperwork lives in three places at once.",
      example:
        "Spreadsheet, inbox, shop-management software, sticky note on the monitor. A 5-person CPA office in Cattaraugus County was retyping the same client info four times before tax season even hit.",
    },
    {
      archetype: "You're the bottleneck.",
      example:
        "Solo operator, owner-operator, or the only person who knows how something works. If you're the constraint, the audit usually finds the boring half of your job that doesn't actually need you on it.",
    },
  ],
  notForYouIf: {
    heading: "What this is — and what it isn't.",
    body: "In scope: smart chatbots, automated reminders, AI-assisted email drafts, document intake, scheduling helpers, anything that reuses tools you're already paying for. Out of scope: a six-month custom platform build, or a system you set up once and never look at again. The audit is aimed at small repeating tasks that add up — not enterprise overhauls, not set-and-forget magic. I'm not trying to sell you new software you don't need.",
  },
  cta: {
    heading: "Sound like you?",
    body: "We'll figure it out in 45 minutes.",
    button: "Book a 45-min discovery call",
  },
};

export const ABOUT_COPY = {
  eyebrow: "About",
  heading: "Hi, I'm Justin.",
  bio: [
    "I'm Justin Whalen. I grew up in Western New York and spent twelve-plus years on the operations side of a regional ski resort in Ellicottville. Back of house in the kitchen, drinks at the bar, teaching ski school in winter. Real work. Long shifts. Local people.",
    "A few years in, I built a chatbot for the ski school so a new director could ramp up without bugging instructors all day. Then I built a 'book with Justin' lesson site so guests could schedule a private with me directly instead of leaving voicemails the resort had to call back. Both started as side projects to save myself time. Turned out the small fixes that save five hours a week add up.",
    "ClearPath is the same idea, scaled. I sit down with a small business owner in Olean or wider WNY, walk through a typical week, and find the repetitive work you stopped seeing because you do it every day. Then I write a short, plain-English plan that names exactly which tools fix it. Usually tools you already pay for.",
    "A real client once called me 'my let-me-show-you person.' That's the job. Not consulting. Not pitching. Just showing you, on your screen, how something works, so when I'm gone, you keep running it yourself.",
  ],
  // Pull-quote rendered as a standalone block on the About page.
  // Period on the attribution is intentional — Justin-voice, not a label.
  pullQuote: "my let-me-show-you person",
  pullQuoteAttribution: "A real client.",
  cta: {
    heading: "Want to talk?",
    body: "Forty-five-minute discovery call, no pitch. The audit itself is $197 if you want one.",
    button: "Book a 45-min discovery call",
  },
};

export const PRICING_COPY = {
  eyebrow: "Pricing",
  heading: "Simple pricing.",
  intro:
    "One firm price for the front door. Everything after is quoted to fit your scope and team size.",
  // The audit is the only firm public number. Everything else is "from."
  audit: {
    eyebrow: "The front door",
    name: "The ClearPath AI Audit",
    price: 197,
    priceLabel: "$197",
    bullets: [
      "60-min discovery call",
      "Plain-English report (3 bottlenecks, real tools, real numbers)",
      "Sent within 5 business days",
      "No subscription, no upsell pressure",
    ],
    cta: "Book my audit",
  },
  // "What happens after the audit" grid — VISUAL ORDER MATTERS.
  // Co-build is FEATURED (middle-option bias). Done-for-you must visually
  // rank BELOW Co-build per Operator's lane guidance.
  pathsHeading: "What happens after the audit",
  pathsSubhead: "You pick the path that fits.",
  paths: [
    {
      id: "self",
      name: "Run it yourself",
      priceLabel: "$0",
      qualifier: null,
      description: "Take the report, run with it.",
    },
    {
      id: "co",
      name: "Co-build sprint",
      priceLabel: "$1,497",
      qualifier: "from",
      description: "We build it together over 4-6 weeks.",
      featured: true,
      featuredEyebrow: "Most owners pick this one",
    },
    {
      id: "dfy",
      name: "Done-for-you",
      priceLabel: "$3,497",
      qualifier: "from",
      description: "We build it. You approve and use it.",
    },
    {
      id: "support",
      name: "Ongoing support",
      priceLabel: "$249",
      qualifier: "from",
      priceSuffix: "/mo",
      description: "Tune-ups, training, new builds.",
    },
  ],
  closingNote:
    "Final price depends on scope and team size. Quoted on the audit call.",
  cta: {
    heading: "Not sure what fits? Let's talk.",
    body: "Forty-five minutes on the phone, no pitch. If the right path costs you nothing, I'll say so.",
    button: "Book a 45-min discovery call",
  },
};

export const CONTACT_COPY = {
  eyebrow: "Get in touch",
  heading: "Book a 45-min discovery call.",
  intro:
    "Pick a time on the calendar below. No prep needed — bring how a typical week runs and a few of the things you wish you didn't have to do twice.",
  calendar: {
    placeholderHeading: "Pick a time",
    placeholderBody:
      "Pick a 45-minute slot that works for you. I'll be on the call — no script, no slide deck.",
  },
  form: {
    heading: "Or send a quick note instead.",
    intro:
      "Tell me a little about your business and what's eating your time. I'll get back within one business day.",
    fields: {
      name: { label: "Name", placeholder: "First and last" },
      business: { label: "Business name", placeholder: "Where you work" },
      email: { label: "Email", placeholder: "you@yourbusiness.com" },
      phone: { label: "Phone (optional)", placeholder: "(555) 555-5555" },
      question: {
        label: "What's one repetitive task eating your time right now?",
        placeholder:
          "One sentence is fine. The more specific, the better — e.g. 'rewriting the same catering reply 30 times a week.'",
      },
    },
    submit: "Send",
    confirmation:
      "Got it. I'll get back to you within one business day. Talk soon.",
    privacyNote: "Your info stays private. I read every message myself.",
  },
  fallbackContact: {
    heading: "Old-school works too.",
    body: "Email is the fastest way if the form's giving you trouble.",
  },
};

/**
 * Shared strings used across pages. Footer disclaimer is required on the
 * audit-related pages — Builder 4 owns the rendering, this module owns the
 * canonical text.
 */
export const SHARED_COPY = {
  primaryCta: "Book a 45-min discovery call",
  // Canonical PUBLIC contact data. Mirrored into lib/site.ts for non-string
  // consumers (metadata, JSON-LD, server-only imports). Booking is on cal.com,
  // not Calendly. The internal-only post-audit review URL is intentionally
  // NOT in this module — see lib/internal.ts → INTERNAL_LINKS.reviewBookingUrl
  // for that. Public components must never import it.
  contact: {
    email: "JWhalen@ClearPathWV.com",
    bookingDiscoveryUrl:
      "https://cal.com/justin-whalen-xpjqtn/45-min-discovery-call",
  },
  footer: {
    tagline: "Practical AI for small businesses in Olean and Western New York.",
    disclaimer:
      "This is AI-assisted analysis + Justin's human review and customization.",
    locationLine: "Based in Olean, NY. Serving Western New York and beyond.",
    rightsLine: "© ClearPath AI Audit, a Whalen Ventures company. All rights reserved.",
  },
  nav: {
    home: "Home",
    howItWorks: "How it works",
    whoItsFor: "Who it's for",
    pricing: "Pricing",
    about: "About",
    contact: "Contact",
  },
};
