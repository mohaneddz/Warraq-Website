import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { getBookById } from "@/lib/catalog";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await getBookById(id);
  if (!book) notFound();

  const authors = book.book_authors.map((ba) => ba.authors.name).join(", ");
  const available = book.copies.filter((c) => c.status === "available").length;

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <div className="flex flex-col gap-8 sm:flex-row">
          <div className="flex aspect-[3/4] w-full max-w-[220px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-black/10 bg-white shadow-card">
            {book.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={book.cover_url} alt={book.title} className="h-full w-full object-cover" />
            ) : (
              <span className="px-4 text-center font-display text-sm font-semibold text-ink/30">
                {book.title}
              </span>
            )}
          </div>

          <div className="flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wide text-copper">
              {book.item_type}
            </span>
            <h1 className="font-display text-2xl font-bold text-ink">{book.title}</h1>
            {book.arabic_title && (
              <p dir="rtl" className="mt-1 text-[16px] text-ink/70">
                {book.arabic_title}
              </p>
            )}
            {book.subtitle && <p className="mt-1 text-[14px] text-ink/60">{book.subtitle}</p>}
            {authors && <p className="mt-3 text-[14px] font-semibold text-ink/80">{authors}</p>}

            <div className="mt-6 grid grid-cols-2 gap-3 text-[13px]">
              <Field label="Category" value={book.categories?.name} />
              <Field label="Publisher" value={book.publishers?.name} />
              <Field label="Year" value={book.publication_year?.toString()} />
              <Field label="Language" value={book.language} />
              <Field label="ISBN" value={book.isbn13} />
              <Field label="Call number" value={book.call_number ?? book.dewey_code} />
            </div>

            <div className="mt-6 rounded-xl border border-black/10 bg-white p-4">
              <p className={available > 0 ? "font-semibold text-emerald" : "font-semibold text-ink/50"}>
                {book.copies.length === 0
                  ? "No copies on record"
                  : available > 0
                    ? `${available} of ${book.copies.length} cop${book.copies.length === 1 ? "y" : "ies"} available`
                    : "All copies currently on loan"}
              </p>
            </div>

            {book.description && (
              <p className="mt-6 whitespace-pre-line text-[14px] leading-relaxed text-ink/70">
                {book.description}
              </p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-wide text-ink/40">{label}</div>
      <div className="font-semibold text-ink">{value}</div>
    </div>
  );
}
