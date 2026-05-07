import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const sectionVariants = cva("w-full", {
  variants: {
    background: {
      cream: "bg-cream-50 text-navy-950",
      navy: "bg-navy-800 text-cream-50",
      navyDeep: "bg-navy-950 text-cream-50",
      transparent: "",
    },
    size: {
      default: "py-16 md:py-24",
      tight: "py-12 md:py-20",
    },
  },
  defaultVariants: {
    background: "transparent",
    size: "default",
  },
});

type SectionProps = React.HTMLAttributes<HTMLElement> &
  VariantProps<typeof sectionVariants>;

export function Section({
  className,
  background,
  size,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(sectionVariants({ background, size }), className)}
      {...props}
    />
  );
}
