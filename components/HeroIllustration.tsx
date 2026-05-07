import * as React from "react";

import { cn } from "@/lib/utils";

type HeroIllustrationProps = {
  className?: string;
};

type DrawDelayStyle = React.CSSProperties & { "--draw-delay"?: string };

const delay = (seconds: number): DrawDelayStyle => ({
  "--draw-delay": `${seconds}s`,
});

/*
 * Five horizontal ribbons drawn left-to-right via stroke-dashoffset. Bottom
 * two are tangled scribbles in graphite (the "before"); top three resolve
 * into smooth sage curves (the "after"), with a cream marker pinning the
 * destination on the cleanest line. pathLength="1" lets the .draw-path
 * utility in globals.css use a single dashoffset value across every path
 * regardless of geometry. Decorative — aria-hidden on the wrapper.
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
          <linearGradient id="hero-fade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-navy-800)" />
            <stop offset="100%" stopColor="var(--color-navy-700)" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="480" height="360" fill="url(#hero-fade)" />

        {/* Bottom two: tangled scribbles, graphite, low opacity. */}
        <path
          pathLength="1"
          d="M 24 290 q 20 -22 40 0 t 40 0 t 40 12 t 40 -16 t 40 6 t 40 -8 t 40 4 t 40 -10 t 40 0 t 40 6"
          fill="none"
          stroke="var(--color-graphite-500)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.55"
          className="draw-path"
          style={delay(0)}
        />
        <path
          pathLength="1"
          d="M 24 250 q 24 -28 48 -4 t 48 8 t 48 -18 t 48 12 t 48 -10 t 48 6 t 48 -14 t 48 4"
          fill="none"
          stroke="var(--color-graphite-500)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.4"
          className="draw-path"
          style={delay(0.1)}
        />

        {/* Middle: transition. */}
        <path
          pathLength="1"
          d="M 24 200 C 120 200, 200 180, 280 170 S 420 150, 456 148"
          fill="none"
          stroke="var(--color-sage-600)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeOpacity="0.85"
          className="draw-path"
          style={delay(0.35)}
        />

        {/* Top two: clean curves resolving to the destination. */}
        <path
          pathLength="1"
          d="M 24 150 C 140 150, 240 120, 340 108 S 440 96, 456 94"
          fill="none"
          stroke="var(--color-sage-500)"
          strokeWidth="3"
          strokeLinecap="round"
          className="draw-path"
          style={delay(0.55)}
        />
        <path
          pathLength="1"
          d="M 24 100 C 160 100, 280 70, 380 58 S 444 50, 456 48"
          fill="none"
          stroke="var(--color-cream-50)"
          strokeWidth="3"
          strokeLinecap="round"
          className="draw-path"
          style={delay(0.75)}
        />

        {/* Destination marker — fades + scales in once the path arrives. */}
        <circle
          cx="456"
          cy="48"
          r="7"
          fill="var(--color-sage-500)"
          stroke="var(--color-cream-50)"
          strokeWidth="2"
          className="hero-marker"
          style={delay(1.25)}
        />
      </svg>
    </div>
  );
}
