"use client";

// Cal.com inline booking embed.
//
// Wraps `@calcom/embed-react`'s <Cal /> component with the same
// IntersectionObserver lazy-mount used by TallyEmbed (cal.com loads a
// script chain that hurts Lighthouse if it boots eagerly above the fold).
// The wrapper reserves a min-height to prevent CLS while the iframe loads.
//
// `Cal` is loaded via `next/dynamic({ ssr:false })` and `getCalApi` via a
// dynamic `import()` inside the post-mount effect - together they keep the
// `@calcom/embed-react` bundle out of the route's initial JS payload until
// IntersectionObserver fires.

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const Cal = dynamic(() => import("@calcom/embed-react"), { ssr: false });

type CalComEmbedProps = {
  /** The "username/event-type" segment after cal.com/. */
  calLink: string;
  title?: string;
  /** Pixels of viewport pre-load before the embed mounts. */
  rootMargin?: string;
  /** Minimum height to reserve before the embed renders - prevents CLS. */
  minHeightClass?: string;
};

export function CalComEmbed({
  calLink,
  title = "Book a discovery call",
  rootMargin = "200px",
  minHeightClass = "min-h-[640px]",
}: CalComEmbedProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const node = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShouldMount(true);
            io.disconnect();
            return;
          }
        }
      },
      { rootMargin },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [rootMargin]);

  useEffect(() => {
    if (!shouldMount) return;
    let cancelled = false;
    (async () => {
      const { getCalApi } = await import("@calcom/embed-react");
      const cal = await getCalApi();
      if (cancelled) return;
      cal("ui", {
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [shouldMount]);

  return (
    <div ref={ref} className={`${minHeightClass} w-full`}>
      {shouldMount ? (
        <Cal
          calLink={calLink}
          style={{ width: "100%", height: "100%", minHeight: "640px" }}
          aria-label={title}
        />
      ) : (
        <div
          aria-hidden="true"
          className={`${minHeightClass} w-full rounded-2xl border border-navy-800/10 bg-cream-50`}
        />
      )}
    </div>
  );
}
