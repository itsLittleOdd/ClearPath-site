"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Logo } from "@/components/Logo"
import { MobileNav } from "@/components/MobileNav"
import { NAV_LINKS } from "@/lib/nav"
import { cn } from "@/lib/utils"

type NavProps = {
  className?: string
}

export function Nav({ className }: NavProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      data-scrolled={scrolled ? "true" : "false"}
      className={cn(
        "sticky top-0 z-40 w-full transition-colors duration-200",
        scrolled
          ? "bg-cream-50/90 supports-backdrop-filter:bg-cream-50/75 supports-backdrop-filter:backdrop-blur-md border-b border-navy-950/10"
          : "bg-transparent border-b border-transparent",
        className
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
      >
        <Logo />

        <ul className="hidden md:flex items-center gap-1 lg:gap-2">
          {NAV_LINKS.filter((link) => link.href !== "/").map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex items-center rounded-md px-3 py-2 font-sans text-sm font-medium text-navy-700 hover:text-navy-950 hover:bg-navy-950/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500/60"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Button
            size="lg"
            variant="default"
            nativeButton={false}
            className="hidden md:inline-flex"
            render={<Link href="/contact" />}
          >
            Book a call
          </Button>
          <MobileNav />
        </div>
      </nav>
    </header>
  )
}
