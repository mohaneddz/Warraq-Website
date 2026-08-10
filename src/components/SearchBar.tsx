/* A plain GET form pointed at /catalog — no client JS, no router calls. The browser
   serialises the fields straight into the query string the catalogue page already reads,
   so search keeps working for anyone with scripting disabled and every result set stays
   a shareable, bookmarkable URL. Omitting `page` means a new search resets to page 1. */

type Props = {
  categories?: { id: string; name: string }[];
  defaults?: { q?: string; itemType?: string; category?: string; sort?: string };
  variant?: "hero" | "full";
};

const ITEM_TYPES = [
  { value: "", label: "All types" },
  { value: "book", label: "Books" },
  { value: "fyp", label: "Final-year projects" },
  { value: "journal", label: "Journals" },
  { value: "other", label: "Other" },
];

const SORTS = [
  { value: "title", label: "Title A–Z" },
  { value: "recent", label: "Recently added" },
  { value: "year", label: "Newest first" },
];

const selectClass =
  "h-11 rounded-xl border border-line bg-surface px-3 text-[13px] font-semibold text-fg outline-none transition-colors hover:border-line-strong focus:border-emerald";

export function SearchBar({ categories = [], defaults = {}, variant = "full" }: Props) {
  const hero = variant === "hero";

  return (
    <form action="/catalog" className={hero ? "w-full max-w-xl" : "space-y-3"}>
      <div className={hero ? "flex gap-2" : "flex flex-wrap gap-2"}>
        <div className="relative flex-1">
          <SearchIcon />
          <input
            type="search"
            name="q"
            defaultValue={defaults.q ?? ""}
            placeholder="Search by title, author, ISBN, or call number…"
            aria-label="Search the catalogue"
            className="h-12 w-full rounded-xl border border-line bg-surface pl-11 pr-4 text-[14px] text-fg shadow-card outline-none transition-colors placeholder:text-faint hover:border-line-strong focus:border-emerald"
          />
        </div>
        <button
          type="submit"
          className="h-12 shrink-0 rounded-xl bg-emerald px-6 text-[14px] font-bold text-white transition-colors hover:bg-emerald-hover"
        >
          Search
        </button>
      </div>

      {!hero && (
        <div className="flex flex-wrap gap-2">
          <select name="itemType" defaultValue={defaults.itemType ?? ""} aria-label="Item type" className={selectClass}>
            {ITEM_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          <select name="category" defaultValue={defaults.category ?? ""} aria-label="Subject" className={selectClass}>
            <option value="">All subjects</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <select name="sort" defaultValue={defaults.sort ?? "title"} aria-label="Sort order" className={selectClass}>
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </form>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
