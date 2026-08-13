import type { MetadataRoute } from "next";
import { getAllBookIds } from "@/lib/catalog";

const SITE_URL = "https://warraq-website.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const books = await getAllBookIds();

  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/catalog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    ...books.map((book) => ({
      url: `${SITE_URL}/catalog/${book.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
