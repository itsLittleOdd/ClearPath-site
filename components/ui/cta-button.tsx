import * as React from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const ctaButtonVariants = cva(
  "group/cta inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200 outline-none focus-visible:ring-3 focus-visible:ring-sage-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50 active:translate-y-px",
  {
    variants: {
      variant: {
        primary:
          "bg-sage-600 text-cream-50 shadow-sm shadow-navy-950/15 hover:bg-sage-500 hover:shadow-md hover:shadow-sage-600/30",
        secondary:
          "bg-transparent text-navy-800 ring-1 ring-inset ring-navy-800/15 hover:bg-navy-950/5 hover:ring-navy-800/30 hover:text-navy-950",
        inverted:
          "bg-sage-500 text-navy-950 shadow-sm shadow-navy-950/40 hover:bg-cream-50",
      },
      size: {
        md: "h-11 px-5 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "lg",
    },
  },
);

type CtaButtonProps = Omit<React.ComponentPropsWithoutRef<"a">, "href"> &
  VariantProps<typeof ctaButtonVariants> & {
    href: string;
    external?: boolean;
    showArrow?: boolean;
    children: React.ReactNode;
  };

export function CtaButton({
  href,
  external,
  showArrow = true,
  variant,
  size,
  className,
  children,
  ...props
}: CtaButtonProps) {
  const Icon = external ? ArrowUpRight : ArrowRight;
  const classes = cn(ctaButtonVariants({ variant, size }), className);

  const content = (
    <>
      <span>{children}</span>
      {showArrow ? (
        <Icon
          aria-hidden="true"
          className="h-4 w-4 transition-transform duration-200 group-hover/cta:translate-x-0.5"
        />
      ) : null}
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        {...props}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}

export { ctaButtonVariants };
