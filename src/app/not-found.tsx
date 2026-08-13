import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-copper">404</p>
        <h1 className="mt-3 font-display text-[32px] font-semibold tracking-tight">Page not found</h1>
        <p className="mt-3 max-w-sm text-[14.5px] leading-relaxed text-muted">
          The page you are looking for does not exist, or may have moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-emerald px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-emerald-hover"
        >
          Back to home
        </Link>
      </main>
      <Footer />
    </>
  );
}
