import * as React from "react";

import { cn } from "@/lib/utils";

type HeroIllustrationProps = {
  className?: string;
};

/*
 * A mock ClearPath audit report - the actual deliverable. Cream document
 * card on a navy gradient, navy header band with the wordmark, three
 * numbered findings with placeholder text lines and time-saved chips,
 * and a SAVED PER WEEK total at the bottom. Decorative - the wrapper is
 * aria-hidden and the SVG carries role="presentation".
 *
 * Hyphens are ASCII per AGENTS.md voice lock.
 */
export function HeroIllustration({ className }: HeroIllustrationProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-2xl border border-navy-800/20 bg-navy-800 shadow-md",
        className,
      )}
    >
      <svg
        viewBox="0 0 480 360"
        role="presentation"
        className="block h-auto w-full"
      >
        <defs>
          <linearGradient id="hero-fade" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-navy-800)" />
            <stop offset="100%" stopColor="var(--color-navy-900)" />
          </linearGradient>
          <clipPath id="hero-card-clip">
            <rect x="70" y="44" width="340" height="272" rx="14" />
          </clipPath>
        </defs>

        {/* Navy gradient background */}
        <rect width="480" height="360" fill="url(#hero-fade)" />

        {/* Decorative sage dots in the corners */}
        <g fill="var(--color-sage-500)" opacity="0.55">
          <circle cx="36" cy="36" r="1.5" />
          <circle cx="56" cy="56" r="1" />
          <circle cx="36" cy="76" r="1" />
          <circle cx="448" cy="290" r="1.5" />
          <circle cx="430" cy="312" r="1" />
          <circle cx="452" cy="270" r="0.8" />
        </g>

        {/* Back card (slight offset, low opacity) for depth */}
        <rect
          x="80"
          y="56"
          width="340"
          height="272"
          rx="14"
          fill="var(--color-cream-50)"
          opacity="0.12"
        />

        {/* Card body, clipped to rounded rect */}
        <g clipPath="url(#hero-card-clip)">
          {/* Cream body fill */}
          <rect
            x="70"
            y="44"
            width="340"
            height="272"
            fill="var(--color-cream-50)"
          />

          {/* Navy header band */}
          <rect
            x="70"
            y="44"
            width="340"
            height="44"
            fill="var(--color-navy-800)"
          />

          {/* Sage hairline below header */}
          <rect
            x="70"
            y="88"
            width="340"
            height="2"
            fill="var(--color-sage-500)"
          />

          {/* ClearPath wordmark on header */}
          <text
            x="90"
            y="68"
            fontFamily="var(--font-display), system-ui, sans-serif"
            fontSize="14"
            fontWeight="600"
            fill="var(--color-cream-50)"
            letterSpacing="-0.2"
          >
            ClearPath
          </text>
          <text
            x="90"
            y="82"
            fontFamily="var(--font-display), system-ui, sans-serif"
            fontSize="7"
            fill="var(--color-sage-500)"
            letterSpacing="2"
          >
            AI AUDIT
          </text>

          {/* Right header label */}
          <text
            x="390"
            y="76"
            textAnchor="end"
            fontFamily="var(--font-display), system-ui, sans-serif"
            fontSize="8"
            fill="var(--color-cream-50)"
            opacity="0.7"
            letterSpacing="1.5"
          >
            FINDINGS
          </text>

          {/* Sub-eyebrow */}
          <text
            x="90"
            y="116"
            fontFamily="var(--font-display), system-ui, sans-serif"
            fontSize="8"
            fontWeight="500"
            fill="var(--color-sage-600)"
            letterSpacing="2"
          >
            YOUR WEEK, AUDITED
          </text>

          {/* Section 1 */}
          <circle
            cx="100"
            cy="148"
            r="11"
            fill="none"
            stroke="var(--color-sage-500)"
            strokeWidth="1.5"
          />
          <text
            x="100"
            y="152"
            textAnchor="middle"
            fontFamily="var(--font-display), system-ui, sans-serif"
            fontSize="10"
            fontWeight="600"
            fill="var(--color-sage-600)"
          >
            1
          </text>
          <rect
            x="120"
            y="142"
            width="170"
            height="3"
            rx="1.5"
            fill="var(--color-graphite-500)"
            opacity="0.65"
          />
          <rect
            x="120"
            y="151"
            width="120"
            height="3"
            rx="1.5"
            fill="var(--color-graphite-500)"
            opacity="0.4"
          />
          <rect
            x="320"
            y="138"
            width="70"
            height="20"
            rx="10"
            fill="var(--color-sage-500)"
            opacity="0.2"
          />
          <text
            x="355"
            y="152"
            textAnchor="middle"
            fontFamily="var(--font-display), system-ui, sans-serif"
            fontSize="9"
            fontWeight="700"
            fill="var(--color-sage-600)"
            letterSpacing="0.4"
          >
            4-6 HRS
          </text>

          {/* Section 2 */}
          <circle
            cx="100"
            cy="194"
            r="11"
            fill="none"
            stroke="var(--color-sage-500)"
            strokeWidth="1.5"
          />
          <text
            x="100"
            y="198"
            textAnchor="middle"
            fontFamily="var(--font-display), system-ui, sans-serif"
            fontSize="10"
            fontWeight="600"
            fill="var(--color-sage-600)"
          >
            2
          </text>
          <rect
            x="120"
            y="188"
            width="155"
            height="3"
            rx="1.5"
            fill="var(--color-graphite-500)"
            opacity="0.65"
          />
          <rect
            x="120"
            y="197"
            width="135"
            height="3"
            rx="1.5"
            fill="var(--color-graphite-500)"
            opacity="0.4"
          />
          <rect
            x="320"
            y="184"
            width="70"
            height="20"
            rx="10"
            fill="var(--color-sage-500)"
            opacity="0.2"
          />
          <text
            x="355"
            y="198"
            textAnchor="middle"
            fontFamily="var(--font-display), system-ui, sans-serif"
            fontSize="9"
            fontWeight="700"
            fill="var(--color-sage-600)"
            letterSpacing="0.4"
          >
            5-7 HRS
          </text>

          {/* Section 3 */}
          <circle
            cx="100"
            cy="240"
            r="11"
            fill="none"
            stroke="var(--color-sage-500)"
            strokeWidth="1.5"
          />
          <text
            x="100"
            y="244"
            textAnchor="middle"
            fontFamily="var(--font-display), system-ui, sans-serif"
            fontSize="10"
            fontWeight="600"
            fill="var(--color-sage-600)"
          >
            3
          </text>
          <rect
            x="120"
            y="234"
            width="180"
            height="3"
            rx="1.5"
            fill="var(--color-graphite-500)"
            opacity="0.65"
          />
          <rect
            x="120"
            y="243"
            width="100"
            height="3"
            rx="1.5"
            fill="var(--color-graphite-500)"
            opacity="0.4"
          />
          <rect
            x="316"
            y="230"
            width="74"
            height="20"
            rx="10"
            fill="var(--color-sage-500)"
            opacity="0.2"
          />
          <text
            x="353"
            y="244"
            textAnchor="middle"
            fontFamily="var(--font-display), system-ui, sans-serif"
            fontSize="9"
            fontWeight="700"
            fill="var(--color-sage-600)"
            letterSpacing="0.4"
          >
            8-10 HRS
          </text>

          {/* Divider above the total */}
          <line
            x1="90"
            y1="272"
            x2="390"
            y2="272"
            stroke="var(--color-navy-800)"
            strokeOpacity="0.15"
            strokeWidth="1"
          />

          {/* Total row */}
          <text
            x="90"
            y="296"
            fontFamily="var(--font-display), system-ui, sans-serif"
            fontSize="9"
            fontWeight="500"
            fill="var(--color-graphite-500)"
            letterSpacing="2"
          >
            SAVED PER WEEK
          </text>
          <text
            x="390"
            y="302"
            textAnchor="end"
            fontFamily="var(--font-display), system-ui, sans-serif"
            fontSize="22"
            fontWeight="700"
            fill="var(--color-sage-600)"
            letterSpacing="-0.5"
          >
            5-10 HRS
          </text>
        </g>

        {/* Crisp card outline drawn outside the clip */}
        <rect
          x="70"
          y="44"
          width="340"
          height="272"
          rx="14"
          fill="none"
          stroke="var(--color-navy-800)"
          strokeOpacity="0.3"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}
