import type { CatalogBook } from "./catalog";
import { authorsOf } from "./catalog";

/** A stored ISBN is only worth searching on if its check digit holds — a large share of
 *  the catalogue's ISBNs are transcription errors, and querying those sends the reader to
 *  a confidently wrong record instead of no record. */
function validIsbn(book: CatalogBook): string | null {
  for (const raw of [book.isbn13, book.isbn10]) {
    const s = (raw ?? "").replace(/[^0-9Xx]/g, "").toUpperCase();
    if (s.length === 13 && /^\d{13}$/.test(s)) {
      let sum = 0;
      for (let i = 0; i < 13; i++) sum += Number(s[i]) * (i % 2 ? 3 : 1);
      if (sum % 10 === 0) return s;
    }
    if (s.length === 10 && /^\d{9}[\dX]$/.test(s)) {
      let sum = 0;
      for (let i = 0; i < 10; i++) sum += (s[i] === "X" ? 10 : Number(s[i])) * (10 - i);
      if (sum % 11 === 0) return s;
    }
  }
  return null;
}

export type ExternalLink = { label: string; href: string; note: string };

export function externalLinksFor(book: CatalogBook): ExternalLink[] {
  const isbn = validIsbn(book);
  const authors = authorsOf(book);
  const phrase = isbn ?? `${book.title} ${authors}`.trim();
  const q = encodeURIComponent(phrase);

  return [
    {
      label: "Google Books",
      href: `https://www.google.com/search?tbm=bks&q=${q}`,
      note: "Previews and editions",
    },
    {
      label: "Open Library",
      href: isbn
        ? `https://openlibrary.org/isbn/${isbn}`
        : `https://openlibrary.org/search?q=${q}`,
      note: "Open bibliographic record",
    },
    {
      label: "WorldCat",
      href: `https://search.worldcat.org/search?q=${q}`,
      note: "Find it in other libraries",
    },
    {
      label: "BnF Catalogue",
      href: `https://data.bnf.fr/fr/search?term=${q}`,
      note: "French national library",
    },
    {
      label: "Google Scholar",
      href: `https://scholar.google.com/scholar?q=${encodeURIComponent(book.title)}`,
      note: "Citations and related work",
    },
  ];
}
