import Link from "next/link";
import { BookCover } from "./BookCover";
import { authorsOf, availabilityOf, type CatalogBook } from "@/lib/catalog";

const TYPE_LABEL: Record<string, string> = {
  book: "Book",
  fyp: "PFE",
  journal: "Journal",
  other: "Other",
};

export function BookCard({ book }: { book: CatalogBook }) {
  const authors = authorsOf(book);
  const { total, available, unavailableLabel } = availabilityOf(book);

  return (
    <Link
      href={`/catalog/${book.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-line-strong hover:shadow-lift"
    >
      <BookCover
        title={book.title}
        author={authors}
        coverUrl={book.cover_url}
        seed={book.id}
        className="aspect-3/4 w-full"
      />

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-copper">
          {TYPE_LABEL[book.item_type] ?? book.item_type}
        </span>

        <h3 className="line-clamp-2 font-display text-[15px] font-semibold leading-snug transition-colors group-hover:text-emerald">
          {book.title}
        </h3>

        {authors && <p className="line-clamp-1 text-[12.5px] text-muted">{authors}</p>}

        <div className="mt-auto flex items-center justify-between pt-3 text-[11.5px] font-semibold">
          <span className="text-faint">{book.publication_year ?? "—"}</span>
          <AvailabilityPill total={total} available={available} unavailableLabel={unavailableLabel} />
        </div>
      </div>
    </Link>
  );
}

export function AvailabilityPill({
  total,
  available,
  unavailableLabel,
}: {
  total: number;
  available: number;
  unavailableLabel: string;
}) {
  if (total === 0) return <span className="text-faint">No copies</span>;

  const on = available > 0;
  return (
    <span className={`inline-flex items-center gap-1.5 ${on ? "text-emerald" : "text-faint"}`}>
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: on ? "var(--emerald)" : "var(--faint)" }}
      />
      {on ? `${available} available` : unavailableLabel}
    </span>
  );
}
