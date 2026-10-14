![Warraq](screenshots/cover.avif)

<h1>
  <img src="public/brand/warraq-symbol.png" alt="Warraq icon" width="42" />
  Warraq — Public Catalog Website
</h1>

Public-facing Next.js site for the Mustapha Bacha Hospital library. Read-only browse/search
over the same Supabase database the [Warraq desktop app](../App) uses, via the `anon` role
and the `catalog_*_public_read` RLS policies defined in `App/supabase/migrations/0004_rls.sql`.

**Status:** Landing page, catalogue browse/search, item detail pages with external lookup links, a dark theme and a language selector are all working, following a recent catalogue UI redesign.

## Project identity

<p align="center">
  <a href="https://warraq-website.vercel.app">
    <img src="src/app/opengraph-image.png" alt="Warraq public catalog brand image" width="720" />
  </a>
</p>

The image links to the live catalog at [warraq-website.vercel.app](https://warraq-website.vercel.app).

## Screenshots

<table>
  <tr>
    <td width="50%"><img src="screenshots/landing.webp" alt="Landing page"/><br/><b>Landing</b><br/>Hero search, live collection counts, browse by subject and the most recently added titles.</td>
    <td width="50%"><img src="screenshots/catalog.webp" alt="Catalogue"/><br/><b>Catalogue</b><br/>The full collection with item type pills, subject filter, sorting and per-title availability.</td>
  </tr>
  <tr>
    <td width="50%"><img src="screenshots/search.webp" alt="Search results"/><br/><b>Search</b><br/>Search across titles, authors, ISBNs and call numbers, with removable filter chips.</td>
    <td width="50%"><img src="screenshots/item.webp" alt="Item detail"/><br/><b>Item detail</b><br/>Description, classification (call number, Dewey, ISBN), copy availability and links to other catalogues.</td>
  </tr>
  <tr>
    <td width="50%"><img src="screenshots/dark.webp" alt="Dark theme"/><br/><b>Dark theme</b><br/>A full dark palette, remembered per visitor.</td>
    <td width="50%"><img src="screenshots/notFound.webp" alt="Not found page"/><br/><b>Not found</b><br/>A branded 404 that points back to the catalogue.</td>
  </tr>
</table>

## Tech

Next.js (App Router) · TypeScript · Tailwind CSS · `@supabase/supabase-js`

## Getting started

```bash
pnpm install
pnpm dev
```

Copy `.env.example` to `.env.local` and fill in the project's Supabase URL and anon
(publishable) key — the same public values used by the desktop app's `VITE_SUPABASE_*` vars.

## Project structure

```text
src/
|-- app/
|   |-- page.tsx              # Landing page
|   |-- catalog/page.tsx      # Search/browse catalog
|   |-- catalog/[id]/page.tsx # Book detail
|-- components/                # Header, BookCard, SearchForm
|-- lib/
|   |-- supabase.ts            # Supabase client (anon key)
|   |-- catalog.ts             # Catalog queries
```

## Scripts

- `pnpm dev` — start the dev server
- `pnpm build` — production build
- `pnpm lint` — ESLint
