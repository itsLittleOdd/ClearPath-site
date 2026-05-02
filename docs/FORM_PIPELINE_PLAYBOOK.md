# Lead-Intake Form Pipeline — Implementation Playbook

**Author:** Scout 1 · **Date:** 2026-05-02 · **For:** Sprint 3 Builders (when operator picks A vs B)
**Stack:** Next 16.2.4 + React 19.2.4. Both paths drop into `app/contact/page.tsx`.

> Operator decision pending. Pre-built **both** so Sprint 3 starts the second the call is made.

---

## Form fields (both paths)

| Field | Required | HTML type | Notes |
|---|:-:|---|---|
| `name` | yes | `text` | Full name |
| `business` | yes | `text` | Business name |
| `email` | yes | `email` | Validated server-side |
| `phone` | no | `tel` | Optional but encouraged |
| `pain` | yes | `textarea` | "What's one repetitive task eating your time right now?" |
| `_hp_company` | — | `text` (hidden) | Honeypot. Real users don't see it; bots fill it; reject submission if non-empty. |

---

## PATH A — Tally.so embed (5-min setup, $0) — **WINNING PATH for Sprint 4 launch**

**Live form (provided by operator 2026-05-02):** https://tally.so/r/Me8OxM
**Form ID:** `Me8OxM`
**Env var (Vercel Production scope + local `.env.local`):** `NEXT_PUBLIC_TALLY_FORM_ID=Me8OxM`

**Account setup (Justin) — already done; recorded here for reference**
- Free Tally account created. Free tier = unlimited submissions + Tally branding in URL.
- Form named "ClearPath Lead Intake" with the 5 fields above (Tally types: "Short answer" / "Email" / "Phone" / "Long answer").
- Honeypot is not natively supported in Tally; we rely on Tally's built-in Google reCAPTCHA (insert with `/recaptcha` before the submit button — free for all Tally users, no captcha keys to manage). **Verify reCAPTCHA is present in the live form before launch.**
- Notifications → "Send email on submission" → **JWhalen@ClearPathWV.com**. (Tally manages SMTP — no Resend setup needed for Path A.)
- Optional: enable Tally's Slack/Sheets/Webhook integration to a `LEAD_WEBHOOK_URL` env var if Justin wants the data outside Tally.
- Embed source URL: `https://tally.so/embed/Me8OxM?alignLeft=1&hideTitle=1&transparentBackground=1`
- Builders read the ID from the env var (do NOT hardcode `Me8OxM` in component source — keeps the form swappable without a code change).

**Drop into the page** (`app/contact/page.tsx`):

```tsx
// app/contact/page.tsx
import { Metadata } from 'next'
import { TallyEmbed } from '@/components/tally-embed'

export const metadata: Metadata = {
  title: 'Book a discovery call',
  description: "Tell us what's eating your time. We'll show you where the easy wins are.",
}

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-4xl text-navy-950">Let's talk.</h1>
      <p className="mt-4 text-graphite-600">
        Fill this out and we'll get back to you within one business day.
      </p>
      <div className="mt-10">
        <TallyEmbed
          src={`https://tally.so/embed/${process.env.NEXT_PUBLIC_TALLY_FORM_ID}?alignLeft=1&hideTitle=1&transparentBackground=1`}
          title="ClearPath Lead Intake"
        />
      </div>
    </section>
  )
}
```

**Lazy-mounted embed** (Lighthouse-safe — keeps iframe out of initial HTML):

```tsx
// components/tally-embed.tsx
'use client'
import { useEffect, useRef, useState } from 'react'

