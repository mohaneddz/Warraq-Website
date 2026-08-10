import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { BookCard } from "@/components/BookCard";
import { getCatalogStats, searchCatalog } from "@/lib/catalog";

export const revalidate = 300;

export default async function Home() {
  const [{ bookCount, copyCount }, { books: recent }] = await Promise.all([
    getCatalogStats(),
    searchCatalog({ page: 1, pageSize: 8, sort: "recent" }),
  ]);

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-20 text-center">
          <Image src="/brand/warraq-symbol.png" alt="Warraq" width={64} height={64} />
          <h1 className="font-display text-4xl font-extrabold text-ink sm:text-5xl">
            The Mustapha Bacha Hospital Library, online.
          </h1>
          <p className="max-w-2xl text-[17px] text-ink/60">
            Search the full catalog of books, final-year projects, and journals held by
            the library — updated live from the same records the front desk uses.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/catalog"
              className="rounded-xl bg-emerald px-6 py-3 text-[14px] font-bold text-white transition-colors hover:bg-emerald-light"
            >
              Browse the catalog
            </Link>
            <div className="flex items-center gap-4 text-[13px] font-semibold text-ink/50">
              <span>{bookCount.toLocaleString()} titles</span>
              <span aria-hidden>·</span>
              <span>{copyCount.toLocaleString()} copies</span>
            </div>
          </div>
        </section>

        {recent.length > 0 && (
          <section className="mx-auto max-w-6xl px-6 pb-24">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-ink">Recently added</h2>
              <Link href="/catalog" className="text-[13px] font-semibold text-emerald hover:underline">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {recent.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </section>
        )}
      </main>
      <footer className="border-t border-black/10 px-6 py-8 text-center text-[12px] text-ink/40">
        Warraq — Mustapha Bacha Hospital Library
      </footer>
    </>
  );
}
