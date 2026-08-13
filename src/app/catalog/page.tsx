import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BookCard } from "@/components/BookCard";
import { SearchBar } from "@/components/SearchBar";
import { getCategories, searchCatalog } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Catalogue",
  description:
    "Browse the full Warraq catalogue: books, final-year projects, and journals held by the Mustapha Bacha Hospital library, with live availability.",
};

const PAGE_SIZE = 24;

type SearchParams = {
  q?: string;
  category?: string;
  itemType?: string;
  sort?: string;
  page?: string;
};

const TYPE_LABEL: Record<string, string> = {
  book: "Books",
  fyp: "Final-year projects",
  journal: "Journals",
  other: "Other",
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const sort = (["title", "recent", "year"] as const).find((s) => s === params.sort) ?? "title";

  const [categories, { books, total }] = await Promise.all([
    getCategories(),
    searchCatalog({
      query: params.q,
      category: params.category,
      itemType: params.itemType,
      sort,
      page,
      pageSize: PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildHref = (overrides: Partial<SearchParams>) => {
    const sp = new URLSearchParams();
    const merged = { ...params, ...overrides };
    for (const key of ["q", "category", "itemType", "sort", "page"] as const) {
      const value = merged[key];
      if (value && !(key === "page" && value === "1") && !(key === "sort" && value === "title")) {
        sp.set(key, String(value));
      }
    }
    const qs = sp.toString();
    return qs ? `/catalog?${qs}` : "/catalog";
  };

  const activeFilters = [
    params.q && { key: "q" as const, label: `“${params.q}”` },
    params.itemType && { key: "itemType" as const, label: TYPE_LABEL[params.itemType] ?? params.itemType },
    params.category && { key: "category" as const, label: params.category },
  ].filter(Boolean) as { key: keyof SearchParams; label: string }[];

  return (
    <>
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <h1 className="font-display text-[30px] font-semibold tracking-tight">Catalogue</h1>
        <p className="mb-6 mt-1 text-[14px] text-muted">
          {total.toLocaleString()} {total === 1 ? "title" : "titles"}
          {activeFilters.length > 0 ? " matching your search" : " in the collection"}
        </p>

        <SearchBar
          categories={categories}
          defaults={{ q: params.q, itemType: params.itemType, category: params.category, sort }}
        />

        {activeFilters.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {activeFilters.map((f) => (
              <Link
                key={f.key}
                href={buildHref({ [f.key]: undefined, page: undefined })}
                className="group inline-flex items-center gap-1.5 rounded-full border border-line bg-surface py-1.5 pl-3 pr-2 text-[12.5px] font-semibold transition-colors hover:border-line-strong"
              >
                {f.label}
                <span aria-hidden className="text-faint transition-colors group-hover:text-copper">
                  ✕
                </span>
                <span className="sr-only">Remove filter</span>
              </Link>
            ))}
            <Link href="/catalog" className="px-1 text-[12.5px] font-semibold text-muted hover:text-emerald">
              Clear all
            </Link>
          </div>
        )}

        {books.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-3">
            <PageLink href={buildHref({ page: String(page - 1) })} disabled={page === 1}>
              ← Previous
            </PageLink>
            <span className="text-[13px] font-semibold text-muted">
              Page {page} of {totalPages}
            </span>
            <PageLink href={buildHref({ page: String(page + 1) })} disabled={page === totalPages}>
              Next →
            </PageLink>
          </nav>
        )}
      </main>

      <Footer />
    </>
  );
}

function PageLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span aria-disabled className="rounded-xl border border-line px-4 py-2 text-[13px] font-semibold text-faint opacity-50">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="rounded-xl border border-line bg-surface px-4 py-2 text-[13px] font-semibold transition-colors hover:border-emerald hover:text-emerald"
    >
      {children}
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="mt-8 rounded-2xl border border-dashed border-line-strong px-6 py-20 text-center">
      <p className="font-display text-[20px] font-semibold">No titles matched</p>
      <p className="mx-auto mt-2 max-w-sm text-[14px] text-muted">
        Try a shorter phrase, or search by author surname: many records use abbreviated
        or French-language titles.
      </p>
      <Link
        href="/catalog"
        className="mt-6 inline-block rounded-xl bg-emerald px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-emerald-hover"
      >
        Browse everything
      </Link>
    </div>
  );
}
