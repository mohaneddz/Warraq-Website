import { Header } from "@/components/Header";
import { BookCard } from "@/components/BookCard";
import { SearchForm } from "@/components/SearchForm";
import { getCategories, searchCatalog } from "@/lib/catalog";

const PAGE_SIZE = 24;

type SearchParams = {
  q?: string;
  category?: string;
  itemType?: string;
  page?: string;
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const [categories, { books, total }] = await Promise.all([
    getCategories(),
    searchCatalog({
      query: params.q,
      category: params.category,
      itemType: params.itemType,
      page,
      pageSize: PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(p: number) {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.category) sp.set("category", params.category);
    if (params.itemType) sp.set("itemType", params.itemType);
    sp.set("page", String(p));
    return `/catalog?${sp.toString()}`;
  }

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <h1 className="font-display text-2xl font-bold text-ink">Catalog</h1>
        <p className="mb-6 text-[14px] text-ink/60">
          {total.toLocaleString()} title{total === 1 ? "" : "s"} in the collection
        </p>

        <SearchForm categories={categories} />

        {books.length === 0 ? (
          <p className="py-16 text-center text-[14px] text-ink/50">
            No titles matched your search.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav className="mt-10 flex items-center justify-center gap-2 text-[13px] font-semibold">
            {page > 1 && (
              <a href={pageHref(page - 1)} className="rounded-lg border border-black/10 px-3 py-1.5 hover:border-emerald">
                Previous
              </a>
            )}
            <span className="px-2 text-ink/50">
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <a href={pageHref(page + 1)} className="rounded-lg border border-black/10 px-3 py-1.5 hover:border-emerald">
                Next
              </a>
            )}
          </nav>
        )}
      </main>
    </>
  );
}
