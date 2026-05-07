import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "flex flex-col rounded-2xl border bg-clip-padding transition-shadow",
  {
    variants: {
      surface: {
        cream:
          "border-navy-800/10 bg-cream-50 text-navy-950 shadow-sm hover:shadow-md",
        navy: "border-cream-50/10 bg-navy-700 text-cream-50 shadow-sm hover:shadow-md",
        ghost: "border-transparent bg-transparent shadow-none",
      },
      interactive: {
        true: "transition-all motion-reduce:transition-none hover:-translate-y-0.5 motion-reduce:hover:translate-y-0",
        false: "",
      },
    },
    defaultVariants: {
      surface: "cream",
      interactive: false,
    },
  },
)

type CardProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof cardVariants>

function Card({ className, surface, interactive, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ surface, interactive }), className)}
      {...props}
    />
  )
}

function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-2 p-6 md:p-8", className)}
      {...props}
    />
  )
}

function CardBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-body"
      className={cn("flex flex-col gap-3 px-6 pb-6 md:px-8 md:pb-8", className)}
      {...props}
    />
  )
}

function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "mt-auto flex flex-col gap-2 px-6 pb-6 md:px-8 md:pb-8",
        className,
      )}
      {...props}
    />
  )
}

export { Card, CardHeader, CardBody, CardFooter, cardVariants }