export function TallyEmbed({ src, title }: { src: string; title: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShow(true); io.disconnect() } },
      { rootMargin: '200px' }
    )
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className="min-h-[600px]">
      {show && <iframe src={src} title={title} className="h-[700px] w-full border-0" loading="lazy" />}
    </div>
  )
}
```

**Pros:** zero backend code, $0, reCAPTCHA built in, ships in one PR.
**Cons:** Tally branding visible in iframe URL on free tier; data lives in Tally; CLS risk if hero image is below the fold (mitigated by `min-h-[600px]` placeholder above).

---

## PATH B — React Hook Form + Resend (full control, ~30 min + 24-hr DNS)

**Prerequisites (Justin, do NOW regardless of which path wins)**
- Register `clearpathai.com` (or fallback). Resend requires an owned domain — no shared/public domains.
- Create Resend account (free tier: 3,000 emails/mo, 100/day, 1 verified domain).
- Resend dashboard → Domains → Add `clearpathai.com` → copy the SPF + DKIM records → paste at the registrar's DNS (Resend writes them on a subdomain like `resend.mail.clearpathai.com`). Propagation up to 24 hr.
- Issue an API key, add to Vercel env: `RESEND_API_KEY`. Also add `LEAD_EMAIL_TO=justin@clearpathai.com` and `LEAD_EMAIL_FROM=hello@clearpathai.com`.

**Install:**
```bash
pnpm add react-hook-form zod @hookform/resolvers resend
```

**Route Handler** (`app/api/lead/route.ts` — preferred over Server Action here because RHF owns submit and we want a clean JSON response):

```ts
// app/api/lead/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'

const resend = new Resend(process.env.RESEND_API_KEY)

const LeadSchema = z.object({
  name: z.string().min(1).max(100),
  business: z.string().min(1).max(150),
  email: z.string().email(),
  phone: z.string().max(30).optional().or(z.literal('')),
  pain: z.string().min(5).max(2000),
  _hp_company: z.string().max(0), // honeypot: bots fill it; we require empty
})

// In-memory rate limit (per-runtime instance — fine for low traffic;
// upgrade to Vercel KV / Upstash Ratelimit if abuse appears)
const recent = new Map<string, number>()
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 3

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const now = Date.now()
  for (const [k, t] of recent) if (now - t > WINDOW_MS) recent.delete(k)
  const hits = [...recent.entries()].filter(([k]) => k.startsWith(ip + ':')).length
  if (hits >= MAX_PER_WINDOW) {
    return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 })
  }
  recent.set(`${ip}:${now}`, now)

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ ok: false }, { status: 400 }) }

  const parsed = LeadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }
  const { name, business, email, phone, pain } = parsed.data

  await resend.emails.send({
    from: process.env.LEAD_EMAIL_FROM!,
    to: process.env.LEAD_EMAIL_TO!,
    replyTo: email,
    subject: `New ClearPath lead — ${business}`,
    text: [
      `Name: ${name}`,
      `Business: ${business}`,
      `Email: ${email}`,
      `Phone: ${phone || '(not provided)'}`,
      ``,
      `Pain point:`,
      pain,
    ].join('\n'),
  })

  return NextResponse.json({ ok: true })
}
```

**Client form** (`app/contact/page.tsx` — split into a server page + client form island):

```tsx
// app/contact/page.tsx
import type { Metadata } from 'next'
import { LeadForm } from './lead-form'

export const metadata: Metadata = {
  title: 'Book a discovery call',
  description: "Tell us what's eating your time. We'll show you where the easy wins are.",
}

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-4xl text-navy-950">Let's talk.</h1>
      <p className="mt-4 text-graphite-600">
        Fill this out and we'll get back to you within one business day.
      </p>
      <LeadForm />
    </section>
  )
}
```

```tsx
// app/contact/lead-form.tsx
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'

const FormSchema = z.object({
  name: z.string().min(1, 'Required'),
  business: z.string().min(1, 'Required'),
  email: z.string().email('Valid email required'),
  phone: z.string().max(30).optional(),
  pain: z.string().min(5, 'Tell us a sentence or two'),
  _hp_company: z.string().max(0),
})
type FormValues = z.infer<typeof FormSchema>

