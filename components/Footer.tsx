import Link from "next/link"

import { Logo } from "@/components/Logo"
import { NAV_LINKS } from "@/lib/nav"
import { SITE } from "@/lib/site"
import { cn } from "@/lib/utils"

const FOOTER_TAGLINE = "Practical AI that actually saves small businesses time."

const FOOTER_DISCLAIMER =
  "This is AI-assisted analysis + Justin's human review and customization."

type FooterProps = {
  className?: string
}

export function Footer({ className }: FooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer
      className={cn(
        "w-full border-t border-navy-950/10 bg-cream-50 text-navy-800",
        className
      )}
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          <div className="flex flex-col gap-3">
            <Logo />
            <p className="font-sans text-sm text-graphite-600 max-w-xs">
              {FOOTER_TAGLINE}
            </p>
            <p className="font-sans text-sm text-graphite-500">Olean, NY</p>
          </div>

          <nav aria-label="Footer site links" className="flex flex-col gap-3">
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-navy-950">
              Site
            </h2>
            <ul className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-navy-700 hover:text-sage-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500/60 rounded-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-navy-950">
              Contact
            </h2>
            <ul className="flex flex-col gap-2 font-sans text-sm">
              <li>
                <span className="text-graphite-500">Email: </span>
                <a
                  href={`mailto:${SITE.email}`}
                  className="text-navy-700 hover:text-sage-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500/60 rounded-sm"
                >
                  {SITE.email}
                </a>
              </li>
              <li>
                <span className="text-graphite-500">Book a call: </span>
                <Link
                  href="/contact"
                  className="text-navy-700 hover:text-sage-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500/60 rounded-sm"
                >
                  /contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-navy-950/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 sm:px-6 lg:px-8 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-sans text-xs text-graphite-500">
            &copy; {year} ClearPath AI Audit
          </p>
          <p className="font-sans text-xs text-graphite-500 sm:text-right">
            {FOOTER_DISCLAIMER}
          </p>
        </div>
      </div>
    </footer>
  )
}
