import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BookCard } from "@/components/BookCard";
import { SearchBar } from "@/components/SearchBar";
import { getCatalogStats, getSubjects, searchCatalog } from "@/lib/catalog";

export const revalidate = 300;

export default async function Home() {
  const [stats, subjects, { books }] = await Promise.all([
    getCatalogStats(),
    getSubjects(10),
    searchCatalog({ page: 1, pageSize: 10, sort: "recent" }),
  ]);

  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-line">
          <div className="grain absolute inset-0" aria-hidden />
          <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center sm:py-28">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-copper">
              Mustapha Bacha Hospital
            </p>

            <h1
              className="font-display text-[38px] font-semibold leading-[1.08] tracking-tight sm:text-[54px]"
              style={{ textWrap: "balance" }}
            >
              The hospital library, open to search.
            </h1>

            <p className="max-w-lg text-[16px] leading-relaxed text-muted" style={{ textWrap: "pretty" }}>
              Every book, journal, and final-year project held by the library — with live
              availability drawn from the same records the front desk uses.
            </p>

            <SearchBar variant="hero" />

            <dl className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-4">
              <Stat value={stats.bookCount} label="titles" />
              <Stat value={stats.copyCount} label="copies" />
              <Stat value={stats.authorCount} label="authors" />
            </dl>
          </div>
        </section>

        {/* Subjects */}
        {subjects.length > 0 && (
          <section className="mx-auto max-w-6xl px-6 py-16">
            <SectionHeading title="Browse by subject" />
            <div className="flex flex-wrap gap-2">
              {subjects.map((s) => (
                <Link
                  key={s.name}
                  href={`/catalog?category=${encodeURIComponent(s.name)}`}
                  className="group inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-[13px] font-semibold transition-colors hover:border-emerald hover:bg-emerald-soft hover:text-emerald"
                >
                  {s.name}
                  <span className="text-[11px] font-bold text-faint transition-colors group-hover:text-emerald">
                    {s.count}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recently added */}
        {books.length > 0 && (
          <section className="mx-auto max-w-6xl px-6 pb-24">
            <SectionHeading
              title="Recently added"
              action={{ href: "/catalog?sort=recent", label: "View all" }}
            />
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <dt className="sr-only">{label}</dt>
      <dd className="font-display text-[22px] font-semibold">{value.toLocaleString()}</dd>
      <span className="text-[13px] font-semibold text-faint">{label}</span>
    </div>
  );
}

function SectionHeading({
  title,
  action,
}: {
  title: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <h2 className="font-display text-[24px] font-semibold tracking-tight">{title}</h2>
      {action && (
        <Link
          href={action.href}
          className="shrink-0 text-[13px] font-semibold text-emerald underline-offset-4 hover:underline"
        >
          {action.label} →
        </Link>
      )}
    </div>
  );
}
