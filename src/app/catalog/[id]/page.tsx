import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BookCover } from "@/components/BookCover";
import { authorsOf, availabilityOf, getBookById } from "@/lib/catalog";
import { externalLinksFor } from "@/lib/external";

export const revalidate = 300;

const TYPE_LABEL: Record<string, string> = {
  book: "Book",
  fyp: "Final-year project",
  journal: "Journal",
  other: "Other",
};

const STATUS_LABEL: Record<string, string> = {
  available: "Available",
  "on-loan": "On loan",
  reserved: "Reserved",
  repair: "In repair",
  lost: "Lost",
  archived: "Archived",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const book = await getBookById(id);
  if (!book) return { title: "Not found" };
  const authors = authorsOf(book);
  const description = authors ? `${book.title} by ${authors}` : book.title;
  return {
    title: book.title,
    description,
    alternates: { canonical: `/catalog/${id}` },
    openGraph: {
      title: book.title,
      description,
      type: "book",
      isbn: book.isbn13 ?? book.isbn10 ?? undefined,
      images: book.cover_url ? [book.cover_url] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: book.title,
      description,
    },
  };
}

/** Escapes `</` so a book field containing literal script-closing text can't break out
 *  of the inline JSON-LD <script> tag it's embedded in. */
function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await getBookById(id);
  if (!book) notFound();

  const authors = authorsOf(book);
  const { total, available } = availabilityOf(book);
  const links = externalLinksFor(book);

  const statusCounts = book.copies.reduce<Record<string, number>>((acc, c) => {
    acc[c.status] = (acc[c.status] ?? 0) + 1;
    return acc;
  }, {});

  const tags = (book.tags ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const bookLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    ...(authors && { author: { "@type": "Person", name: authors } }),
    ...(book.description && { description: book.description }),
    ...(book.isbn13 || book.isbn10
      ? { isbn: book.isbn13 ?? book.isbn10 }
      : {}),
    ...(book.publication_year && { datePublished: String(book.publication_year) }),
    ...(book.publishers?.name && {
      publisher: { "@type": "Organization", name: book.publishers.name },
    }),
    ...(book.language && { inLanguage: book.language }),
    ...(book.page_count && { numberOfPages: book.page_count }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(bookLd) }}
      />
      <Header />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <Link
          href="/catalog"
          className="inline-block text-[13px] font-semibold text-muted transition-colors hover:text-emerald"
        >
          ← Back to catalogue
        </Link>

        <div className="mt-6 grid gap-10 md:grid-cols-[260px_1fr]">
          {/* Cover + availability */}
          <div className="space-y-4">
            <BookCover
              title={book.title}
              author={authors}
              coverUrl={book.cover_url}
              seed={book.id}
              size="detail"
              className="aspect-3/4 w-full overflow-hidden rounded-2xl border border-line shadow-lift"
            />

            <div className="rounded-2xl border border-line bg-surface p-4">
              <p className="font-display text-[16px] font-semibold">
                {total === 0
                  ? "No copies on record"
                  : available > 0
                    ? `${available} of ${total} available`
                    : "All copies on loan"}
              </p>

              {total > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <li key={status} className="flex items-center justify-between text-[12.5px]">
                      <span className="text-muted">{STATUS_LABEL[status] ?? status}</span>
                      <span className="font-semibold">{count}</span>
                    </li>
                  ))}
                </ul>
              )}

              <p className="mt-4 border-t border-line pt-3 text-[12px] leading-relaxed text-faint">
                Consultation and borrowing are handled at the library desk; this catalogue is
                for reference only.
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="min-w-0">
            <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-copper">
              {TYPE_LABEL[book.item_type] ?? book.item_type}
            </span>

            <h1
              className="mt-1 font-display text-[30px] font-semibold leading-[1.15] tracking-tight"
              style={{ textWrap: "balance" }}
            >
              {book.title}
            </h1>

            {book.subtitle && (
              <p className="mt-2 font-display text-[17px] text-muted">{book.subtitle}</p>
            )}

            {book.arabic_title && (
              <p dir="rtl" lang="ar" className="mt-2 font-display text-[19px] text-muted">
                {book.arabic_title}
              </p>
            )}

            {authors && <p className="mt-4 text-[15px] font-semibold">{authors}</p>}

            {book.description && (
              <p className="mt-6 whitespace-pre-line text-[14.5px] leading-relaxed text-muted">
                {book.description}
              </p>
            )}

            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-6 sm:grid-cols-3">
              <Field label="Subject" value={book.categories?.name} />
              <Field label="Publisher" value={book.publishers?.name} />
              <Field label="Year" value={book.publication_year?.toString()} />
              <Field label="Language" value={book.language} />
              <Field label="Edition" value={book.edition} />
              <Field label="Pages" value={book.page_count?.toString()} />
              <Field label="Call number" value={book.call_number} mono />
              <Field label="Dewey" value={book.dewey_code} mono />
              <Field label="ISBN" value={book.isbn13 ?? book.isbn10} mono />
            </dl>

            {tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-sunken px-2.5 py-1 text-[11.5px] font-semibold text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Look this title up elsewhere */}
            <section className="mt-10 border-t border-line pt-6">
              <h2 className="font-display text-[18px] font-semibold">Find this book elsewhere</h2>
              <p className="mt-1 text-[13px] text-muted">
                Search other catalogues and booksellers for editions, previews, and full records.
              </p>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3 transition-colors hover:border-emerald hover:bg-emerald-soft"
                  >
                    <span className="min-w-0">
                      <span className="block text-[13.5px] font-semibold transition-colors group-hover:text-emerald">
                        {link.label}
                      </span>
                      <span className="block truncate text-[11.5px] text-faint">{link.note}</span>
                    </span>
                    <span
                      aria-hidden
                      className="shrink-0 text-[13px] text-faint transition-colors group-hover:text-emerald"
                    >
                      ↗
                    </span>
                  </a>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="min-w-0">
      <dt className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-faint">{label}</dt>
      <dd className={`mt-0.5 break-words text-[13.5px] font-semibold ${mono ? "font-mono text-[12.5px]" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
