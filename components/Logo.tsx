import Link from "next/link"

import { cn } from "@/lib/utils"

type LogoProps = {
  className?: string
  href?: string
  tone?: "default" | "inverted"
}

export function Logo({ className, href = "/", tone = "default" }: LogoProps) {
  const wordmarkColor = tone === "inverted" ? "text-cream-50" : "text-navy-950"
  const eyebrowColor =
    tone === "inverted" ? "text-cream-50/70" : "text-sage-600"

  return (
    <Link
      href={href}
      aria-label="ClearPath AI Audit — home"
      className={cn(
        "inline-flex flex-col leading-none rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500/60",
        className
      )}
    >
      <span
        className={cn(
          "font-display text-xl sm:text-2xl font-semibold tracking-tight",
          wordmarkColor
        )}
      >
        ClearPath
      </span>
      <span
        className={cn(
          "font-sans text-[0.625rem] sm:text-xs uppercase tracking-[0.18em] mt-0.5",
          eyebrowColor
        )}
      >
        AI Audit
      </span>
    </Link>
  )
}