export function LeadForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } =
    useForm<FormValues>({ resolver: zodResolver(FormSchema), defaultValues: { _hp_company: '' } })
  const [done, setDone] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const onSubmit = async (data: FormValues) => {
    setServerError(null)
    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) { setDone(true); reset() }
    else { setServerError("Something went wrong. Email justin@clearpathai.com instead.") }
  }

  if (done) {
    return <p className="mt-10 rounded-lg bg-sage-500/10 p-6 text-navy-950">Got it. Justin will reply within one business day.</p>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-5" noValidate>
      {/* Honeypot — hidden from real users, accessible to bots */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }}>
        <label>Company<input type="text" tabIndex={-1} autoComplete="off" {...register('_hp_company')} /></label>
      </div>

      <Field label="Your name" error={errors.name?.message}>
        <input {...register('name')} className="input" autoComplete="name" />
      </Field>
      <Field label="Business name" error={errors.business?.message}>
        <input {...register('business')} className="input" autoComplete="organization" />
      </Field>
      <Field label="Email" error={errors.email?.message}>
        <input type="email" {...register('email')} className="input" autoComplete="email" />
      </Field>
      <Field label="Phone (optional)" error={errors.phone?.message}>
        <input type="tel" {...register('phone')} className="input" autoComplete="tel" />
      </Field>
      <Field label="What's one repetitive task eating your time right now?" error={errors.pain?.message}>
        <textarea {...register('pain')} className="input min-h-[120px]" rows={5} />
      </Field>

      {serverError && <p role="alert" className="text-sm text-red-600">{serverError}</p>}

      <button type="submit" disabled={isSubmitting}
        className="rounded-lg bg-sage-500 px-6 py-3 font-sans text-cream-50 hover:bg-sage-600 disabled:opacity-60">
        {isSubmitting ? 'Sending…' : 'Book a discovery call'}
      </button>
    </form>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-navy-900">{label}</span>
      <div className="mt-1">{children}</div>
      {error && <span role="alert" className="mt-1 block text-sm text-red-600">{error}</span>}
    </label>
  )
}
```

> Define the `.input` utility once in `globals.css`:
> `.input { @apply w-full rounded-lg border border-navy-900/15 bg-cream-50 px-3 py-2 font-sans text-navy-950 outline-none focus:border-sage-500 focus:ring-2 focus:ring-sage-500/30; }`

**Pros:** full UX control, our brand, sub-100ms response, no third-party iframe, cleaner mobile keyboard handling.
**Cons:** ~30 min build; deliverability depends on Justin completing the 24-hr Resend domain verification; in-memory rate limit resets per cold-start (acceptable for Phase 1; upgrade to Upstash later).

---

## Why a Route Handler instead of a Server Action for Path B?

- RHF wants to own the submit handler so it can manage `isSubmitting` and field-level errors. Server Actions accept `FormData` directly and pair best with `useActionState` — works, but means rewriting RHF's submit pipeline.
- Route Handler returns a clean JSON response RHF can consume; honeypot rejection / rate-limit can return distinct status codes; easier to swap in Upstash Ratelimit later as edge middleware.
- Server Actions remain the right call when you don't need RHF (see `node_modules/next/dist/docs/01-app/02-guides/forms.md` — pattern is `'use server'` async function passed to `<form action={...}>`, optionally with `useActionState` for validation state).

---

## Switch decision criteria (for the operator)

- **Pick Tally** if launch speed > brand control, and the iframe-in-URL Tally branding is acceptable for the first 30 days.
- **Pick Resend** if Justin has the registered domain by 2026-05-09 (gives 7 days for DNS + build + test before the 5-16 launch). Otherwise Tally now, swap to Resend in Phase 1.5.

---

Sources
- `node_modules/next/dist/docs/01-app/02-guides/forms.md` — Server Actions, Zod validation pattern, useActionState, useFormStatus
- `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md` — Route Handler conventions, NextRequest/NextResponse, caching defaults
- [Resend pricing 2026](https://resend.com/pricing) · [Resend domain auth guide](https://resend.com/blog/email-authentication-a-developers-guide)
- [Tally.so reCAPTCHA help](https://tally.so/help/recaptcha)
