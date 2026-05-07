import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const headingVariants = cva(
  "font-display font-semibold text-navy-950 tracking-tight text-balance",
  {
    variants: {
      level: {
        h1: "text-display-lg md:text-display-xl",
        h2: "text-display-md md:text-display-lg",
        h3: "text-display-sm md:text-display-md",
        h4: "text-2xl md:text-3xl",
      },
    },
    defaultVariants: {
      level: "h2",
    },
  },
);

type HeadingTag = "h1" | "h2" | "h3" | "h4";

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> &
  VariantProps<typeof headingVariants> & {
    as?: HeadingTag;
  };

export function Heading({ as, level, className, ...props }: HeadingProps) {
  const Tag: HeadingTag = as ?? (level as HeadingTag | undefined) ?? "h2";
  return (
    <Tag className={cn(headingVariants({ level }), className)} {...props} />
  );
}
