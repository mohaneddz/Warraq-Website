"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type Category = { id: string; name: string };

export function SearchForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  function submit(formData: FormData) {
    const params = new URLSearchParams();
    const q = String(formData.get("q") ?? "").trim();
    const category = String(formData.get("category") ?? "");
    const itemType = String(formData.get("itemType") ?? "");
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (itemType) params.set("itemType", itemType);
    router.push(`/catalog?${params.toString()}`);
  }

  return (
    <form
      action={submit}
      className="flex flex-wrap items-center gap-3 rounded-2xl border border-black/10 bg-white p-3 shadow-card"
    >
      <input
        name="q"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by title, author, or ISBN…"
        className="min-w-[220px] flex-1 rounded-xl border border-black/10 bg-parchment px-4 py-2.5 text-[14px] outline-none focus:border-emerald"
      />
      <select
        name="itemType"
        defaultValue={searchParams.get("itemType") ?? ""}
        className="rounded-xl border border-black/10 bg-parchment px-3 py-2.5 text-[13px] font-semibold outline-none"
      >
        <option value="">All types</option>
        <option value="book">Books</option>
        <option value="fyp">FYPs</option>
        <option value="journal">Journals</option>
        <option value="other">Other</option>
      </select>
      <select
        name="category"
        defaultValue={searchParams.get("category") ?? ""}
        className="rounded-xl border border-black/10 bg-parchment px-3 py-2.5 text-[13px] font-semibold outline-none"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.name}>
            {c.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-xl bg-emerald px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-emerald-light"
      >
        Search
      </button>
    </form>
  );
}
