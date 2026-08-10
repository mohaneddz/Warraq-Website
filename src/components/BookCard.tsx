import Link from "next/link";
import type { CatalogBook } from "@/lib/catalog";

function availability(copies: { status: string }[]) {
  const available = copies.filter((c) => c.status === "available").length;
  return { available, total: copies.length };
}

export function BookCard({ book }: { book: CatalogBook }) {
  const authors = book.book_authors.map((ba) => ba.authors.name).join(", ");
  const { available, total } = availability(book.copies);

  return (
    <Link
      href={`/catalog/${book.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-card transition-transform hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex aspect-[3/4] items-center justify-center bg-parchment">
        {book.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={book.cover_url}
            alt={book.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="px-4 text-center font-display text-sm font-semibold text-ink/30">
            {book.title}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-[11px] font-bold uppercase tracking-wide text-copper">
          {book.item_type}
        </span>
        <h3 className="line-clamp-2 font-display text-[15px] font-bold text-ink group-hover:text-emerald">
          {book.title}
        </h3>
        {authors && <p className="line-clamp-1 text-[13px] text-ink/60">{authors}</p>}
        <div className="mt-auto flex items-center justify-between pt-2 text-[12px]">
          <span className="text-ink/50">{book.publication_year ?? "—"}</span>
          <span
            className={
              available > 0
                ? "font-semibold text-emerald"
                : "font-semibold text-ink/40"
            }
          >
            {total === 0 ? "No copies" : available > 0 ? `${available} available` : "On loan"}
          </span>
        </div>
      </div>
    </Link>
  );
}
