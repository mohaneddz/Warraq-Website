/* A plain GET form pointed at /catalog — no client JS, no router calls. The browser
   serialises the fields straight into the query string the catalogue page already reads,
   so search keeps working for anyone with scripting disabled and every result set stays
   a shareable, bookmarkable URL. Omitting `page` means a new search resets to page 1.
   The type pills below are native radios styled with peer-checked, not buttons + state,
   so the "no client JS" property holds for them too. */

type ItemTypeOption = { value: string; label: string; count: number };

type Props = {
  categories?: { name: string; count: number }[];
  itemTypes?: ItemTypeOption[];
  defaults?: { q?: string; itemType?: string; category?: string; sort?: string };
  variant?: "hero" | "full";
};

const SORTS = [
  { value: "title", label: "Title A–Z" },
  { value: "recent", label: "Recently added" },
  { value: "year", label: "Newest first" },
];

const selectClass =
  "h-11 rounded-xl border border-line bg-surface px-3 text-[13px] font-semibold text-fg outline-none transition-colors hover:border-line-strong focus:border-emerald";

export function SearchBar({ categories = [], itemTypes = [], defaults = {}, variant = "full" }: Props) {
  const hero = variant === "hero";
  const selectedType = defaults.itemType ?? "";

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
        <>
          {/* Type is the primary way this collection gets browsed once it holds more
              than one kind of document, so it gets its own pill row rather than being
              buried in a dropdown with subject/sort. Only types that actually have
              records render — a "PFE" pill that always leads to zero results is worse
              than no pill. */}
          {itemTypes.length > 0 && (
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Item type">
              <TypePill name="itemType" value="" label="All types" checked={selectedType === ""} />
              {itemTypes.map((t) => (
                <TypePill
                  key={t.value}
                  name="itemType"
                  value={t.value}
                  label={t.label}
                  count={t.count}
                  checked={selectedType === t.value}
                />
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <select name="category" defaultValue={defaults.category ?? ""} aria-label="Subject" className={selectClass}>
              <option value="">All subjects</option>
              {categories.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.count})
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
        </>
      )}
    </form>
  );
}

function TypePill({
  name,
  value,
  label,
  count,
  checked,
}: {
  name: string;
  value: string;
  label: string;
  count?: number;
  checked: boolean;
}) {
  return (
    <label className="group relative">
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={checked}
        className="peer sr-only"
      />
      <span className="flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1.5 text-[12.5px] font-semibold text-muted transition-colors peer-checked:border-emerald peer-checked:bg-emerald-soft peer-checked:text-emerald peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-copper peer-focus-visible:outline-offset-2 hover:border-line-strong">
        {label}
        {typeof count === "number" && <span className="opacity-60">{count}</span>}
      </span>
    </label>
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
