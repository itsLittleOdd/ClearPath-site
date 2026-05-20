"use client"

import { useState } from "react"
import Link from "next/link"
import { MenuIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Logo } from "@/components/Logo"
import { NAV_LINKS } from "@/lib/nav"

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open navigation menu"
            className="md:hidden text-navy-950 hover:bg-navy-950/5"
          />
        }
      >
        <MenuIcon className="size-5" />
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex flex-col gap-0 p-0 bg-cream-50"
      >
        <SheetHeader className="border-b border-navy-950/10 px-4 py-4">
          <SheetTitle render={<span className="sr-only" />}>
            ClearPath navigation
          </SheetTitle>
          <Logo />
        </SheetHeader>

        <nav
          aria-label="Mobile primary"
          className="flex flex-col gap-1 px-4 py-4"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-3 font-sans text-base font-medium text-navy-800 hover:text-navy-950 hover:bg-navy-950/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500/60"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-navy-950/10 px-4 py-4">
          <Button
            size="lg"
            variant="default"
            className="w-full"
            render={<Link href="/contact" onClick={() => setOpen(false)} />}
          >
            Book a call
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
