import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Warraq · Mustapha Bacha Hospital Library",
    short_name: "Warraq",
    description:
      "Search the Mustapha Bacha Hospital library: books, final-year projects, and journals, with live availability.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf8f3",
    theme_color: "#1a4d40",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
