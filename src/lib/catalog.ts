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
  cover_url: string | null;
  call_number: string | null;
  dewey_code: string | null;
  isbn13: string | null;
  publishers: { name: string } | null;
  categories: { name: string } | null;
  book_authors: { authors: { name: string } }[];
  copies: { status: string }[];
};

const CATALOG_SELECT = `
  id, item_type, title, arabic_title, subtitle, description, language,
  publication_year, cover_url, call_number, dewey_code, isbn13,
  publishers ( name ),
  categories ( name ),
  book_authors ( authors ( name ) ),
  copies ( status )
`;

export type CatalogSearchParams = {
  query?: string;
  category?: string;
  itemType?: string;
  page?: number;
  pageSize?: number;
  sort?: "title" | "recent";
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
  const to = from + pageSize - 1;

  let request = supabase
    .from("books")
    .select(CATALOG_SELECT, { count: "exact" })
    .is("archived_at", null)
    .order(sort === "recent" ? "created_at" : "title", { ascending: sort !== "recent" })
    .range(from, to);

  if (query && query.trim()) {
    const term = query.trim();
    request = request.or(
      `title.ilike.%${term}%,arabic_title.ilike.%${term}%,isbn13.ilike.%${term}%,isbn10.ilike.%${term}%`
    );
  }
  if (itemType) {
    request = request.eq("item_type", itemType);
  }
  if (category) {
    const { data: categoryRow } = await supabase
      .from("categories")
      .select("id")
      .eq("name", category)
      .maybeSingle();
    if (!categoryRow) return { books: [], total: 0 };
    request = request.eq("category_id", categoryRow.id);
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
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getCatalogStats() {
  const [{ count: bookCount }, { count: copyCount }] = await Promise.all([
    supabase.from("books").select("id", { count: "exact", head: true }).is("archived_at", null),
    supabase.from("copies").select("id", { count: "exact", head: true }),
  ]);
  return { bookCount: bookCount ?? 0, copyCount: copyCount ?? 0 };
}
