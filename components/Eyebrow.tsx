import * as React from "react";

import { cn } from "@/lib/utils";

type EyebrowProps = React.HTMLAttributes<HTMLParagraphElement>;

export function Eyebrow({ className, ...props }: EyebrowProps) {
  return (
    <p
      className={cn(
        "font-display text-eyebrow font-medium uppercase tracking-wider text-sage-600",
        className,
      )}
      {...props}
    />
  );
}
