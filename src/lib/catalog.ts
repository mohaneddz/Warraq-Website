import { getSupabase } from "./supabase";

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

/** Labels for the `copy_status` enum (App/supabase/migrations/0001_extensions_enums_core.sql). */
export const COPY_STATUS_LABEL: Record<string, string> = {
  available: "Available",
  "on-loan": "On loan",
  reserved: "Reserved",
  repair: "In repair",
  lost: "Lost",
  archived: "Archived",
};

/** `unavailableLabel` says why nothing is on the shelf, taken from the copies' actual
 *  statuses: a reserved or in-repair copy is not "on loan", and saying so sends readers
 *  to the desk asking when it will be returned. */
export function availabilityOf(book: CatalogBook) {
  const total = book.copies.length;
  const available = book.copies.filter((c) => c.status === "available").length;

  const statuses = new Set(book.copies.map((c) => c.status));
  let unavailableLabel = "Unavailable";
  if (statuses.size === 1) {
    const [status] = statuses;
    unavailableLabel =
      status === "on-loan" && total > 1 ? "All on loan" : (COPY_STATUS_LABEL[status] ?? status);
  }

  return { total, available, unavailableLabel };
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
  const supabase = getSupabase();

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
  const supabase = getSupabase();
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
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

/** Subject list for the landing page and the catalogue's subject filter, counted in one
 *  pass rather than one query per category — the whole table is only a few hundred rows.
 *  Subjects with zero books are dropped rather than shown as a dead filter option. */
export async function getSubjects(limit = Infinity) {
  const supabase = getSupabase();
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

export const ITEM_TYPE_LABELS: Record<string, string> = {
  book: "Books",
  fyp: "Final-year projects (PFE)",
  journal: "Journals",
  other: "Other",
};

// Fixed order rather than sorted by count: these are a closed, meaningful set of
// categories (not organic subjects), so "Books, FYPs, Journals, Other" should read
// the same regardless of which one currently has the most records.
const ITEM_TYPE_ORDER = ["book", "fyp", "journal", "other"] as const;

/** Item-type counts for the catalogue's type filter and the homepage's "browse by
 *  type" section. A type with zero books is omitted rather than offered as a filter
 *  or section that would only ever lead to an empty result. */
export async function getItemTypeCounts() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("books")
    .select("item_type")
    .is("archived_at", null);
  if (error) throw error;

  const counts = new Map<string, number>();
  for (const b of data ?? []) {
    counts.set(b.item_type, (counts.get(b.item_type) ?? 0) + 1);
  }

  return ITEM_TYPE_ORDER.filter((type) => (counts.get(type) ?? 0) > 0).map((type) => ({
    value: type,
    label: ITEM_TYPE_LABELS[type],
    count: counts.get(type) ?? 0,
  }));
}

export async function getCatalogStats() {
  const supabase = getSupabase();
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

/** IDs of every public book, for the sitemap. */
export async function getAllBookIds() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("books")
    .select("id")
    .is("archived_at", null);
  if (error) throw error;
  return (data ?? []) as { id: string }[];
}
