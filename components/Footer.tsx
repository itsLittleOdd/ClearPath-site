import Link from "next/link"

import { Logo } from "@/components/Logo"
import { CtaButton } from "@/components/ui/cta-button"
import { Separator } from "@/components/ui/separator"
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
        "w-full bg-navy-950 text-cream-50",
        className
      )}
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          <div className="flex flex-col gap-3">
            <Logo />
            <p className="font-sans text-sm text-cream-50/75 max-w-xs">
              {FOOTER_TAGLINE}
            </p>
            <p className="font-sans text-sm text-cream-50/55">Olean, NY</p>
          </div>

          <nav aria-label="Footer site links" className="flex flex-col gap-3">
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-cream-50">
              Site
            </h2>
            <ul className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-cream-50/80 hover:text-sage-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500/60 rounded-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-cream-50">
              Contact
            </h2>
            <ul className="flex flex-col gap-2 font-sans text-sm">
              <li>
                <span className="text-cream-50/55">Email: </span>
                <a
                  href={`mailto:${SITE.email}`}
                  className="text-cream-50/90 hover:text-sage-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500/60 rounded-sm"
                >
                  {SITE.email}
                </a>
              </li>
              <li className="pt-1">
                <CtaButton
                  href={SITE.bookingDiscoveryUrl}
                  external
                  variant="inverted"
                  size="sm"
                >
                  Book a discovery call
                </CtaButton>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <Separator className="bg-cream-50/10" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 sm:px-6 lg:px-8 py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-sans text-xs text-cream-50/55">
          &copy; {year} ClearPath AI Audit
        </p>
        <p className="font-sans text-xs text-cream-50/55 sm:text-right">
          {FOOTER_DISCLAIMER}
        </p>
      </div>
    </footer>
  )
}
