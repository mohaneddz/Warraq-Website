import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Covers are hotlinked from these providers (see src/lib/external.ts / the
    // App/scripts/backfill_covers.mjs cover backfill). Routing them through Next's
    // image optimizer — rather than plain <img> tags — is what actually fixes the
    // "covers keep refreshing" symptom: Next re-encodes and serves them from our own
    // domain with a long, immutable Cache-Control header, instead of every render
    // depending on Open Library / Google Books' own (weak, short-lived) cache headers.
    remotePatterns: [
      { protocol: "https", hostname: "covers.openlibrary.org" },
      { protocol: "https", hostname: "books.google.com" },
      { protocol: "https", hostname: "books.googleusercontent.com" },
    ],
    // Covers never change once written, so cache the optimized output for 30 days
    // instead of Next's 60-second default.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
