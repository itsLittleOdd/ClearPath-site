import * as React from "react"

import { cn } from "@/lib/utils"

type SeparatorProps = React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical"
  decorative?: boolean
}

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: SeparatorProps) {
  const ariaProps = decorative
    ? { role: "none" as const }
    : {
        role: "separator" as const,
        "aria-orientation": orientation,
      }

  return (
    <div
      data-slot="separator"
      data-orientation={orientation}
      className={cn(
        "shrink-0 bg-current/10",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      {...ariaProps}
      {...props}
    />
  )
}

export { Separator }
