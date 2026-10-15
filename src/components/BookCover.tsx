"use client";

import Image from "next/image";
import { useState } from "react";

/* Most of this collection is 1950s–90s French medical monographs, which the public
   metadata APIs simply do not hold cover art for. Rather than leave the grid full of
   empty boxes, unmatched books get a generated cover: a deterministic colourway drawn
   from a curated set (never a random hue, which would clash with the parchment palette)
   so the same book always renders identically, and the wall of results still reads as
   a designed shelf. */
const PALETTE = [
  { from: "#1e5246", to: "#123029", ink: "#f4efe4" }, // emerald
  { from: "#193a45", to: "#0e2028", ink: "#eef2f2" }, // deep teal
  { from: "#8a4a2a", to: "#5b3120", ink: "#fbf0e6" }, // copper
  { from: "#4c2b46", to: "#2f1b2c", ink: "#f6edf3" }, // plum
  { from: "#2d4160", to: "#1a2840", ink: "#eef1f7" }, // slate blue
  { from: "#4a4826", to: "#2c2b15", ink: "#f5f2e2" }, // olive
];

function hash(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

type Props = {
  title: string;
  author?: string;
  coverUrl?: string | null;
  seed: string;
  /** Detail pages render the generated cover larger, so its type scales up with it. */
  size?: "card" | "detail";
  className?: string;
};

/* Open Library cover URLs redirect to archive.org, which can take seconds on a cold
   fetch, and Next's optimizer gives up on an upstream after 7s. Each rendered width is
   its own optimizer cache entry, so the same cover can load on a card and time out on
   the detail page. A failed optimized load therefore retries the original URL straight
   from the browser, which has no such limit, before settling for the generated cover. */
type CoverAttempt = "optimized" | "direct" | "failed";

export function BookCover({ title, author, coverUrl, seed, size = "card", className = "" }: Props) {
  const [attempt, setAttempt] = useState<CoverAttempt>("optimized");
  const showImage = coverUrl && attempt !== "failed";

  if (showImage) {
    return (
      <div className={`relative overflow-hidden bg-sunken ${className}`}>
        {/* Routed through Next's image optimizer (see next.config.ts remotePatterns) so
            the browser gets a long-lived, immutable response from our own domain instead
            of re-fetching from Open Library / Google Books on every render — that
            external round-trip, with their own short cache lifetimes, is what caused
            covers to visibly reload while browsing. */}
        <Image
          key={attempt}
          src={coverUrl}
          unoptimized={attempt === "direct"}
          alt={`Cover of ${title}`}
          fill
          sizes={
            size === "detail"
              ? "260px"
              : "(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw"
          }
          // Detail pages show a single cover above the fold — it's the page's LCP
          // element, so it should preload eagerly rather than wait on an intersection
          // trigger. Grid thumbnails stay lazy since dozens render per page.
          priority={size === "detail"}
          loading={size === "detail" ? undefined : "lazy"}
          onError={() => setAttempt(attempt === "optimized" ? "direct" : "failed")}
          className="object-cover"
        />
      </div>
    );
  }

  const theme = PALETTE[hash(seed) % PALETTE.length];
  const detail = size === "detail";

  return (
    <div
      role="img"
      aria-label={`${title}: no cover image available`}
      className={`relative flex flex-col justify-between overflow-hidden ${className}`}
      style={{ background: `linear-gradient(150deg, ${theme.from}, ${theme.to})`, color: theme.ink }}
    >
      {/* Spine: a hairline and a soft wash down the binding edge, which is what stops
          the shape reading as a flat coloured rectangle. */}
      <div
        className="absolute inset-y-0 left-0"
        style={{
          width: detail ? 14 : 9,
          background: "linear-gradient(90deg, rgba(0,0,0,.26), rgba(0,0,0,0))",
        }}
      />
      <div className="absolute inset-y-0 left-0" style={{ width: 1, background: "rgba(255,255,255,.16)" }} />

      <div className={detail ? "px-7 pt-8" : "px-4 pt-5"}>
        <div
          style={{ background: "currentColor", opacity: 0.5 }}
          className={detail ? "h-px w-10" : "h-px w-6"}
        />
      </div>

      <div className={`flex-1 ${detail ? "px-7 py-5" : "px-4 py-3"} flex items-center`}>
        <p
          className={`font-display ${detail ? "line-clamp-4 text-[22px] leading-snug" : "line-clamp-4 text-[13px] leading-snug"} font-semibold`}
          style={{ textWrap: "balance" }}
        >
          {title}
        </p>
      </div>

      <div className={detail ? "px-7 pb-8" : "px-4 pb-5"}>
        {author && (
          <p
            className={`${detail ? "text-[11px]" : "text-[9px]"} font-semibold uppercase tracking-[0.14em] line-clamp-2`}
            style={{ opacity: 0.72 }}
          >
            {author}
          </p>
        )}
      </div>

      <div className="grain absolute inset-0" />
    </div>
  );
}
