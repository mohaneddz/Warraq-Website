"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-copper">Error</p>
        <h1 className="mt-3 font-display text-[32px] font-semibold tracking-tight">Something went wrong</h1>
        <p className="mt-3 max-w-sm text-[14.5px] leading-relaxed text-muted">
          Try reloading the page. If the problem continues, check back later.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => reset()}
            className="rounded-xl bg-emerald px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-emerald-hover"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-xl border border-line px-5 py-2.5 text-[13px] font-bold transition-colors hover:bg-emerald-soft"
          >
            Back to home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
