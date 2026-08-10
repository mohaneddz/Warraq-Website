import { supabase } from "./supabase";

export type CatalogBook = {
  id: string;
  item_type: "book" | "fyp" | "journal" | "other";
  title: string;
  arabic_title: string | null;
  subtitle: string | null;
  description: string | null;
  language: string;
  publication_year: number | null;
  edition: string | null;
  page_count: number | null;
  cover_url: string | null;
  call_number: string | null;
  dewey_code: string | null;
  isbn13: string | null;
  isbn10: string | null;
  tags: string | null;
  publishers: { name: string } | null;
  categories: { name: string } | null;
  book_authors: { authors: { name: string } }[];
  copies: { status: string }[];
};

/* `shelves` is deliberately absent from this projection: the public-read RLS policies in
   App/supabase/migrations/0004_rls.sql cover books/authors/categories/publishers/copies/tags
   only, so joining shelf location here would come back empty for anonymous visitors. */
const CATALOG_SELECT = `
  id, item_type, title, arabic_title, subtitle, description, language,
  publication_year, edition, page_count, cover_url, call_number, dewey_code,
  isbn13, isbn10, tags,
  publishers ( name ),
  categories ( name ),
  book_authors ( authors ( name ) ),
  copies ( status )
`;

export const authorsOf = (book: CatalogBook) =>
  book.book_authors.map((ba) => ba.authors.name).filter(Boolean).join(", ");

export function availabilityOf(book: CatalogBook) {
  const total = book.copies.length;
  const available = book.copies.filter((c) => c.status === "available").length;
  return { total, available };
}

export type CatalogSearchParams = {
  query?: string;
  category?: string;
  itemType?: string;
  page?: number;
  pageSize?: number;
  sort?: "title" | "recent" | "year";
};

export async function searchCatalog({
  query,
  category,
  itemType,
  page = 1,
  pageSize = 24,
  sort = "title",
}: CatalogSearchParams) {
  const from = (page - 1) * pageSize;

  let request = supabase
    .from("books")
    .select(CATALOG_SELECT, { count: "exact" })
    .is("archived_at", null)
    .range(from, from + pageSize - 1);

  if (sort === "recent") request = request.order("created_at", { ascending: false });
  else if (sort === "year") request = request.order("publication_year", { ascending: false, nullsFirst: false });
  else request = request.order("title", { ascending: true });

  if (query?.trim()) {
    // Escape PostgREST's or() delimiters so a title containing a comma or paren
    // cannot break out of the filter expression.
    const term = query.trim().replace(/[,()]/g, " ");
    request = request.or(
      `title.ilike.%${term}%,arabic_title.ilike.%${term}%,isbn13.ilike.%${term}%,isbn10.ilike.%${term}%,call_number.ilike.%${term}%`
    );
  }

  if (itemType) request = request.eq("item_type", itemType);

  if (category) {
    const { data: row } = await supabase
      .from("categories")
      .select("id")
      .eq("name", category)
      .maybeSingle();
    if (!row) return { books: [], total: 0 };
    request = request.eq("category_id", row.id);
  }

  const { data, error, count } = await request;
  if (error) throw error;
  return { books: (data ?? []) as unknown as CatalogBook[], total: count ?? 0 };
}

export async function getBookById(id: string) {
  const { data, error } = await supabase
    .from("books")
    .select(CATALOG_SELECT)
    .eq("id", id)
    .is("archived_at", null)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as CatalogBook | null;
}

export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

/** Subject list for the landing page, counted in one pass rather than one query per
 *  category — the whole table is only a few hundred rows. */
export async function getSubjects(limit = 12) {
  const [{ data: books }, { data: categories }] = await Promise.all([
    supabase.from("books").select("category_id").is("archived_at", null),
    supabase.from("categories").select("id, name"),
  ]);

  const counts = new Map<string, number>();
  for (const b of books ?? []) {
    if (b.category_id) counts.set(b.category_id, (counts.get(b.category_id) ?? 0) + 1);
  }

  return (categories ?? [])
    .map((c) => ({ name: c.name as string, count: counts.get(c.id as string) ?? 0 }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function getCatalogStats() {
  const [books, copies, authors] = await Promise.all([
    supabase.from("books").select("id", { count: "exact", head: true }).is("archived_at", null),
    supabase.from("copies").select("id", { count: "exact", head: true }),
    supabase.from("authors").select("id", { count: "exact", head: true }),
  ]);
  return {
    bookCount: books.count ?? 0,
    copyCount: copies.count ?? 0,
    authorCount: authors.count ?? 0,
  };
}
