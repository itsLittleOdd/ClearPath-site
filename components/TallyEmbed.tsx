"use client";

// Tally.so lead-intake embed.
//
// Path A from docs/FORM_PIPELINE_PLAYBOOK.md — IntersectionObserver
// lazy-mount. The iframe is held out of the initial HTML until the wrapper
// scrolls within ~200px of the viewport, which keeps the contact page off
// the Lighthouse-mobile penalty list (Tally's iframe boots a script chain
// that tanks Performance scores when eager-mounted).
//
// BLOCKED state: until the operator creates the Tally form and exports
// `NEXT_PUBLIC_TALLY_FORM_ID`, this component renders a graceful fallback
// pointing prospects to email Justin directly. Once the env var is set, the
// real embed renders without a code change.

import { useEffect, useRef, useState } from "react";

type TallyEmbedProps = {
  /**
   * Tally form ID — the segment after `tally.so/forms/` in your form's
   * share URL. Falls back to `process.env.NEXT_PUBLIC_TALLY_FORM_ID` if
   * not provided. When neither is set, renders the fallback.
   */
  formId?: string;
  title?: string;
  /** Pixels of viewport pre-load before the iframe mounts. */
  rootMargin?: string;
  /** Minimum height to reserve before the iframe loads — prevents CLS. */
  minHeightClass?: string;
  /** Email shown in the fallback when no form ID is configured. */
  fallbackEmail?: string;
};

const FALLBACK_EMAIL = "JWhalen@ClearPathWV.com";

export function TallyEmbed({
  formId,
  title = "ClearPath Lead Intake",
  rootMargin = "200px",
  minHeightClass = "min-h-[640px]",
  fallbackEmail = FALLBACK_EMAIL,
}: TallyEmbedProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shouldMount, setShouldMount] = useState(false);

  const resolvedFormId =
    formId ?? process.env.NEXT_PUBLIC_TALLY_FORM_ID ?? "";

  useEffect(() => {
    if (!resolvedFormId || !ref.current) return;
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
  }, [resolvedFormId, rootMargin]);

  if (!resolvedFormId) {
    return <TallyFallback email={fallbackEmail} />;
  }

  const src = `https://tally.so/embed/${resolvedFormId}?alignLeft=1&hideTitle=1&transparentBackground=1`;

  return (
    <div ref={ref} className={`${minHeightClass} w-full`}>
      {shouldMount ? (
        <iframe
          src={src}
          title={title}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          className="h-[700px] w-full border-0"
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

function TallyFallback({ email }: { email: string }) {
  return (
    <div className="rounded-2xl border border-navy-800/10 bg-navy-800/[0.04] p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
      <p className="font-display text-lg font-medium text-navy-950">
        Form coming online shortly
      </p>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-graphite-600">
        We&apos;re finishing the lead-intake form. Until it&apos;s live, the
        fastest path is the discovery call on the calendar — or email Justin
        directly and he&apos;ll get back inside one business day.
      </p>
      <a
        href={`mailto:${email}?subject=ClearPath%20—%20Discovery%20call%20question`}
        className="mt-6 inline-flex items-center justify-center rounded-lg bg-sage-500 px-5 py-2.5 text-sm font-medium text-navy-950 shadow-sm transition-colors hover:bg-sage-600 hover:text-cream-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500 focus-visible:ring-offset-2"
      >
        Email Justin: {email}
      </a>
    </div>
  );
}
