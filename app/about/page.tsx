import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Image from "next/image";

import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { Heading } from "@/components/Heading";
import { Section } from "@/components/Section";
import { CTASection } from "@/components/sections/CTASection";
import { ABOUT_COPY } from "@/content/copy";

export const metadata: Metadata = {
  title: { absolute: "About Justin | ClearPath AI Audit" },
  description:
    "Justin Whalen. Twelve-plus years on the operations side of a regional ski resort in Western New York. ClearPath is the same idea, scaled.",
};

// Prefer the optimized WebP (75 KB) when present; fall back to the source JPEG
// (2.4 MB) so the page still renders if the WebP step hasn't been run yet.
// Either file's presence flips us out of the "photo coming soon" placeholder.
const PUBLIC_DIR = path.join(process.cwd(), "public");
const photoSrc = fs.existsSync(path.join(PUBLIC_DIR, "justin.webp"))
  ? "/justin.webp"
  : fs.existsSync(path.join(PUBLIC_DIR, "justin.jpg"))
    ? "/justin.jpg"
    : null;
const photoExists = photoSrc !== null;
// Source dimensions: justin.webp is 1200x1766 (justin.jpg is 1320x1943); both
// preserve the same portrait aspect ratio. next/image needs intrinsic dims to
// avoid CLS; we display object-cover into an aspect-square frame.
const PHOTO_WIDTH = 1200;
const PHOTO_HEIGHT = 1766;
const PHOTO_ALT = "Justin Whalen with his partner Macie, in Olean, NY";
const PHOTO_CAPTION = "Justin + Macie.";

// Brand mark: prefer the optimized WebP (~13 KB); fall back to the source PNG
// (~490 KB). Same fs.existsSync gating pattern as the portrait — silently
// no-ops if the asset isn't on disk.
const logoSrc = fs.existsSync(path.join(PUBLIC_DIR, "clearpath-logo.webp"))
  ? "/clearpath-logo.webp"
  : fs.existsSync(path.join(PUBLIC_DIR, "clearpath-logo.png"))
    ? "/clearpath-logo.png"
    : null;
const LOGO_WIDTH = 784;
const LOGO_HEIGHT = 1168;

export default function AboutPage() {
  const [intro1, intro2, why, letMeShowYou] = ABOUT_COPY.bio;

  return (
    <main id="main">
      <Section background="cream" className="pt-20 md:pt-28">
        <Container>
          <div className="grid gap-12 md:grid-cols-12 md:gap-12 lg:gap-16">
            <div className="flex flex-col gap-6 md:col-span-7">
              {logoSrc && (
                <Image
                  src={logoSrc}
                  alt=""
                  width={LOGO_WIDTH}
                  height={LOGO_HEIGHT}
                  aria-hidden="true"
                  className="h-12 w-auto"
                />
              )}
              <Eyebrow>{ABOUT_COPY.eyebrow}</Eyebrow>
              <Heading as="h1" level="h1">
                {ABOUT_COPY.heading}
              </Heading>
              <div className="flex flex-col gap-5 text-lg leading-relaxed text-graphite-600">
                <p>{intro1}</p>
                <p>{intro2}</p>
              </div>

              <div className="mt-6 flex flex-col gap-5">
                <Heading as="h2" level="h3">
                  Why I built ClearPath
                </Heading>
                <div className="flex flex-col gap-5 text-lg leading-relaxed text-graphite-600">
                  <p>{why}</p>
                  <p>{letMeShowYou}</p>
                </div>
              </div>
            </div>

            <aside className="flex flex-col gap-6 md:col-span-5">
              <JustinPortrait hasPhoto={photoExists} />
              <PullQuote
                quote={ABOUT_COPY.pullQuote}
                attribution={ABOUT_COPY.pullQuoteAttribution}
              />
            </aside>
          </div>
        </Container>
      </Section>

      <CTASection
        heading={ABOUT_COPY.cta.heading}
        body={ABOUT_COPY.cta.body}
        cta={ABOUT_COPY.cta.button}
      />
    </main>
  );
}

type JustinPortraitProps = {
  hasPhoto: boolean;
};

function JustinPortrait({ hasPhoto }: JustinPortraitProps) {
  if (hasPhoto && photoSrc) {
    return (
      <figure className="flex flex-col gap-2">
        <div className="overflow-hidden rounded-2xl border border-navy-800/10 bg-graphite-500/10">
          <Image
            src={photoSrc}
            alt={PHOTO_ALT}
            width={PHOTO_WIDTH}
            height={PHOTO_HEIGHT}
            priority
            sizes="(min-width: 768px) 40vw, 100vw"
            className="aspect-square w-full object-cover object-top"
          />
        </div>
        <figcaption className="font-sans text-sm text-sage-500">
          {PHOTO_CAPTION}
        </figcaption>
      </figure>
    );
  }

  return (
    <div
      role="img"
      aria-label="Portrait of Justin Whalen, photo coming soon"
      className="flex aspect-square w-full items-end justify-start rounded-2xl border border-navy-800/10 bg-graphite-500/20 p-5"
    >
      <span className="font-display text-sm uppercase tracking-[0.18em] text-navy-800/70">
        Photo coming soon
      </span>
    </div>
  );
}

type PullQuoteProps = {
  quote: string;
  attribution: string;
};

function PullQuote({ quote, attribution }: PullQuoteProps) {
  return (
    <figure className="rounded-2xl border-l-4 border-sage-500 bg-cream-50 p-6 shadow-[0_1px_0_0_color-mix(in_srgb,var(--color-navy-950)_6%,transparent)]">
      <blockquote className="font-display text-2xl leading-snug text-navy-950">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption className="mt-3 font-sans text-sm text-graphite-500">
        {attribution}
      </figcaption>
    </figure>
  );
}
